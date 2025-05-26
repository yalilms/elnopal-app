const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/User');
const { authorize } = require('../middleware/authMiddleware');

// Validaciones para crear/actualizar usuario
const userValidation = [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('Email no válido')
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (user && user._id.toString() !== req.params.id) {
        throw new Error('El email ya está registrado');
      }
      return true;
    }),
  body('password').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role').isIn(['admin', 'manager', 'host', 'waiter']).withMessage('Rol no válido'),
  body('isActive').optional().isBoolean().withMessage('isActive debe ser un booleano')
];

// Obtener todos los usuarios (solo admin)
router.get('/', authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Obtener un usuario por ID (solo admin)
router.get('/:id', authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Crear un nuevo usuario (solo admin)
router.post('/', authorize(['admin']), userValidation, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Crear el usuario
    const user = new User({
      name,
      email,
      password,
      role
    });
    
    await user.save();
    
    // No devolver la contraseña
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Actualizar un usuario (solo admin)
router.put('/:id', authorize(['admin']), userValidation, async (req, res) => {
  try {
    const { name, email, password, role, isActive } = req.body;
    
    // Preparar objeto de actualización
    const updateData = {
      name,
      email,
      role,
      isActive
    };
    
    // Solo incluir contraseña si se proporciona
    if (password) {
      updateData.password = password;
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Impedir que un admin se desactive a sí mismo
    if (req.user.id === req.params.id && isActive === false) {
      return res.status(400).json({ message: 'No puedes desactivar tu propia cuenta' });
    }
    
    // Aplicar actualizaciones
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });
    
    await user.save();
    
    // No devolver la contraseña
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Eliminar un usuario (solo admin)
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    // Impedir eliminar el propio usuario
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Marcar como inactivo en lugar de eliminar
    user.isActive = false;
    await user.save();
    
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

module.exports = router; 