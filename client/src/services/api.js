import axios from 'axios';

// Configurar base URL para desarrollo y producción
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://elnopal.es'
  : 'http://localhost:5000';

// Crear instancia de axios con configuración optimizada
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para CORS con cookies si es necesario
});

// Variables para el token
let authToken = null;
let isRefreshing = false;
let failedQueue = [];

// Función para procesar la cola de requests fallidos
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Función para establecer el token
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
    // También guardar en sessionStorage como backup
    try {
      sessionStorage.setItem('authToken', token);
    } catch (e) {
      // Ignorer si sessionStorage no está disponible
    }
  } else {
    delete api.defaults.headers.common['x-auth-token'];
    try {
      sessionStorage.removeItem('authToken');
    } catch (e) {
      // Ignorer si sessionStorage no está disponible
    }
  }
};

// Función para obtener el token guardado
export const getStoredToken = () => {
  try {
    return sessionStorage.getItem('authToken');
  } catch (e) {
    return null;
  }
};

// Función para limpiar autenticación
export const clearAuth = () => {
  authToken = null;
  delete api.defaults.headers.common['x-auth-token'];
  try {
    sessionStorage.removeItem('authToken');
  } catch (e) {
    // Ignorer errores
  }
  
  // Solo loguear en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Autenticación limpiada');
  }
};

// Función de retry para requests fallidos
const retryRequest = async (originalRequest, retries = 1) => {
  if (retries <= 0) {
    throw new Error('Máximo número de reintentos alcanzado');
  }
  
  // Esperar un poco antes de reintentar
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    return await api(originalRequest);
  } catch (error) {
    if (retries > 1 && shouldRetry(error)) {
      return retryRequest(originalRequest, retries - 1);
    }
    throw error;
  }
};

// Función para determinar si un error amerita retry
const shouldRetry = (error) => {
  // Retry para errores de red o timeouts
  if (!error.response) return true;
  
  // Retry para errores del servidor (5xx) pero no para errores del cliente (4xx)
  const status = error.response.status;
  return status >= 500 && status < 600;
};

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Añadir timestamp para debugging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      config.metadata = { startTime: new Date() };
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Asegurar que el token esté presente si existe
    if (authToken && !config.headers['x-auth-token']) {
      config.headers['x-auth-token'] = authToken;
    }
    
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    // Log de rendimiento en desarrollo
    if (process.env.NODE_ENV === 'development' && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log de errores en desarrollo
    if (process.env.NODE_ENV === 'development') {
      if (error.response) {
        console.error(`❌ API Error ${error.response.status}:`, error.response.data);
      } else if (error.request) {
        console.error('❌ Network Error:', error.message);
      } else {
        console.error('❌ Request Error:', error.message);
      }
    }
    
    // Manejar token expirado (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya estamos refrescando, añadir a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['x-auth-token'] = token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Intentar refrescar el token o limpiar la autenticación
        clearAuth();
        processQueue(null, null);
        isRefreshing = false;
        
        // Redirigir a login si es necesario
        if (window.location.pathname !== '/admin') {
          window.location.href = '/admin';
        }
        
        return Promise.reject(error);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearAuth();
        return Promise.reject(refreshError);
      }
    }
    
    // Retry para errores de red o servidor
    if (shouldRetry(error) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        return await retryRequest(originalRequest, 2);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Función helper para formatear errores de API
export const formatApiError = (error) => {
  if (error.response) {
    // Error del servidor
    const { status, data } = error.response;
    
    if (data?.error) {
      return {
        message: data.error,
        details: data.details || null,
        status
      };
    }
    
    // Mensajes de error predeterminados según el código de estado
    const statusMessages = {
      400: 'Solicitud inválida',
      401: 'No autorizado',
      403: 'Acceso prohibido',
      404: 'Recurso no encontrado',
      429: 'Demasiadas solicitudes',
      500: 'Error interno del servidor',
      503: 'Servicio no disponible'
    };
    
    return {
      message: statusMessages[status] || 'Error del servidor',
      status
    };
  }
  
  if (error.request) {
    // Error de red
    return {
      message: 'Error de conexión. Verifique su internet.',
      isNetworkError: true
    };
  }
  
  // Error de configuración
  return {
    message: error.message || 'Error inesperado'
  };
};

// Función helper para hacer requests con manejo de errores consistente
export const makeRequest = async (requestFn, errorMessage = 'Error en la operación') => {
  try {
    const response = await requestFn();
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const formattedError = formatApiError(error);
    
    // Log solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${errorMessage}:`, formattedError);
    }
    
    return {
      success: false,
      error: formattedError
    };
  }
};

// Health check del API
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error)
    };
  }
};

// Inicializar token desde el almacenamiento al cargar
const initializeAuth = () => {
  const storedToken = getStoredToken();
  if (storedToken) {
    setAuthToken(storedToken);
  }
};

// Inicializar cuando se carga el módulo
initializeAuth();

export default api; 