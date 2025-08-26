# 🍃 Guía de Instalación y Configuración de MongoDB

Esta guía te ayudará a instalar y configurar MongoDB localmente para el proyecto El Nopal.

## 📋 Tabla de Contenidos

1. [Instalación en Ubuntu/Debian](#ubuntu-debian)
2. [Instalación en CentOS/RHEL](#centos-rhel)
3. [Instalación en macOS](#macos)
4. [Instalación en Windows](#windows)
5. [Configuración Inicial](#configuración-inicial)
6. [Creación de Base de Datos y Usuario](#creación-de-base-de-datos-y-usuario)
7. [Configuración de Seguridad](#configuración-de-seguridad)
8. [Verificación de la Instalación](#verificación-de-la-instalación)
9. [Comandos Útiles](#comandos-útiles)
10. [Troubleshooting](#troubleshooting)

---

## 🐧 Ubuntu/Debian {#ubuntu-debian}

### 1. Importar la clave GPG de MongoDB

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
```

### 2. Crear el archivo de lista de fuentes

**Para Ubuntu 22.04 (Jammy):**
```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

**Para Ubuntu 20.04 (Focal):**
```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

### 3. Actualizar el índice de paquetes e instalar MongoDB

```bash
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### 4. Iniciar y habilitar MongoDB

```bash
# Iniciar MongoDB
sudo systemctl start mongod

# Habilitar MongoDB para que inicie automáticamente
sudo systemctl enable mongod

# Verificar el estado
sudo systemctl status mongod
```

---

## 🎩 CentOS/RHEL {#centos-rhel}

### 1. Crear el archivo de repositorio

```bash
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF
```

### 2. Instalar MongoDB

```bash
sudo yum install -y mongodb-org
```

### 3. Iniciar y habilitar MongoDB

```bash
# Iniciar MongoDB
sudo systemctl start mongod

# Habilitar MongoDB para que inicie automáticamente
sudo systemctl enable mongod

# Verificar el estado
sudo systemctl status mongod
```

---

## 🍎 macOS {#macos}

### Opción 1: Usando Homebrew (Recomendado)

```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Agregar el tap de MongoDB
brew tap mongodb/brew

# Instalar MongoDB Community Edition
brew install mongodb-community

# Iniciar MongoDB
brew services start mongodb/brew/mongodb-community
```

### Opción 2: Descarga Manual

1. Descargar desde: https://www.mongodb.com/try/download/community
2. Descomprimir y mover a `/usr/local/mongodb`
3. Agregar al PATH en `~/.zshrc` o `~/.bash_profile`:

```bash
export PATH="/usr/local/mongodb/bin:$PATH"
```

---

## 🪟 Windows {#windows}

### 1. Descargar MongoDB

- Ir a: https://www.mongodb.com/try/download/community
- Seleccionar Windows y descargar el MSI

### 2. Instalar MongoDB

1. Ejecutar el archivo MSI descargado
2. Seguir el asistente de instalación
3. Seleccionar "Complete" setup
4. Instalar MongoDB como servicio de Windows

### 3. Verificar la instalación

Abrir Command Prompt como administrador y ejecutar:

```cmd
mongod --version
```

---

## ⚙️ Configuración Inicial {#configuración-inicial}

### 1. Verificar que MongoDB esté corriendo

```bash
# Verificar proceso
ps aux | grep mongod

# Verificar puerto
sudo netstat -tlnp | grep :27017

# O usar ss en sistemas más modernos
sudo ss -tlnp | grep :27017
```

### 2. Conectar a MongoDB

```bash
mongosh
```

Si `mongosh` no está disponible, instálalo:

```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-mongosh

# CentOS/RHEL
sudo yum install -y mongodb-mongosh

# macOS
brew install mongosh
```

---

## 👤 Creación de Base de Datos y Usuario {#creación-de-base-de-datos-y-usuario}

### 1. Conectar a MongoDB

```bash
mongosh
```

### 2. Crear la base de datos

```javascript
// Cambiar a la base de datos elnopal (la crea si no existe)
use elnopal
```

### 3. Crear usuario administrador para la aplicación

```javascript
// Crear usuario para la aplicación
db.createUser({
  user: "elnopal_user",
  pwd: "ElNopal_DB_2024_SuperSeguro!",
  roles: [
    {
      role: "readWrite",
      db: "elnopal"
    }
  ]
})
```

### 4. Crear usuario administrador general (opcional)

```javascript
// Cambiar a la base de datos admin
use admin

// Crear usuario administrador
db.createUser({
  user: "admin",
  pwd: "Admin_MongoDB_2024_Seguro!",
  roles: [
    {
      role: "userAdminAnyDatabase",
      db: "admin"
    },
    {
      role: "readWriteAnyDatabase",
      db: "admin"
    }
  ]
})
```

---

## 🔒 Configuración de Seguridad {#configuración-de-seguridad}

### 1. Habilitar autenticación

Editar el archivo de configuración:

```bash
# Ubuntu/Debian/CentOS/RHEL
sudo nano /etc/mongod.conf

# macOS (si se instaló con Homebrew)
nano /usr/local/etc/mongod.conf
```

### 2. Modificar la configuración

```yaml
# Configuración de red
net:
  port: 27017
  bindIp: 127.0.0.1  # Solo localhost por seguridad

# Configuración de seguridad
security:
  authorization: enabled  # Habilitar autenticación

# Configuración de almacenamiento
storage:
  dbPath: /var/lib/mongodb  # Ubuntu/CentOS
  # dbPath: /usr/local/var/mongodb  # macOS
  journal:
    enabled: true

# Logs
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log  # Ubuntu/CentOS
  # path: /usr/local/var/log/mongodb/mongo.log  # macOS
```

### 3. Reiniciar MongoDB

```bash
# Ubuntu/Debian/CentOS/RHEL
sudo systemctl restart mongod

# macOS
brew services restart mongodb/brew/mongodb-community
```

---

## ✅ Verificación de la Instalación {#verificación-de-la-instalación}

### 1. Verificar conexión sin autenticación

```bash
mongosh --host localhost --port 27017
```

### 2. Verificar conexión con autenticación

```bash
mongosh --host localhost --port 27017 --authenticationDatabase elnopal -u elnopal_user -p
```

### 3. Probar desde la aplicación

Actualizar el archivo `.env` del servidor:

```env
MONGODB_URI=mongodb://elnopal_user:ElNopal_DB_2024_SuperSeguro!@localhost:27017/elnopal
```

---

## 🛠️ Comandos Útiles {#comandos-útiles}

### Gestión del Servicio

```bash
# Iniciar
sudo systemctl start mongod

# Detener
sudo systemctl stop mongod

# Reiniciar
sudo systemctl restart mongod

# Ver estado
sudo systemctl status mongod

# Ver logs
sudo journalctl -u mongod
sudo tail -f /var/log/mongodb/mongod.log
```

### Comandos de MongoDB

```javascript
// Mostrar bases de datos
show dbs

// Cambiar a base de datos
use elnopal

// Mostrar colecciones
show collections

// Mostrar usuarios
db.getUsers()

// Ver estadísticas de la base de datos
db.stats()

// Hacer backup
mongodump --db elnopal --out /path/to/backup

// Restaurar backup
mongorestore --db elnopal /path/to/backup/elnopal
```

---

## 🚨 Troubleshooting {#troubleshooting}

### Problema: MongoDB no inicia

**Solución 1: Verificar permisos**
```bash
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
```

**Solución 2: Verificar espacio en disco**
```bash
df -h
```

**Solución 3: Verificar logs**
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

### Problema: No puede conectar desde la aplicación

**Solución 1: Verificar firewall**
```bash
# Ubuntu/Debian
sudo ufw allow 27017

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=27017/tcp
sudo firewall-cmd --reload
```

**Solución 2: Verificar configuración de bindIp**
```bash
# En /etc/mongod.conf, asegurarse de que bindIp incluya las IPs necesarias
net:
  bindIp: 127.0.0.1,::1  # IPv4 y IPv6 localhost
```

### Problema: Autenticación falla

**Solución: Verificar usuario y contraseña**
```javascript
// Conectar a MongoDB
mongosh

// Cambiar a la base de datos
use elnopal

// Verificar si el usuario existe
db.getUser("elnopal_user")

// Si no existe, crearlo nuevamente
db.createUser({
  user: "elnopal_user",
  pwd: "ElNopal_DB_2024_SuperSeguro!",
  roles: ["readWrite"]
})
```

---

## 🎯 Configuración Final para El Nopal

### 1. String de conexión para desarrollo

```env
MONGODB_URI=mongodb://localhost:27017/elnopal
```

### 2. String de conexión para producción (con autenticación)

```env
MONGODB_URI=mongodb://elnopal_user:ElNopal_DB_2024_SuperSeguro!@localhost:27017/elnopal
```

### 3. Verificar que la aplicación se conecte

```bash
cd /workspace/server
npm start
```

Deberías ver el mensaje: `Conectado a MongoDB: localhost:27017`

---

## 📝 Notas Adicionales

- **Backup automático**: Considera configurar backups automáticos con `cron`
- **Monitoreo**: Usar `mongostat` y `mongotop` para monitorear performance
- **Seguridad**: En producción, siempre usar autenticación y configurar firewall
- **Performance**: Ajustar `ulimit` para sistemas con alta carga

¡MongoDB está listo para El Nopal! 🌮🍃