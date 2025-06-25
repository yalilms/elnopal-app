#!/bin/bash

# 🚀 SCRIPT SIMPLE DE ACTUALIZACIÓN - El Nopal Restaurant
# Ejecutar directamente en el servidor

echo "🔄 Iniciando actualización..."

# 1. Hacer git pull
echo "📥 Haciendo git pull..."
git pull origin main

# 2. Actualizar dependencias del servidor
echo "📦 Actualizando dependencias del servidor..."
cd server
npm ci --production

# 3. Actualizar dependencias del cliente
echo "🎨 Actualizando dependencias del cliente..."
cd ../client
npm ci

# 4. Construir frontend con optimizaciones
echo "🏗️ Construyendo frontend con optimizaciones..."
# Verificar si existe el script optimizado
if npm run | grep -q "build:optimized"; then
    npm run build:optimized
else
    npm run build
fi

# 5. Reiniciar backend
echo "🔄 Reiniciando backend..."
cd ../server
pm2 restart elnopal-backend

# 6. Verificar estado
echo "📊 Estado final:"
pm2 status

echo "✅ ¡Actualización completada!"
echo "🌐 Sitio: https://elnopal.es" 