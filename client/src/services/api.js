import axios from 'axios';

// Crear instancia de axios
const api = axios.create({
  baseURL: 'https://elnopal.es',
  timeout: 10000,
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
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Función para obtener el token actual
export const getAuthToken = () => authToken;

// Interceptor de respuesta para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('authToken');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// Interceptor de solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 