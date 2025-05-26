const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

// Crear una nueva mesa
exports.createTable = async (req, res) => {
  try {
    const { number, capacity, position, size, zone } = req.body;

    // Verificar si ya existe una mesa con ese número
    const existingTable = await Table.findOne({ number });
    if (existingTable) {
      return res.status(400).json({ message: 'Ya existe una mesa con ese número' });
    }

    const table = new Table({
      number,
      capacity,
      position,
      size,
      zone,
      status: 'free'
    });

    await table.save();
    res.status(201).json(table);
  } catch (error) {
    console.error('Error al crear mesa:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Obtener todas las mesas
exports.getAllTables = async (req, res) => {
  try {
    const { zone, status } = req.query;
    const query = { isActive: true };

    if (zone) query.zone = zone;
    if (status) query.status = status;

    const tables = await Table.find(query)
      .populate('currentReservation')
      .sort({ number: 1 });
    
    res.json(tables);
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Obtener una mesa por ID
exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('currentReservation');
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    res.json(table);
  } catch (error) {
    console.error('Error al obtener mesa:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Actualizar una mesa
exports.updateTable = async (req, res) => {
  try {
    const { number, capacity, position, size, zone, isActive } = req.body;
    
    // Si se actualiza el número, verificar que no exista otra mesa con ese número
    if (number) {
      const existingTable = await Table.findOne({ number, _id: { $ne: req.params.id } });
      if (existingTable) {
        return res.status(400).json({ message: 'Ya existe otra mesa con ese número' });
      }
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { number, capacity, position, size, zone, isActive },
      { new: true }
    ).populate('currentReservation');

    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    res.json(table);
  } catch (error) {
    console.error('Error al actualizar mesa:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
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

// Eliminar una mesa
exports.deleteTable = async (req, res) => {
  try {
    // Verificar si tiene reservas activas
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    if (table.status !== 'free') {
      return res.status(400).json({ 
        message: 'No se puede eliminar una mesa con reservas activas' 
      });
    }

    // Marcar como inactiva en lugar de eliminar
    table.isActive = false;
    await table.save();
    
    res.json({ message: 'Mesa eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar mesa:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}; 