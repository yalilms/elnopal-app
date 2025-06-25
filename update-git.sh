#!/bin/bash

# 🔄 SCRIPT DE ACTUALIZACIÓN - El Nopal Restaurant
# Para actualizar el sitio después del primer despliegue

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

VPS_IP="5.250.190.97"

echo -e "${BLUE}🔄 Actualizando El Nopal Restaurant${NC}"

# Verificar cambios pendientes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}📝 Guardando cambios locales...${NC}"
    git add .
    echo "Describe los cambios realizados:"
    read -r commit_message
    git commit -m "$commit_message"
fi

# Subir cambios
echo -e "${BLUE}📤 Subiendo cambios al repositorio...${NC}"
git push origin main || git push origin master

# Actualizar en el servidor
echo -e "${BLUE}🚀 Actualizando servidor...${NC}"
ssh root@$VPS_IP << 'EOF'
cd /var/www/elnopal
echo "🔄 Descargando últimos cambios..."
git pull origin main || git pull origin master

echo "🏗️ Construyendo cliente..."
cd client
npm run build

echo "🔄 Reiniciando backend..."
cd ../server
pm2 restart elnopal-backend

echo "✅ Actualización completada!"
EOF

echo -e "${GREEN}🎉 ¡Sitio actualizado exitosamente!${NC}"
echo -e "${BLUE}🌐 Visita: https://elnopal.es${NC}" 