const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const nodemailer = require('nodemailer');

// Configuración de transporte de correo
let transporter;
if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

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
    const { customer, date, time, partySize, tableId, specialRequests } = req.body;

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

    // Convertir hora a minutos desde medianoche
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;

    // Crear la reserva
    const reservation = new Reservation({
      customer,
      date,
      time,
      timeInMinutes,
      partySize,
      tableId,
      specialRequests,
      createdBy: req.user ? req.user.id : null,
      status: 'pending'
    });

    await reservation.save();

    // Actualizar estado de la mesa si se asignó una
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, { 
        status: 'reserved',
        currentReservation: reservation._id
      });
    }

    // Enviar correo de confirmación si está configurado el transporte
    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customer.email,
        subject: 'Confirmación de Reserva - El Nopal',
        html: `
          <h2>¡Gracias por tu reserva en El Nopal!</h2>
          <p>Detalles de tu reserva:</p>
          <ul>
            <li>Fecha: ${new Date(date).toLocaleDateString('es-ES')}</li>
            <li>Hora: ${time}</li>
            <li>Personas: ${partySize}</li>
          </ul>
          <p>Si tienes alguna pregunta, por favor contáctanos.</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error('Error al enviar correo de confirmación:', error);
      }
    }

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ message: 'Error al crear la reserva', error: error.message });
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
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: searchDate, $lt: nextDay };
    }

    if (status) {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate('tableId')
      .sort({ date: 1, time: 1 });

    res.json(reservations);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Obtener una reserva por ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('tableId');
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    res.json(reservation);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
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
    if (tableId && tableId !== currentReservation.tableId?.toString()) {
      // Liberar mesa anterior si existía
      if (currentReservation.tableId) {
        await Table.findByIdAndUpdate(currentReservation.tableId, { 
          status: 'free',
          currentReservation: null
        });
      }
      
      // Reservar nueva mesa
      const newTable = await Table.findById(tableId);
      if (!newTable) {
        return res.status(404).json({ message: 'Mesa no encontrada' });
      }
      
      // Verificar capacidad
      if (newTable.capacity < (partySize || currentReservation.partySize)) {
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
        customer: customer || currentReservation.customer,
        date: date || currentReservation.date,
        time: time || currentReservation.time,
        partySize: partySize || currentReservation.partySize,
        tableId: tableId || currentReservation.tableId,
        status: status || currentReservation.status,
        specialRequests: specialRequests !== undefined ? specialRequests : currentReservation.specialRequests,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('tableId');

    // Notificar al cliente si hay cambio de estado
    if (status && status !== currentReservation.status && 
        transporter && updatedReservation.customer.email) {
      let subject, message;
      
      switch(status) {
        case 'confirmed':
          subject = 'Reserva Confirmada - El Nopal';
          message = `
            <h1>¡Tu reserva ha sido confirmada!</h1>
            <p>Hola ${updatedReservation.customer.name},</p>
            <p>Tenemos el placer de confirmar tu reserva para el ${new Date(updatedReservation.date).toLocaleDateString()} a las ${updatedReservation.time}.</p>
            <p>¡Esperamos verte pronto!</p>
            <p>El equipo de El Nopal</p>
          `;
          break;
        case 'canceled':
          subject = 'Reserva Cancelada - El Nopal';
          message = `
            <h1>Tu reserva ha sido cancelada</h1>
            <p>Hola ${updatedReservation.customer.name},</p>
            <p>Te informamos que tu reserva para el ${new Date(updatedReservation.date).toLocaleDateString()} a las ${updatedReservation.time} ha sido cancelada.</p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>El equipo de El Nopal</p>
          `;
          break;
      }
      
      if (subject && message) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'El Nopal <reservas@elnopal.es>',
          to: updatedReservation.customer.email,
          subject,
          html: message
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.error('Error al enviar correo de actualización:', error);
          }
        });
      }
    }

    res.json(updatedReservation);
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Eliminar una reserva
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Liberar mesa si estaba asignada
    if (reservation.tableId) {
      await Table.findByIdAndUpdate(reservation.tableId, { 
        status: 'free',
        currentReservation: null
      });
    }

    await Reservation.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}; 