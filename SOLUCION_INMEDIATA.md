# 🚀 SOLUCIÓN INMEDIATA - EL NOPAL RESTAURANT

## ⚡ PASO 1: INSTALAR MONGODB (EN TU SERVIDOR)

```bash
# 1. Conecta a tu servidor por SSH
ssh tu_usuario@elnopal.es

# 2. Ejecuta estos comandos uno por uno:
sudo apt update

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar que funciona
sudo systemctl status mongod
```

## ⚡ PASO 2: CONFIGURAR BASE DE DATOS

```bash
# En tu servidor, ejecuta:
mongosh

# Dentro de mongosh, copia y pega:
use elnopal
db.createUser({
  user: "elnopal_user",
  pwd: "ElNopal_DB_2024_SuperSeguro!",
  roles: [{ role: "readWrite", db: "elnopal" }]
})

# Salir de mongosh
exit
```

## ⚡ PASO 3: CONFIGURAR GMAIL

### Opción A: Usar Gmail actual
1. Ve a tu cuenta Gmail `reservas@elnopal.es`
2. Configuración → Seguridad → Verificación en 2 pasos (actívala)
3. Contraseñas de aplicaciones → Generar nueva
4. Copia la contraseña de 16 caracteres generada
5. En tu servidor, edita el archivo `.env`:

```bash
# En tu servidor:
nano /ruta/al/servidor/.env

# Cambia esta línea:
EMAIL_PASS=ajkme ntsd bcbd drsf

# Por la nueva contraseña de aplicación:
EMAIL_PASS=tu_nueva_contrasena_de_aplicacion
```

### Opción B: Usar otro servicio
Si prefieres, puedes usar otro servicio de correo como SendGrid o Mailgun.

## ⚡ PASO 4: SECRETOS SEGUROS

```bash
# En tu servidor, genera nuevos secretos:
openssl rand -hex 32  # Para JWT_SECRET
openssl rand -hex 32  # Para SESSION_SECRET

# Actualiza el .env con los valores generados
```

## ⚡ PASO 5: REINICIAR APLICACIÓN

```bash
# En tu servidor:
cd /ruta/a/tu/aplicacion/server
pm2 restart all

# O si usas otro gestor:
sudo systemctl restart tu-app
```

## 🧪 VERIFICAR QUE FUNCIONA

Después de los cambios, prueba:

1. **Hacer una reserva** desde tu web
2. **Verificar que llegue el email** de confirmación
3. **Comprobar en MongoDB** que se guardó:

```bash
mongosh
use elnopal
db.reservations.find().pretty()
```

## 📱 CONTACTO URGENTE

Si tienes problemas:
- **WhatsApp:** [Tu número]
- **Email:** [Tu email]
- **Horario:** Disponible para soporte inmediato

---

## 🎯 TIEMPO ESTIMADO

- **MongoDB:** 10-15 minutos
- **Gmail:** 5 minutos  
- **Secretos:** 2 minutos
- **Reinicio:** 1 minuto

**Total:** ⏱️ **20-25 minutos para tener todo funcionando**

---

## ⚠️ IMPORTANTE

Una vez hagas estos cambios, tu aplicación estará **100% funcional**:
- ✅ Reservas guardándose en base de datos
- ✅ Emails enviándose automáticamente
- ✅ Sistema seguro con secretos fuertes
- ✅ Panel de administración operativo