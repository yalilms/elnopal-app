const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

// Obtener todas las mesas
exports.getAllTables = async (req, res) => {
  try {
    const tables = await Table.find()
      .sort({ number: 1 })
      .populate('currentReservation');
    
    res.json({
      success: true,
      tables
    });
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener mesas', 
      error: error.message 
    });
  }
};

// Obtener mesas activas
exports.getActiveTables = async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true })
      .sort({ number: 1 })
      .populate('currentReservation');
    
    res.json({
      success: true,
      tables
    });
  } catch (error) {
    console.error('Error al obtener mesas activas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener mesas activas', 
      error: error.message 
    });
  }
};

// Obtener una mesa por ID
exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate('currentReservation');
    
    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: 'Mesa no encontrada' 
      });
    }
    
    res.json({
      success: true,
      table
    });
  } catch (error) {
    console.error('Error al obtener mesa:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener mesa', 
      error: error.message 
    });
  }
};

// Crear una nueva mesa
exports.createTable = async (req, res) => {
  try {
    const { number, capacity, location } = req.body;
    
    // Verificar si ya existe una mesa con ese número
    const existingTable = await Table.findOne({ number });
    if (existingTable) {
      return res.status(400).json({ 
        success: false,
        message: 'Ya existe una mesa con ese número' 
      });
    }
    
    // Crear mesa
    const table = new Table({
      number,
      capacity,
      location,
      status: 'free'
    });
    
    await table.save();
    
    res.status(201).json({
      success: true,
      message: 'Mesa creada correctamente',
      table
    });
  } catch (error) {
    console.error('Error al crear mesa:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear mesa', 
      error: error.message 
    });
  }
};

// Actualizar una mesa
exports.updateTable = async (req, res) => {
  try {
    const { capacity, location } = req.body;
    
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: 'Mesa no encontrada' 
      });
    }
    
    // Actualizar campos
    if (capacity) table.capacity = capacity;
    if (location) table.location = location;
    
    await table.save();
    
    res.json({
      success: true,
      message: 'Mesa actualizada correctamente',
      table
    });
  } catch (error) {
    console.error('Error al actualizar mesa:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar mesa', 
      error: error.message 
    });
  }
};

// Actualizar estado de una mesa
exports.updateTableStatus = async (req, res) => {
  try {
    const { status, reservationId } = req.body;
    
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: 'Mesa no encontrada' 
      });
    }
    
    // Si la mesa pasa a estar reservada, vincular con la reserva
    if (status === 'reserved' && reservationId) {
      // Actualizar la reserva a "confirmed"
      await Reservation.findByIdAndUpdate(reservationId, {
        status: 'confirmed',
        tableId: table._id
      });
      
      table.currentReservation = reservationId;
    }
    else if (status === 'occupied' && table.currentReservation) {
      // Actualizar la reserva a "completed" si existe
      await Reservation.findByIdAndUpdate(table.currentReservation, {
        status: 'completed'
      });
    }

    table.status = status;
    await table.save();

    const updatedTable = await Table.findById(req.params.id).populate('currentReservation');
    res.json({
      success: true,
      message: 'Estado de mesa actualizado',
      table: updatedTable
    });
  } catch (error) {
    console.error('Error al actualizar estado de mesa:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en el servidor', 
      error: error.message 
    });
  }
};

// Eliminar una mesa (desactivar)
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: 'Mesa no encontrada' 
      });
    }

    // Desactivar en lugar de eliminar
    table.isActive = false;
    await table.save();

    res.json({
      success: true,
      message: 'Mesa desactivada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar mesa:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar mesa', 
      error: error.message 
    });
  }
};

// Obtener mesas disponibles para una fecha/hora específica
exports.getAvailableTables = async (req, res) => {
  try {
    const { date, time, partySize } = req.query;

    if (!date || !time || !partySize) {
      return res.status(400).json({ 
        success: false,
        message: 'Faltan parámetros: fecha, hora y número de personas' 
      });
    }

    // Usar el método estático del modelo
    const availableTables = await Table.getAvailableTables(date, time, parseInt(partySize));

    res.json({
      success: true,
      availableTables,
      totalAvailable: availableTables.length
    });
  } catch (error) {
    console.error('Error al obtener mesas disponibles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener mesas disponibles', 
      error: error.message 
    });
  }
};

// Cambiar estado de mesa
exports.changeTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['free', 'reserved', 'occupied', 'cleaning'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Estado inválido. Debe ser: free, reserved, occupied, cleaning' 
      });
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: 'Mesa no encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Estado de mesa actualizado',
      table
    });
  } catch (error) {
    console.error('Error al cambiar estado de mesa:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al cambiar estado de mesa', 
      error: error.message 
    });
  }
};

// Activar/desactivar mesa
exports.toggleTableStatus = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: 'Mesa no encontrada' 
      });
    }

    table.isActive = !table.isActive;
    await table.save();

    res.json({
      success: true,
      message: `Mesa ${table.isActive ? 'activada' : 'desactivada'} exitosamente`,
      table
    });
  } catch (error) {
    console.error('Error al cambiar estado de mesa:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al cambiar estado de mesa', 
      error: error.message 
    });
  }
};

// Inicializar mesas por defecto
exports.initializeDefaultTables = async (req, res) => {
  try {
    const wasInitialized = await Table.initializeDefaultTables();
    
    if (wasInitialized) {
      res.json({
        success: true,
        message: 'Mesas por defecto creadas exitosamente'
      });
    } else {
      res.json({
        success: true,
        message: 'Las mesas ya estaban inicializadas'
      });
    }
  } catch (error) {
    console.error('Error al inicializar mesas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al inicializar mesas', 
      error: error.message 
    });
  }
};