import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Importar axios

// Creamos el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar la aplicación
    const checkAuth = () => {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          // Verificar que tenga token y que no esté expirado (podríamos añadir validación de expiración aquí)
          if (userData && userData.token) {
            setUser(userData);
            console.log('Usuario autenticado cargado desde localStorage:', userData);
            // Configurar axios para usar este token por defecto en futuras solicitudes
            axios.defaults.headers.common['x-auth-token'] = userData.token;
          } else {
            console.warn('Token no encontrado o inválido en localStorage');
            localStorage.removeItem('currentUser');
            delete axios.defaults.headers.common['x-auth-token'];
          }
        }
      } catch (err) {
        console.error('Error al verificar autenticación:', err);
        localStorage.removeItem('currentUser');
        delete axios.defaults.headers.common['x-auth-token'];
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => { // Cambiado de username a email
    setError(null);
    console.log("Intentando login con email:", email);
    
    try {
      // Llamar al endpoint de login del servidor
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data && response.data.token && response.data.user) {
        const { token, user: userData } = response.data;
        console.log("Login exitoso, datos recibidos del servidor:", { token, userData });
        
        // Crear el objeto de usuario completo para guardar
        const fullUserData = { ...userData, token };
        
        setUser(fullUserData);
        // Guardar en localStorage para persistencia
        localStorage.setItem('currentUser', JSON.stringify(fullUserData));
        // Configurar axios para usar este token por defecto
        axios.defaults.headers.common['x-auth-token'] = token;
        
        // Mantener compatibilidad por si acaso
        localStorage.setItem('adminAuth', 'true'); 
        return true;
      } else {
        // Si la respuesta no tiene el formato esperado
        console.error('Respuesta inesperada del servidor al iniciar sesión:', response.data);
        setError('Error inesperado del servidor.');
        return false;
      }

    } catch (err) {
      console.error("Error en la autenticación:", err.response ? err.response.data : err.message);
      // Usar el mensaje de error del servidor si está disponible
      const serverError = err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
      setError(serverError);
      // Limpiar datos en caso de error
      setUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('adminAuth');
      delete axios.defaults.headers.common['x-auth-token'];
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminAuth');
    // Limpiar token de axios
    delete axios.defaults.headers.common['x-auth-token'];
    console.log('Sesión cerrada');
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return user?.roles?.includes('admin') || user?.role === 'admin' || false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    error,
    currentUser: user,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 