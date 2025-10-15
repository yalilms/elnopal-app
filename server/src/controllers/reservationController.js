const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const emailService = require('../services/emailService');
const mongoose = require('mongoose');

// Función para liberar mesas automáticamente
const autoCompleteReservations = async () => {
  try {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Tiempo actual en minutos
    const today = now.toISOString().split('T')[0];

    // Buscar reservas activas que deberían haber terminado
    const reservationsToComplete = await Reservation.find({
      date: today,
      status: { $in: ['confirmed', 'seated'] },
      endTimeInMinutes: { $lte: currentTime },
      autoCompleted: false
    });

    // Completar cada reserva y liberar su mesa
    for (const reservation of reservationsToComplete) {
      // Marcar la reserva como completada
      reservation.status = 'completed';
      reservation.autoCompleted = true;
      reservation.completedAt = now;
      await reservation.save();

      // Liberar la mesa si existe
      if (reservation.table) {
        await Table.findByIdAndUpdate(reservation.table, {
          status: 'free',
          currentReservation: null
        });
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(`Reserva ${reservation._id} completada automáticamente y mesa liberada`);
      }
    }
  } catch (error) {
    console.error('Error en autoCompleteReservations:', error);
  }
};

// Iniciar el proceso de liberación automática solo una vez
// Note: In production, this should be moved to a cron job or scheduled task
let autoCompleteInterval = null;
if (!autoCompleteInterval) {
  autoCompleteInterval = setInterval(autoCompleteReservations, 60000); // Ejecutar cada minuto
}

// Export function to clear interval (for testing/cleanup)
exports.clearAutoCompleteInterval = () => {
  if (autoCompleteInterval) {
    clearInterval(autoCompleteInterval);
    autoCompleteInterval = null;
  }
};

// Función para asignar mesa automáticamente según las reglas del restaurante
const getAutomaticTableAssignment = async (partySize, date, time) => {
  const Reservation = mongoose.model('Reservation');
  
  // VALIDACIÓN: Más de 8 personas deben contactar directamente
  if (partySize > 8) {
    return {
      success: false,
      requiresCall: true,
      message: 'Para grupos de más de 8 personas, por favor contáctanos directamente'
    };
  }
  
  // Convertir tiempo a minutos para verificar disponibilidad
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const duration = 90; // 1.5 horas
  const endTimeInMinutes = timeInMinutes + duration;
  
  // Buscar reservas que se superpongan con el horario solicitado
  const overlappingReservations = await Reservation.find({
    date: new Date(date),
    $or: [
      {
        timeInMinutes: { $lt: endTimeInMinutes },
        endTimeInMinutes: { $gt: timeInMinutes }
      }
    ],
    status: { $nin: ['cancelled', 'no-show', 'completed'] }
  }).select('table');
  
  // Obtener IDs de mesas ocupadas
  const occupiedTableIds = overlappingReservations.map(res => res.table?.toString()).filter(Boolean);
  
  let assignmentOrder = [];
  
  // REGLAS DE ASIGNACIÓN SEGÚN EL NÚMERO DE PERSONAS
  if (partySize >= 1 && partySize <= 3) {
    // Para 1-3 personas: mesas individuales 2,3,4,5,6,7,8,9,10
    assignmentOrder = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  } 
  else if (partySize >= 4 && partySize <= 5) {
    // Para 4-5 personas: mesas individuales 11,12,13,14,15,16,17,18,29,28,27,26,25,24,23,22,21,20
    assignmentOrder = [11, 12, 13, 14, 15, 16, 17, 18, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20];
  }
  else if (partySize >= 6 && partySize <= 7) {
    // Para 6-7 personas: mesas juntas [20,21], [22,23], [24,25]
    const tableGroups = [
      [20, 21], [22, 23], [24, 25]
    ];
    
    // Buscar el primer grupo de mesas disponibles
    for (const group of tableGroups) {
      let groupAvailable = true;
      
      // Verificar cada mesa del grupo
      for (const tableNum of group) {
        const table = await Table.findOne({ number: tableNum, isActive: true });
        if (!table || occupiedTableIds.includes(table._id.toString())) {
          groupAvailable = false;
          break;
        }
      }
      
      if (groupAvailable) {
        // Retornar las mesas del grupo
        const tables = await Table.find({ 
          number: { $in: group }, 
          isActive: true 
        });
        
        return {
          success: true,
          tables: tables,
          message: `Mesas ${group.join(' y ')} asignadas para ${partySize} personas`,
          isGroupReservation: true
        };
      }
    }
    
    // Si no hay grupos disponibles
    return {
      success: false,
      message: 'No hay mesas disponibles para grupos de 6-7 personas en este horario'
    };
  }
  else if (partySize === 8) {
    // Para 8 personas: mesas juntas [22,23], [24,25]
    const tableGroups = [
      [22, 23], [24, 25]
    ];
    
    // Buscar el primer grupo de mesas disponibles
    for (const group of tableGroups) {
      let groupAvailable = true;
      
      // Verificar cada mesa del grupo
      for (const tableNum of group) {
        const table = await Table.findOne({ number: tableNum, isActive: true });
        if (!table || occupiedTableIds.includes(table._id.toString())) {
          groupAvailable = false;
          break;
        }
      }
      
      if (groupAvailable) {
        // Retornar las mesas del grupo
        const tables = await Table.find({ 
          number: { $in: group }, 
          isActive: true 
        });
        
        return {
          success: true,
          tables: tables,
          message: `Mesas ${group.join(' y ')} asignadas para ${partySize} personas`,
          isGroupReservation: true
        };
      }
    }
    
    // Si no hay grupos disponibles
    return {
      success: false,
      message: 'No hay mesas disponibles para grupos de 8 personas en este horario'
    };
  }
  
  // Para mesas individuales (1-5 personas)
  if (assignmentOrder.length > 0) {
    for (const tableNumber of assignmentOrder) {
      // Saltar mesas 1 y 19 (no reservables)
      if (tableNumber === 1 || tableNumber === 19) continue;
      
      const table = await Table.findOne({ 
        number: tableNumber, 
        isActive: true 
      });
      
      if (table && !occupiedTableIds.includes(table._id.toString())) {
        return {
          success: true,
          tables: [table],
          message: `Mesa ${tableNumber} asignada automáticamente`,
          isGroupReservation: false
        };
      }
    }
  }
  
  return {
    success: false,
    message: 'No hay mesas disponibles en este horario'
  };
};

// Crear una nueva reserva
exports.createReservation = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      date, 
      time, 
      partySize, 
      tableId, 
      specialRequests,
      needsBabyCart,
      needsWheelchair
    } = req.body;

    // Validaciones básicas (email opcional para admin)
    const isAdminUser = req.user && req.user.role === 'admin';
    
    if (!name || !phone || !date || !time || !partySize) {
      return res.status(400).json({ 
        message: 'Faltan campos obligatorios: nombre, teléfono, fecha, hora y número de personas' 
      });
    }

    // Email obligatorio solo para usuarios normales, opcional para admin
    if (!isAdminUser && !email) {
      return res.status(400).json({ 
        message: 'El email es obligatorio para reservas públicas' 
      });
    }

    // Validar formato de email solo si se proporciona
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido' });
      }
    }

    // ⏰ VALIDACIÓN: Máximo 30 minutos antes de la hora solicitada (solo para usuarios normales)
    const reservationDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();
    const timeDifferenceInMinutes = (reservationDateTime - now) / (1000 * 60);

    if (!isAdminUser && timeDifferenceInMinutes < 30) {
      return res.status(400).json({ 
        message: 'Las reservas deben realizarse con al menos 30 minutos de anticipación. Para reservas inmediatas, por favor llama al restaurante.' 
      });
    }

    // 🤖 ASIGNACIÓN AUTOMÁTICA DE MESA si no se proporciona tableId
    let assignedTableId = tableId;
    let assignedTables = []; // Para mesas múltiples (grupos)
    let isGroupReservation = false;
    
    if (!tableId) {
      console.log(`🔍 Buscando mesa automática para ${partySize} personas...`);
      
      try {
        const assignmentResult = await getAutomaticTableAssignment(partySize, date, time);
        
        if (assignmentResult.success) {
          console.log(`✅ ${assignmentResult.message}`);
          assignedTables = assignmentResult.tables;
          assignedTableId = assignmentResult.tables[0]._id; // Mesa principal para la reserva
          isGroupReservation = assignmentResult.isGroupReservation;
        } else if (assignmentResult.requiresCall) {
          return res.status(400).json({ 
            message: assignmentResult.message,
            requiresCall: true
          });
        } else {
          console.log(`❌ ${assignmentResult.message}`);
          return res.status(409).json({ 
            message: assignmentResult.message + '. Por favor, prueba con otro horario o llama al restaurante para consultar disponibilidad.'
          });
        }
      } catch (error) {
        console.error('Error en asignación automática de mesas:', error);
        return res.status(500).json({ 
          message: 'Error al verificar disponibilidad de mesas. Por favor, intenta de nuevo.'
        });
      }
    } else {
      // Si se proporciona tableId, verificar que sea una mesa individual
      const providedTable = await Table.findById(tableId);
      if (providedTable) {
        assignedTables = [providedTable];
      }
    }

    // Validar que la mesa exista si se proporciona o se asignó automáticamente
    if (assignedTableId) {
      const table = await Table.findById(assignedTableId);
      if (!table) {
        return res.status(404).json({ message: 'Mesa no encontrada' });
      }
      // Verificar capacidad de la mesa
      if (table.capacity < partySize) {
        return res.status(400).json({ message: 'La mesa seleccionada no tiene capacidad suficiente' });
      }
    }

    // CALCULAR CAMPOS REQUERIDOS PARA EL ESQUEMA
    // Convertir tiempo a minutos desde medianoche
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;

    // Duración por defecto de 90 minutos (1.5 horas)
    const duration = 90;
    const endTimeInMinutes = timeInMinutes + duration;
    
    // Calcular hora de finalización
    const endHours = Math.floor(endTimeInMinutes / 60) % 24;
    const endMins = endTimeInMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    // Crear la reserva con la estructura correcta
    const reservation = new Reservation({
      customer: {
        name: name.trim(),
        email: email ? email.toLowerCase().trim() : `admin-${Date.now()}@elnopal.es`,
        phone: phone.trim()
      },
      date: new Date(date),
      time,
      timeInMinutes, // Campo requerido
      duration,
      endTime, // Campo requerido  
      endTimeInMinutes, // Campo requerido
      partySize: parseInt(partySize),
      table: assignedTableId, // Mesa principal de la reserva
      specialRequests: specialRequests?.trim() || '',
      needsBabyCart: needsBabyCart || false,
      needsWheelchair: needsWheelchair || false,
      status: 'confirmed', // Confirmamos automáticamente
      createdBy: req.user ? req.user.id : null,
      // Información adicional para reservas de grupo
      ...(isGroupReservation && {
        groupReservation: {
          isGroup: true,
          tableIds: assignedTables.map(table => table._id),
          tableNumbers: assignedTables.map(table => table.number)
        }
      })
    });

    await reservation.save();

    // Actualizar estado de TODAS las mesas asignadas
    if (assignedTables.length > 0) {
      for (const table of assignedTables) {
        await Table.findByIdAndUpdate(table._id, { 
          status: 'reserved',
          currentReservation: reservation._id
        });
      }
      
      if (isGroupReservation) {
        console.log(`✅ ${assignedTables.length} mesas actualizadas para reserva de grupo: ${assignedTables.map(t => t.number).join(', ')}`);
      } else {
        console.log(`✅ Mesa ${assignedTables[0].number} actualizada para reserva individual`);
      }
    }

    // Enviar correos de confirmación (solo si hay email real)
    const shouldSendEmails = email && !email.includes('admin-') && !email.includes('@elnopal.es');
    
    if (shouldSendEmails) {
      try {
        console.log('📧 Preparando envío de correos para reserva:', reservation._id);
        
        const reservationData = {
          name: reservation.customer.name,
          email: reservation.customer.email,
          phone: reservation.customer.phone,
          date: reservation.date,
          time: reservation.time,
          partySize: reservation.partySize,
          specialRequests: reservation.specialRequests,
          needsBabyCart: reservation.needsBabyCart,
          needsWheelchair: reservation.needsWheelchair
        };

        console.log('📧 Llamando a emailService.sendReservationEmails...');
        const emailResult = await emailService.sendReservationEmails(reservationData);
        
        if (emailResult.success) {
          console.log('✅ Correos enviados exitosamente');
          reservation.confirmationEmailSent = true;
          reservation.confirmationEmailSentAt = new Date();
          reservation.notificationEmailSent = true;
          reservation.notificationEmailSentAt = new Date();
          await reservation.save();
        } else {
          console.error('❌ Error en el envío de correos:', emailResult.message);
        }
      } catch (emailError) {
        console.error('❌ Excepción enviando correos de reserva:', emailError);
      }
    } else {
      console.log('📧 Omitiendo envío de correos (reserva admin sin email real)');
    }

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      reservation: {
        id: reservation._id,
        customer: reservation.customer,
        date: reservation.date,
        time: reservation.time,
        partySize: reservation.partySize,
        status: reservation.status
      }
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    
    if (error.code === 'BLACKLISTED') {
      return res.status(403).json({ 
        message: 'No se puede realizar la reserva. Cliente en lista negra.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error al crear la reserva', 
      error: error.message 
    });
  }
};

// Obtener todas las reservas
exports.getAllReservations = async (req, res) => {
  try {
    const { date, status } = req.query;
    const query = {};

    // Filtros opcionales
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: searchDate, $lt: nextDay };
    }

    if (status) {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate('table')
      .sort({ date: 1, timeInMinutes: 1 });

    res.json({
      success: true,
      reservations
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ 
      message: 'Error en el servidor', 
      error: error.message 
    });
  }
};

// Obtener una reserva por ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('table');
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    res.json({
      success: true,
      reservation
    });
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ 
      message: 'Error en el servidor', 
      error: error.message 
    });
  }
};

// Actualizar una reserva existente
exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Buscar la reserva existente
    const existingReservation = await Reservation.findById(id);
    if (!existingReservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Validaciones básicas
    if (updateData.name && !updateData.name.trim()) {
      return res.status(400).json({ message: 'El nombre no puede estar vacío' });
    }

    if (updateData.email && updateData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({ message: 'Formato de email inválido' });
      }
    }

    // Si se cambia la fecha, hora o número de personas, verificar disponibilidad
    const isTimeChange = updateData.date !== existingReservation.date.toISOString().split('T')[0] || 
                        updateData.time !== existingReservation.time ||
                        updateData.partySize !== existingReservation.partySize;

    let newTableId = updateData.tableId;

    if (isTimeChange && !updateData.tableId) {
      // Reasignar mesa automáticamente
      try {
        const assignmentResult = await getAutomaticTableAssignment(
          updateData.partySize || existingReservation.partySize, 
          updateData.date || existingReservation.date.toISOString().split('T')[0], 
          updateData.time || existingReservation.time
        );
        
        if (assignmentResult.success) {
          newTableId = assignmentResult.tables[0]._id;
        } else {
          return res.status(409).json({ 
            message: assignmentResult.message + '. Por favor, selecciona una mesa manualmente o cambia el horario.'
          });
        }
      } catch (error) {
        console.error('Error en reasignación automática:', error);
        return res.status(500).json({ 
          message: 'Error al verificar disponibilidad. Por favor, selecciona una mesa manualmente.'
        });
      }
    }

    // Preparar datos de actualización
    const updateFields = {};
    
    if (updateData.name) updateFields['customer.name'] = updateData.name.trim();
    if (updateData.email) updateFields['customer.email'] = updateData.email.toLowerCase().trim();
    if (updateData.phone) updateFields['customer.phone'] = updateData.phone.trim();
    if (updateData.date) updateFields.date = new Date(updateData.date);
    if (updateData.time) {
      updateFields.time = updateData.time;
      const [hours, minutes] = updateData.time.split(':').map(Number);
      updateFields.timeInMinutes = hours * 60 + minutes;
      updateFields.endTimeInMinutes = updateFields.timeInMinutes + 90;
      const endHours = Math.floor(updateFields.endTimeInMinutes / 60) % 24;
      const endMins = updateFields.endTimeInMinutes % 60;
      updateFields.endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    }
    if (updateData.partySize) updateFields.partySize = parseInt(updateData.partySize);
    if (newTableId) updateFields.table = newTableId;
    if (updateData.specialRequests !== undefined) updateFields.specialRequests = updateData.specialRequests.trim();
    if (updateData.needsBabyCart !== undefined) updateFields.needsBabyCart = updateData.needsBabyCart;
    if (updateData.needsWheelchair !== undefined) updateFields.needsWheelchair = updateData.needsWheelchair;
    if (updateData.status) updateFields.status = updateData.status;

    // Actualizar la reserva
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('table');

    // Si cambió la mesa, actualizar el estado de las mesas
    if (newTableId && newTableId !== existingReservation.table?.toString()) {
      // Liberar mesa anterior
      if (existingReservation.table) {
        await Table.findByIdAndUpdate(existingReservation.table, {
          status: 'available',
          currentReservation: null
        });
      }
      
      // Reservar nueva mesa
      await Table.findByIdAndUpdate(newTableId, {
        status: 'reserved',
        currentReservation: updatedReservation._id
      });
    }

    res.json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('Error actualizando reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar una reserva
exports.deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la reserva
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Liberar la mesa asociada
    if (reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, {
        status: 'available',
        currentReservation: null
      });
    }

    // Eliminar la reserva
    await Reservation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Reserva eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener reservas por fecha
exports.getReservationsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const reservations = await Reservation.findByDate(date);
    
    res.json({
      success: true,
      date,
      reservations
    });
  } catch (error) {
    console.error('Error al obtener reservas por fecha:', error);
    res.status(500).json({ 
      message: 'Error al obtener reservas', 
      error: error.message 
    });
  }
};

// Verificar disponibilidad
exports.checkAvailability = async (req, res) => {
  try {
    const { date, time, partySize } = req.query;
    
    if (!date || !time || !partySize) {
      return res.status(400).json({ 
        message: 'Faltan parámetros: fecha, hora y número de personas' 
      });
    }

    const availability = await Reservation.checkAvailability(date, time, parseInt(partySize));
    
    res.json({
      success: true,
      availability
    });
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ 
      message: 'Error al verificar disponibilidad', 
      error: error.message 
    });
  }
};

// Marcar reserva como no-show
exports.markNoShow = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    await reservation.markNoShow(req.user ? req.user.id : null);

    // Liberar la mesa
    if (reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, { 
        status: 'free',
        currentReservation: null
      });
    }

    res.json({
      success: true,
      message: 'Reserva marcada como no-show',
      reservation
    });
  } catch (error) {
    console.error('Error al marcar no-show:', error);
    res.status(500).json({ 
      message: 'Error al marcar no-show', 
      error: error.message 
    });
  }
};

// Función para enviar emails de reserva
const sendReservationEmails = async (reservation, type = 'new') => {
  try {
    console.log(`📧 Enviando correos de reserva (${type})...`);
    
    // Usar el emailService en lugar de transporter directo
    const reservationData = {
      name: reservation.customer.name,
      email: reservation.customer.email,
      phone: reservation.customer.phone,
      date: reservation.date,
      time: reservation.time,
      partySize: reservation.partySize,
      specialRequests: reservation.specialRequests,
      id: reservation._id,
      tableName: reservation.tableName || 'Asignación automática',
      status: reservation.status,
      cancelReason: reservation.cancelReason
    };

    // Enviar correos usando el emailService
    const result = await emailService.sendReservationEmails(reservationData);
    
    if (result.success) {
      console.log('✅ Correos de reserva enviados exitosamente');
    } else {
      console.log('❌ Error enviando correos:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error en sendReservationEmails:', error);
    return { success: false, message: error.message };
  }
}; 