#!/bin/bash

# =============================================================================
# SCRIPT DE ACTUALIZACIÓN PARA EL NOPAL RESTAURANT - PRODUCCIÓN
# Versión 2.0 - Con mejoras de seguridad y rendimiento
# =============================================================================

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Configuración
PROJECT_DIR="/var/www/elnopal"
BACKUP_DIR="/var/backups/elnopal"
REPO_URL="https://github.com/yalilms/elnopal.git"
NODE_VERSION="18"

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Función para verificar si el comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar que estamos ejecutando como root
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root (sudo)"
fi

log "🚀 Iniciando actualización de El Nopal Restaurant..."

# =============================================================================
# 1. VERIFICACIONES PREVIAS
# =============================================================================

log "📋 Verificando requisitos del sistema..."

# Verificar Node.js
if ! command_exists node; then
    error "Node.js no está instalado"
fi

NODE_CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT_VERSION" -lt "$NODE_VERSION" ]; then
    warning "Node.js versión $NODE_CURRENT_VERSION detectada. Se recomienda versión $NODE_VERSION+"
fi

# Verificar npm
if ! command_exists npm; then
    error "npm no está instalado"
fi

# Verificar PM2
if ! command_exists pm2; then
    error "PM2 no está instalado. Instalar con: npm install -g pm2"
fi

# Verificar MongoDB
if ! systemctl is-active --quiet mongod; then
    warning "MongoDB no está ejecutándose. Intentando iniciar..."
    systemctl start mongod
fi

# Verificar Nginx
if ! systemctl is-active --quiet nginx; then
    warning "Nginx no está ejecutándose. Intentando iniciar..."
    systemctl start nginx
fi

# =============================================================================
# 2. CREAR BACKUP
# =============================================================================

log "💾 Creando backup del sistema actual..."

# Crear directorio de backup con timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CURRENT_BACKUP_DIR="$BACKUP_DIR/$TIMESTAMP"
mkdir -p "$CURRENT_BACKUP_DIR"

# Backup de la aplicación
if [ -d "$PROJECT_DIR" ]; then
    log "📁 Backup de la aplicación..."
    cp -r "$PROJECT_DIR" "$CURRENT_BACKUP_DIR/app_backup"
fi

# Backup de MongoDB
log "🗄️ Backup de la base de datos..."
if command_exists mongodump; then
    mongodump --db elnopal --out "$CURRENT_BACKUP_DIR/db_backup"
else
    warning "mongodump no disponible. Saltando backup de BD."
fi

# Backup de configuración de Nginx
if [ -f "/etc/nginx/sites-available/elnopal" ]; then
    cp "/etc/nginx/sites-available/elnopal" "$CURRENT_BACKUP_DIR/nginx_config"
fi

log "✅ Backup completado en: $CURRENT_BACKUP_DIR"

# =============================================================================
# 3. DETENER SERVICIOS
# =============================================================================

log "⏹️ Deteniendo servicios..."

# Detener aplicación
if pm2 list | grep -q "elnopal-backend"; then
    pm2 stop elnopal-backend
    log "🔴 Backend detenido"
fi

# =============================================================================
# 4. ACTUALIZAR CÓDIGO
# =============================================================================

log "📥 Actualizando código desde Git..."

cd "$PROJECT_DIR" || error "No se puede acceder al directorio del proyecto"

# Limpiar cambios locales no confirmados
git stash

# Obtener últimos cambios
git fetch origin main

# Actualizar a la última versión
git reset --hard origin/main

log "✅ Código actualizado desde Git"

# =============================================================================
# 5. INSTALAR DEPENDENCIAS ACTUALIZADAS
# =============================================================================

log "📦 Instalando dependencias del servidor..."

cd "$PROJECT_DIR/server"

# Limpiar caché de npm
npm cache clean --force

# Instalar dependencias de producción
npm ci --production --no-audit

log "📦 Instalando dependencias del cliente..."

cd "$PROJECT_DIR/client"

# Instalar dependencias del cliente
npm ci --no-audit

# =============================================================================
# 6. BUILD DE PRODUCCIÓN
# =============================================================================

log "🏗️ Construyendo aplicación de producción..."

cd "$PROJECT_DIR/client"

# Build optimizado para producción
npm run build

log "✅ Build de producción completado"

# =============================================================================
# 7. CONFIGURAR VARIABLES DE ENTORNO
# =============================================================================

log "⚙️ Verificando configuración de entorno..."

ENV_FILE="$PROJECT_DIR/server/.env"

if [ ! -f "$ENV_FILE" ]; then
    warning "Archivo .env no encontrado. Creando desde ejemplo..."
    cp "$PROJECT_DIR/server/env.production.example" "$ENV_FILE"
    warning "⚠️ IMPORTANTE: Configurar variables de entorno en $ENV_FILE"
else
    log "✅ Archivo .env encontrado"
fi

# Verificar variables críticas
if ! grep -q "JWT_SECRET=.*[^example]" "$ENV_FILE"; then
    warning "⚠️ JWT_SECRET no configurado o usando valor de ejemplo"
fi

if ! grep -q "EMAIL_PASS=.*[^aqui]" "$ENV_FILE"; then
    warning "⚠️ EMAIL_PASS no configurado"
fi

# =============================================================================
# 8. CONFIGURAR NGINX CON HEADERS DE SEGURIDAD MEJORADOS
# =============================================================================

log "🔒 Configurando Nginx con seguridad mejorada..."

cat > /etc/nginx/sites-available/elnopal << 'EOL'
server {
    listen 80;
    server_name elnopal.es www.elnopal.es;

    # Headers de seguridad mejorados
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # CSP Header mejorado
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' wss: ws:; frame-src 'none'; object-src 'none';" always;

    # Ocultar versión de servidor
    server_tokens off;

    # Configuración de archivos estáticos
    location / {
        root /var/www/elnopal/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary "Accept-Encoding";
        }
    }

    # Proxy para API con configuración optimizada
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts optimizados
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer optimization
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
    }

    # Socket.io con configuración optimizada
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }

    # Protección contra acceso a archivos sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ /\.env {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/geo+json
        application/javascript
        application/x-javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rdf+xml
        application/rss+xml
        application/xhtml+xml
        application/xml
        font/eot
        font/otf
        font/ttf
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;
}
EOL

# Habilitar el sitio
ln -sf /etc/nginx/sites-available/elnopal /etc/nginx/sites-enabled/

# Verificar configuración de Nginx
if nginx -t; then
    log "✅ Configuración de Nginx válida"
else
    error "❌ Error en configuración de Nginx"
fi

# =============================================================================
# 9. CONFIGURAR PM2 CON CONFIGURACIÓN OPTIMIZADA
# =============================================================================

log "⚙️ Configurando PM2 con configuración optimizada..."

cat > "$PROJECT_DIR/server/ecosystem.config.js" << 'EOL'
module.exports = {
  apps: [{
    name: 'elnopal-backend',
    script: './src/index.js',
    cwd: '/var/www/elnopal/server',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Configuración de logs
    log_file: '/var/log/pm2/elnopal-combined.log',
    out_file: '/var/log/pm2/elnopal-out.log',
    error_file: '/var/log/pm2/elnopal-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Configuración de memoria y CPU
    max_memory_restart: '500M',
    
    // Reinicio automático
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Variables de entorno adicionales
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOL

# Crear directorio de logs
mkdir -p /var/log/pm2
chown -R www-data:www-data /var/log/pm2

# =============================================================================
# 10. INICIAR SERVICIOS
# =============================================================================

log "🚀 Iniciando servicios..."

# Recargar configuración de Nginx
systemctl reload nginx
log "✅ Nginx recargado"

# Iniciar aplicación con PM2
cd "$PROJECT_DIR/server"
pm2 start ecosystem.config.js --env production

# Guardar configuración de PM2
pm2 save
pm2 startup

log "✅ Aplicación iniciada con PM2"

# =============================================================================
# 11. VERIFICACIONES FINALES
# =============================================================================

log "🔍 Realizando verificaciones finales..."

# Verificar que la aplicación responde
sleep 10

if curl -f -s http://localhost:5000/health > /dev/null; then
    log "✅ API respondiendo correctamente"
else
    warning "⚠️ API no responde en /health"
fi

# Verificar frontend
if curl -f -s http://localhost > /dev/null; then
    log "✅ Frontend accesible"
else
    warning "⚠️ Frontend no accesible"
fi

# Mostrar estado de servicios
log "📊 Estado de servicios:"
info "MongoDB: $(systemctl is-active mongod)"
info "Nginx: $(systemctl is-active nginx)"
info "PM2 Apps:"
pm2 list

# =============================================================================
# 12. LIMPIEZA
# =============================================================================

log "🧹 Limpiando archivos temporales..."

# Limpiar caché de npm
npm cache clean --force

# Limpiar logs antiguos (mantener últimos 7 días)
find /var/log/pm2 -name "*.log" -mtime +7 -delete 2>/dev/null || true

# Limpiar backups antiguos (mantener últimos 30 días)
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \; 2>/dev/null || true

# =============================================================================
# FINALIZACIÓN
# =============================================================================

log "🎉 ¡Actualización completada exitosamente!"
log ""
log "📋 Resumen:"
log "  • Backup creado en: $CURRENT_BACKUP_DIR"
log "  • Aplicación actualizada desde Git"
log "  • Dependencias actualizadas"
log "  • Build de producción completado"
log "  • Nginx configurado con headers de seguridad mejorados"
log "  • PM2 configurado en modo cluster"
log "  • Servicios iniciados y verificados"
log ""
log "🌐 Tu aplicación está disponible en:"
log "  • Frontend: http://elnopal.es"
log "  • Admin Panel: http://elnopal.es/admin"
log "  • API Health: http://elnopal.es/health"
log ""
log "🔧 Comandos útiles:"
log "  • Ver logs: pm2 logs elnopal-backend"
log "  • Reiniciar: pm2 restart elnopal-backend"
log "  • Estado: pm2 status"
log "  • Monitoreo: pm2 monit"
log ""

# Mostrar warnings importantes si existen
if [ -f "$ENV_FILE" ]; then
    if grep -q "CAMBIAR" "$ENV_FILE"; then
        warning "⚠️ IMPORTANTE: Hay variables de entorno que necesitan configuración en $ENV_FILE"
    fi
fi

log "✅ El Nopal Restaurant está actualizado y funcionando!"

exit 0 