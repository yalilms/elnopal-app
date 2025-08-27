#!/bin/bash

# 🚀 SCRIPT COMPLETO DE DESPLIEGUE DE PRODUCCIÓN - El Nopal Restaurant
# Versión mejorada con verificaciones avanzadas y optimizaciones
# Ejecutar EN EL SERVIDOR después de hacer git pull

set -e # Detener en cualquier error

# ===============================================================================
# CONFIGURACIÓN Y VARIABLES
# ===============================================================================

echo "🚀 INICIANDO DESPLIEGUE DE PRODUCCIÓN - EL NOPAL"
echo "=================================================="
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Variables de configuración
PROJECT_DIR="/var/www/elnopal-app"
CLIENT_DIR="$PROJECT_DIR/client"
SERVER_DIR="$PROJECT_DIR/server"
BACKUP_DIR="/var/backups/elnopal"
LOG_DIR="/var/log/elnopal"
NGINX_CONFIG="/etc/nginx/sites-available/elnopal.es"
SERVICE_NAME="elnopal-backend"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# ===============================================================================
# VERIFICACIONES PREVIAS
# ===============================================================================

log_info "Verificando pre-requisitos del sistema..."

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Directorio del proyecto no encontrado: $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# Verificar que tenemos Node.js y npm
if ! command -v node &> /dev/null; then
    log_error "Node.js no está instalado"
fi

if ! command -v npm &> /dev/null; then
    log_error "npm no está instalado"
fi

# Verificar versión de Node.js (mínimo 16)
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    log_error "Node.js versión 16+ requerida. Versión actual: $(node --version)"
fi

# Verificar que tenemos pm2
if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 no encontrado. Instalando..."
    npm install -g pm2
fi

# Verificar MongoDB
if ! systemctl is-active --quiet mongod; then
    log_warning "MongoDB no está ejecutándose. Iniciando..."
    sudo systemctl start mongod
fi

# Verificar Nginx
if ! systemctl is-active --quiet nginx; then
    log_warning "Nginx no está ejecutándose. Iniciando..."
    sudo systemctl start nginx
fi

log_success "Verificaciones previas completadas"

# ===============================================================================
# CREAR BACKUP
# ===============================================================================

log_info "Creando backup antes del despliegue..."

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

# Crear directorio de backup si no existe
sudo mkdir -p "$BACKUP_DIR"
sudo mkdir -p "$LOG_DIR"

# Backup de archivos
sudo cp -r "$PROJECT_DIR" "$BACKUP_PATH"

# Backup de base de datos MongoDB
mongodump --db elnopal --out "$BACKUP_PATH/mongodb_backup" 2>/dev/null || log_warning "No se pudo hacer backup de MongoDB"

# Mantener solo los últimos 5 backups
sudo find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_*" | sort | head -n -5 | xargs sudo rm -rf

log_success "Backup creado en: $BACKUP_PATH"

# ===============================================================================
# ACTUALIZAR CÓDIGO
# ===============================================================================

log_info "Actualizando código desde repositorio..."

# Verificar que estamos en un repositorio git
if [ ! -d ".git" ]; then
    log_error "No es un repositorio git válido"
fi

# Guardar cambios locales si los hay
git stash save "Auto-stash before deployment $(date)" 2>/dev/null || true

# Actualizar código
git fetch origin
git checkout main
git pull origin main

log_success "Código actualizado"

# ===============================================================================
# ACTUALIZAR DEPENDENCIAS DEL SERVIDOR
# ===============================================================================

log_info "Actualizando dependencias del servidor..."

cd "$SERVER_DIR"

# Limpiar caché y reinstalar dependencias
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --production --no-audit

# Verificar que las dependencias críticas están instaladas
CRITICAL_DEPS=("express" "mongoose" "bcryptjs" "jsonwebtoken" "cors")
for dep in "${CRITICAL_DEPS[@]}"; do
    if ! npm list "$dep" &>/dev/null; then
        log_error "Dependencia crítica no encontrada: $dep"
    fi
done

log_success "Dependencias del servidor actualizadas"

# ===============================================================================
# VERIFICAR CONFIGURACIÓN DEL SERVIDOR
# ===============================================================================

log_info "Verificando configuración del servidor..."

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    log_error "Archivo .env no encontrado en el servidor"
fi

# Verificar variables críticas en .env
REQUIRED_VARS=("MONGODB_URI" "JWT_SECRET" "PORT")
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" .env; then
        log_error "Variable de entorno requerida no encontrada: $var"
    fi
done

log_success "Configuración del servidor verificada"

# ===============================================================================
# ACTUALIZAR FRONTEND
# ===============================================================================

log_info "Construyendo frontend optimizado..."

cd "$CLIENT_DIR"

# Limpiar caché y reinstalar dependencias
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --no-audit

# Verificar que existe el archivo de configuración de producción
if [ -f "env.production.example" ] && [ ! -f ".env.production" ]; then
    log_warning "Creando .env.production desde ejemplo"
    cp env.production.example .env.production
fi

# Optimizar imágenes si existe el script
if [ -f "optimize-images.js" ]; then
    log_info "Optimizando imágenes..."
    node optimize-images.js || log_warning "Error optimizando imágenes"
fi

# Build optimizado de producción
log_info "Generando build de producción..."
npm run build:production

# Verificar que el build se generó correctamente
if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
    log_error "Build del frontend falló"
fi

# Copiar archivos estáticos a directorio web
sudo rm -rf /var/www/html/elnopal/*
sudo cp -r build/* /var/www/html/elnopal/
sudo chown -R www-data:www-data /var/www/html/elnopal/

log_success "Frontend construido y desplegado"

# ===============================================================================
# CONFIGURAR NGINX
# ===============================================================================

log_info "Verificando configuración de Nginx..."

# Verificar que existe la configuración
if [ ! -f "$NGINX_CONFIG" ]; then
    log_warning "Creando configuración de Nginx..."
    
    # Crear configuración básica
    sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
server {
    listen 80;
    server_name elnopal.es www.elnopal.es;

    # Frontend React
    location / {
        root /var/www/html/elnopal;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Headers de cache para recursos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

    # Habilitar el sitio
    sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/elnopal.es
fi

# Verificar configuración de Nginx
sudo nginx -t || log_error "Configuración de Nginx inválida"

# Recargar Nginx
sudo systemctl reload nginx

log_success "Nginx configurado y recargado"

# ===============================================================================
# GESTIONAR SERVICIO DEL BACKEND
# ===============================================================================

log_info "Gestionando servicio del backend..."

cd "$SERVER_DIR"

# Detener servicio anterior si existe
pm2 stop "$SERVICE_NAME" 2>/dev/null || true
pm2 delete "$SERVICE_NAME" 2>/dev/null || true

# Iniciar servicio con PM2
pm2 start ecosystem.config.js --name "$SERVICE_NAME"

# Guardar configuración de PM2
pm2 save

# Verificar que el servicio está corriendo
sleep 5
if ! pm2 list | grep -q "$SERVICE_NAME.*online"; then
    log_error "El servicio del backend no se inició correctamente"
fi

log_success "Servicio del backend iniciado con PM2"

# ===============================================================================
# OPTIMIZACIONES POST-DESPLIEGUE
# ===============================================================================

log_info "Ejecutando optimizaciones post-despliegue..."

# Limpiar logs antiguos
sudo find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null || true

# Optimizar base de datos MongoDB
mongo elnopal --eval "db.runCommand({compact: 'reservations'})" 2>/dev/null || log_warning "No se pudo optimizar MongoDB"

# Limpiar caché del sistema
sudo apt-get autoremove -y &>/dev/null || true
sudo apt-get autoclean &>/dev/null || true

log_success "Optimizaciones completadas"

# ===============================================================================
# VERIFICACIONES POST-DESPLIEGUE
# ===============================================================================

log_info "Ejecutando verificaciones post-despliegue..."

# Verificar que el frontend es accesible
if curl -f -s http://localhost/health &>/dev/null; then
    log_success "Frontend accesible"
else
    log_warning "Frontend podría no estar accesible"
fi

# Verificar que el backend está respondiendo
if curl -f -s http://localhost:5000/api/health &>/dev/null; then
    log_success "Backend API accesible"
else
    log_warning "Backend API podría no estar accesible"
fi

# Verificar que MongoDB está accesible
if mongo --eval "db.stats()" elnopal &>/dev/null; then
    log_success "MongoDB accesible"
else
    log_warning "MongoDB podría no estar accesible"
fi

# Verificar espacio en disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    log_warning "Espacio en disco bajo: ${DISK_USAGE}%"
else
    log_success "Espacio en disco OK: ${DISK_USAGE}%"
fi

# Verificar memoria
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEM_USAGE" -gt 85 ]; then
    log_warning "Uso de memoria alto: ${MEM_USAGE}%"
else
    log_success "Uso de memoria OK: ${MEM_USAGE}%"
fi

# ===============================================================================
# CONFIGURAR MONITOREO
# ===============================================================================

log_info "Configurando monitoreo..."

# Instalar PM2 logrotate si no existe
pm2 install pm2-logrotate 2>/dev/null || true

# Configurar logrotate para PM2
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

# Configurar startup de PM2
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true

log_success "Monitoreo configurado"

# ===============================================================================
# FINALIZACIÓN
# ===============================================================================

echo ""
echo "🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "====================================="
echo ""
echo "📊 Resumen del despliegue:"
echo "   • Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "   • Backup creado en: $BACKUP_PATH"
echo "   • Frontend desplegado en: /var/www/html/elnopal/"
echo "   • Backend corriendo con PM2: $SERVICE_NAME"
echo "   • Logs disponibles en: $LOG_DIR"
echo ""
echo "🔗 URLs importantes:"
echo "   • Frontend: http://elnopal.es"
echo "   • Backend API: http://elnopal.es/api"
echo "   • Admin Panel: http://elnopal.es/admin"
echo ""
echo "🛠️  Comandos útiles:"
echo "   • Ver logs del backend: pm2 logs $SERVICE_NAME"
echo "   • Reiniciar backend: pm2 restart $SERVICE_NAME"
echo "   • Estado de servicios: pm2 status"
echo "   • Logs de Nginx: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "✅ El Nopal está listo para recibir clientes!"

# Registrar despliegue exitoso
echo "$(date '+%Y-%m-%d %H:%M:%S') - Despliegue exitoso" | sudo tee -a "$LOG_DIR/deployment.log" > /dev/null

exit 0