# Guía de Despliegue - El Nopal Restaurant

## ✅ Checklist Pre-Despliegue

### 1. Variables de Entorno del Servidor
Crea un archivo `.env` en la carpeta `server/` con estos valores de producción:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://elnopal_user:TU_PASSWORD_SEGURA@cluster.mongodb.net/elnopal
JWT_SECRET=ElNopal_JWT_SuperSecreto_2024_ProduccionSegura_CAMBIAR_ESTE_VALOR_123456789
CORS_ORIGIN=https://tu-dominio.com

# Configuración de correo Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=reservas@tudominio.com
EMAIL_PASS=tu-app-password-de-gmail-aqui
EMAIL_FROM="El Nopal Restaurant <reservas@tudominio.com>"

# Configuración del restaurante
ADMIN_EMAIL=reservas@tudominio.com
RESTAURANT_NAME="El Nopal Restaurant"
RESTAURANT_PHONE="+34 XXX XXX XXX"
RESTAURANT_ADDRESS="Tu dirección completa del restaurante"

# Configuración de seguridad adicional
SESSION_SECRET=ElNopal_Session_SuperSecreto_2024_CAMBIAR_ESTE_VALOR_987654321
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=30
```

### 2. Configuración MongoDB Atlas
1. Crear cuenta en MongoDB Atlas
2. Crear cluster
3. Configurar usuario de base de datos
4. Whitelist IPs del servidor de producción
5. Obtener connection string

### 3. Configuración de Gmail para envío de emails
1. Ir a Google Account → Seguridad
2. Activar verificación en 2 pasos
3. Generar App Password específica
4. Usar esa password en `EMAIL_PASS`

### 4. Build del Cliente para Producción
```bash
cd client
npm run build
```

### 5. Dependencias de Producción
```bash
# Servidor
cd server
npm install --production

# Cliente (si es necesario)
cd client
npm install --production
```

## 🚀 Comandos de Despliegue

### Para IONOS o servidor VPS:
```bash
# 1. Build del cliente
cd client && npm run build

# 2. Copiar archivos al servidor
# Subir carpeta 'build' del cliente
# Subir carpeta 'server' completa

# 3. En el servidor
cd server
npm install --production
pm2 start ecosystem.config.js --env production
```

### Para servicios como Heroku/Railway:
```bash
# El proceso está automatizado con los scripts de package.json
npm run build
npm start
```

## 🔒 Configuraciones de Seguridad Implementadas

✅ **Autenticación JWT** - Sin localStorage  
✅ **Rate Limiting** - Protección contra ataques de fuerza bruta  
✅ **Helmet.js** - Headers de seguridad  
✅ **CORS Configurado** - Solo dominios autorizados  
✅ **Validación de Entrada** - express-validator  
✅ **Hash de Contraseñas** - bcrypt con salt  
✅ **Variables de Entorno** - Secretos protegidos  
✅ **Error Handling** - Sin exposición de información sensible  

## 📋 Verificaciones de Producción

### 1. Base de Datos
- [ ] MongoDB Atlas conectado
- [ ] Usuario administrador creado
- [ ] Datos de prueba eliminados

### 2. Emails
- [ ] Gmail configurado correctamente
- [ ] Emails de confirmación funcionando
- [ ] Emails de cancelación funcionando

### 3. Funcionalidades
- [ ] Login de admin funciona
- [ ] Creación de reservas funciona
- [ ] Panel de administración accesible
- [ ] Lista negra funcional
- [ ] Gestión de mesas funcional

### 4. Rendimiento
- [ ] Build de producción optimizado
- [ ] Imágenes optimizadas
- [ ] Caching configurado
- [ ] Logs de producción configurados

## 🔧 Solución de Problemas Comunes

### Error de CORS
- Verificar `CORS_ORIGIN` en .env
- Asegurar que el dominio sea exacto (con/sin www)

### Error de conexión MongoDB
- Verificar connection string
- Revisar whitelist de IPs
- Verificar credenciales de usuario

### Emails no se envían
- Verificar App Password de Gmail
- Revisar configuración SMTP
- Verificar que EMAIL_USER sea correcto

### Rate Limiting muy restrictivo
- Ajustar valores en `server/src/index.js`
- Solo en desarrollo, no en producción

## 📱 Testing en Producción

1. **Reserva Completa**: Probar todo el flujo de reserva
2. **Panel Admin**: Verificar todas las funciones
3. **Responsive**: Probar en móviles y tablets
4. **Emails**: Confirmar que llegan correctamente
5. **Performance**: Verificar tiempos de carga

## 🆘 Contacto de Emergencia

Si hay problemas después del despliegue:
- Revisar logs del servidor
- Verificar configuración de variables de entorno
- Comprobar conectividad con MongoDB
- Revisar configuración de dominio y DNS

---
**¡Sistema listo para producción! 🎉** 