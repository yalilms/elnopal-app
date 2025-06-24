import axios from 'axios';

// Configurar base URL para desarrollo y producción
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://elnopal.es'
  : 'http://localhost:5000';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Variables para el token
let authToken = null;

// Función para establecer el token
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete api.defaults.headers.common['x-auth-token'];
  }
};

// Función para obtener el token actual
export const getAuthToken = () => authToken;

// Interceptor de respuesta para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.log('Token inválido o expirado, limpiando autenticación');
      setAuthToken(null);
      // Emitir evento personalizado para que AuthContext pueda reaccionar
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// Interceptor de solicitud para logging en desarrollo
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

export default api; 