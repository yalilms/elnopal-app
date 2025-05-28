const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const emailService = require('../services/emailService');

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

      console.log(`Reserva ${reservation._id} completada automáticamente y mesa liberada`);
    }
  } catch (error) {
    console.error('Error en autoCompleteReservations:', error);
  }
};

// Iniciar el proceso de liberación automática
setInterval(autoCompleteReservations, 60000); // Ejecutar cada minuto

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

    // Validaciones básicas
    if (!name || !email || !phone || !date || !time || !partySize) {
      return res.status(400).json({ 
        message: 'Faltan campos obligatorios: nombre, email, teléfono, fecha, hora y número de personas' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Formato de email inválido' });
    }

    // Validar que la mesa exista si se proporciona tableId
    if (tableId) {
      const table = await Table.findById(tableId);
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
        email: email.toLowerCase().trim(),
        phone: phone.trim()
      },
      date: new Date(date),
      time,
      timeInMinutes, // Campo requerido
      duration,
      endTime, // Campo requerido  
      endTimeInMinutes, // Campo requerido
      partySize: parseInt(partySize),
      table: tableId || null,
      specialRequests: specialRequests?.trim() || '',
      needsBabyCart: needsBabyCart || false,
      needsWheelchair: needsWheelchair || false,
      status: 'confirmed', // Confirmamos automáticamente
      createdBy: req.user ? req.user.id : null
    });

    await reservation.save();

    // Actualizar estado de la mesa si se asignó una
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, { 
        status: 'reserved',
        currentReservation: reservation._id
      });
    }

    // Enviar correos de confirmación
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

      console.log('📧 Datos de correo preparados:', {
        email: reservationData.email,
        name: reservationData.name,
        date: reservationData.date,
        time: reservationData.time
      });

      console.log('📧 Llamando a emailService.sendReservationEmails...');
      const emailResult = await emailService.sendReservationEmails(reservationData);
      
      console.log('📧 Resultado del envío de correos:', emailResult);
      
      if (emailResult.success) {
        console.log('✅ Correos enviados exitosamente, marcando en BD...');
        // Marcar correos como enviados
        reservation.confirmationEmailSent = true;
        reservation.confirmationEmailSentAt = new Date();
        reservation.notificationEmailSent = true;
        reservation.notificationEmailSentAt = new Date();
        await reservation.save();
        console.log('✅ Estado de correos actualizado en BD');
      } else {
        console.error('❌ Error en el envío de correos:', emailResult.message, emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Excepción enviando correos de reserva:', emailError);
      console.error('Stack trace:', emailError.stack);
      // No fallar la reserva por error de correo
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

// Actualizar una reserva
exports.updateReservation = async (req, res) => {
  try {
    const { customer, date, time, partySize, tableId, status, specialRequests } = req.body;
    
    // Buscar la reserva actual
    const currentReservation = await Reservation.findById(req.params.id);
    if (!currentReservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Si se cambia la mesa, actualizar estados
    if (tableId && tableId !== currentReservation.table?.toString()) {
      // Liberar mesa anterior si existía
      if (currentReservation.table) {
        await Table.findByIdAndUpdate(currentReservation.table, { 
          status: 'free',
          currentReservation: null
        });
      }
      
      // Reservar nueva mesa
      const newTable = await Table.findById(tableId);
      if (!newTable) {
        return res.status(404).json({ message: 'Mesa no encontrada' });
      }
      
      if (newTable.capacity < partySize) {
        return res.status(400).json({ message: 'La mesa seleccionada no tiene capacidad suficiente' });
      }
      
      await Table.findByIdAndUpdate(tableId, { 
        status: 'reserved',
        currentReservation: currentReservation._id
      });
    }

    // Actualizar la reserva
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      {
        customer,
        date,
        time,
        partySize,
        table: tableId,
        status,
        specialRequests,
        updatedBy: req.user ? req.user.id : null
      },
      { new: true }
    ).populate('table');

    res.json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ 
      message: 'Error al actualizar la reserva', 
      error: error.message 
    });
  }
};

// Cancelar una reserva
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Liberar la mesa si está asignada
    if (reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, { 
        status: 'free',
        currentReservation: null
      });
    }

    // Actualizar el estado de la reserva
    reservation.status = 'cancelled';
    reservation.cancelledAt = new Date();
    reservation.updatedBy = req.user ? req.user.id : null;
    await reservation.save();

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      reservation
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ 
      message: 'Error al cancelar la reserva', 
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