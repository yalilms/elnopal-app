# 🚀 DESPLIEGUE COMPLETO - El Nopal Restaurant

## 📋 TUS DATOS ESPECÍFICOS
- **VPS IP**: `5.250.190.97`
- **Dominio**: `elnopal.es` ✅ (DNS ya configurado)
- **Email**: `reservas@elnopal.es`
- **Usuario SSH**: `root`
- **Repositorio**: `https://github.com/yalilms/elnopal.git` ✅ (Ya subido)

---

## ⚡ PASOS COMPLETOS (15 minutos total)

### ✅ COMPLETADO: Código Subido a GitHub
- **121 archivos** subidos correctamente
- **57,364 líneas de código**
- **Repositorio**: https://github.com/yalilms/elnopal.git
- **Script configurado** con tu repositorio

---

### 🔧 PASO 1: Configurar Gmail (5 minutos)

1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. **Seguridad** → **Verificación en 2 pasos** → Habilitar
3. **Contraseñas de aplicaciones** → Generar nueva
4. Nombre: `El Nopal Restaurant`
5. **¡IMPORTANTE!** Copia la contraseña de 16 caracteres y guárdala

---

### 🚀 PASO 2: Ejecutar Despliegue Automatizado (10 minutos)

**Conectar al VPS y ejecutar script:**
```bash
# Conectar a tu VPS
ssh root@5.250.190.97

# Descargar y ejecutar script de despliegue
wget https://raw.githubusercontent.com/yalilms/elnopal/main/deploy-git.sh
chmod +x deploy-git.sh
./deploy-git.sh
```

**¿Qué hace este script automáticamente?**
- ✅ Actualiza el sistema Ubuntu
- ✅ Instala Node.js 18, MongoDB 6.0, Nginx, PM2
- ✅ Clona tu repositorio desde GitHub
- ✅ Instala todas las dependencias (incluyendo seguridad)
- ✅ Construye el frontend React
- ✅ Configura Nginx con headers de seguridad
- ✅ Configura firewall UFW
- ✅ Inicia el backend con PM2
- ✅ Configura SSL automático (IONOS)

---

### 📧 PASO 3: Configurar Correo y Seguridad Final (5 minutos)

**Configurar MongoDB seguro y variables de entorno:**
```bash
# Ya conectado al VPS desde el paso anterior

# 1. Configurar MongoDB con autenticación
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
```

**Configurar el archivo .env con estos valores:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://elnopal_user:ElNopal_DB_2024_SuperSeguro!@localhost:27017/elnopal
JWT_SECRET=ElNopal_JWT_SuperSecreto_2024_ProduccionSegura_CambiarEsteValor!
CORS_ORIGIN=http://elnopal.es
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=reservas@elnopal.es
EMAIL_PASS=TU_CONTRASEÑA_DE_GMAIL_DE_16_CARACTERES
```

**Reiniciar servicios:**
```bash
# Reiniciar backend para aplicar cambios
pm2 restart elnopal-backend

# Verificar que todo funciona
pm2 status
systemctl status nginx
systemctl status mongod
```

---

## 🎉 ¡DESPLIEGUE COMPLETADO!

### 🌐 **Tu Aplicación Está Lista:**
- **Sitio Web**: http://elnopal.es (IONOS activará HTTPS automáticamente)
- **Panel Admin**: http://elnopal.es/admin

### 🔐 **Credenciales por Defecto:**
- **Usuario**: `admin@elnopal.es`
- **Contraseña**: `Admin123!Seguro`
- **⚠️ IMPORTANTE**: Cambiar estas credenciales inmediatamente

---

## 🔍 VERIFICACIÓN Y MONITOREO

### ✅ **Checklist de Verificación:**
```bash
# Verificar servicios
pm2 status                    # Backend debe estar "online"
systemctl status nginx       # Debe estar "active (running)"
systemctl status mongod      # Debe estar "active (running)"

# Verificar logs
pm2 logs elnopal-backend     # Logs del backend
tail -f /var/log/nginx/elnopal_error.log  # Logs de Nginx

# Verificar puertos
netstat -tlnp | grep :80     # Nginx en puerto 80
netstat -tlnp | grep :5000   # Backend en puerto 5000
netstat -tlnp | grep :27017  # MongoDB en puerto 27017
```

### 🛠️ **Comandos Útiles:**
```bash
# Reiniciar servicios
pm2 restart elnopal-backend
systemctl restart nginx
systemctl restart mongod

# Ver logs en tiempo real
pm2 logs elnopal-backend --lines 50
tail -f /var/log/nginx/elnopal_access.log

# Actualizar aplicación
cd /var/www/elnopal
git pull origin main
cd client && npm run build
pm2 restart elnopal-backend
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Error 502 Bad Gateway**
```bash
pm2 restart elnopal-backend
systemctl restart nginx
```

### **Problemas de Email**
```bash
# Verificar configuración
nano /var/www/elnopal/server/.env
# Asegurar que EMAIL_PASS tiene la contraseña de aplicación de Gmail
pm2 restart elnopal-backend
```

### **Problemas de Base de Datos**
```bash
# Verificar conexión MongoDB
mongo -u elnopal_user -p --authenticationDatabase elnopal
# Usar contraseña: ElNopal_DB_2024_SuperSeguro!
```

### **Verificar Firewall**
```bash
ufw status                   # Debe mostrar SSH y Nginx permitidos
```

---

## 🔒 CARACTERÍSTICAS DE SEGURIDAD IMPLEMENTADAS

### ✅ **Seguridad de Aplicación:**
- **Rate Limiting**: 5 intentos de login por 15 minutos
- **Rate Limiting General**: 100 requests por IP por 15 minutos
- **Headers de Seguridad**: Helmet.js configurado
- **Validación de Entrada**: Sanitización estricta
- **JWT Seguro**: Secretos fuertes obligatorios
- **Contraseñas Robustas**: bcrypt con cost factor 12
- **Bloqueo de Cuentas**: Tras 5 intentos fallidos

### ✅ **Seguridad de Servidor:**
- **Firewall UFW**: Solo SSH y HTTP/HTTPS permitidos
- **MongoDB Autenticado**: Usuario específico con permisos limitados
- **Nginx Configurado**: Headers de seguridad y proxy seguro
- **PM2 Protegido**: Proceso aislado y monitoreado

### ✅ **Seguridad de Datos:**
- **Variables de Entorno**: Secretos protegidos
- **Logs Seguros**: Sin información sensible
- **CORS Configurado**: Orígenes específicos permitidos
- **SSL Ready**: IONOS gestiona certificados automáticamente

---

## 📞 SOPORTE

- **Documentación**: Este archivo
- **Logs**: `pm2 logs elnopal-backend`
- **Monitoreo**: `pm2 monit`
- **Estado**: `pm2 status`

**¡Tu aplicación El Nopal Restaurant está desplegada con seguridad empresarial!** 🌮🔒 