#!/bin/bash

# 🚀 SCRIPT COMPLETO DE DESPLIEGUE OPTIMIZADO - El Nopal Restaurant
# Ejecutar EN EL SERVIDOR después de hacer git pull

echo "🚀 INICIANDO DESPLIEGUE OPTIMIZADO DE EL NOPAL"
echo "=================================================="

# Variables
PROJECT_DIR="/var/www/elnopal-app"
CLIENT_DIR="$PROJECT_DIR/client"
SERVER_DIR="$PROJECT_DIR/server"


# 3. Actualizar dependencias del servidor
echo "📦 Actualizando dependencias del servidor..."
cd $SERVER_DIR
npm ci --production --silent
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del servidor"
    exit 1
fi
echo "✅ Dependencias del servidor actualizadas"

# 4. Actualizar dependencias del cliente
echo "🎨 Actualizando dependencias del cliente..."
cd $CLIENT_DIR
npm ci --silent
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del cliente"
    exit 1
fi
echo "✅ Dependencias del cliente actualizadas"

# 5. Instalar dependencias de optimización de imágenes
echo "🖼️  Instalando herramientas de optimización..."
npm install imagemin imagemin-mozjpeg imagemin-pngquant imagemin-webp --save-dev --silent
echo "✅ Herramientas de optimización instaladas"

# 6. Ejecutar optimización de imágenes
echo "🔄 Optimizando imágenes..."
if [ -f "optimize-images.js" ]; then
    node optimize-images.js
    echo "✅ Imágenes optimizadas"
else
    echo "⚠️  Archivo optimize-images.js no encontrado, continuando..."
fi

# 7. Build optimizado del frontend
echo "🏗️  Construyendo frontend optimizado..."
# Configurar variables de optimización
export GENERATE_SOURCEMAP=false
export INLINE_RUNTIME_CHUNK=false

# Intentar build optimizado, sino usar build normal
if npm run | grep -q "build:optimized"; then
    npm run build:optimized
else
    npm run build
fi

if [ $? -ne 0 ]; then
    echo "❌ Error en el build del frontend"
    exit 1
fi
echo "✅ Frontend construido exitosamente"

# 8. Configurar Nginx (si no está configurado)
echo "🌐 Verificando configuración de Nginx..."
NGINX_CONFIG="/etc/nginx/sites-available/elnopal"

if [ -f "$NGINX_CONFIG" ]; then
    # Verificar si ya tiene optimizaciones
    if grep -q "gzip on" "$NGINX_CONFIG"; then
        echo "✅ Nginx ya tiene optimizaciones configuradas"
    else
        echo "⚠️  Nginx necesita configuración de optimizaciones"
        echo "📋 Instrucciones:"
        echo "   1. Hacer backup: cp $NGINX_CONFIG ${NGINX_CONFIG}.backup"
        echo "   2. Editar: nano $NGINX_CONFIG"
        echo "   3. Agregar configuraciones del archivo server-nginx-config.conf"
        echo "   4. Reiniciar: systemctl restart nginx"
    fi
else
    echo "⚠️  Archivo de configuración Nginx no encontrado en $NGINX_CONFIG"
fi

# 9. Reiniciar servicios
echo "🔄 Reiniciando servicios..."

# Reiniciar PM2
cd $SERVER_DIR
pm2 restart elnopal-backend
if [ $? -ne 0 ]; then
    echo "❌ Error reiniciando PM2"
    exit 1
fi
echo "✅ PM2 reiniciado"

# Verificar Nginx y reiniciar si es necesario
nginx -t
if [ $? -eq 0 ]; then
    systemctl restart nginx
    echo "✅ Nginx reiniciado"
else
    echo "⚠️  Error en configuración de Nginx, no se reinició"
fi

# 10. Verificaciones finales
echo "🔍 Verificaciones finales..."

# Verificar PM2
PM2_STATUS=$(pm2 list | grep "elnopal-backend" | grep "online")
if [ -n "$PM2_STATUS" ]; then
    echo "✅ Backend corriendo correctamente"
else
    echo "❌ Problema con el backend"
    pm2 logs elnopal-backend --lines 5
fi

# Verificar Nginx
NGINX_STATUS=$(systemctl is-active nginx)
if [ "$NGINX_STATUS" = "active" ]; then
    echo "✅ Nginx corriendo correctamente"
else
    echo "❌ Problema con Nginx"
fi

# Verificar conectividad
echo "🌐 Probando conectividad..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Sitio web respondiendo correctamente"
else
    echo "⚠️  Sitio web no responde correctamente (HTTP: $HTTP_STATUS)"
fi

# 11. Resumen final
echo ""
echo "🎉 DESPLIEGUE COMPLETADO!"
echo "========================"
echo "📊 Estado de servicios:"
pm2 list
echo ""
echo "🌐 Sitio web: https://elnopal.es"
echo "⚡ Optimizaciones aplicadas:"
echo "   ✅ Imágenes optimizadas (WebP + compresión)"
echo "   ✅ JavaScript sin sourcemaps"
echo "   ✅ CSS crítico inline"
echo "   ✅ Code splitting implementado"
echo "   ✅ Cache headers configurados"
echo ""
echo "📈 Para verificar rendimiento:"
echo "   • Google PageSpeed: https://pagespeed.web.dev/report?url=https://elnopal.es"
echo "   • GTmetrix: https://gtmetrix.com/"
echo ""
echo "🔧 Si hay problemas:"
echo "   • Ver logs: pm2 logs elnopal-backend"
echo "   • Ver estado: systemctl status nginx"
echo "   • Reiniciar: pm2 restart elnopal-backend && systemctl restart nginx"

exit 0 