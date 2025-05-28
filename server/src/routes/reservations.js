const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reservationController = require('../controllers/reservationController');
const { authenticateJWT, authorize } = require('../middleware/authMiddleware');

// Validaciones para crear reserva (formulario público)
const createReservationValidation = [
  body('name').notEmpty().trim().withMessage('El nombre es obligatorio'),
  body('email').isEmail().normalizeEmail().withMessage('El email no es válido'),
  body('phone').notEmpty().trim().withMessage('El teléfono es obligatorio'),
  body('date').isISO8601().withMessage('La fecha debe ser válida'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora debe tener formato HH:MM'),
  body('partySize').isInt({ min: 1, max: 20 }).withMessage('El número de comensales debe estar entre 1 y 20'),
  body('specialRequests').optional().trim(),
  body('needsBabyCart').optional().isBoolean(),
  body('needsWheelchair').optional().isBoolean()
];

// Validaciones para actualizar reserva (administradores)
const updateReservationValidation = [
  body('customer.name').optional().notEmpty().withMessage('El nombre del cliente es obligatorio'),
  body('customer.email').optional().isEmail().withMessage('El email del cliente no es válido'),
  body('customer.phone').optional().notEmpty().withMessage('El teléfono del cliente es obligatorio'),
  body('date').optional().isISO8601().withMessage('La fecha debe ser válida'),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora debe tener formato HH:MM'),
  body('partySize').optional().isInt({ min: 1, max: 20 }).withMessage('El número de comensales debe estar entre 1 y 20'),
  body('tableId').optional({ nullable: true }),
  body('status').optional().isIn(['pending', 'confirmed', 'seated', 'completed', 'no-show', 'cancelled']).withMessage('Estado no válido'),
  body('specialRequests').optional().trim()
];

// Rutas públicas (sin autenticación)
router.post('/', createReservationValidation, reservationController.createReservation);
router.get('/availability', reservationController.checkAvailability);

// Rutas con autenticación (administradores)
router.get('/', authenticateJWT, reservationController.getAllReservations);
router.get('/date/:date', authenticateJWT, reservationController.getReservationsByDate);
router.get('/:id', authenticateJWT, reservationController.getReservationById);
router.put('/:id', authenticateJWT, updateReservationValidation, reservationController.updateReservation);
router.patch('/:id/cancel', authenticateJWT, reservationController.cancelReservation);
router.patch('/:id/no-show', authenticateJWT, reservationController.markNoShow);

module.exports = router; 