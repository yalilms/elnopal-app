const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Registro de usuario
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { name, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      password,
      role: role || 'host' // Valor por defecto si no se especifica
    });

    await user.save();

    // Generar token JWT con payload estandarizado
    const payload = {
      id: user._id,
      roles: [user.role || 'host'] // Usar array y asegurar que siempre haya un rol
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Error de configuración del servidor' });
    }

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          return res.status(500).json({ message: 'Error al generar token' });
        }
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Actualizar último login
    user.lastLogin = Date.now();
    await user.save();

    // Generar token JWT con payload estandarizado
    const payload = {
      id: user._id,
      roles: [user.role] // Usar array
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Error de configuración del servidor' });
    }

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          return res.status(500).json({ message: 'Error al generar token' });
        }
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener usuario actual
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}; 