#!/bin/bash

# Script para instalar MongoDB en el servidor El Nopal
echo "🗄️  Instalando MongoDB para El Nopal Restaurant..."

# Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt update

# Importar clave pública de MongoDB
echo "🔑 Importando clave pública de MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Crear archivo de lista para MongoDB
echo "📋 Configurando repositorio de MongoDB..."
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Actualizar base de datos de paquetes
echo "🔄 Actualizando base de datos de paquetes..."
sudo apt update

# Instalar MongoDB
echo "⬇️  Instalando MongoDB..."
sudo apt install -y mongodb-org

# Iniciar y habilitar MongoDB
echo "🚀 Iniciando MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar estado
echo "✅ Verificando estado de MongoDB..."
sudo systemctl status mongod

# Configurar base de datos El Nopal
echo "🏗️  Configurando base de datos El Nopal..."

# Crear archivo temporal de configuración
cat > /tmp/setup_db.js << 'EOF'
// Crear base de datos El Nopal
use elnopal;

// Crear usuario específico para la aplicación
db.createUser({
  user: "elnopal_user",
  pwd: "ElNopal_DB_2024_SuperSeguro!",
  roles: [
    { role: "readWrite", db: "elnopal" }
  ]
});

// Crear colecciones con índices optimizados
db.createCollection("users");
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.createCollection("reservations");
db.reservations.createIndex({ email: 1 });
db.reservations.createIndex({ date: 1, time: 1 });
db.reservations.createIndex({ status: 1 });
db.reservations.createIndex({ created: -1 });

db.createCollection("tables");
db.tables.createIndex({ number: 1 }, { unique: true });
db.tables.createIndex({ status: 1 });

db.createCollection("reviews");
db.reviews.createIndex({ email: 1 });
db.reviews.createIndex({ rating: 1 });
db.reviews.createIndex({ created: -1 });

db.createCollection("contacts");
db.contacts.createIndex({ email: 1 });
db.contacts.createIndex({ created: -1 });

db.createCollection("blacklist");
db.blacklist.createIndex({ email: 1 }, { unique: true });
db.blacklist.createIndex({ phone: 1 });

db.createCollection("posts");
db.posts.createIndex({ slug: 1 }, { unique: true });
db.posts.createIndex({ published: 1 });
db.posts.createIndex({ created: -1 });

print("✅ Base de datos El Nopal configurada correctamente");
EOF

# Ejecutar configuración de base de datos
echo "🎯 Ejecutando configuración de base de datos..."
mongosh < /tmp/setup_db.js

# Limpiar archivo temporal
rm /tmp/setup_db.js

# Verificar conexión
echo "🔍 Verificando conexión a la base de datos..."
mongosh --eval "db.runCommand({connectionStatus: 1})"

echo "🎉 ¡MongoDB instalado y configurado correctamente para El Nopal!"
echo "📊 Base de datos: elnopal"
echo "👤 Usuario: elnopal_user"
echo "🔗 URI: mongodb://elnopal_user:ElNopal_DB_2024_SuperSeguro!@localhost:27017/elnopal"