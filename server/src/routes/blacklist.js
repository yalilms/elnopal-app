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

// Ruta pública para verificar lista negra (usada durante reservas)
router.get('/check', blacklistController.checkBlacklist);

// Aplicar middleware de autenticación y autorización a las demás rutas
router.use(authenticateJWT);
router.use(authorize(['admin']));

// Rutas protegidas de administración
router.post('/', blacklistValidation, blacklistController.addToBlacklist);
router.get('/', blacklistController.getBlacklist);
router.delete('/:id', blacklistController.removeFromBlacklist);

module.exports = router; 