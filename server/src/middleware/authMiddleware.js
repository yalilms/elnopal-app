const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para autenticación con JWT
exports.authenticateJWT = async (req, res, next) => {
  // Obtener token del header
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
  
  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({ message: 'No autorizado. Token no proporcionado.' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario por ID
    const user = await User.findById(decoded.id).select('-password');
    
    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({ message: 'No autorizado. No se encontró usuario autenticado.' });
    }
    
    // Si el usuario está inactivo
    if (!user.active) {
      return res.status(403).json({ message: 'Acceso denegado. Usuario inactivo.' });
    }
    
    // Agregar usuario al request
    req.user = user;
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token no válido' });
  }
};

// Middleware para verificar roles
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado. Usuario no autenticado.' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado. Rol no autorizado.' });
    }
    
    next();
  };
};