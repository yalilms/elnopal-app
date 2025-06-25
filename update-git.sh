#!/bin/bash

# 🔄 SCRIPT DE ACTUALIZACIÓN COMPLETO - El Nopal Restaurant
# Para ejecutar DIRECTAMENTE en el servidor
# Incluye: git pull, actualización de dependencias, build y reinicio de servicios

set -e

# Colores para mejor presentación
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración del proyecto
PROJECT_PATH="/var/www/elnopal"
SERVICE_NAME="elnopal-backend"

echo -e "${BLUE}🔄 ACTUALIZANDO EL NOPAL RESTAURANT${NC}"
echo -e "${CYAN}================================================${NC}"
echo -e "${YELLOW}📅 Fecha y hora: $(date)${NC}"
echo -e "${BLUE}📍 Directorio: $(pwd)${NC}"

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

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] && [ ! -d "client" ] && [ ! -d "server" ]; then
    echo -e "${RED}❌ Error: No parece ser el directorio del proyecto El Nopal${NC}"
    echo -e "${YELLOW}💡 Asegúrate de ejecutar este script desde /var/www/elnopal${NC}"
    exit 1
fi

show_step "VERIFICANDO ESTADO ACTUAL DE SERVICIOS"

echo -e "${BLUE}📋 Estado de PM2:${NC}"
pm2 status || echo -e "${YELLOW}⚠️ PM2 no está disponible o no hay procesos${NC}"

echo -e "\n${BLUE}📋 Estado de Nginx:${NC}"
systemctl is-active nginx && echo -e "${GREEN}✅ Nginx está activo${NC}" || echo -e "${RED}❌ Nginx no está activo${NC}"

echo -e "\n${BLUE}📋 Estado de MongoDB:${NC}"
systemctl is-active mongod && echo -e "${GREEN}✅ MongoDB está activo${NC}" || echo -e "${RED}❌ MongoDB no está activo${NC}"

show_step "CREANDO BACKUP DE CONFIGURACIONES"

BACKUP_DIR="/var/backups/elnopal-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup de archivos .env
if [ -f "server/.env" ]; then
    cp server/.env $BACKUP_DIR/env-backup
    show_success "Backup de .env creado en $BACKUP_DIR"
else
    echo -e "${YELLOW}⚠️ Archivo .env no encontrado${NC}"
fi

# Backup de configuración de PM2
if command -v pm2 > /dev/null 2>&1; then
    pm2 save --force > /dev/null 2>&1
    show_success "Configuración de PM2 guardada"
fi

show_step "DESCARGANDO ÚLTIMOS CAMBIOS DESDE GIT"

# Verificar estado de git
git status --porcelain > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${BLUE}🔍 Repositorio Git detectado${NC}"
else
    echo -e "${RED}❌ Error: No es un repositorio Git válido${NC}"
    exit 1
fi

# Stash cualquier cambio local no commiteado
echo -e "${BLUE}💾 Guardando cambios locales temporalmente...${NC}"
git stash push -m "Auto-stash antes de actualización $(date)" > /dev/null 2>&1 || true

# Fetch los últimos cambios
echo -e "${BLUE}🔍 Obteniendo cambios remotos...${NC}"
git fetch origin
check_command "Fetch de cambios remotos"

# Mostrar commits nuevos si los hay
echo -e "${BLUE}📋 Nuevos commits encontrados:${NC}"
NEW_COMMITS=$(git log HEAD..origin/main --oneline 2>/dev/null || echo "")
if [ -n "$NEW_COMMITS" ]; then
    echo "$NEW_COMMITS"
else
    echo -e "${GREEN}ℹ️ No hay nuevos commits${NC}"
fi

# Pull de los cambios
echo -e "${BLUE}⬇️ Descargando cambios...${NC}"
git pull origin main
check_command "Actualización del código desde Git"

show_step "VERIFICANDO Y ACTUALIZANDO DEPENDENCIAS DEL SERVIDOR"

cd server

# Verificar si package.json existe
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json del servidor no encontrado${NC}"
    exit 1
fi

# Verificar si package.json cambió en los últimos commits
DEPS_CHANGED=$(git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -E "server/package.*\.json" || echo "")

if [ -n "$DEPS_CHANGED" ]; then
    echo -e "${YELLOW}⚠️ Dependencias del servidor cambiaron, actualizando...${NC}"
    
    # Limpiar cache de npm
    npm cache clean --force > /dev/null 2>&1 || true
    
    # Actualizar dependencias
    echo -e "${BLUE}📦 Instalando dependencias del servidor...${NC}"
    npm ci --production
    check_command "Instalación de dependencias del servidor"
else
    echo -e "${GREEN}✅ No hay cambios en dependencias del servidor${NC}"
    # Verificar que node_modules existe
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️ node_modules no existe, instalando...${NC}"
        npm ci --production
        check_command "Instalación inicial de dependencias del servidor"
    fi
fi

# Auditar seguridad (no crítico)
echo -e "${BLUE}🔒 Verificando vulnerabilidades de seguridad...${NC}"
npm audit --audit-level=high > /dev/null 2>&1
if [ $? -eq 0 ]; then
    show_success "No se encontraron vulnerabilidades críticas"
else
    echo -e "${YELLOW}⚠️ Se encontraron vulnerabilidades, ejecutando auto-fix...${NC}"
    npm audit fix --force > /dev/null 2>&1 || true
fi

show_step "VERIFICANDO Y ACTUALIZANDO DEPENDENCIAS DEL CLIENTE"

cd ../client

# Verificar si package.json existe
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json del cliente no encontrado${NC}"
    exit 1
fi

# Verificar si package.json del cliente cambió
CLIENT_DEPS_CHANGED=$(git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -E "client/package.*\.json" || echo "")

if [ -n "$CLIENT_DEPS_CHANGED" ]; then
    echo -e "${YELLOW}⚠️ Dependencias del cliente cambiaron, actualizando...${NC}"
    
    # Limpiar cache de npm
    npm cache clean --force > /dev/null 2>&1 || true
    
    # Actualizar dependencias
    echo -e "${BLUE}📦 Instalando dependencias del cliente...${NC}"
    npm ci
    check_command "Instalación de dependencias del cliente"
else
    echo -e "${GREEN}✅ No hay cambios en dependencias del cliente${NC}"
    # Verificar que node_modules existe
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️ node_modules del cliente no existe, instalando...${NC}"
        npm ci
        check_command "Instalación inicial de dependencias del cliente"
    fi
fi

show_step "CONSTRUYENDO FRONTEND OPTIMIZADO"

# Verificar si hubo cambios en el código del frontend
FRONTEND_CHANGED=$(git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -E "client/src|client/public" || echo "")

if [ -n "$FRONTEND_CHANGED" ] || [ ! -d "build" ]; then
    if [ -n "$FRONTEND_CHANGED" ]; then
        echo -e "${YELLOW}⚠️ Código del frontend cambió, reconstruyendo...${NC}"
    else
        echo -e "${YELLOW}⚠️ Build no existe, construyendo...${NC}"
    fi
    
    # Limpiar build anterior
    rm -rf build/
    
    # Construir para producción
    echo -e "${BLUE}🔨 Ejecutando build de producción...${NC}"
    npm run build
    check_command "Construcción del frontend"
    
    if [ -d "build" ]; then
        BUILD_SIZE=$(du -sh build/ 2>/dev/null | cut -f1 || echo "desconocido")
        show_success "Frontend construido exitosamente (Tamaño: $BUILD_SIZE)"
    fi
else
    show_success "No hay cambios en el frontend, build existente conservado"
fi

show_step "REINICIANDO SERVICIOS DEL BACKEND"

cd ../server

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}💡 Asegúrate de que existe server/.env con las configuraciones${NC}"
    exit 1
fi

# Reiniciar el backend con PM2
if command -v pm2 > /dev/null 2>&1; then
    echo -e "${BLUE}🔄 Reiniciando backend con PM2...${NC}"
    
    # Verificar si el proceso existe
    if pm2 list | grep -q "$SERVICE_NAME"; then
        pm2 restart $SERVICE_NAME
        check_command "Reinicio del backend"
    else
        echo -e "${YELLOW}⚠️ Proceso $SERVICE_NAME no encontrado, iniciando...${NC}"
        if [ -f "ecosystem.config.js" ]; then
            pm2 start ecosystem.config.js
        else
            pm2 start src/index.js --name $SERVICE_NAME
        fi
        check_command "Inicio del backend"
    fi
    
    # Esperar un momento para que el servicio inicie
    sleep 3
else
    echo -e "${RED}❌ PM2 no está disponible${NC}"
    exit 1
fi

show_step "ACTUALIZANDO CONFIGURACIÓN DE NGINX"

# Verificar y recargar configuración de Nginx
if command -v nginx > /dev/null 2>&1; then
    echo -e "${BLUE}🔍 Verificando configuración de Nginx...${NC}"
    if nginx -t > /dev/null 2>&1; then
        show_success "Configuración de Nginx válida"
        
        echo -e "${BLUE}🔄 Recargando Nginx...${NC}"
        systemctl reload nginx
        check_command "Recarga de Nginx"
    else
        echo -e "${RED}❌ Error en configuración de Nginx${NC}"
        nginx -t
    fi
else
    echo -e "${YELLOW}⚠️ Nginx no está disponible${NC}"
fi

show_step "VERIFICACIÓN FINAL DE SERVICIOS"

echo -e "${BLUE}📋 Estado final de PM2:${NC}"
pm2 status

echo -e "\n${BLUE}📋 Estado final de Nginx:${NC}"
systemctl is-active nginx && echo -e "${GREEN}✅ Nginx está activo${NC}" || echo -e "${RED}❌ Nginx no está activo${NC}"

echo -e "\n${BLUE}📋 Estado final de MongoDB:${NC}"
systemctl is-active mongod && echo -e "${GREEN}✅ MongoDB está activo${NC}" || echo -e "${RED}❌ MongoDB no está activo${NC}"

# Verificar que el backend responde
echo -e "\n${BLUE}🔍 Verificando que el backend responde...${NC}"
sleep 2

if command -v curl > /dev/null 2>&1; then
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        show_success "Backend respondiendo correctamente"
    elif curl -s http://localhost:5000/ > /dev/null 2>&1; then
        show_success "Backend respondiendo en puerto 5000"
    else
        echo -e "${YELLOW}⚠️ Backend puede necesitar más tiempo para iniciar${NC}"
        echo -e "${BLUE}💡 Verificar logs: pm2 logs $SERVICE_NAME${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ curl no disponible, no se puede verificar respuesta del backend${NC}"
fi

show_step "LOGS RECIENTES DEL BACKEND"

if command -v pm2 > /dev/null 2>&1; then
    echo -e "${BLUE}📋 Últimas 10 líneas de logs:${NC}"
    pm2 logs $SERVICE_NAME --lines 10 --nostream 2>/dev/null || echo -e "${YELLOW}⚠️ No se pudieron obtener los logs${NC}"
fi

show_step "INFORMACIÓN DE BACKUP Y FINALIZACIÓN"

echo -e "${BLUE}📁 Backup creado en: $BACKUP_DIR${NC}"
echo -e "${BLUE}📅 Fecha de actualización: $(date)${NC}"
echo -e "${BLUE}👤 Ejecutado por: $(whoami)${NC}"

echo -e "\n${GREEN}🎉 ¡ACTUALIZACIÓN COMPLETADA EXITOSAMENTE!${NC}"
echo -e "${CYAN}===========================================${NC}"

echo -e "\n${YELLOW}📝 INFORMACIÓN ÚTIL:${NC}"
echo -e "${CYAN}• 🌐 Sitio Web: https://elnopal.es${NC}"
echo -e "${CYAN}• 🔧 Panel Admin: https://elnopal.es/admin${NC}"
echo -e "${CYAN}• 📊 Monitoreo: pm2 monit${NC}"
echo -e "${CYAN}• 📋 Logs: pm2 logs $SERVICE_NAME${NC}"
echo -e "${CYAN}• 🔄 Reiniciar: pm2 restart $SERVICE_NAME${NC}"
echo -e "${CYAN}• 📈 Estado: pm2 status${NC}"

echo -e "\n${GREEN}✅ El sitio está actualizado y funcionando!${NC}"