// Middleware para verificar si el usuario es administrador
module.exports = function(req, res, next) {
  // Verificar si es administrador
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
  }
  
  next();
};
