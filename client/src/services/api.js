import axios from 'axios';

// Crear instancia de axios optimizada
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://elnopal.es' : 'http://localhost:5000'),
  timeout: 15000, // Aumentado para conexiones lentas
  headers: {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br', // Compresión
    'Cache-Control': 'no-cache', // Control de caché explícito
  },
  // Configuración de rendimiento
  maxRedirects: 3,
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
});

// Variables para el token
let authToken = null;

// Función para establecer el token
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Función para obtener el token actual
export const getAuthToken = () => authToken;

// Interceptor de respuesta mejorado con retry automático
api.interceptors.response.use(
  (response) => {
    // Marcar respuesta exitosa para estadísticas de rendimiento
    if (window.performance && performance.mark) {
      performance.mark('api-success');
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Retry automático para errores de red
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      if (!originalRequest._retry && originalRequest._retryCount < 2) {
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        
        // Espera progresiva (backoff)
        const delay = Math.pow(2, originalRequest._retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return api(originalRequest);
      }
    }
    
    // Manejo de errores de autenticación
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('authToken');
      window.dispatchEvent(new Event('auth:logout'));
    }
    
    return Promise.reject(error);
  }
);

// Interceptor de solicitud optimizado
api.interceptors.request.use(
  (config) => {
    // Marcar inicio de request para estadísticas de rendimiento
    if (window.performance && performance.mark) {
      performance.mark('api-request-start');
    }
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Configurar timeout diferenciado por tipo de request
    if (config.method === 'post' || config.method === 'put') {
      config.timeout = 30000; // Más tiempo para operaciones de escritura
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 