import api, { makeRequest, formatApiError } from './api';

// ============= SERVICIOS DE RESERVAS =============

// Crear una nueva reserva
export const createReservation = async (reservationData) => {
  return makeRequest(
    () => {
      // Solo loguear en desarrollo y sin información sensible
      if (process.env.NODE_ENV === 'development') {
        console.log('🍽️ Creando reserva para:', reservationData.date, reservationData.time);
      }
      
      return api.post('/api/reservations', reservationData);
    },
    'Error al crear reserva'
  );
};

// Obtener todas las reservas (con filtros opcionales)
export const getAllReservations = async (filters = {}) => {
  return makeRequest(
    () => {
    const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const queryString = params.toString();
      const url = `/api/reservations${queryString ? `?${queryString}` : ''}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Obteniendo reservas con filtros:', Object.keys(filters).length);
      }
      
      return api.get(url);
    },
    'Error al obtener reservas'
  );
};

// Obtener reservas por fecha
export const getReservationsByDate = async (date) => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📅 Obteniendo reservas para fecha:', date);
      }
      
      return api.get(`/api/reservations/date/${date}`);
    },
    'Error al obtener reservas por fecha'
  );
};

// Obtener una reserva por ID
export const getReservationById = async (reservationId) => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Obteniendo reserva por ID');
      }
      
      return api.get(`/api/reservations/${reservationId}`);
    },
    'Error al obtener reserva'
  );
};

// Actualizar una reserva
export const updateReservation = async (reservationId, updateData) => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✏️ Actualizando reserva ID:', reservationId);
      }
      
      return api.put(`/api/reservations/${reservationId}`, updateData);
    },
    'Error al actualizar reserva'
  );
};

// Cancelar una reserva
export const cancelReservation = async (reservationId, reason = '') => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Cancelando reserva ID:', reservationId);
      }
      
      return api.put(`/api/reservations/${reservationId}/cancel`, { reason });
    },
    'Error al cancelar reserva'
  );
};

// Marcar reserva como no-show
export const markAsNoShow = async (reservationId) => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('👻 Marcando como no-show:', reservationId);
      }
      
      return api.put(`/api/reservations/${reservationId}/no-show`);
    },
    'Error al marcar como no-show'
  );
};

// Verificar disponibilidad para una fecha/hora específica
export const checkAvailability = async (date, time, partySize) => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Verificando disponibilidad:', { date, time, partySize });
      }
      
      return api.get('/api/reservations/availability', {
      params: { date, time, partySize }
    });
    },
    'Error al verificar disponibilidad'
  );
};

// ============= SERVICIOS DE MESAS =============

// Obtener todas las mesas
export const getAllTables = async () => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🪑 Obteniendo todas las mesas');
      }
      
      return api.get('/api/tables');
    },
    'Error al obtener mesas'
  );
};

// Alias para compatibilidad
export const getTables = getAllTables;

// Inicializar mesas por defecto
export const initializeTables = async () => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Inicializando mesas por defecto');
      }
      
      return api.post('/api/tables/initialize');
    },
    'Error al inicializar mesas'
  );
};

// Obtener mesa por ID
export const getTableById = async (tableId) => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Obteniendo mesa por ID');
      }
      
      return api.get(`/api/tables/${tableId}`);
    },
    'Error al obtener mesa'
  );
};

// ============= SERVICIOS DE LISTA NEGRA =============

// Verificar si un cliente está en la lista negra
export const checkBlacklist = async (email, phone) => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚫 Verificando lista negra');
      }
      
      return api.post('/api/blacklist/check', { email, phone });
    },
    'Error al verificar lista negra'
  );
};

// Añadir cliente a la lista negra
export const addToBlacklist = async (blacklistData) => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚫 Añadiendo cliente a lista negra');
      }
      
      return api.post('/api/blacklist', blacklistData);
    },
    'Error al añadir a lista negra'
  );
};

// Obtener lista negra completa
export const getBlacklist = async () => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Obteniendo lista negra');
      }
      
      return api.get('/api/blacklist');
    },
    'Error al obtener lista negra'
  );
};

// Remover cliente de la lista negra
export const removeFromBlacklist = async (id) => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Removiendo de lista negra:', id);
      }
      
      return api.delete(`/api/blacklist/${id}`);
    },
    'Error al remover de lista negra'
  );
};

// ============= UTILIDADES =============

// Obtener reservas por mesa y fecha
export const getTableReservations = async (tableId, date) => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🪑 Obteniendo reservas para mesa:', tableId, 'fecha:', date);
      }
      
      const result = api.get('/api/reservations', {
        params: { tableId, date }
      });
      
      return result;
    },
    'Error al obtener reservas de mesa'
  );
};

// Obtener estadísticas de reservas
export const getReservationStats = async (startDate, endDate) => {
  return makeRequest(
    () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Obteniendo estadísticas de reservas');
      }
      
      return api.get('/api/reservations/stats', {
        params: { startDate, endDate }
      });
    },
    'Error al obtener estadísticas'
  );
};

// Validar datos de reserva en el cliente
export const validateReservationData = (reservationData) => {
  const errors = [];
  
  // Validar campos requeridos
  if (!reservationData.name?.trim()) {
    errors.push('El nombre es requerido');
  }
  
  if (!reservationData.email?.trim()) {
    errors.push('El email es requerido');
  } else if (!/\S+@\S+\.\S+/.test(reservationData.email)) {
    errors.push('El email no es válido');
  }
  
  if (!reservationData.phone?.trim()) {
    errors.push('El teléfono es requerido');
  }
  
  if (!reservationData.date) {
    errors.push('La fecha es requerida');
  } else {
    const reservationDate = new Date(reservationData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (reservationDate < today) {
      errors.push('No se pueden hacer reservas para fechas pasadas');
    }
  }
  
  if (!reservationData.time) {
    errors.push('La hora es requerida');
  }
  
  if (!reservationData.partySize || reservationData.partySize < 1 || reservationData.partySize > 12) {
    errors.push('El número de personas debe estar entre 1 y 12');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Formatear datos de reserva para envío
export const formatReservationData = (formData) => {
  return {
    name: formData.name?.trim(),
    email: formData.email?.trim().toLowerCase(),
    phone: formData.phone?.trim(),
    date: formData.date,
    time: formData.time,
    partySize: parseInt(formData.partySize),
    specialRequests: formData.specialRequests?.trim() || '',
    needsBabyCart: Boolean(formData.needsBabyCart),
    needsWheelchair: Boolean(formData.needsWheelchair)
  };
};