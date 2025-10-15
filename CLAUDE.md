# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

## Descripción del Proyecto

El Nopal es un sistema completo de gestión de restaurantes con reservas online, panel de administración y actualizaciones en tiempo real. El sistema está diseñado para un restaurante mexicano auténtico con funcionalidades de gestión de mesas, sistema de lista negra, reseñas, publicaciones de blog y notificaciones por email.

**Stack Tecnológico:**
- Frontend: React 17 con React Router v5, React Toastify, Socket.io Client
- Backend: Node.js/Express con MongoDB/Mongoose, autenticación JWT, Socket.io, Helmet, Rate Limiting
- Infraestructura: Nginx reverse proxy, gestión de procesos PM2

## Comandos de Desarrollo

### Desarrollo Backend

```bash
# Iniciar backend en modo desarrollo (con nodemon)
cd server
npm run dev

# Iniciar backend en modo producción
npm start

# Ejecutar tests
npm test

# Crear usuario administrador (ejecutar desde raíz del proyecto)
node create-admin.js

# Inicializar base de datos (ejecutar desde raíz del proyecto)
node init-database.js
```

### Desarrollo Frontend

```bash
# Iniciar servidor de desarrollo React
cd client
npm start

# Build para producción
npm run build

# Ejecutar tests
npm test
```

### Desarrollo Full Stack

Ejecutar ambos servidores simultáneamente en terminales separadas:
1. Terminal 1: `cd server && npm run dev` (Backend en puerto 5000)
2. Terminal 2: `cd client && npm start` (Frontend en puerto 3000)

### Gestión de Procesos PM2

```bash
# Ver logs del backend
pm2 logs restaurant-backend

# Reiniciar backend
pm2 restart restaurant-backend

# Verificar estado del servicio
pm2 status

# Guardar configuración de PM2
pm2 save
```

## Arquitectura

### Estructura Monorepo

El proyecto es un **monorepo** con directorios separados para cliente y servidor:
- `client/` - Frontend React (SPA)
- `server/` - Backend API Express
- Nivel raíz tiene scripts de utilidades y base de datos

### Arquitectura Backend (server/src/)

**Punto de Entrada:** `server/src/index.js` configura Express con:
- Headers de seguridad Helmet con CSP
- Rate limiting (5 intentos/15min para auth, 1000 requests/15min general)
- CORS configurado para orígenes específicos
- Socket.io para actualizaciones en tiempo real de reservas
- Conexión MongoDB con resiliencia (continúa sin BD en modo dev)
- Sirve el build estático del frontend desde `client/build/`
- Maneja enrutamiento SPA (todas las rutas no-API sirven `index.html`)

**Cadena de Middleware:**
1. `checkMongo` - Asegura que MongoDB está conectado antes de procesar requests API
2. `auth.js` / `authMiddleware.js` - Verificación de token JWT
3. `admin.js` - Verificación de rol administrador

**Controladores:** Manejan la lógica de negocio para cada recurso
- `authController.js` - Login, registro, generación JWT
- `reservationController.js` - CRUD de reservas, verificación de lista negra
- `tableController.js` - Disponibilidad y gestión de mesas
- `blacklistController.js` - Bloquear/desbloquear clientes
- `reviewController.js` - Moderación de reseñas
- `contactController.js` - Manejo de formulario de contacto
- `postController.js` - Gestión de publicaciones del blog

**Modelos (Schemas Mongoose):**
- `User.js` - Usuarios admin con contraseñas hasheadas con bcrypt, acceso basado en roles
- `Reservation.js` - Reservas de clientes con estado (pending/confirmed/completed/cancelled), asignación de mesa, peticiones especiales
- `Table.js` - Mesas del restaurante con capacidad y posición
- `Blacklist.js` - Clientes bloqueados por email/teléfono
- `Review.js` - Reseñas de clientes con estado de moderación
- `Contact.js` - Envíos del formulario de contacto
- `Post.js` - Publicaciones del blog

**Servicios:**
- `emailService.js` - Integración Nodemailer para confirmaciones de reserva vía Gmail
- `reservationService.js` - Lógica de reservas y verificación de disponibilidad

### Arquitectura Frontend (client/src/)

**Entrada:** `App.js` - Componente principal con:
- React Router v5 para navegación
- Lazy loading para componentes no críticos (Blog, Paneles Admin, etc.)
- Suspense con componente `LoadingFallback`
- Context wrappers de AuthProvider y ReservationProvider

**Organización de Componentes:**
- `components/admin/` - Paneles admin (reservas, reseñas, gestión lista negra)
  - `AdminRoute.jsx` - Wrapper de ruta protegida que requiere autenticación admin
  - Todos los componentes admin requieren autenticación vía AuthContext
- `components/common/` - Componentes reutilizables (OptimizedImage, ViewportObserver, RestaurantStatusIndicator)
- `components/layout/` - Navbar, Footer
- `components/reservation/` - Formulario de reserva, selección de mesa, mapa de mesas
- `components/reviews/` - Formulario y visualización de reseñas
- `components/routes/` - Componentes de página (Blog, BlogPost, About)
- `components/contact/` - Formulario de contacto e información

**Context Providers:**
- `AuthContext.jsx` - Gestiona estado de autenticación, login/logout, verificación admin
  - Token almacenado en localStorage como 'authToken'
  - Establece token en servicio API vía `setAuthToken()`
  - Escucha eventos 'auth:logout' para expiración de sesión
- `ReservationContext.jsx` - Gestiona estado de reservas y disponibilidad

**Servicios:**
- `api.js` - Instancia Axios con URL base, inyección de token auth, interceptores de error
- `reservationService.js` - Llamadas API de reservas
- `tableService.js` - Verificaciones de disponibilidad de mesas
- `contactService.js` - Envío de formulario de contacto

**Optimizaciones de Rendimiento:**
- `OptimizedImage.jsx` - Lazy loading de imágenes con soporte WebP
- `ViewportObserver.jsx` - Intersection Observer para animaciones basadas en viewport
- `useImageOptimization.js` - Custom hook para optimización de imágenes
- `scrollUtils.js` - Utilidades de scroll suave
- `performanceOptimizations.js` - Utilidades de rendimiento

### Flujo de Autenticación

1. Usuario envía credenciales vía `AdminLogin.jsx`
2. `AuthContext.login()` envía POST a `/api/auth/login`
3. Backend `authController.js` valida credenciales con bcrypt
4. Token JWT generado y retornado con datos de usuario
5. Frontend almacena token en localStorage y lo establece en servicio API
6. Llamadas API subsecuentes incluyen token en header Authorization
7. Middleware backend `auth.js` verifica JWT en rutas protegidas
8. Middleware `admin.js` verifica rol de usuario para rutas solo-admin

### Actualizaciones en Tiempo Real

Eventos Socket.io:
- `newReservation` - Emitido cuando se crea reserva, dispara broadcast de `reservationUpdate`
- `cancelReservation` - Emitido cuando se cancela reserva, dispara broadcast de `reservationUpdate`
- Frontend escucha `reservationUpdate` para refrescar listas de reservas en panel admin

### Características de Seguridad

**Backend:**
- Hashing de contraseñas con Bcrypt (factor de costo 12)
- JWT con capacidad de rotación de secreto
- Rate limiting en endpoints auth (5 intentos/15min)
- Headers de seguridad Helmet (CSP, protección XSS, opciones de frame)
- Validación y sanitización de entrada vía express-validator
- Prevención de inyección MongoDB vía Mongoose
- Configuración de trust proxy para detección precisa de IP detrás de nginx

**Frontend:**
- Sin datos sensibles en localStorage excepto token auth
- Rutas protegidas requieren autenticación
- Rutas admin requieren verificación de rol admin
- CORS restringido a orígenes específicos

## Variables de Entorno

### Backend (.env en server/)

Requeridas:
- `NODE_ENV` - production/development
- `PORT` - Puerto del servidor (por defecto: 5000)
- `MONGODB_URI` - String de conexión MongoDB
- `JWT_SECRET` - Secreto para firma JWT (¡cambiar en producción!)
- `CORS_ORIGIN` - Origen frontend permitido (ej., http://localhost:3000)

Opcionales:
- `EMAIL_HOST` - Host SMTP (smtp.gmail.com)
- `EMAIL_PORT` - Puerto SMTP (587)
- `EMAIL_USER` - Dirección de email para envíos
- `EMAIL_PASS` - Contraseña de aplicación para Gmail

### Frontend (.env.production en client/)

El frontend usa URLs relativas para llamadas API en producción, apoyándose en configuración de proxy nginx.

## Configuración de Base de Datos

**Autenticación MongoDB:**
- Base de datos: Nombre configurable vía MONGODB_URI
- Conexión incluye parámetros de autenticación

**Configuración Inicial:**
```bash
# Inicializar base de datos con datos por defecto
node init-database.js

# Crear usuario administrador
node create-admin.js
```

Credenciales admin por defecto (cambiar inmediatamente):
- Email: Configurable vía variable de entorno
- Password: Configurable vía variable de entorno

## Detalles Importantes de Implementación

### Configuración de Enrutamiento SPA

El backend sirve la SPA de React mediante:
1. Servir archivos estáticos de `client/build/` vía express.static
2. Capturar todas las rutas no-API con handler `app.get('*')`
3. Retornar `index.html` para enrutamiento del lado del cliente
4. Rutas API con prefijo `/api` se manejan antes del catch-all

Esto permite que React Router maneje rutas frontend mientras el backend sirve la API.

### Endpoints Duales de Reserva

El backend tiene DOS endpoints de reserva:
1. `/api/reservations` - Requiere MongoDB, con todas las funcionalidades (definido en routes)
2. POST `/api/reservations` - Endpoint de respaldo con validación básica (definido en index.js), usado cuando MongoDB no está disponible durante desarrollo

El middleware `checkMongo` determina qué endpoint se usa.

### Comportamiento de Rate Limiting

Rate limiting se omite para localhost (127.0.0.1, ::1) en modo desarrollo. En producción:
- Endpoints auth: 5 requests por 15 minutos
- API general: 1000 requests por 15 minutos

### Integración Socket.io

El servidor Socket.io está adjunto al servidor HTTP (no la app Express) para soportar upgrades WebSocket. CORS debe configurarse por separado para Socket.io.

### Optimización de Imágenes

Frontend incluye scripts de optimización de imágenes:
- `optimize-images.js` - Optimización básica de imágenes
- Scripts ejecutables antes del despliegue para mejor rendimiento

### Resiliencia MongoDB

El backend implementa lógica de reintento de conexión:
- Si MongoDB falla al inicio, el servidor continúa sin base de datos
- Reintenta conexión cada 30 segundos
- Todas las rutas API están protegidas por middleware `checkMongo`
- Retorna 503 cuando base de datos no disponible

Esto permite desarrollo sin MongoDB corriendo.

## Testing

Backend incluye configuración de test Jest en `server/src/__tests__/api.test.js` con mongodb-memory-server para testing sin base de datos real.

## Errores Comunes

1. **Versión React Router:** Este proyecto usa React Router v5, no v6. La API es diferente (Switch vs Routes, prop component vs element).

2. **Almacenamiento Token Auth:** Token se almacena en localStorage, NO sessionStorage. Persiste entre sesiones del navegador.

3. **Configuración CORS:** El CORS backend está configurado para orígenes específicos. Al agregar nuevos dominios, actualizar tanto CORS de Express como CORS de Socket.io.

4. **Conexión MongoDB:** No asumir que MongoDB siempre está conectado. El sistema está diseñado para manejar fallos de conexión con gracia.

5. **Ubicación de Artefactos de Build:** Build frontend está en `client/build/`, backend sirve desde `../../client/build/` relativo a `server/src/index.js`.

6. **Servicio de Archivos Estáticos:** El backend sirve el frontend en producción. No ejecutar `npm start` en directorio client para producción.

7. **Configuración PM2 Ecosystem:** Ubicado en `server/ecosystem.config.js`, define configuración de proceso de producción.

## Notas de Despliegue

El proyecto está diseñado para:
- Backend sirviendo frontend en producción
- Nginx como reverse proxy
- PM2 gestionando proceso backend
- MongoDB corriendo localmente o remotamente

El despliegue incluye:
- Backups automáticos antes del despliegue
- Actualizaciones de dependencias
- Optimización de build frontend
- Optimización de imágenes
- Verificación de configuración Nginx
- Gestión de procesos PM2
- Health checks post-despliegue
- Monitoreo de espacio en disco y memoria
