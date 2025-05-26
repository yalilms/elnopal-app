# 🌮 El Nopal Restaurant - Sistema de Gestión

Sistema completo de gestión para restaurante con reservas online, panel de administración y características de seguridad empresarial.

## 🚀 Características Principales

- **🍽️ Reservas Online**: Sistema completo de reservas con validación en tiempo real
- **👨‍💼 Panel de Administración**: Gestión completa de reservas, mesas y usuarios
- **📧 Notificaciones por Email**: Confirmaciones automáticas vía Gmail
- **📱 Responsive Design**: Optimizado para móviles y tablets
- **🔒 Seguridad Empresarial**: Rate limiting, validación de entrada, autenticación robusta
- **⚡ Tiempo Real**: Actualizaciones instantáneas con Socket.io
- **🛡️ Lista Negra**: Sistema de gestión de clientes problemáticos

## 🛡️ Características de Seguridad

### 🔐 Autenticación y Autorización
- JWT con secretos fuertes y expiración
- Contraseñas hasheadas con bcrypt (cost factor 12)
- Validación de fortaleza de contraseñas (8+ caracteres, mayúsculas, minúsculas, números, símbolos)
- Bloqueo automático de cuentas tras 5 intentos fallidos
- Roles de usuario con permisos granulares

### 🚫 Protección contra Ataques
- **Rate Limiting**: 5 intentos de login por 15 minutos
- **Rate Limiting General**: 100 requests por IP por 15 minutos
- **Headers de Seguridad**: Helmet.js con CSP, XSS Protection, etc.
- **Validación de Entrada**: Sanitización y validación estricta
- **CORS Configurado**: Orígenes permitidos específicos
- **Protección CSRF**: Headers y validación de origen

### 🔍 Monitoreo y Logs
- Logs de producción sin información sensible
- Manejo seguro de errores
- Eliminación de tokens mock y credenciales de desarrollo

## 🏗️ Arquitectura

```
elnopal/
├── client/          # Frontend React
├── server/          # Backend Node.js/Express
├── deploy-git.sh    # Script de despliegue automatizado
└── docs/           # Documentación
```

## 🛠️ Tecnologías

### Frontend
- **React 18** con Hooks
- **React Router** para navegación
- **Axios** para API calls
- **Socket.io Client** para tiempo real
- **CSS3** con diseño responsive

### Backend
- **Node.js** con Express
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **bcrypt** para hashing de contraseñas
- **Nodemailer** para emails
- **Socket.io** para tiempo real
- **Helmet** para seguridad
- **express-rate-limit** para protección

### Infraestructura
- **Nginx** como proxy reverso
- **PM2** para gestión de procesos
- **Let's Encrypt** para SSL
- **UFW** firewall configurado

## 🚀 Despliegue Rápido

### Opción 1: Despliegue Automatizado (Recomendado)

1. **Configurar repositorio Git**:
   ```bash
   git clone https://github.com/TU_USUARIO/elnopal.git
   cd elnopal
   ```

2. **Configurar script de despliegue**:
   - Editar `deploy-git.sh`
   - Cambiar `REPO_URL` por tu repositorio

3. **Ejecutar despliegue**:
   ```bash
   chmod +x deploy-git.sh
   ./deploy-git.sh
   ```

### Credenciales por Defecto

**Panel de Administración**: http://elnopal.es/admin (HTTPS automático por IONOS)
- **Usuario**: `admin@elnopal.es`
- **Contraseña**: `Admin123!Seguro`

⚠️ **IMPORTANTE**: Cambiar estas credenciales inmediatamente después del primer login.

## 📧 Configuración de Email

1. **Configurar Gmail**:
   - Habilitar verificación en 2 pasos
   - Generar contraseña de aplicación
   - Usar: `reservas@elnopal.es`

2. **Variables de entorno**:
   ```env
   EMAIL_USER=reservas@elnopal.es
   EMAIL_PASS=tu-app-password-de-16-caracteres
   ```

## 🔧 Configuración de Desarrollo

### Prerrequisitos
- Node.js 18+
- MongoDB 6.0+
- Git

### Instalación Local

1. **Clonar repositorio**:
   ```bash
   git clone https://github.com/TU_USUARIO/elnopal.git
   cd elnopal
   ```

2. **Instalar dependencias**:
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   # En server/
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar desarrollo**:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm start
   ```

## 📁 Estructura del Proyecto

```
elnopal/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── context/        # Context API
│   │   ├── services/       # API calls
│   │   ├── styles/         # CSS
│   │   └── utils/          # Utilidades
│   └── package.json
├── server/
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Middleware personalizado
│   │   ├── models/         # Modelos de MongoDB
│   │   ├── routes/         # Rutas de API
│   │   └── services/       # Servicios
│   └── package.json
├── deploy-git.sh          # Script de despliegue
├── DESPLIEGUE-COMPLETO.md # Guía de despliegue
└── README.md
```

## 🔒 Variables de Entorno de Producción

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://elnopal_user:ElNopal_DB_2024_SuperSeguro!@localhost:27017/elnopal
JWT_SECRET=ElNopal_JWT_SuperSecreto_2024_ProduccionSegura_CambiarEsteValor!
CORS_ORIGIN=http://elnopal.es
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=reservas@elnopal.es
EMAIL_PASS=tu-app-password-de-gmail
```

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📊 Monitoreo

### Logs del Sistema
```bash
# Logs de la aplicación
pm2 logs elnopal-backend

# Logs de Nginx
tail -f /var/log/nginx/elnopal_error.log

# Logs del sistema
journalctl -u mongod -f
```

### Comandos Útiles
```bash
# Estado de servicios
pm2 status
systemctl status nginx
systemctl status mongod

# Reiniciar servicios
pm2 restart elnopal-backend
systemctl restart nginx
systemctl restart mongod
```

## 🆘 Solución de Problemas

### Error 502 Bad Gateway
```bash
pm2 restart elnopal-backend
systemctl restart nginx
```

### Problemas de Base de Datos
```bash
# Verificar conexión MongoDB
mongo --eval "db.adminCommand('ismaster')"

# Verificar autenticación
mongo -u elnopal_user -p --authenticationDatabase elnopal
```

### Problemas de SSL
```bash
# Renovar certificados
certbot renew --dry-run
systemctl restart nginx
```

## 🔄 Actualizaciones

### Método Automático
```bash
./update-git.sh
```

### Método Manual
```bash
git pull origin main
cd client && npm run build
pm2 restart elnopal-backend
```

## 📈 Rendimiento

- **Tiempo de carga**: < 2 segundos
- **Optimización de imágenes**: WebP y lazy loading
- **Compresión**: Gzip habilitado
- **Cache**: Headers de cache optimizados
- **CDN Ready**: Preparado para CDN

## 🌍 SEO y Accesibilidad

- **Meta tags** optimizados
- **Schema.org** markup
- **Accesibilidad WCAG 2.1**
- **Responsive design**
- **Progressive Web App** ready

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📞 Soporte

- **Email**: soporte@elnopal.es
- **Documentación**: [DESPLIEGUE-COMPLETO.md](./DESPLIEGUE-COMPLETO.md)
- **Issues**: GitHub Issues

---

**¡El Nopal Restaurant - Gestión profesional con seguridad empresarial!** 🌮🔒
