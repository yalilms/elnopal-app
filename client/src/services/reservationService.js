import api from './api';

// ============= SERVICIOS DE RESERVAS =============

// Crear una nueva reserva
export const createReservation = async (reservationData) => {
  try {
    console.log('Creando reserva:', reservationData);
    
    const response = await api.post('/api/reservations', {
      name: reservationData.name,
      email: reservationData.email,
      phone: reservationData.phone,
      date: reservationData.date,
      time: reservationData.time,
      partySize: parseInt(reservationData.partySize),
      tableId: reservationData.tableId,
      specialRequests: reservationData.specialRequests || '',
      needsBabyCart: reservationData.needsBabyCart || false,
      needsWheelchair: reservationData.needsWheelchair || false
    });
    
    console.log('Reserva creada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva:', error);
    
    // Solo mostrar el error real en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('Error detallado:', error);
    }
    
    // En producción, siempre mostrar mensaje amigable
    throw new Error('Lo sentimos, el restaurante está completo para la fecha y hora seleccionadas. Por favor, intente con otra fecha u horario.');
  }
};

// Obtener todas las reservas (solo para administradores)
export const getAllReservations = async (filters = {}) => {
  try {
    console.log('Obteniendo todas las reservas con filtros:', filters);
    
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/api/reservations?${params.toString()}`);
    
    console.log('Reservas obtenidas:', response.data);
    return response.data.reservations || [];
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    
    if (error.response?.status === 401) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a esta información');
    } else {
      throw new Error(error.response?.data?.message || 'Error al obtener reservas');
    }
  }
};

// Obtener reservas por fecha específica
export const getReservationsByDate = async (date) => {
  try {
    console.log('Obteniendo reservas para la fecha:', date);
    
    const response = await api.get(`/api/reservations/date/${date}`);
    
    console.log('Reservas obtenidas para la fecha:', response.data);
    return response.data.reservations || [];
  } catch (error) {
    console.error('Error al obtener reservas por fecha:', error);
    
    if (error.response?.status === 401) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    } else {
      throw new Error(error.response?.data?.message || 'Error al obtener reservas');
    }
  }
};

// Obtener una reserva específica por ID
export const getReservationById = async (reservationId) => {
  try {
    console.log('Obteniendo reserva por ID:', reservationId);
    
    const response = await api.get(`/api/reservations/${reservationId}`);
    
    console.log('Reserva obtenida:', response.data);
    return response.data.reservation;
  } catch (error) {
    console.error('Error al obtener reserva por ID:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Reserva no encontrada');
    } else if (error.response?.status === 401) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    } else {
      throw new Error(error.response?.data?.message || 'Error al obtener reserva');
    }
  }
};

// Actualizar una reserva
export const updateReservation = async (reservationId, updateData) => {
  try {
    console.log('Actualizando reserva:', reservationId, updateData);
    
    const response = await api.put(`/api/reservations/${reservationId}`, updateData);
    
    console.log('Reserva actualizada:', response.data);
    return response.data.reservation;
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Reserva no encontrada');
    } else if (error.response?.status === 401) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Datos de actualización inválidos');
    } else {
      throw new Error(error.response?.data?.message || 'Error al actualizar reserva');
    }
  }
};

// Cancelar una reserva
export const cancelReservation = async (reservationId, reason = '') => {
  try {
    console.log('Cancelando reserva:', reservationId, 'Motivo:', reason);
    
    const response = await api.patch(`/api/reservations/${reservationId}/cancel`, { reason });
    
    console.log('Reserva cancelada:', response.data);
    return response.data.reservation;
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Reserva no encontrada');
    } else if (error.response?.status === 401) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    } else {
      throw new Error(error.response?.data?.message || 'Error al cancelar reserva');
    }
  }
};

// Marcar reserva como no-show
export const markReservationNoShow = async (reservationId) => {
  try {
    console.log('Marcando reserva como no-show:', reservationId);
    
    const response = await api.patch(`/api/reservations/${reservationId}/no-show`);
    
    console.log('Reserva marcada como no-show:', response.data);
    return response.data.reservation;
  } catch (error) {
    console.error('Error al marcar como no-show:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Reserva no encontrada');
    } else if (error.response?.status === 401) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    } else {
      throw new Error(error.response?.data?.message || 'Error al marcar como no-show');
    }
  }
};

// Eliminar una reserva
export const deleteReservation = async (reservationId) => {
  try {
    console.log('Eliminando reserva:', reservationId);
    
    const response = await api.delete(`/api/reservations/${reservationId}`);
    
    console.log('Reserva eliminada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Reserva no encontrada');
    } else if (error.response?.status === 401) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para eliminar esta reserva');
    } else {
      throw new Error(error.response?.data?.message || 'Error al eliminar reserva');
    }
  }
};

// Verificar disponibilidad
export const checkAvailability = async (date, time, partySize) => {
  try {
    console.log('Verificando disponibilidad para:', { date, time, partySize });
    
    const response = await api.get('/api/reservations/availability', {
      params: { date, time, partySize }
    });
    
    console.log('Disponibilidad verificada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    throw new Error(error.response?.data?.message || 'Error al verificar disponibilidad');
  }
};

// Obtener mesas disponibles para una fecha/hora específica
export const getAvailableTables = async ({ date, time, guests }) => {
  try {
    console.log('Obteniendo mesas disponibles para:', { date, time, guests });
    
    const response = await api.get('/api/reservations/availability', {
      params: { date, time, partySize: guests }
    });
    
    console.log('Mesas disponibles obtenidas:', response.data);
    return response.data.availableTables || [];
  } catch (error) {
    console.error('Error al obtener mesas disponibles:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener mesas disponibles');
  }
};

// ============= SERVICIOS DE MESAS =============

// Obtener todas las mesas
export const getAllTables = async () => {
  try {
    console.log('Obteniendo todas las mesas');
    
    const response = await api.get('/api/tables');
    
    console.log('Mesas obtenidas:', response.data);
    return response.data.tables || [];
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener mesas');
  }
};

// Alias para compatibilidad
export const getTables = getAllTables;

// Inicializar mesas por defecto
export const initializeDefaultTables = async () => {
  try {
    console.log('Inicializando mesas por defecto');
    
    const response = await api.post('/api/tables/initialize');
    
    console.log('Mesas inicializadas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al inicializar mesas:', error);
    throw new Error(error.response?.data?.message || 'Error al inicializar mesas');
  }
};

// Obtener mesa por ID
export const getTableById = async (tableId) => {
  try {
    console.log('Obteniendo mesa por ID:', tableId);
    
    const response = await api.get(`/api/tables/${tableId}`);
    
    console.log('Mesa obtenida:', response.data);
    return response.data.table;
  } catch (error) {
    console.error('Error al obtener mesa por ID:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Mesa no encontrada');
    } else {
      throw new Error(error.response?.data?.message || 'Error al obtener mesa');
    }
  }
};

// ============= SERVICIOS DE LISTA NEGRA =============

// Añadir cliente a la lista negra
export const addToBlacklist = async (blacklistData) => {
  try {
    // Validar datos requeridos
    if (!blacklistData.customerName || !blacklistData.customerEmail || !blacklistData.customerPhone) {
      throw new Error('Faltan datos requeridos del cliente');
    }
    
    if (!blacklistData.reason) {
      throw new Error('El motivo es requerido');
    }
    
    if (!blacklistData.reservationId) {
      throw new Error('El ID de la reserva es requerido');
    }

    console.log('Intentando añadir cliente a la lista negra:', blacklistData);
    
    const response = await api.post('/api/blacklist', blacklistData);
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al añadir cliente a la lista negra:', error);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      } else if (error.response.status === 400) {
        throw new Error(error.response.data.message || 'Datos inválidos');
      } else if (error.response.status === 403) {
        throw new Error('No tienes permiso para realizar esta acción');
      } else {
        throw new Error(error.response.data.message || 'Error del servidor');
      }
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      throw new Error(error.message || 'Error al procesar la solicitud');
    }
  }
};

// Verificar si un cliente está en la lista negra
export const checkBlacklist = async (email, phone) => {
  try {
    console.log('Verificando cliente en lista negra:', { email, phone });
    const response = await api.get(`/api/blacklist/check?email=${email}&phone=${phone}`);
    console.log('Respuesta de verificación:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al verificar lista negra:', error);
    throw new Error(error.response?.data?.message || 'Error al verificar lista negra');
  }
};

// Obtener toda la lista negra
export const getBlacklist = async () => {
  try {
    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('Obteniendo lista negra');
    }
    
    const response = await api.get('/api/blacklist');
    
    // Solo log en desarrollo y límite de información
    if (process.env.NODE_ENV === 'development') {
      console.log(`Lista negra obtenida: ${response.data?.length || 0} entradas`);
    }
    return response.data;
  } catch (error) {
    console.error('Error al obtener lista negra:', error);
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      } else if (error.response.status === 403) {
        throw new Error('No tienes permiso para acceder a esta información');
      } else {
        throw new Error(error.response.data.message || 'Error del servidor al obtener lista negra');
      }
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      throw new Error(error.message || 'Error desconocido al obtener lista negra');
    }
  }
};

// Remover cliente de la lista negra
export const removeFromBlacklist = async (id) => {
  try {
    console.log('Removiendo cliente de la lista negra:', id);
    
    const response = await api.delete(`/api/blacklist/${id}`);
    
    console.log('Cliente removido:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al remover de la lista negra:', error);
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      } else if (error.response.status === 403) {
        throw new Error('No tienes permiso para realizar esta acción');
      } else if (error.response.status === 404) {
        throw new Error('Cliente no encontrado en la lista negra');
      } else {
        throw new Error(error.response.data.message || 'Error al remover cliente de la lista negra');
      }
    } else {
      throw new Error(error.message || 'Error al remover cliente de la lista negra');
    }
  }
};

// ============= UTILIDADES =============

// Obtener reservas de una mesa específica en una fecha
export const getTableReservations = async (tableId, date) => {
  try {
    console.log('Obteniendo reservas para mesa:', tableId, 'en fecha:', date);
    
    const reservations = await getAllReservations({ date });
    const tableReservations = reservations.filter(reservation => 
      reservation.table && reservation.table._id === tableId
    );
    
    console.log('Reservas de la mesa obtenidas:', tableReservations);
    return tableReservations;
  } catch (error) {
    console.error('Error al obtener reservas de la mesa:', error);
    throw new Error('Error al obtener reservas de la mesa');
  }
};

// Función auxiliar para calcular hora de finalización
const calculateEndTime = (startTime, duration = 90) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};