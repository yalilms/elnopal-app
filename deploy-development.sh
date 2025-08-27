#!/bin/bash

# 🚀 SCRIPT DE DESPLIEGUE PARA DESARROLLO - El Nopal Restaurant
# Script simplificado para entorno de desarrollo y testing

set -e

# ===============================================================================
# CONFIGURACIÓN
# ===============================================================================

echo "🚀 INICIANDO DESPLIEGUE DE DESARROLLO - EL NOPAL"
echo "==============================================="

PROJECT_DIR="$(pwd)"
CLIENT_DIR="$PROJECT_DIR/client"
SERVER_DIR="$PROJECT_DIR/server"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# ===============================================================================
# VERIFICACIONES BÁSICAS
# ===============================================================================

log_info "Verificando entorno de desarrollo..."

# Verificar Node.js y npm
command -v node >/dev/null 2>&1 || { echo "Node.js requerido"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm requerido"; exit 1; }

# Verificar directorios
[ ! -d "$CLIENT_DIR" ] && { echo "Directorio client no encontrado"; exit 1; }
[ ! -d "$SERVER_DIR" ] && { echo "Directorio server no encontrado"; exit 1; }

log_success "Verificaciones completadas"

# ===============================================================================
# INSTALAR DEPENDENCIAS DEL SERVIDOR
# ===============================================================================

log_info "Instalando dependencias del servidor..."
cd "$SERVER_DIR"

# Limpiar e instalar
npm ci

# Verificar archivo .env
if [ ! -f ".env" ]; then
    if [ -f "env.production.example" ]; then
        log_warning "Creando .env desde ejemplo"
        cp env.production.example .env
    else
        log_warning "Archivo .env no encontrado - crear manualmente"
    fi
fi

log_success "Dependencias del servidor instaladas"

# ===============================================================================
# INSTALAR DEPENDENCIAS DEL CLIENTE
# ===============================================================================

log_info "Instalando dependencias del cliente..."
cd "$CLIENT_DIR"

# Limpiar e instalar
npm ci

# Verificar configuración de producción
if [ -f "env.production.example" ] && [ ! -f ".env.production" ]; then
    log_warning "Creando .env.production desde ejemplo"
    cp env.production.example .env.production
fi

log_success "Dependencias del cliente instaladas"

# ===============================================================================
# OPTIMIZAR IMÁGENES
# ===============================================================================

log_info "Optimizando imágenes..."

if [ -f "optimize-images.js" ]; then
    node optimize-images.js || log_warning "Error optimizando imágenes"
else
    log_warning "Script de optimización de imágenes no encontrado"
fi

log_success "Optimización completada"

# ===============================================================================
# BUILD DEL CLIENTE
# ===============================================================================

log_info "Construyendo aplicación cliente..."

# Build de producción
npm run build

# Verificar que el build existe
if [ ! -d "build" ]; then
    echo "❌ Build falló"
    exit 1
fi

log_success "Build del cliente completado"

# ===============================================================================
# INICIAR SERVICIOS
# ===============================================================================

log_info "Iniciando servicios..."

# Crear directorio de logs si no existe
mkdir -p "$PROJECT_DIR/logs"

# Función para manejar cierre limpio
cleanup() {
    echo ""
    log_info "Deteniendo servicios..."
    [ ! -z "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null || true
    [ ! -z "$CLIENT_PID" ] && kill $CLIENT_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar servidor backend
cd "$SERVER_DIR"
echo "Iniciando servidor backend en puerto 5000..."
npm start > "$PROJECT_DIR/logs/server.log" 2>&1 &
SERVER_PID=$!

# Esperar un momento para que el servidor inicie
sleep 3

# Verificar que el servidor está corriendo
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Error iniciando servidor backend"
    cat "$PROJECT_DIR/logs/server.log"
    exit 1
fi

# Servir frontend con servidor simple
cd "$CLIENT_DIR"
echo "Sirviendo frontend en puerto 3000..."

# Usar serve si está disponible, sino usar python
if command -v serve >/dev/null 2>&1; then
    serve -s build -l 3000 > "$PROJECT_DIR/logs/client.log" 2>&1 &
    CLIENT_PID=$!
elif command -v python3 >/dev/null 2>&1; then
    cd build
    python3 -m http.server 3000 > "$PROJECT_DIR/logs/client.log" 2>&1 &
    CLIENT_PID=$!
    cd ..
else
    log_warning "Servidor web no encontrado. Instalar 'serve': npm install -g serve"
    log_warning "O usar python3 para servir archivos estáticos"
fi

# ===============================================================================
# VERIFICACIONES
# ===============================================================================

log_info "Verificando servicios..."

sleep 5

# Verificar backend
if curl -f -s http://localhost:5000/api/health >/dev/null 2>&1; then
    log_success "Backend API respondiendo en http://localhost:5000"
else
    log_warning "Backend API podría no estar respondiendo"
fi

# Verificar frontend
if curl -f -s http://localhost:3000 >/dev/null 2>&1; then
    log_success "Frontend servido en http://localhost:3000"
else
    log_warning "Frontend podría no estar accesible"
fi

# ===============================================================================
# INFORMACIÓN FINAL
# ===============================================================================

echo ""
echo "🎉 DESPLIEGUE DE DESARROLLO COMPLETADO"
echo "====================================="
echo ""
echo "🔗 URLs disponibles:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:5000"
echo "   • Admin: http://localhost:3000/admin"
echo ""
echo "📋 Información de desarrollo:"
echo "   • Logs del servidor: $PROJECT_DIR/logs/server.log"
echo "   • Logs del cliente: $PROJECT_DIR/logs/client.log"
echo "   • PID del servidor: $SERVER_PID"
[ ! -z "$CLIENT_PID" ] && echo "   • PID del cliente: $CLIENT_PID"
echo ""
echo "🛠️  Para desarrollo activo:"
echo "   • Servidor: cd server && npm run dev"
echo "   • Cliente: cd client && npm start"
echo ""
echo "💡 Presiona Ctrl+C para detener todos los servicios"
echo ""

# Mantener el script corriendo
if [ ! -z "$CLIENT_PID" ]; then
    wait $CLIENT_PID $SERVER_PID
else
    wait $SERVER_PID
fi