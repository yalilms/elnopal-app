# 🚀 Guía Completa de Despliegue - El Nopal Restaurant

Una guía comprehensiva para desplegar la aplicación El Nopal en producción con las mejores prácticas de DevOps y optimizaciones de rendimiento.

## 📋 Tabla de Contenidos

- [Pre-requisitos](#pre-requisitos)
- [Configuración del Servidor](#configuración-del-servidor)
- [Despliegue de Producción](#despliegue-de-producción)
- [Despliegue de Desarrollo](#despliegue-de-desarrollo)
- [Configuración de Servicios](#configuración-de-servicios)
- [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
- [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
- [Seguridad](#seguridad)
- [Solución de Problemas](#solución-de-problemas)

## 🛠️ Pre-requisitos

### Servidor de Producción

#### Hardware Mínimo
- **CPU**: 2 cores / 2.0 GHz
- **RAM**: 4 GB (recomendado 8 GB)
- **Almacenamiento**: 50 GB SSD
- **Ancho de banda**: 100 Mbps

#### Software Requerido
```bash
# Ubuntu 20.04 LTS o superior
sudo apt update && sudo apt upgrade -y

# Node.js 18+ LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB 6.0+
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Nginx
sudo apt install -y nginx

# PM2 para gestión de procesos
sudo npm install -g pm2

# Herramientas adicionales
sudo apt install -y git curl wget unzip htop
```

### Entorno de Desarrollo

```bash
# Node.js 16+ y npm
node --version  # v16.0.0+
npm --version   # 8.0.0+

# Git
git --version

# Editor de código (recomendado)
code --version  # VS Code
```

## 🏗️ Configuración del Servidor

### 1. Configuración de Usuario y Permisos

```bash
# Crear usuario para la aplicación
sudo adduser elnopal
sudo usermod -aG sudo elnopal

# Cambiar al usuario de la aplicación
su - elnopal

# Configurar directorio del proyecto
sudo mkdir -p /var/www/elnopal-app
sudo chown elnopal:elnopal /var/www/elnopal-app

# Configurar directorio web
sudo mkdir -p /var/www/html/elnopal
sudo chown -R www-data:www-data /var/www/html/elnopal
```

### 2. Configuración de MongoDB

```bash
# Iniciar y habilitar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Configurar base de datos
mongo
> use elnopal
> db.createUser({
    user: "elnopal_user",
    pwd: "tu_password_seguro",
    roles: [{ role: "dbAdmin", db: "elnopal" }]
})
> exit

# Habilitar autenticación (opcional pero recomendado)
sudo nano /etc/mongod.conf
# Añadir:
# security:
#   authorization: enabled

sudo systemctl restart mongod
```

### 3. Configuración de Nginx

```bash
# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/elnopal.es

# Contenido del archivo (ver más abajo)

# Habilitar el sitio
sudo ln -sf /etc/nginx/sites-available/elnopal.es /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Configuración de Nginx Completa

```nginx
# /etc/nginx/sites-available/elnopal.es
server {
    listen 80;
    listen [::]:80;
    server_name elnopal.es www.elnopal.es;

    # Logs
    access_log /var/log/nginx/elnopal.access.log;
    error_log /var/log/nginx/elnopal.error.log;

    # Frontend React
    location / {
        root /var/www/html/elnopal;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Headers de cache para recursos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary "Accept-Encoding";
        }

        # Cache para HTML
        location ~* \.(html)$ {
            expires 1h;
            add_header Cache-Control "public, must-revalidate";
        }
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO
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

    # Salud del sistema
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;

    # Límites de tamaño
    client_max_body_size 10M;

    # Bloquear archivos sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}

# Configuración SSL (cuando esté disponible)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name elnopal.es www.elnopal.es;
#
#     ssl_certificate /path/to/certificate.crt;
#     ssl_certificate_key /path/to/private.key;
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
#     ssl_prefer_server_ciphers off;
#
#     # Resto de la configuración...
# }

# Redirección HTTP a HTTPS (cuando SSL esté configurado)
# server {
#     listen 80;
#     listen [::]:80;
#     server_name elnopal.es www.elnopal.es;
#     return 301 https://$server_name$request_uri;
# }
```

## 🚀 Despliegue de Producción

### Método 1: Script Automatizado (Recomendado)

```bash
# Clonar el repositorio
cd /var/www/elnopal-app
git clone https://github.com/tu-usuario/elnopal-app.git .

# Hacer ejecutable el script
chmod +x deploy-production.sh

# Ejecutar despliegue
./deploy-production.sh
```

### Método 2: Despliegue Manual

#### 1. Preparar el Servidor

```bash
# Crear archivos de configuración
cd /var/www/elnopal-app/server
cp env.production.example .env

# Editar configuración
nano .env
```

#### 2. Variables de Entorno del Servidor

```bash
# /var/www/elnopal-app/server/.env
NODE_ENV=production
PORT=5000

# Base de datos
MONGODB_URI=mongodb://localhost:27017/elnopal
# O con autenticación:
# MONGODB_URI=mongodb://elnopal_user:password@localhost:27017/elnopal

# Seguridad
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro_aqui
SESSION_SECRET=tu_session_secret_muy_largo_y_seguro_aqui

# CORS
CORS_ORIGIN=https://elnopal.es

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_FROM=El Nopal <no-reply@elnopal.es>

# Logs
LOG_LEVEL=info
LOG_FILE=/var/log/elnopal/app.log
```

#### 3. Configurar Frontend

```bash
cd /var/www/elnopal-app/client
cp env.production.example .env.production

# Editar configuración
nano .env.production
```

```bash
# /var/www/elnopal-app/client/.env.production
REACT_APP_API_URL=https://elnopal.es/api
REACT_APP_SOCKET_URL=https://elnopal.es
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
```

#### 4. Instalar y Construir

```bash
# Instalar dependencias del servidor
cd /var/www/elnopal-app/server
npm ci --production

# Instalar dependencias del cliente
cd /var/www/elnopal-app/client
npm ci

# Optimizar imágenes
node optimize-images-enhanced.js

# Construir aplicación
npm run build:production

# Copiar build a directorio web
sudo cp -r build/* /var/www/html/elnopal/
sudo chown -R www-data:www-data /var/www/html/elnopal/
```

#### 5. Configurar PM2

```bash
cd /var/www/elnopal-app/server

# Crear archivo de configuración PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'elnopal-backend',
    script: 'src/index.js',
    cwd: '/var/www/elnopal-app/server',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: '/var/log/elnopal/combined.log',
    out_file: '/var/log/elnopal/out.log',
    error_file: '/var/log/elnopal/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    restart_delay: 4000
  }]
};
EOF

# Iniciar aplicación con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Verificar estado
pm2 status
pm2 logs elnopal-backend
```

## 💻 Despliegue de Desarrollo

### Método Rápido

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/elnopal-app.git
cd elnopal-app

# Hacer ejecutable y ejecutar
chmod +x deploy-development.sh
./deploy-development.sh
```

### Método Manual para Desarrollo

```bash
# Terminal 1 - Backend
cd server
npm install
cp env.production.example .env
# Editar .env con configuración local
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm start

# Terminal 3 - MongoDB (si no está como servicio)
mongod --dbpath /path/to/data
```

## 🔧 Configuración de Servicios

### Systemd para MongoDB

```bash
# /etc/systemd/system/mongod.service
[Unit]
Description=MongoDB Database Server
Documentation=https://docs.mongodb.org/manual
After=network-online.target
Wants=network-online.target

[Service]
User=mongodb
Group=mongodb
Type=notify
ExecStart=/usr/bin/mongod --config /etc/mongod.conf
PIDFile=/var/lib/mongodb/mongod.lock
TimeoutStartSec=0
TimeoutStopSec=30
Restart=always

[Install]
WantedBy=multi-user.target
```

### Logrotate para Aplicación

```bash
# /etc/logrotate.d/elnopal
/var/log/elnopal/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 📊 Monitoreo y Mantenimiento

### Comandos de Monitoreo

```bash
# Estado de servicios
systemctl status mongod nginx
pm2 status

# Logs en tiempo real
pm2 logs elnopal-backend
tail -f /var/log/nginx/elnopal.error.log

# Uso de recursos
htop
df -h
free -h

# Conexiones de red
netstat -tulpn | grep :5000
netstat -tulpn | grep :80
```

### Scripts de Monitoreo

```bash
#!/bin/bash
# /usr/local/bin/elnopal-health-check.sh

echo "🏥 CHEQUEO DE SALUD - EL NOPAL"
echo "============================="

# Verificar servicios
services=("mongod" "nginx")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✅ $service: RUNNING"
    else
        echo "❌ $service: STOPPED"
    fi
done

# Verificar aplicación
if pm2 list | grep -q "elnopal-backend.*online"; then
    echo "✅ Backend: RUNNING"
else
    echo "❌ Backend: STOPPED"
fi

# Verificar endpoints
if curl -f -s http://localhost:5000/api/health >/dev/null; then
    echo "✅ API: RESPONDING"
else
    echo "❌ API: NOT RESPONDING"
fi

if curl -f -s http://localhost/health >/dev/null; then
    echo "✅ Frontend: ACCESSIBLE"
else
    echo "❌ Frontend: NOT ACCESSIBLE"
fi

# Uso de recursos
echo ""
echo "📊 RECURSOS DEL SISTEMA"
echo "======================="
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
echo "RAM: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
echo "Disco: $(df / | awk 'NR==2{printf "%s", $5}')"

# Hacer ejecutable
chmod +x /usr/local/bin/elnopal-health-check.sh

# Crear cron job para chequeo automático
echo "*/5 * * * * /usr/local/bin/elnopal-health-check.sh >> /var/log/elnopal/health.log 2>&1" | crontab -
```

### Backup Automatizado

```bash
#!/bin/bash
# /usr/local/bin/elnopal-backup.sh

BACKUP_DIR="/var/backups/elnopal"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

mkdir -p "$BACKUP_PATH"

# Backup de archivos
cp -r /var/www/elnopal-app "$BACKUP_PATH/app"

# Backup de MongoDB
mongodump --db elnopal --out "$BACKUP_PATH/mongodb"

# Comprimir
tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "backup_$TIMESTAMP"
rm -rf "$BACKUP_PATH"

# Mantener solo 7 días de backups
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completado: $BACKUP_PATH.tar.gz"

# Programar backup diario
# 0 2 * * * /usr/local/bin/elnopal-backup.sh >> /var/log/elnopal/backup.log 2>&1
```

## ⚡ Optimizaciones de Rendimiento

### 1. Optimización de Base de Datos

```javascript
// Índices recomendados para MongoDB
db.reservations.createIndex({ "date": 1, "time": 1 })
db.reservations.createIndex({ "email": 1 })
db.reservations.createIndex({ "createdAt": -1 })
db.users.createIndex({ "email": 1 }, { unique: true })
db.reviews.createIndex({ "createdAt": -1 })
```

### 2. Configuración de Caché

```nginx
# Añadir a la configuración de Nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m use_temp_path=off;

# En location /api/
proxy_cache api_cache;
proxy_cache_revalidate on;
proxy_cache_min_uses 3;
proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
proxy_cache_background_update on;
proxy_cache_lock on;
```

### 3. Compresión de Archivos

```bash
# Pre-comprimir archivos estáticos
cd /var/www/html/elnopal
find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) -exec gzip -k {} \;

# Configurar Nginx para servir archivos pre-comprimidos
# Añadir a server block:
gzip_static on;
```

### 4. CDN y Optimización de Imágenes

```bash
# Optimizar imágenes existentes
cd /var/www/elnopal-app/client
node optimize-images-enhanced.js

# Configurar headers para imágenes optimizadas
# En Nginx:
location ~* \.(webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept";
}
```

## 🛡️ Seguridad

### Firewall (UFW)

```bash
# Configurar firewall básico
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Verificar estado
sudo ufw status verbose
```

### Fail2Ban

```bash
# Instalar Fail2Ban
sudo apt install fail2ban

# Configurar para Nginx
sudo tee /etc/fail2ban/jail.local << EOF
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/elnopal.error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/elnopal.access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/elnopal.access.log
maxretry = 2
EOF

sudo systemctl restart fail2ban
```

### Actualizaciones de Seguridad

```bash
# Script de actualización automática
#!/bin/bash
# /usr/local/bin/security-updates.sh

# Actualizar paquetes del sistema
apt update && apt upgrade -y

# Actualizar dependencias de Node.js (revisar manualmente)
cd /var/www/elnopal-app/server
npm audit fix

cd /var/www/elnopal-app/client
npm audit fix

# Reiniciar servicios si es necesario
if [ -f /var/run/reboot-required ]; then
    echo "Reinicio requerido"
    # Programar reinicio en horario de mantenimiento
fi

# Cron job semanal
# 0 3 * * 0 /usr/local/bin/security-updates.sh >> /var/log/security-updates.log 2>&1
```

## 🔍 Solución de Problemas

### Problemas Comunes

#### 1. Error 502 Bad Gateway

```bash
# Verificar que el backend está corriendo
pm2 status
pm2 logs elnopal-backend

# Verificar conexión de red
netstat -tulpn | grep :5000
curl http://localhost:5000/api/health

# Verificar logs de Nginx
tail -f /var/log/nginx/elnopal.error.log
```

#### 2. Error de Conexión a MongoDB

```bash
# Verificar estado de MongoDB
systemctl status mongod
sudo journalctl -u mongod

# Verificar conexión
mongo --eval "db.stats()"

# Verificar configuración
cat /etc/mongod.conf
```

#### 3. Problemas de Permisos

```bash
# Verificar permisos de archivos
ls -la /var/www/html/elnopal/
ls -la /var/www/elnopal-app/

# Corregir permisos
sudo chown -R www-data:www-data /var/www/html/elnopal/
sudo chmod -R 755 /var/www/html/elnopal/
```

#### 4. Agotamiento de Memoria

```bash
# Verificar uso de memoria
free -h
ps aux --sort=-%mem | head

# Configurar swap si es necesario
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Añadir a /etc/fstab para persistencia
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Logs y Diagnóstico

```bash
# Ubicaciones de logs importantes
/var/log/elnopal/          # Logs de la aplicación
/var/log/nginx/            # Logs de Nginx
/var/log/mongodb/          # Logs de MongoDB
~/.pm2/logs/               # Logs de PM2

# Comandos útiles para diagnóstico
pm2 monit                  # Monitor en tiempo real
nginx -t                   # Verificar configuración
systemctl status <service> # Estado de servicios
journalctl -u <service>    # Logs del sistema
```

## 📞 Contacto y Soporte

Para soporte técnico o preguntas sobre el despliegue:

- **Documentación**: Esta guía y README.md del proyecto
- **Logs**: Revisar siempre los logs antes de solicitar ayuda
- **Issues**: Crear issue en el repositorio con información detallada

---

**¡El Nopal está listo para servir a sus clientes! 🌮**