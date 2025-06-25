const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Validación mejorada para registro
const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios')
    .trim()
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Ingresa un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email es demasiado largo'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'),
  
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'host', 'waiter'])
    .withMessage('Rol no válido')
];

// Validación mejorada para login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Ingresa un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email es demasiado largo'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ max: 128 })
    .withMessage('Contraseña demasiado larga')
];

// Rutas
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authenticateJWT, authController.getCurrentUser);

module.exports = router; 