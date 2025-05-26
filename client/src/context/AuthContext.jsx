import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import jwt from 'jsonwebtoken';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Función para generar un token simulado
const generateSimulatedToken = (user) => {
  const payload = {
    user: {
      id: user.id || '1',
      username: user.username,
      role: user.role
    },
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  };

  // En un entorno real, esto sería un JWT firmado por el servidor
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Función para verificar si un token ha expirado
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch (e) {
    return true;
  }
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usuarios disponibles (en un caso real, esto vendría de una base de datos)
  const availableUsers = [
    { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
    { id: '2', username: 'gerente', password: 'gerente123', role: 'admin' },
    { id: '3', username: 'staff', password: 'staff123', role: 'staff' }
  ];

  // Verificar si hay un usuario guardado en localStorage al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.token && !isTokenExpired(parsedUser.token)) {
          setCurrentUser(parsedUser);
        } else {
          console.log('Token expirado, cerrando sesión');
          localStorage.removeItem('currentUser');
        }
      } catch (e) {
        console.error("Error al procesar usuario guardado:", e);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = (username, password) => {
    setError(null);
    
    // Verificar credenciales
    const user = availableUsers.find(
      user => user.username === username && user.password === password
    );

    if (user) {
      // Generar token simulado
      const token = generateSimulatedToken(user);
      
      // No guardar la contraseña en el estado o localStorage
      const { password: _, ...userWithoutPassword } = user;
      const userWithToken = {
        ...userWithoutPassword,
        token
      };
      
      setCurrentUser(userWithToken);
      localStorage.setItem('currentUser', JSON.stringify(userWithToken));
      toast.success(`¡Bienvenido ${user.username}!`);
      return true;
    } else {
      setError('Credenciales incorrectas');
      toast.error('Credenciales incorrectas');
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.info('Sesión cerrada correctamente');
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  // Obtener el token actual
  const getToken = () => {
    return currentUser?.token;
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAdmin,
    getToken,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 