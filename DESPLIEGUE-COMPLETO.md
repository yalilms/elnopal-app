# 🚀 DESPLIEGUE COMPLETO - El Nopal Restaurant

## 📋 TUS DATOS ESPECÍFICOS
- **VPS IP**: `5.250.190.97`
- **Dominio**: `elnopal.es` ✅ (DNS ya configurado)
- **Email**: `reservas@elnopal.es`
- **Usuario SSH**: `root`

---

## ⚡ PASOS COMPLETOS (22 minutos total)

### 🔧 PASO 1: Configurar Gmail (5 minutos)

1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. **Seguridad** → **Verificación en 2 pasos** → Habilitar
3. **Contraseñas de aplicaciones** → Generar nueva
4. Nombre: `El Nopal Restaurant`
5. **¡IMPORTANTE!** Copia la contraseña de 16 caracteres y guárdala

---

### 📦 PASO 2: Crear Repositorio Git (3 minutos)

**Crear repositorio en GitHub:**
1. Ve a [github.com](https://github.com) y crea cuenta si no tienes
2. Clic en **"New repository"** (botón verde)
3. **Configuración del repositorio:**
   - **Nombre**: `elnopal`
   - **Descripción**: `Sistema de gestión para El Nopal Restaurant`
   - **Visibilidad**: 
     - ✅ **Público** (Recomendado para primer despliegue - más fácil)
     - 🔒 **Privado** (Más seguro pero requiere configuración SSH)
   - **⚠️ IMPORTANTE**: **NO marcar** "Add README", ".gitignore" ni "license" (ya los tienes)
4. Clic **"Create repository"**
5. **¡Deja la página abierta!** La necesitarás para el siguiente paso

**💡 Recomendación:** Usa **público** para el primer despliegue (más simple), luego puedes cambiarlo a privado.

https://github.com/yalilms/elnopal.git
---

### 📤 PASO 3: Limpiar y Subir Código al Repositorio (3 minutos)

**Desde PowerShell en tu proyecto:**
```powershell
# Ir a tu proyecto
cd C:\Users\yalil\Documents\Unity\ELNOPAL

# Verificar que Git esté instalado
git --version

# Si no tienes Git, descárgalo de: https://git-scm.com/download/win
```

**¡IMPORTANTE! Limpiar archivos que no deben subirse:**
```powershell
# Eliminar node_modules (se instalarán en el servidor)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force server\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force client\node_modules -ErrorAction SilentlyContinue

# Eliminar build (se generará en el servidor)
Remove-Item -Recurse -Force client\build -ErrorAction SilentlyContinue

# Eliminar archivos .env (contienen secretos)
Remove-Item -Force .env -ErrorAction SilentlyContinue
Remove-Item -Force server\.env -ErrorAction SilentlyContinue
Remove-Item -Force client\.env -ErrorAction SilentlyContinue
```

**Configurar Git (solo la primera vez):**
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

**Subir el código a GitHub:**

1. **Preparar archivos localmente:**
```bash
# Inicializar repositorio (si no está hecho)
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "El Nopal Restaurant - Listo para producción"
```

2. **Subir a GitHub usando la interfaz web:**
   - Ve a tu repositorio en GitHub (https://github.com/TU_USUARIO/elnopal)
   - Clic en **"uploading an existing file"** o **"choose your files"**
   - **Arrastra toda la carpeta ELNOPAL** o selecciona todos los archivos
   - En el mensaje de commit escribe: `"El Nopal Restaurant - Listo para producción"`
   - Clic en **"Commit changes"**

**Alternativa por terminal (si prefieres):**
```bash
# Conectar con GitHub (CAMBIAR por tu URL real)
git remote add origin https://github.com/TU_USUARIO/elnopal.git

# Subir código
git push -u origin main
```

---

### ⚙️ PASO 4: Configurar Script de Despliegue (1 minuto)

**Obtener URL del repositorio y configurar script:**

1. **En la página de GitHub que dejaste abierta**, busca la sección **"Quick setup"**
2. **Copia la URL HTTPS** (algo como: `https://github.com/TU_USUARIO/elnopal.git`)
3. **Abre el archivo `deploy-git.sh`** con cualquier editor de texto
4. **En la línea 18**, cambia:
   ```bash
   REPO_URL="https://github.com/TU_USUARIO/elnopal.git"
   ```
   Por tu URL real de GitHub
5. **Guarda el archivo**

**Ejemplo:**
```bash
REPO_URL="https://github.com/yalil/elnopal.git"  # ← Tu URL aquí
```

---

### 🚀 PASO 5: Ejecutar Despliegue (10 minutos)

**Opción A: Desde WSL (Recomendado)**
```bash
# Instalar WSL si no lo tienes
wsl --install

# Reiniciar Windows si es necesario

# Desde WSL
cd /mnt/c/Users/yalil/Documents/Unity/ELNOPAL
chmod +x deploy-git.sh
./deploy-git.sh
```

**Opción B: Desde Git Bash**
```bash
# Descargar Git Bash de: https://git-scm.com/download/win
# Abrir Git Bash y ejecutar:
cd /c/Users/yalil/Documents/Unity/ELNOPAL
chmod +x deploy-git.sh
./deploy-git.sh
```

**¿Qué hace este script?**
- Verifica que todo esté listo
- Sube tu código al repositorio
- Configura el VPS automáticamente
- Instala Node.js, MongoDB, Nginx, PM2
- Clona tu repositorio en el servidor
- Construye el proyecto
- Configura Nginx y firewall
- Inicia el backend

---

### 📧 PASO 6: Configurar Correo y Seguridad (5 minutos)

**Conectar al VPS y configurar MongoDB seguro y correo:**
```bash
ssh root@5.250.190.97

# 1. Crear usuario administrador para MongoDB
mongo
use admin
db.createUser({
  user: "elnopal_admin",
  pwd: "ElNopal2024_SuperSeguro!",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
use elnopal
db.createUser({
  user: "elnopal_user", 
  pwd: "ElNopal_DB_2024_SuperSeguro!",
  roles: ["readWrite"]
})
exit

# 2. Habilitar autenticación en MongoDB
nano /etc/mongod.conf
# Buscar la línea #security: y cambiarla por:
# security:
#   authorization: enabled

# Reiniciar MongoDB
systemctl restart mongod

# 3. Configurar variables de entorno
nano /var/www/elnopal/server/.env

# Actualizar estas líneas:
MONGODB_URI=mongodb://elnopal_user:ElNopal_DB_2024_SuperSeguro!@localhost:27017/elnopal
EMAIL_PASS=tu-contraseña-de-16-caracteres-de-gmail
JWT_SECRET=ElNopal_JWT_SuperSecreto_2024_ProduccionSegura_CambiarEsteValor!

# Guardar: Ctrl+X, luego Y, luego Enter

# 4. Reiniciar el backend
pm2 restart elnopal-backend

# Salir del VPS
exit
```

---

## ✅ VERIFICACIÓN FINAL

### 🌐 Probar el Sitio Web
1. **Sitio principal**: http://elnopal.es (IONOS activará HTTPS automáticamente)
2. **Panel de administración**: http://elnopal.es/admin
   - Usuario: `admin@elnopal.es`
   - Contraseña: `Admin123!Seguro`

### 📧 Probar Reservas y Correos
1. Hacer una reserva de prueba desde http://elnopal.es
2. Verificar que llegue el correo a `reservas@elnopal.es`
3. Probar el panel de administración

---

## 🔄 ACTUALIZACIONES FUTURAS

**Para actualizar tu sitio después de hacer cambios:**

**Método Rápido (Script automático):**
```bash
# Desde WSL o Git Bash
cd /mnt/c/Users/yalil/Documents/Unity/ELNOPAL
./update-git.sh
```

**Método Manual:**
```bash
# Guardar cambios locales
git add .
git commit -m "Descripción de los cambios"
git push origin main

# Actualizar en el servidor
ssh root@5.250.190.97
cd /var/www/elnopal
git pull origin main
cd client && npm run build
pm2 restart elnopal-backend
exit
```

## 🔒 HACER REPOSITORIO PRIVADO (Opcional)

**Después del primer despliegue, puedes hacer tu repositorio privado:**

1. **En GitHub:**
   - Ve a tu repositorio
   - **Settings** → **General** 
   - Scroll hasta **"Danger Zone"**
   - **"Change repository visibility"** → **"Make private"**

2. **Configurar acceso SSH en el VPS:**
```bash
ssh root@5.250.190.97

# Generar clave SSH
ssh-keygen -t rsa -b 4096 -C "elnopal@server"
cat ~/.ssh/id_rsa.pub

# Copiar la clave y agregarla en GitHub:
# GitHub → Settings → SSH and GPG keys → New SSH key

# Cambiar URL del repositorio a SSH
cd /var/www/elnopal
git remote set-url origin git@github.com:TU_USUARIO/elnopal.git

# Probar conexión
git pull origin main
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "git: command not found"
```bash
# Descargar e instalar Git desde:
# https://git-scm.com/download/win
```

### ❌ Error: "Permission denied (publickey)"
```bash
# Usar HTTPS en lugar de SSH
# Asegúrate de que tu repositorio sea público
```

### ❌ Error: "Cannot connect to VPS"
```bash
# Verificar que el VPS esté encendido en el panel de IONOS
ssh -v root@5.250.190.97
```

### ❌ Error 502 Bad Gateway
```bash
ssh root@5.250.190.97
pm2 status
pm2 restart elnopal-backend
systemctl restart nginx
```

### ❌ No llegan correos
```bash
ssh root@5.250.190.97
pm2 logs elnopal-backend
# Verificar que EMAIL_PASS esté configurado correctamente
```

### ❌ Problemas con HTTPS
```bash
# IONOS gestiona SSL automáticamente
# Si hay problemas, contactar soporte de IONOS
# Verificar que el dominio apunte correctamente a la IP
```

---

## 📞 COMANDOS ÚTILES

```bash
# Conectar al VPS
ssh root@5.250.190.97

# Ver estado de todos los servicios
pm2 status
systemctl status nginx
systemctl status mongod

# Ver logs en tiempo real
pm2 logs elnopal-backend
tail -f /var/log/nginx/elnopal_error.log

# Reiniciar servicios
pm2 restart elnopal-backend
systemctl restart nginx
systemctl restart mongod

# Ver espacio en disco
df -h

# Ver uso de memoria
free -h

# Salir del VPS
exit
```

---

## 🔒 SEGURIDAD IMPLEMENTADA

✅ **MongoDB Autenticado**: Usuario y contraseña específicos  
✅ **JWT Secreto Fuerte**: Token de autenticación seguro  
✅ **Variables de Entorno**: Secretos no en el código  
✅ **Firewall Configurado**: Solo puertos necesarios abiertos  
✅ **SSL/HTTPS**: Gestionado automáticamente por IONOS  
✅ **Nginx Hardening**: Headers de seguridad  
✅ **Rate Limiting**: Protección contra ataques de fuerza bruta  
✅ **Helmet Security**: Headers de seguridad adicionales  
✅ **Validación de Entrada**: Protección contra inyecciones  
✅ **Contraseñas Seguras**: Validación de fortaleza  
✅ **Bloqueo de Cuentas**: Protección contra intentos múltiples  

## 🛡️ NUEVAS CARACTERÍSTICAS DE SEGURIDAD

### 🔐 **Autenticación Mejorada**
- Contraseñas deben tener mínimo 8 caracteres
- Requiere mayúsculas, minúsculas, números y símbolos
- Bloqueo automático después de 5 intentos fallidos
- Desbloqueo automático después de 30 minutos

### 🚫 **Protección contra Ataques**
- Rate limiting: máximo 5 logins por 15 minutos
- Rate limiting general: máximo 100 requests por 15 minutos
- Headers de seguridad con Helmet
- Validación estricta de entrada de datos
- Protección CORS configurada correctamente

### 🔍 **Monitoreo y Logs**
- Logs de consola eliminados en producción
- Manejo seguro de errores sin exposición de información
- Tokens mock eliminados completamente

## 🎯 VENTAJAS DE ESTE MÉTODO

✅ **Profesional**: Usa Git como los desarrolladores reales  
✅ **Rápido**: Solo transfiere cambios, no todo el proyecto  
✅ **Seguro**: Historial completo de cambios  
✅ **Escalable**: Fácil agregar más desarrolladores  
✅ **Backup**: Tu código está seguro en GitHub  
✅ **Actualizaciones**: Un solo comando para actualizar  
✅ **Producción Lista**: Configuración de seguridad empresarial  

---

## 🎉 ¡RESULTADO FINAL!

Una vez completados todos los pasos, tendrás:

- **🌐 Sitio web**: http://elnopal.es (HTTPS automático por IONOS)
- **⚙️ Panel admin**: http://elnopal.es/admin  
- **📧 Correos**: reservas@elnopal.es
- **🔒 SSL**: Gestionado automáticamente por IONOS
- **📦 Repositorio**: https://github.com/TU_USUARIO/elnopal
- **🔄 Actualizaciones**: Simples con Git
- **🛡️ Seguridad**: Nivel empresarial con protecciones múltiples

**¡El Nopal Restaurant está oficialmente online con seguridad de nivel empresarial!** 🍽️✨🔒

---

## 📋 CHECKLIST FINAL

### 🔧 **Configuración Inicial:**
- [ ] Gmail configurado con contraseña de aplicación
- [ ] Repositorio GitHub creado (público o privado)
- [ ] Archivos sensibles eliminados (node_modules, .env, build)
- [ ] Código subido al repositorio
- [ ] Script deploy-git.sh configurado con tu URL

### 🚀 **Despliegue:**
- [ ] Despliegue ejecutado exitosamente
- [ ] MongoDB con autenticación habilitada
- [ ] Variables de entorno configuradas (.env)
- [ ] Firewall y seguridad configurados

### ✅ **Verificación:**
- [ ] Sitio web funcionando (http://elnopal.es)
- [ ] Panel admin accesible (http://elnopal.es/admin)
- [ ] Reservas y correos funcionando
- [ ] Base de datos segura y autenticada
- [ ] HTTPS activado automáticamente por IONOS

### 🔒 **Seguridad (Opcional):**
- [ ] Repositorio cambiado a privado
- [ ] SSH configurado para acceso privado
- [ ] Contraseñas de MongoDB personalizadas
- [ ] Rate limiting funcionando
- [ ] Headers de seguridad verificados

**¡Todo listo para producción segura de nivel empresarial!** 🚀🔒🛡️ 