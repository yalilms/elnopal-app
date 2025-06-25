const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { authenticateJWT, authorize } = require('../middleware/authMiddleware');

// Validaciones para crear mensaje de contacto (formulario público)
const createContactValidation = [
  body('name').notEmpty().trim().withMessage('El nombre es obligatorio'),
  body('email').isEmail().normalizeEmail().withMessage('El email no es válido'),
  body('phone').optional().trim(),
  body('subject').optional().trim(),
  body('message').notEmpty().trim().withMessage('El mensaje es obligatorio')
];

// Validaciones para actualizar estado de mensaje
const updateStatusValidation = [
  body('status').isIn(['pending', 'responded', 'resolved']).withMessage('Estado no válido')
];

// Validaciones para marcar como respondido
const respondValidation = [
  body('responseMessage').notEmpty().trim().withMessage('El mensaje de respuesta es obligatorio')
];

// Rutas públicas (sin autenticación)
router.post('/', createContactValidation, contactController.createContact);

// Rutas con autenticación (administradores)
router.get('/', authenticateJWT, authorize(['admin']), contactController.getAllContacts);
router.get('/stats', authenticateJWT, authorize(['admin']), contactController.getContactStats);
router.get('/:id', authenticateJWT, authorize(['admin']), contactController.getContactById);
router.patch('/:id/status', authenticateJWT, authorize(['admin']), updateStatusValidation, contactController.updateContactStatus);
router.patch('/:id/respond', authenticateJWT, authorize(['admin']), respondValidation, contactController.markAsResponded);
router.patch('/:id/resolve', authenticateJWT, authorize(['admin']), contactController.markAsResolved);
router.delete('/:id', authenticateJWT, authorize(['admin']), contactController.deleteContact);

module.exports = router; 