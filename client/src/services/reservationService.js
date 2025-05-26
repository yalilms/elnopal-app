import axios from 'axios';

// Función para obtener el token del localStorage
const getAuthToken = () => {
  try {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      console.warn('No se encontró usuario en localStorage');
      return null;
    }
    
    const parsedUser = JSON.parse(user);
    if (!parsedUser.token) {
      console.warn('Usuario encontrado pero no tiene token');
      return null;
    }
    
    return parsedUser.token;
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

// Configurar interceptor para incluir el token en todas las solicitudes
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['x-auth-token'] = token;
      console.log('Token incluido en la solicitud:', token);
    } else {
      console.warn('No se encontró token para la solicitud');
    }
    return config;
  },
  (error) => {
    console.error('Error en el interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

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

    // Verificar autenticación
    const token = getAuthToken();
    if (!token) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    }

    console.log('Intentando añadir cliente a la lista negra:', blacklistData);
    console.log('Token usado:', token);
    
    const response = await axios.post('/api/blacklist', blacklistData, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al añadir cliente a la lista negra:', {
      error,
      response: error.response,
      data: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      // El servidor respondió con un código de error
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
      // La solicitud se hizo pero no se recibió respuesta
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      // Error al configurar la solicitud
      throw new Error(error.message || 'Error al procesar la solicitud');
    }
  }
};

// Verificar si un cliente está en la lista negra
export const checkBlacklist = async (email, phone) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    }

    console.log('Verificando cliente en lista negra:', { email, phone });
    const response = await axios.get(`/api/blacklist/check?email=${email}&phone=${phone}`);
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
    const token = getAuthToken();
    if (!token) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    }

    console.log('Obteniendo lista negra');
    console.log('Token usado:', token);
    
    const response = await axios.get('/api/blacklist', {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Lista negra obtenida:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener lista negra:', error);
    if (error.response) {
      // El servidor respondió con un código de error
      if (error.response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      } else if (error.response.status === 403) {
        throw new Error('No tienes permiso para acceder a esta información');
      } else {
        throw new Error(error.response.data.message || 'Error del servidor al obtener lista negra');
      }
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      // Error al configurar la solicitud
      throw new Error(error.message || 'Error desconocido al obtener lista negra');
    }
  }
};

// Remover cliente de la lista negra
export const removeFromBlacklist = async (id) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    }

    console.log('Removiendo cliente de la lista negra:', id);
    console.log('Token usado:', token);
    
    const response = await axios.delete(`/api/blacklist/${id}`, {
      headers: {
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Cliente removido:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al remover de la lista negra:', error);
    if (error.response) {
      // El servidor respondió con un código de error
      if (error.response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      } else if (error.response.status === 403) {
        throw new Error('No tienes permiso para realizar esta acción');
      } else if (error.response.status === 404) {
        throw new Error('Cliente no encontrado en la lista negra');
      } else {
        throw new Error(error.response.data.message || 'Error al remover cliente de la lista negra');
      }
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      // Error al configurar la solicitud
      throw new Error(error.message || 'Error desconocido al remover cliente');
    }
  }
};

// Obtener reservaciones de una mesa específica
export const getTableReservations = async (tableId, date) => {
  try {
    // Aquí iría la llamada a la API real
    // Por ahora simulamos datos de ejemplo
    const mockReservations = [
      { time: '13:00', status: 'confirmed' },
      { time: '15:30', status: 'cancelled' },
      { time: '20:00', status: 'confirmed' }
    ];
    
    // Simulamos un delay para simular la llamada a la API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockReservations;
  } catch (error) {
    console.error('Error al obtener las reservaciones de la mesa:', error);
    throw error;
  }
};

// Función para calcular la hora de finalización
const calculateEndTime = (startTime, duration = 90) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

// Función para verificar disponibilidad
export const checkAvailability = async (date, time, partySize) => {
  try {
    const endTime = calculateEndTime(time);
    const response = await fetch('/api/reservations/check-availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        time,
        endTime,
        partySize
      }),
    });

    if (!response.ok) {
      throw new Error('Error al verificar disponibilidad');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Función para crear una reserva
export const createReservation = async (reservationData) => {
  try {
    // Calcular la hora de finalización
    const endTime = calculateEndTime(reservationData.time);
    
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...reservationData,
        duration: 90, // 1.5 horas en minutos
        endTime
      }),
    });

    if (!response.ok) {
      throw new Error('Error al crear la reserva');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}; 