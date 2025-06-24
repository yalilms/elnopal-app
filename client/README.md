# El Nopal - Frontend

![El Nopal Logo](https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=400&auto=format&fit=crop)

## Descripción

Frontend para el sitio web del restaurante mexicano El Nopal. Esta aplicación React permite a los usuarios ver información del restaurante, hacer reservas y contactar al restaurante. También incluye un panel de administración para la gestión de reservas.

## Estructura del Proyecto

```
src/
  ├── data/
  │   ├── menuData.js        # Datos del menú
  │   ├── reviewsData.js     # Reseñas de clientes
  │   └── reservationsData.js  # Datos simulados de reservas
  ├── hooks/
  │   └── useReservations.js # Hook personalizado para gestión de reservas
  ├── images/                # Imágenes del sitio
  ├── App.js                 # Componente principal y enrutamiento
  ├── App.css                # Estilos principales
  └── index.js               # Punto de entrada
```

## Características Principales

### Página de Inicio

La página principal incluye:
- Hero banner con imagen y botón de llamada a la acción
- Sección de promociones
- Sección de testimonios/reseñas de clientes

### Sistema de Reservas

El formulario de reservas permite:
- Seleccionar fecha y hora de la reserva
- Indicar número de personas
- Proporcionar información de contacto
- Recibir confirmación visual

### Panel de Administración

El panel de administración permite:
- Autenticación básica (usuario: admin, contraseña: admin123)
- Visualización de todas las reservas
- Filtrado por estado (confirmada, pendiente, cancelada)
- Cambio de estado de reservas
- Eliminación de reservas

## Implementación Técnica

### Estilo y Diseño

- Diseño con colores tradicionales mexicanos:
  - Rojo (#D62828)
  - Verde (#006B3C)
  - Amarillo (#F8B612)
  - Marrón (#421f16)
  - Crema (#FEF9EF)
- Tipografías: 
  - Poppins para títulos
  - Montserrat para contenido

### Datos

Actualmente, los datos son simulados en archivos JS:
- `menuData.js`: Contiene la información del menú
- `reviewsData.js`: Contiene las reseñas de los clientes
- `reservationsData.js`: Simula la base de datos de reservas

### Hooks Personalizados

- `useReservations.js`: Hook que simula la interacción con una API para:
  - Obtener todas las reservas
  - Añadir nuevas reservas
  - Actualizar estado
  - Eliminar reservas

### Animaciones

- Transiciones de página con React Transition Group
- Animaciones en hover para tarjetas y botones
- Efectos visuales para confirmaciones

## Guía para Desarrolladores

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

### Estructura de Archivos Clave

- **App.js**: Contiene la lógica de enrutamiento y los componentes principales
- **App.css**: Estilos globales y variables CSS
- **useReservations.js**: Simula la lógica de backend para reservas

### Añadir Nuevas Funcionalidades

#### Para añadir nuevos platos al menú:

Editar el archivo `src/data/menuData.js` siguiendo el formato existente:

```javascript
{
  id: 'nuevo-id',
  nombre: 'Nombre del Plato',
  descripcion: 'Descripción del plato',
  precio: '$XX.XX',
  imagen: 'URL_de_la_imagen'
}
```

#### Para conectar con una API real:

Modificar el hook `useReservations.js` para realizar llamadas a una API real en lugar de utilizar datos simulados.

## Próximas Mejoras

- Integración con API backend real
- Ampliación del panel de administración
- Sistema de notificaciones
- Carrito de compra para pedidos en línea
- Galería de fotos del restaurante
- Sección de eventos especiales 