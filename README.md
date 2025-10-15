# 🌮 Sistema de Gestión de Restaurante - El Nopal

> Un sistema completo de gestión de restaurante con reservas online, panel administrativo y actualizaciones en tiempo real. Desarrollado para un restaurante mexicano pero adaptable a cualquier establecimiento gastronómico.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Descripción General

Este proyecto fue desarrollado como una solución completa para la gestión de restaurantes, con sistema de reservas orientado al cliente, panel administrativo y capacidades de comunicación en tiempo real. Aunque fue creado inicialmente para un restaurante mexicano, el sistema está diseñado para ser fácilmente personalizable para cualquier tipo de restaurante.

**Estado del Proyecto:** Completado pero no desplegado en producción (el contrato con el cliente finalizó antes de la fecha de despliegue).

## ✨ Características Principales

### Características para Clientes
- 📅 **Sistema de Reservas Online** - Selección interactiva de mesas con disponibilidad en tiempo real
- 🍽️ **Mapa Interactivo de Mesas** - Representación visual del diseño del restaurante
- ⭐ **Sistema de Reseñas** - Los clientes pueden dejar reseñas y calificaciones
- 📱 **Diseño Responsive** - Totalmente optimizado para móviles, tablets y escritorio
- 📖 **Sección de Blog** - Noticias del restaurante, recetas y eventos
- 📧 **Formulario de Contacto** - Comunicación directa con el personal del restaurante

### Características Administrativas
- 🔐 **Panel de Administración Seguro** - Autenticación basada en JWT con control de acceso por roles
- 📊 **Gestión de Reservas** - Ver, crear, editar y cancelar reservas
- 🚫 **Sistema de Lista Negra** - Bloquear clientes problemáticos por email/teléfono
- ✅ **Moderación de Reseñas** - Aprobar o rechazar reseñas de clientes
- 📈 **Actualizaciones en Tiempo Real** - Integración Socket.io para actualizaciones de reservas en vivo
- 📧 **Notificaciones por Email** - Emails automáticos de confirmación vía Nodemailer

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Librería UI con hooks y Context API
- **React Router v6** - Enrutamiento del lado del cliente
- **Socket.io Client** - Comunicación en tiempo real
- **Axios** - Cliente HTTP para peticiones a la API
- **React Toastify** - Notificaciones al usuario
- **CSS3** - Estilos personalizados con animaciones

### Backend
- **Node.js y Express** - Servidor API RESTful
- **MongoDB y Mongoose** - Base de datos y ODM
- **JWT (jsonwebtoken)** - Autenticación
- **bcrypt** - Hashing de contraseñas
- **Socket.io** - Servidor WebSocket para características en tiempo real
- **Nodemailer** - Integración de servicio de email
- **Helmet** - Headers de seguridad
- **express-rate-limit** - Protección DDoS

### Características de Seguridad
- 🔒 Hashing de contraseñas con Bcrypt (factor de coste 12)
- 🛡️ Autenticación basada en tokens JWT
- 🚦 Rate limiting (5 intentos de login por 15 min)
- 🔐 Headers de seguridad con Helmet (CSP, protección XSS)
- ✅ Validación y sanitización de entradas
- 🔑 Configuración basada en variables de entorno

## 📁 Estructura del Proyecto

```
restaurant-management/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── admin/     # Componentes del panel de administración
│   │   │   ├── common/    # Componentes reutilizables
│   │   │   ├── layout/    # Componentes de diseño
│   │   │   ├── reservation/
│   │   │   ├── reviews/
│   │   │   └── routes/
│   │   ├── context/       # Proveedores de React Context
│   │   ├── services/      # Capa de servicios API
│   │   ├── utils/         # Funciones de utilidad
│   │   └── App.js         # Componente principal de la aplicación
│   └── package.json
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── middleware/    # Middleware de Express
│   │   ├── models/        # Modelos de Mongoose
│   │   ├── routes/        # Rutas de la API
│   │   ├── services/      # Capa de servicios
│   │   └── index.js       # Punto de entrada del servidor
│   ├── .env.example       # Plantilla de variables de entorno
│   └── package.json
├── create-admin.js        # Script de creación de usuario administrador
├── init-database.js       # Script de inicialización de base de datos
└── README.md
```

## 🚀 Comenzar

### Prerrequisitos

- Node.js 18+
- MongoDB 6.0+
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tuusuario/restaurant-management.git
   cd restaurant-management
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd server
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Edita .env con tu configuración
   ```

4. **Instalar dependencias del frontend**
   ```bash
   cd ../client
   npm install
   ```

### Configuración

Crea un archivo `.env` en el directorio `server` con las siguientes variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant_db
JWT_SECRET=tu-clave-secreta-super-segura-jwt
CORS_ORIGIN=http://localhost:3000

# Configuración de Email (Opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@ejemplo.com
EMAIL_PASS=tu-contraseña-de-aplicación-gmail
```

### Ejecutar la Aplicación

**Modo Desarrollo:**

```bash
# Terminal 1 - Iniciar servidor backend
cd server
npm run dev

# Terminal 2 - Iniciar frontend
cd client
npm start
```

El frontend estará disponible en `http://localhost:3000` y la API backend en `http://localhost:5000`.

### Configuración de Base de Datos

Inicializar la base de datos con datos de ejemplo:

```bash
# Desde la raíz del proyecto
node init-database.js
```

Crear un usuario administrador:

```bash
# Establece primero las variables de entorno
export ADMIN_EMAIL=admin@ejemplo.com
export ADMIN_PASSWORD=TuContraseñaSegura123!

# Ejecutar script
node create-admin.js
```

## 📚 Documentación de la API

### Endpoints de Autenticación

- `POST /api/auth/login` - Login de administrador
- `POST /api/auth/register` - Registrar nuevo administrador (protegido)
- `GET /api/auth/me` - Obtener información del usuario actual

### Endpoints de Reservas

- `GET /api/reservations` - Obtener todas las reservas (admin)
- `POST /api/reservations` - Crear nueva reserva
- `PUT /api/reservations/:id` - Actualizar reserva (admin)
- `DELETE /api/reservations/:id` - Cancelar reserva (admin)

### Endpoints de Mesas

- `GET /api/tables` - Obtener todas las mesas
- `GET /api/tables/available` - Verificar disponibilidad de mesas
- `POST /api/tables` - Crear mesa (admin)

### Endpoints de Reseñas

- `GET /api/reviews` - Obtener reseñas aprobadas
- `POST /api/reviews` - Enviar nueva reseña
- `PUT /api/reviews/:id/approve` - Aprobar reseña (admin)
- `DELETE /api/reviews/:id` - Eliminar reseña (admin)

### Endpoints de Lista Negra

- `GET /api/blacklist` - Obtener lista negra (admin)
- `POST /api/blacklist` - Añadir a lista negra (admin)
- `DELETE /api/blacklist/:id` - Eliminar de lista negra (admin)

## 🎨 Profundización en Características

### Actualizaciones de Reservas en Tiempo Real

El sistema usa Socket.io para proporcionar actualizaciones en tiempo real al panel de administración cuando se realizan o cancelan nuevas reservas. Esto asegura que múltiples usuarios administradores siempre vean los datos más actuales.

### Sistema de Selección de Mesas

Los clientes pueden seleccionar visualmente las mesas desde un mapa interactivo que muestra el diseño del restaurante. El sistema verifica la disponibilidad en tiempo real y proporciona retroalimentación inmediata.

### Notificaciones por Email

Se envían confirmaciones automáticas por email a los clientes tras una reserva exitosa usando Nodemailer con SMTP de Gmail. Los emails son personalizables mediante plantillas.

### Optimizaciones de Rendimiento

- Carga diferida de componentes usando React.lazy()
- Optimización de imágenes con soporte de formato WebP
- Renderizado de componentes basado en viewport
- Consultas eficientes de MongoDB con indexación apropiada

## 🔐 Consideraciones de Seguridad

- Todas las contraseñas se hashean usando bcrypt con un factor de coste de 12
- Los tokens JWT expiran después de 24 horas
- El rate limiting previene ataques de fuerza bruta
- La validación de entradas previene ataques de inyección
- CORS está configurado solo para orígenes específicos
- Los headers de seguridad se establecen mediante Helmet.js

## 🧪 Testing

```bash
# Tests del backend
cd server
npm test

# Tests del frontend
cd client
npm test
```

## 📦 Construcción para Producción

```bash
# Construir frontend
cd client
npm run build

# La carpeta build puede ser servida por el backend
# o desplegada en un servicio de hosting estático
```

## 🚀 Despliegue

El backend sirve el build de React en producción. Simplemente:

1. Construye el frontend con `npm run build`
2. Establece `NODE_ENV=production` en las variables de entorno del servidor
3. Inicia el backend con `npm start`
4. El backend servirá la aplicación React desde `/client/build`

## 🤝 Contribuir

Este es un proyecto de portfolio y no se mantiene activamente. Sin embargo, siéntete libre de hacer fork y adaptarlo para tu propio uso.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

## 👤 Autor

**Tu Nombre**
- Portfolio: [tuwebsite.com](https://tuwebsite.com)
- LinkedIn: [Tu LinkedIn](https://linkedin.com/in/tuperfil)
- GitHub: [@yalilms](https://github.com/yalilms)

## 🙏 Agradecimientos

- Desarrollado originalmente para un concepto de restaurante mexicano
- Diseñado con escalabilidad y seguridad en mente
- Construido como demostración de capacidades de desarrollo full-stack

---

**Nota:** Este proyecto fue desarrollado como un contrato profesional pero no fue desplegado debido a que el contrato del cliente finalizó antes de la fecha de despliegue programada. Representa un sistema completo y listo para producción que demuestra habilidades de desarrollo full-stack, mejores prácticas de seguridad y patrones modernos de desarrollo web.
