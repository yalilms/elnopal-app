#!/bin/bash

# 🚀 DESPLIEGUE CON GIT - El Nopal Restaurant
# VPS: 5.250.190.97 | Dominio: elnopal.es

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración específica
VPS_IP="5.250.190.97"
DOMAIN="elnopal.es"
PROJECT_DIR="/var/www/elnopal"
REPO_URL="https://github.com/yalilms/elnopal.git"  # ¡CAMBIAR POR TU REPO!

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🚀 Despliegue con Git - El Nopal Restaurant"
print_status "VPS: $VPS_IP | Dominio: $DOMAIN"

# Verificar que estamos en un repositorio Git
if [ ! -d ".git" ]; then
    print_error "Este directorio no es un repositorio Git. Ejecuta 'git init' primero."
    exit 1
fi

# Verificar conexión SSH
print_status "Verificando conexión SSH..."
if ! ssh -o ConnectTimeout=10 root@$VPS_IP "echo 'SSH OK'" 2>/dev/null; then
    print_error "No se puede conectar al VPS. Verifica SSH."
    exit 1
fi
print_success "Conexión SSH verificada"

# Verificar cambios pendientes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Hay cambios sin commit. ¿Quieres hacer commit automático? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        git add .
        git commit -m "Despliegue automático - $(date '+%Y-%m-%d %H:%M:%S')"
        print_success "Cambios guardados en Git"
    else
        print_error "Haz commit de tus cambios antes de continuar"
        exit 1
    fi
fi

# Push al repositorio remoto
print_status "Subiendo cambios al repositorio..."
git push origin main || git push origin master
print_success "Código subido al repositorio"

# Construir proyecto localmente para verificar
print_status "Verificando build local..."
cd client
npm run build
cd ..
print_success "Build local exitoso"

# Configurar VPS
print_status "Configurando VPS..."
ssh root@$VPS_IP << EOF
set -e

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Git si no está
if ! command -v git &> /dev/null; then
    apt install git -y
fi

# Instalar Node.js 18
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Instalar MongoDB
if ! command -v mongod &> /dev/null; then
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
fi

# Instalar Nginx
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl start nginx
    systemctl enable nginx
fi

# Instalar PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Clonar o actualizar repositorio
if [ ! -d "$PROJECT_DIR" ]; then
    echo "🔄 Clonando repositorio por primera vez..."
    git clone $REPO_URL $PROJECT_DIR
else
    echo "🔄 Actualizando repositorio existente..."
    cd $PROJECT_DIR
    git fetch origin
    git reset --hard origin/main || git reset --hard origin/master
fi

cd $PROJECT_DIR

# Configurar permisos
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# Instalar dependencias del servidor (incluyendo las nuevas de seguridad)
cd $PROJECT_DIR/server
npm install --production

# Verificar que las dependencias de seguridad estén instaladas
npm list helmet express-rate-limit || npm install helmet express-rate-limit

# Crear .env si no existe
if [ ! -f .env ]; then
    cp env.production.example .env
    echo "⚠️  Archivo .env creado. ¡RECUERDA CONFIGURAR EMAIL_PASS!"
fi

# Instalar dependencias del cliente y construir
cd $PROJECT_DIR/client
npm install
npm run build

# Configurar Nginx
cat > /etc/nginx/sites-available/elnopal << 'EOL'
server {
    listen 80;
    server_name elnopal.es www.elnopal.es;

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        root /var/www/elnopal/client/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
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

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/elnopal/client/build;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/elnopal_access.log;
    error_log /var/log/nginx/elnopal_error.log;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOL

# Habilitar sitio
ln -sf /etc/nginx/sites-available/elnopal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Configurar firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Iniciar/reiniciar backend con PM2
cd $PROJECT_DIR/server
pm2 delete elnopal-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Despliegue completado con Git!"
echo ""
echo "🔗 PRÓXIMOS PASOS:"
echo "1. Configurar correo en: nano /var/www/elnopal/server/.env"
echo "2. Reiniciar backend: pm2 restart elnopal-backend"
echo ""
echo "🌐 Tu sitio: http://elnopal.es (IONOS gestionará HTTPS automáticamente)"
echo "⚙️  Admin: http://elnopal.es/admin"
EOF

print_success "🎉 ¡Despliegue con Git completado!"
print_warning ""
print_warning "📝 PASO FINAL:"
echo "Configurar correo:"
echo "   ssh root@$VPS_IP"
echo "   nano /var/www/elnopal/server/.env"
echo "   (Actualizar EMAIL_PASS con tu contraseña de Gmail)"
echo "   pm2 restart elnopal-backend"
echo ""
echo "🌐 Sitio: http://elnopal.es"
echo "⚙️ Admin: http://elnopal.es/admin"
echo "🔒 IONOS gestionará HTTPS automáticamente"

 