const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar y autenticar JWT
exports.authenticateJWT = (req, res, next) => {
  // Obtener el token del encabezado
  let token = req.header('x-auth-token');
  
  // Si no hay token en x-auth-token, probar con otros headers comunes
  if (!token) {
    if (req.headers.authorization) {
      const authParts = req.headers.authorization.split(' ');
      if (authParts.length === 2 && authParts[0] === 'Bearer') {
        token = authParts[1];
      }
    }
  }
  
  // Verificar si hay token
  if (!token) {
    return res.status(401).json({
      message: 'No autorizado. Token no proporcionado.'
    });
  }
  
  try {
    // Verificar el token - NUNCA usar clave por defecto en producción
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no configurado');
    }
    
    const decoded = jwt.verify(token, jwtSecret);
    
    // Añadir el usuario decodificado a req.user
    req.user = decoded;
    
    // Asegurar compatibilidad con diferentes formatos de datos de usuario
    if (!req.user.roles && req.user.role) {
      req.user.roles = [req.user.role];
    }
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Sesión expirada. Por favor, inicie sesión nuevamente.'
      });
    }
    
    return res.status(401).json({
      message: 'Token inválido.'
    });
  }
};

// Middleware para verificar roles
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'No autorizado. No se encontró usuario autenticado.'
      });
    }
    
    // Aceptar tanto un array de roles como un string
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    
    // Si no se requieren roles específicos, permitir acceso
    if (rolesArray.length === 0) {
      return next();
    }
    
    // Verificar si el usuario tiene alguno de los roles requeridos
    let hasRequiredRole = false;
    
    // Comprobar si req.user.roles es un array
    if (Array.isArray(req.user.roles)) {
      hasRequiredRole = rolesArray.some(role => req.user.roles.includes(role));
    } 
    // Comprobar si req.user.role es un string
    else if (req.user.role) {
      hasRequiredRole = rolesArray.includes(req.user.role);
    }
    
    if (hasRequiredRole) {
      return next();
    }
    
    return res.status(403).json({
      message: 'Prohibido. No tiene los permisos necesarios.'
    });
  };
}; 