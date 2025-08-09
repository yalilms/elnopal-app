import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api, { setAuthToken } from '../services/api';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authTokenState, setAuthTokenState] = useState(null);

  // Manejar eventos de logout automático - solo se ejecuta una vez
  useEffect(() => {
    const handleAuthLogout = () => {
      setCurrentUser(null);
      setAuthTokenState(null);
      setError(null);
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []); // Solo se ejecuta una vez al montar el componente

  // Actualizar token en la configuración de API cuando cambie
  useEffect(() => {
    setAuthToken(authTokenState); // setAuthToken es la función del servicio API
  }, [authTokenState]);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Intentar obtener el usuario actual si hay un token en memoria
        if (authTokenState) {
          const response = await api.get('/api/auth/me');
          if (response.data) {
            setCurrentUser(response.data);
          }
        }
      } catch (error) {
        console.log('No hay sesión activa o token inválido');
        setAuthTokenState(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (authTokenState) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [authTokenState]);

  // Función para iniciar sesión
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      console.log("Intentando login con email:", email);
      
      const response = await api.post('/api/auth/login', { 
        email: email.trim(), 
        password: password.trim() 
      });
      
      if (response.data && response.data.token && response.data.user) {
        const { token, user: userData } = response.data;
        
        console.log("Login exitoso:", userData);
        
        // Guardar token en localStorage
        localStorage.setItem('authToken', token);
        
        // Establecer token y usuario en el estado
        setAuthTokenState(token);
        
        // Crear objeto de usuario completo con token incluido
        const fullUserData = {
          ...userData,
          token: token
        };
        
        setCurrentUser(fullUserData);
        
        toast.success(`¡Bienvenido ${userData.name || userData.email}!`);
        return true;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

    } catch (error) {
      console.error("Error en la autenticación:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al iniciar sesión. Verifique sus credenciales.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Limpiar estado y localStorage en caso de error
      localStorage.removeItem('authToken');
      setAuthTokenState(null);
      setCurrentUser(null);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar usuario
  const register = async (name, email, password, role = 'host') => {
    setError(null);
    setLoading(true);
    
    try {
      console.log("Intentando registro con email:", email);
      
      const response = await api.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role
      });
      
      if (response.data && response.data.token && response.data.user) {
        const { token, user: userData } = response.data;
        
        console.log("Registro exitoso:", userData);
        
        // Establecer token y usuario en el estado
        setAuthTokenState(token);
        setCurrentUser(userData);
        
        toast.success(`¡Bienvenido ${userData.name}! Tu cuenta ha sido creada.`);
        return true;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

    } catch (error) {
      console.error("Error en el registro:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al crear la cuenta.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthTokenState(null);
    setCurrentUser(null);
    toast.info('Has cerrado sesión');
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return currentUser?.role === role;
  };

  // Obtener el token actual
  const getToken = () => {
    return authTokenState;
  };

  // Refrescar datos del usuario
  const refreshUser = async () => {
    if (!authTokenState) return false;
    
    try {
      const response = await api.get('/api/auth/me');
      if (response.data) {
        setCurrentUser(response.data);
        return true;
      }
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      logout();
    }
    return false;
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
    hasRole,
    getToken,
    refreshUser,
    isAuthenticated: !!currentUser && !!authTokenState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 