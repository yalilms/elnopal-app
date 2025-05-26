const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const tableController = require('../controllers/tableController');
const { authorize } = require('../middleware/authMiddleware');

// Validaciones para crear/actualizar mesa
const tableValidation = [
  body('number').isInt({ min: 1 }).withMessage('El número de mesa debe ser un número positivo'),
  body('capacity').isInt({ min: 1 }).withMessage('La capacidad debe ser un número positivo'),
  body('position.x').isFloat().withMessage('La posición X debe ser un número'),
  body('position.y').isFloat().withMessage('La posición Y debe ser un número'),
  body('size.width').isFloat({ min: 0 }).withMessage('El ancho debe ser un número positivo'),
  body('size.height').isFloat({ min: 0 }).withMessage('El alto debe ser un número positivo'),
  body('zone').isIn(['interior', 'terraza', 'vip']).withMessage('Zona no válida')
];

// Validaciones para actualizar estado
const statusValidation = [
  body('status').isIn(['free', 'reserved', 'occupied']).withMessage('Estado no válido'),
  body('reservationId').optional()
];

// Rutas
router.get('/', tableController.getAllTables);
router.get('/:id', tableController.getTableById);
router.post('/', authorize(['admin', 'manager']), tableValidation, tableController.createTable);
router.put('/:id', authorize(['admin', 'manager']), tableValidation, tableController.updateTable);
router.put('/:id/status', authorize(['admin', 'manager', 'host']), statusValidation, tableController.updateTableStatus);
router.delete('/:id', authorize(['admin']), tableController.deleteTable);

module.exports = router; 