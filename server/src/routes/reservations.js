const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reservationController = require('../controllers/reservationController');
const { authenticateJWT, authorize } = require('../middleware/authMiddleware');

// Validaciones para crear/actualizar reserva
const reservationValidation = [
  body('customer.name').notEmpty().withMessage('El nombre del cliente es obligatorio'),
  body('customer.email').isEmail().withMessage('El email del cliente no es válido'),
  body('customer.phone').notEmpty().withMessage('El teléfono del cliente es obligatorio'),
  body('date').isISO8601().withMessage('La fecha debe ser válida'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora debe tener formato HH:MM'),
  body('partySize').isInt({ min: 1 }).withMessage('El número de comensales debe ser al menos 1'),
  body('tableId').optional({ nullable: true }),
  body('status').optional().isIn(['pending', 'confirmed', 'canceled', 'completed']).withMessage('Estado no válido'),
  body('specialRequests').optional()
];

// Rutas con autenticación
router.get('/', reservationController.getAllReservations);
router.get('/:id', reservationController.getReservationById);
router.post('/', reservationValidation, reservationController.createReservation);
router.put('/:id', authenticateJWT, reservationValidation, reservationController.updateReservation);
router.delete('/:id', authorize(['admin', 'manager']), reservationController.deleteReservation);

module.exports = router; 