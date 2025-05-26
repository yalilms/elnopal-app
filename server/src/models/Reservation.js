const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  timeInMinutes: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 90, // Duración por defecto de 1.5 horas en minutos
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  endTimeInMinutes: {
    type: Number,
    required: true
  },
  partySize: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  table: {
    type: Schema.Types.ObjectId,
    ref: 'Table'
  },
  specialRequests: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'seated', 'completed', 'no-show', 'cancelled'],
    default: 'pending'
  },
  occasion: {
    type: String,
    enum: ['none', 'birthday', 'anniversary', 'business', 'date', 'other'],
    default: 'none'
  },
  source: {
    type: String,
    enum: ['online', 'phone', 'walk-in', 'third-party'],
    default: 'online'
  },
  notes: {
    type: String,
    trim: true
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInTime: {
    type: Date
  },
  confirmedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    trim: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  checkBlacklist: {
    type: Boolean,
    default: true,
    description: 'Indica si se debe verificar la lista negra para esta reserva'
  },
  autoCompleted: {
    type: Boolean,
    default: false
  }
});

// Middleware para actualizar la fecha de modificación
ReservationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Convertir tiempo a minutos desde medianoche para facilitar comparaciones
  if (this.time) {
    const [hours, minutes] = this.time.split(':').map(Number);
    this.timeInMinutes = hours * 60 + minutes;
  }
  
  if (this.time && this.timeInMinutes) {
    // Calcular la hora de finalización
    const totalMinutes = this.timeInMinutes + this.duration;
    
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    this.endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    this.endTimeInMinutes = totalMinutes % (24 * 60); // Asegurarse de que no exceda las 24 horas
  }
  
  next();
});

// Middleware para verificar si el cliente está en la lista negra
ReservationSchema.pre('save', async function(next) {
  if (this.isNew && this.checkBlacklist) {
    try {
      const Blacklist = mongoose.model('Blacklist');
      const blacklistEntry = await Blacklist.findOne({ 
        $or: [
          { email: this.customer.email },
          { phone: this.customer.phone }
        ],
        active: true
      });
      
      if (blacklistEntry) {
        const error = new Error('Cliente en lista negra. No se puede realizar la reserva.');
        error.code = 'BLACKLISTED';
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Método para actualizar el estado de la reserva
ReservationSchema.methods.updateStatus = function(status, userId) {
  this.status = status;
  this.updatedBy = userId;
  
  if (status === 'seated') {
    this.checkedIn = true;
    this.checkedInTime = new Date();
  }
  
  return this.save();
};

// Método para cancelar una reserva
ReservationSchema.methods.cancel = function(userId) {
  this.status = 'cancelled';
  this.updatedBy = userId;
  return this.save();
};

// Método para marcar como no-show
ReservationSchema.methods.markNoShow = function(userId) {
  this.status = 'no-show';
  this.updatedBy = userId;
  
  // Comprobar si el cliente debe ser añadido a la lista negra
  // (la lógica para la lista negra se implementará en otro modelo)
  return this.save();
};

// Método para asignar mesa
ReservationSchema.methods.assignTable = function(tableId, userId) {
  this.table = tableId;
  this.assignedBy = userId;
  this.updatedBy = userId;
  return this.save();
};

// Método estático para buscar reservas por fecha
ReservationSchema.statics.findByDate = function(date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .populate('table')
  .sort({ timeInMinutes: 1 });
};

// Método estático para buscar reservas futuras de un cliente
ReservationSchema.statics.findFutureReservationsByCustomer = function(email, phone) {
  const now = new Date();
  
  return this.find({
    'customer.email': email.toLowerCase(),
    'customer.phone': phone,
    date: { $gte: now },
    status: { $nin: ['cancelled', 'no-show', 'completed'] }
  })
  .populate('table')
  .sort({ date: 1, timeInMinutes: 1 });
};

// Método para verificar si hay mesas disponibles para una fecha y hora
ReservationSchema.statics.checkAvailability = async function(date, time, partySize) {
  const Table = mongoose.model('Table');
  const availableTables = await Table.getAvailableTables(date, time, partySize);
  
  return {
    available: availableTables.length > 0,
    tables: availableTables,
    count: availableTables.length
  };
};

module.exports = mongoose.model('Reservation', ReservationSchema); 