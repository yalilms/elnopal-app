#!/bin/bash

# 🔄 SCRIPT DE ACTUALIZACIÓN COMPLETO - El Nopal Restaurant
# Para actualizar el sitio después del primer despliegue
# Incluye: git pull, actualizacion de dependencias, build y reinicio de servicios

set -e

# Colores para mejor presentación
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración del servidor
VPS_IP="5.250.190.97"
PROJECT_PATH="/var/www/elnopal"
SERVICE_NAME="elnopal-backend"

echo -e "${BLUE}🔄 ACTUALIZANDO EL NOPAL RESTAURANT${NC}"
echo -e "${CYAN}================================================${NC}"

# Función para mostrar paso actual
show_step() {
    echo -e "\n${PURPLE}⏳ $1${NC}"
    echo -e "${CYAN}--------------------${NC}"
}

# Función para mostrar éxito
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar error
show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para verificar comando
check_command() {
    if [ $? -eq 0 ]; then
        show_success "$1"
    else
        show_error "$1 falló"
        exit 1
    fi
}

# Actualizar en el servidor
echo -e "${BLUE}🚀 Conectando al servidor $VPS_IP...${NC}"

ssh root@$VPS_IP << 'EOF'
#!/bin/bash

# Colores dentro del SSH
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_PATH="/var/www/elnopal"
SERVICE_NAME="elnopal-backend"

echo -e "\n${PURPLE}🔄 INICIANDO ACTUALIZACIÓN EN EL SERVIDOR${NC}"

# Verificar que el directorio del proyecto existe
if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Error: Directorio del proyecto no encontrado en $PROJECT_PATH${NC}"
    exit 1
fi

cd $PROJECT_PATH

# PASO 1: Verificar servicios antes de la actualización
echo -e "\n${PURPLE}📊 VERIFICANDO ESTADO ACTUAL DE SERVICIOS${NC}"
echo -e "${CYAN}--------------------------------------------${NC}"

echo -e "${BLUE}📋 Estado de PM2:${NC}"
pm2 status

echo -e "\n${BLUE}📋 Estado de Nginx:${NC}"
systemctl status nginx --no-pager -l || echo "Nginx no está corriendo"

echo -e "\n${BLUE}📋 Estado de MongoDB:${NC}"
systemctl status mongod --no-pager -l || echo "MongoDB no está corriendo"

# PASO 2: Backup de configuraciones importantes
echo -e "\n${PURPLE}💾 CREANDO BACKUP DE CONFIGURACIONES${NC}"
echo -e "${CYAN}-------------------------------------${NC}"

BACKUP_DIR="/var/backups/elnopal-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup de archivos .env
if [ -f "server/.env" ]; then
    cp server/.env $BACKUP_DIR/env-backup
    echo -e "${GREEN}✅ Backup de .env creado${NC}"
fi

# Backup de configuración de PM2
pm2 save --force > /dev/null 2>&1
echo -e "${GREEN}✅ Configuración de PM2 guardada${NC}"

# PASO 3: Actualizar código desde Git
echo -e "\n${PURPLE}📥 DESCARGANDO ÚLTIMOS CAMBIOS DESDE GIT${NC}"
echo -e "${CYAN}----------------------------------------${NC}"

# Stash cualquier cambio local no commiteado
git stash push -m "Auto-stash antes de actualización $(date)" > /dev/null 2>&1 || true

# Fetch los últimos cambios
echo -e "${BLUE}🔍 Obteniendo cambios remotos...${NC}"
git fetch origin

# Mostrar commits nuevos si los hay
echo -e "${BLUE}📋 Nuevos commits encontrados:${NC}"
git log HEAD..origin/main --oneline || echo "No hay nuevos commits"

# Pull de los cambios
echo -e "${BLUE}⬇️ Descargando cambios...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Código actualizado desde Git${NC}"
else
    echo -e "${RED}❌ Error al actualizar código desde Git${NC}"
    exit 1
fi

# PASO 4: Verificar y actualizar dependencias del servidor
echo -e "\n${PURPLE}📦 ACTUALIZANDO DEPENDENCIAS DEL SERVIDOR${NC}"
echo -e "${CYAN}-------------------------------------------${NC}"

cd server

# Verificar si package.json cambió
if git diff HEAD~1 HEAD --name-only | grep -q "server/package.json\|server/package-lock.json"; then
    echo -e "${YELLOW}⚠️ Dependencias del servidor cambiaron, actualizando...${NC}"
    
    # Limpiar cache de npm
    npm cache clean --force
    
    # Actualizar dependencias
    echo -e "${BLUE}📦 Instalando dependencias del servidor...${NC}"
    npm ci --production
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencias del servidor actualizadas${NC}"
    else
        echo -e "${RED}❌ Error al actualizar dependencias del servidor${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ No hay cambios en dependencias del servidor${NC}"
fi

# Auditar seguridad
echo -e "${BLUE}🔒 Verificando vulnerabilidades de seguridad...${NC}"
npm audit --audit-level=high
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ No se encontraron vulnerabilidades críticas${NC}"
else
    echo -e "${YELLOW}⚠️ Se encontraron vulnerabilidades, considerando auto-fix...${NC}"
    npm audit fix --force || true
fi

# PASO 5: Verificar y actualizar dependencias del cliente
echo -e "\n${PURPLE}🎨 ACTUALIZANDO DEPENDENCIAS DEL CLIENTE${NC}"
echo -e "${CYAN}------------------------------------------${NC}"

cd ../client

# Verificar si package.json del cliente cambió
if git diff HEAD~1 HEAD --name-only | grep -q "client/package.json\|client/package-lock.json"; then
    echo -e "${YELLOW}⚠️ Dependencias del cliente cambiaron, actualizando...${NC}"
    
    # Limpiar cache de npm
    npm cache clean --force
    
    # Actualizar dependencias
    echo -e "${BLUE}📦 Instalando dependencias del cliente...${NC}"
    npm ci
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencias del cliente actualizadas${NC}"
    else
        echo -e "${RED}❌ Error al actualizar dependencias del cliente${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ No hay cambios en dependencias del cliente${NC}"
    # Aún así, verificar que node_modules existe
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️ node_modules no existe, instalando...${NC}"
        npm ci
    fi
fi

# PASO 6: Construir el frontend
echo -e "\n${PURPLE}🏗️ CONSTRUYENDO FRONTEND OPTIMIZADO${NC}"
echo -e "${CYAN}-----------------------------------${NC}"

# Verificar si hubo cambios en el código del frontend
if git diff HEAD~1 HEAD --name-only | grep -q "client/src\|client/public"; then
    echo -e "${YELLOW}⚠️ Código del frontend cambió, reconstruyendo...${NC}"
    NEEDS_BUILD=true
else
    echo -e "${BLUE}ℹ️ No hay cambios en el frontend, pero construyendo por seguridad...${NC}"
    NEEDS_BUILD=true
fi

if [ "$NEEDS_BUILD" = true ]; then
    # Limpiar build anterior
    rm -rf build/
    
    # Construir para producción
    echo -e "${BLUE}🔨 Ejecutando build de producción...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend construido exitosamente${NC}"
        echo -e "${BLUE}📊 Tamaño del build:${NC}"
        du -sh build/ || echo "No se pudo obtener el tamaño"
    else
        echo -e "${RED}❌ Error al construir el frontend${NC}"
        exit 1
    fi
fi

# PASO 7: Reiniciar servicios backend
echo -e "\n${PURPLE}🔄 REINICIANDO SERVICIOS DEL BACKEND${NC}"
echo -e "${CYAN}------------------------------------${NC}"

cd ../server

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado${NC}"
    exit 1
fi

# Reiniciar el backend con PM2
echo -e "${BLUE}🔄 Reiniciando backend con PM2...${NC}"
pm2 restart $SERVICE_NAME

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend reiniciado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al reiniciar backend${NC}"
    # Intentar iniciar si no estaba corriendo
    echo -e "${YELLOW}⚠️ Intentando iniciar el servicio...${NC}"
    pm2 start ecosystem.config.js
fi

# Esperar un momento para que el servicio inicie
sleep 3

# PASO 8: Recargar configuración de Nginx
echo -e "\n${PURPLE}🌐 ACTUALIZANDO CONFIGURACIÓN DE NGINX${NC}"
echo -e "${CYAN}--------------------------------------${NC}"

# Verificar configuración de Nginx
nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuración de Nginx válida${NC}"
    
    # Recargar Nginx
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx recargado${NC}"
else
    echo -e "${RED}❌ Error en configuración de Nginx${NC}"
fi

# PASO 9: Verificación final de servicios
echo -e "\n${PURPLE}🔍 VERIFICACIÓN FINAL DE SERVICIOS${NC}"
echo -e "${CYAN}----------------------------------${NC}"

echo -e "${BLUE}📋 Estado final de PM2:${NC}"
pm2 status

echo -e "\n${BLUE}📋 Estado final de Nginx:${NC}"
systemctl is-active nginx && echo -e "${GREEN}✅ Nginx está activo${NC}" || echo -e "${RED}❌ Nginx no está activo${NC}"

echo -e "\n${BLUE}📋 Estado final de MongoDB:${NC}"
systemctl is-active mongod && echo -e "${GREEN}✅ MongoDB está activo${NC}" || echo -e "${RED}❌ MongoDB no está activo${NC}"

# Verificar que el backend responde
echo -e "\n${BLUE}🔍 Verificando que el backend responde...${NC}"
sleep 2
curl -s http://localhost:5000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend respondiendo correctamente${NC}"
else
    echo -e "${YELLOW}⚠️ Backend puede necesitar más tiempo para iniciar${NC}"
fi

# PASO 10: Logs de verificación
echo -e "\n${PURPLE}📋 LOGS RECIENTES DEL BACKEND${NC}"
echo -e "${CYAN}-----------------------------${NC}"
pm2 logs $SERVICE_NAME --lines 10 --nostream

# Información de backup
echo -e "\n${PURPLE}💾 INFORMACIÓN DE BACKUP${NC}"
echo -e "${CYAN}------------------------${NC}"
echo -e "${BLUE}📁 Backup creado en: $BACKUP_DIR${NC}"
echo -e "${BLUE}📅 Fecha de actualización: $(date)${NC}"

echo -e "\n${GREEN}🎉 ¡ACTUALIZACIÓN COMPLETADA EXITOSAMENTE!${NC}"
echo -e "${CYAN}===========================================${NC}"
EOF

# Verificación final desde el script local
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ¡ACTUALIZACIÓN REMOTA COMPLETADA EXITOSAMENTE!${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo -e "${BLUE}🌐 Sitio Web: https://elnopal.es${NC}"
    echo -e "${BLUE}🔧 Panel Admin: https://elnopal.es/admin${NC}"
    echo -e "${BLUE}📊 Monitoreo: ssh root@$VPS_IP 'pm2 monit'${NC}"
    echo -e "${BLUE}📋 Logs: ssh root@$VPS_IP 'pm2 logs elnopal-backend'${NC}"
    
    echo -e "\n${YELLOW}📝 COMANDOS ÚTILES:${NC}"
    echo -e "${CYAN}• Ver estado: ssh root@$VPS_IP 'pm2 status'${NC}"
    echo -e "${CYAN}• Ver logs: ssh root@$VPS_IP 'pm2 logs elnopal-backend --lines 50'${NC}"
    echo -e "${CYAN}• Reiniciar: ssh root@$VPS_IP 'pm2 restart elnopal-backend'${NC}"
    echo -e "${CYAN}• Monitoreo: ssh root@$VPS_IP 'pm2 monit'${NC}"
else
    echo -e "\n${RED}❌ ERROR EN LA ACTUALIZACIÓN${NC}"
    echo -e "${YELLOW}⚠️ Revisa los logs para más detalles${NC}"
    echo -e "${CYAN}• ssh root@$VPS_IP 'pm2 logs elnopal-backend'${NC}"
    exit 1
fi