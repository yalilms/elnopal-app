#!/bin/bash

# Script para verificar optimizaciones del servidor
# Uso: ./verify-server.sh https://tudominio.com

if [ -z "$1" ]; then
    echo "❌ Error: Proporciona la URL del sitio"
    echo "Uso: ./verify-server.sh https://tudominio.com"
    exit 1
fi

URL=$1
echo "🔍 Verificando optimizaciones en: $URL"
echo "=================================================="

# 1. Verificar GZIP
echo "📦 Verificando compresión GZIP..."
GZIP_CHECK=$(curl -H "Accept-Encoding: gzip" -s -I "$URL" | grep -i "content-encoding: gzip")
if [ -n "$GZIP_CHECK" ]; then
    echo "✅ GZIP está funcionando"
else
    echo "❌ GZIP no está habilitado"
fi

# 2. Verificar headers de cache
echo "🕐 Verificando headers de cache..."
CACHE_CHECK=$(curl -s -I "$URL/static/css/" | grep -i "cache-control")
if [ -n "$CACHE_CHECK" ]; then
    echo "✅ Headers de cache configurados"
else
    echo "⚠️  Headers de cache no detectados"
fi

# 3. Verificar Content-Type correcto
echo "📄 Verificando Content-Type..."
CONTENT_TYPE=$(curl -s -I "$URL" | grep -i "content-type: text/html")
if [ -n "$CONTENT_TYPE" ]; then
    echo "✅ Content-Type correcto para HTML"
else
    echo "❌ Content-Type incorrecto"
fi

# 4. Verificar que React Router funciona
echo "🔄 Verificando React Router..."
ROUTER_CHECK=$(curl -s -w "%{http_code}" "$URL/nosotros" -o /dev/null)
if [ "$ROUTER_CHECK" = "200" ]; then
    echo "✅ React Router funcionando"
else
    echo "❌ React Router no configurado (error $ROUTER_CHECK)"
fi

# 5. Verificar recursos estáticos
echo "🖼️  Verificando recursos estáticos..."
CSS_CHECK=$(curl -s -w "%{http_code}" "$URL/static/css/" -o /dev/null)
if [ "$CSS_CHECK" = "200" ] || [ "$CSS_CHECK" = "404" ]; then
    echo "✅ Ruta de recursos estáticos accesible"
else
    echo "❌ Problemas con recursos estáticos"
fi

echo "=================================================="
echo "🎯 Verificación completada!"
echo ""
echo "📊 Para análisis completo, usa:"
echo "   • Google PageSpeed: https://pagespeed.web.dev/report?url=$URL"
echo "   • GTmetrix: https://gtmetrix.com/reports/análisis/$URL"
echo ""
echo "💡 Si hay errores, revisa:"
echo "   • Configuración del servidor web (Apache/Nginx)"
echo "   • Permisos de archivos"
echo "   • Módulos habilitados" 