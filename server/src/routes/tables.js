const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

// Rutas públicas (sin autenticación por ahora)
router.get('/', tableController.getAllTables);
router.get('/available', tableController.getAvailableTables);
router.get('/:id', tableController.getTableById);

// Rutas administrativas (sin autenticación por ahora para debugging)
router.post('/', tableController.createTable);
router.post('/initialize', tableController.initializeDefaultTables);
router.put('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);
router.patch('/:id/toggle', tableController.toggleTableStatus);

module.exports = router; 