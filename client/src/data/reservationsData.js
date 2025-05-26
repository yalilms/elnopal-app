// Datos de ejemplo para reservaciones (para pruebas)
export const reservationsData = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    telefono: '555-123-4567',
    fecha: '2023-11-20',
    hora: '20:00',
    personas: 2,
    mesa: 3,
    estado: 'confirmada',
    comentarios: 'Celebración de aniversario'
  },
  {
    id: 2,
    nombre: 'María García',
    email: 'maria@ejemplo.com',
    telefono: '555-765-4321',
    fecha: '2023-11-21',
    hora: '21:00',
    personas: 4,
    mesa: 8,
    estado: 'pendiente',
    comentarios: ''
  },
  {
    id: 3,
    nombre: 'Carlos Rodríguez',
    email: 'carlos@ejemplo.com',
    telefono: '555-987-6543',
    fecha: '2023-11-20',
    hora: '19:30',
    personas: 6,
    mesa: 12,
    estado: 'cancelada',
    comentarios: 'Necesitamos una mesa cerca de la ventana'
  }
];

// Lista negra de clientes que no se presentaron
const blacklistData = [
  {
    id: 1,
    name: "Fernando Pérez",
    email: "fernando@ejemplo.com",
    phone: "555-4321",
    reason: "No se presentó a 3 reservas",
    addedAt: "2023-11-15T09:30:00"
  },
  {
    id: 2,
    name: "Lucía Fernández",
    email: "lucia@ejemplo.com",
    phone: "555-8765",
    reason: "No se presentó a 2 reservas y canceló tarde 3 veces",
    addedAt: "2023-11-20T14:15:00"
  }
];

export { reservationsData, blacklistData }; 