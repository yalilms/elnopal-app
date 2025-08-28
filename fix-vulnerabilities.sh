#!/bin/bash

# Script para corregir vulnerabilidades en El Nopal Restaurant
echo "🛡️  Corrigiendo vulnerabilidades en El Nopal Restaurant..."

# Función para mostrar progreso
show_progress() {
    echo "⏳ $1..."
}

# Backend - Corregir vulnerabilidades
show_progress "Corrigiendo vulnerabilidades del backend"
cd /workspace/server

echo "📦 Actualizando dependencias del servidor..."
npm update

echo "🔒 Ejecutando npm audit fix..."
npm audit fix

echo "💪 Forzando corrección de vulnerabilidades críticas..."
npm audit fix --force

# Frontend - Corregir vulnerabilidades
show_progress "Corrigiendo vulnerabilidades del frontend"
cd /workspace/client

echo "📦 Actualizando dependencias del cliente..."
npm update

echo "🔒 Ejecutando npm audit fix..."
npm audit fix

echo "💪 Forzando corrección de vulnerabilidades críticas..."
npm audit fix --force

# Volver al directorio raíz
cd /workspace

# Verificar estado final
show_progress "Verificando estado final de vulnerabilidades"

echo "🔍 Vulnerabilidades restantes en el backend:"
cd server && npm audit --audit-level moderate

echo ""
echo "🔍 Vulnerabilidades restantes en el frontend:"
cd ../client && npm audit --audit-level moderate

cd ..

echo ""
echo "✅ Proceso de corrección de vulnerabilidades completado!"
echo "📊 Revisa los reportes anteriores para ver las vulnerabilidades restantes"
echo "⚠️  Algunas vulnerabilidades pueden requerir actualización manual de dependencias"