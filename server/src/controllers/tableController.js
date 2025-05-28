const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

// Crear una nueva mesa
exports.createTable = async (req, res) => {
  try {
    const { number, capacity, minGuests, maxGuests, location, isAccessible, notes } = req.body;

    // Verificar que no exista una mesa con el mismo número
    const existingTable = await Table.findOne({ number });
    if (existingTable) {
      return res.status(400).json({ message: 'Ya existe una mesa con ese número' });
    }

    const table = new Table({
      number,
      capacity,
      minGuests: minGuests || 1,
      maxGuests: maxGuests || capacity + 1,
      location: location || 'center',
      isAccessible: isAccessible || false,
      notes: notes || ''
    });

    await table.save();

    res.status(201).json({
      success: true,
      message: 'Mesa creada exitosamente',
      table
    });
  } catch (error) {
    console.error('Error al crear mesa:', error);
    res.status(500).json({ 
      message: 'Error al crear mesa', 
      error: error.message 
    });
  }
};

// Obtener todas las mesas
exports.getAllTables = async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true }).sort({ number: 1 });
    res.json({
      success: true,
      tables
    });
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ 
      message: 'Error al obtener mesas', 
      error: error.message 
    });
  }
};

// Obtener una mesa por ID
exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    res.json({
      success: true,
      table
    });
  } catch (error) {
    console.error('Error al obtener mesa:', error);
    res.status(500).json({ 
      message: 'Error al obtener mesa', 
      error: error.message 
    });
  }
};

// Actualizar una mesa
exports.updateTable = async (req, res) => {
  try {
    const { number, capacity, minGuests, maxGuests, location, isAccessible, notes } = req.body;
    
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { number, capacity, minGuests, maxGuests, location, isAccessible, notes },
      { new: true, runValidators: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    res.json({
      success: true,
      message: 'Mesa actualizada exitosamente',
      table
    });
  } catch (error) {
    console.error('Error al actualizar mesa:', error);
    res.status(500).json({ 
      message: 'Error al actualizar mesa', 
      error: error.message 
    });
  }
};

// Actualizar estado de una mesa
exports.updateTableStatus = async (req, res) => {
  try {
    const { status, reservationId } = req.body;
    
    if (!['free', 'reserved', 'occupied'].includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    // Obtener la mesa actual
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    // Acciones específicas según el nuevo estado
    if (status === 'free') {
      // Si tenía una reserva asignada, actualizarla
      if (table.currentReservation) {
        await Reservation.findByIdAndUpdate(table.currentReservation, {
          status: 'completed',
          tableId: null
        });
      }
      table.currentReservation = null;
    } 
    else if (status === 'reserved' && reservationId) {
      // Verificar que la reserva exista
      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: 'Reserva no encontrada' });
      }
      
      // Verificar capacidad
      if (table.capacity < reservation.partySize) {
        return res.status(400).json({ 
          message: 'La mesa no tiene capacidad suficiente para esta reserva' 
        });
      }
      
      // Si la reserva ya estaba asignada a otra mesa, liberar esa mesa
      if (reservation.tableId && reservation.tableId.toString() !== req.params.id) {
        await Table.findByIdAndUpdate(reservation.tableId, {
          status: 'free',
          currentReservation: null
        });
      }
      
      // Actualizar la reserva
      await Reservation.findByIdAndUpdate(reservationId, {
        tableId: req.params.id,
        status: 'confirmed'
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
    res.json(updatedTable);
  } catch (error) {
    console.error('Error al actualizar estado de mesa:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Eliminar una mesa (desactivar)
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
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
        message: 'Estado inválido. Debe ser: free, reserved, occupied, cleaning' 
      });
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    res.json({
      success: true,
      message: 'Estado de mesa actualizado',
      table
    });
  } catch (error) {
    console.error('Error al cambiar estado de mesa:', error);
    res.status(500).json({ 
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
      return res.status(404).json({ message: 'Mesa no encontrada' });
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
      message: 'Error al inicializar mesas', 
      error: error.message 
    });
  }
}; 