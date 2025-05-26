const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const blacklistController = require('../controllers/blacklistController');
const { authenticateJWT, authorize } = require('../middleware/authMiddleware');

// Validaciones
const blacklistValidation = [
  body('customerName').notEmpty().withMessage('El nombre del cliente es requerido'),
  body('customerEmail').isEmail().withMessage('Email inválido'),
  body('customerPhone').notEmpty().withMessage('El teléfono es requerido'),
  body('reason').notEmpty().withMessage('El motivo es requerido'),
  body('reservationId').notEmpty().withMessage('El ID de la reserva es requerido')
];

// Aplicar middleware de autenticación y autorización a todas las rutas
router.use(authenticateJWT);
router.use(authorize(['admin']));

// Añadir cliente a la lista negra
router.post('/', blacklistValidation, blacklistController.addToBlacklist);

// Verificar si un cliente está en la lista negra
router.get('/check', blacklistController.checkBlacklist);

// Obtener todas las entradas de la lista negra
router.get('/', blacklistController.getBlacklist);

// Remover cliente de la lista negra
router.delete('/:id', blacklistController.removeFromBlacklist);

module.exports = router; 