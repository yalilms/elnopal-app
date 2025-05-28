const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TableSchema = new Schema({
  number: {
    type: Number,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 2,
    max: 10
  },
  minGuests: {
    type: Number,
    required: true,
    min: 1
  },
  maxGuests: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    enum: ['window', 'bar', 'center', 'outdoor', 'private', 'corner'],
    default: 'center'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAccessible: {
    type: Boolean,
    default: false
  },
  // Coordenadas para el componente visual
  positionX: {
    type: Number,
    default: 0
  },
  positionY: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar la fecha de modificación
TableSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para activar la mesa
TableSchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

// Método para desactivar la mesa
TableSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Método para actualizar la posición
TableSchema.methods.updatePosition = function(x, y) {
  this.positionX = x;
  this.positionY = y;
  return this.save();
};

// Método estático para obtener mesas disponibles para una fecha y hora específicas
TableSchema.statics.getAvailableTables = async function(date, time, partySize) {
  const Reservation = mongoose.model('Reservation');
  
  // Convertir tiempo a minutos desde la medianoche para comparar
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  
  // Duración promedio de la reserva en minutos (2 horas)
  const reservationDuration = 120;
  
  // Encontrar reservas que se superpongan con el horario solicitado
  const reservations = await Reservation.find({
    date: date,
    timeInMinutes: {
      $lt: timeInMinutes + reservationDuration,
      $gt: timeInMinutes - reservationDuration
    },
    status: { $nin: ['cancelled', 'no-show'] }
  }).select('table');
  
  // Obtener IDs de mesas ocupadas
  const occupiedTableIds = reservations.map(res => res.table);
  
  // Buscar mesas adecuadas para el tamaño del grupo y que estén disponibles
  return this.find({
    isActive: true,
    minGuests: { $lte: partySize },
    maxGuests: { $gte: partySize },
    _id: { $nin: occupiedTableIds }
  }).sort({ capacity: 1 });
};

// Método estático para inicializar las mesas predeterminadas si no existen
TableSchema.statics.initializeDefaultTables = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultTables = [];
    
    // Mesa 1 - NO RESERVABLE (barra o uso especial)
    defaultTables.push({ 
      number: 1, 
      capacity: 2, 
      minGuests: 1, 
      maxGuests: 2, 
      location: 'bar', 
      isActive: false, // No reservable
      notes: 'Mesa no disponible para reservas' 
    });

    // Mesas 2-10: Para 1-3 personas (primera prioridad para grupos pequeños)
    for (let i = 2; i <= 10; i++) {
      defaultTables.push({
        number: i,
        capacity: i <= 6 ? 2 : 4, // 2-6 son mesas de 2, 7-10 son de 4
        minGuests: 1,
        maxGuests: 3,
        location: i <= 4 ? 'window' : 'center'
      });
    }

    // Mesas 11-18: Para 4-5 personas
    for (let i = 11; i <= 18; i++) {
      defaultTables.push({
        number: i,
        capacity: 4,
        minGuests: 3,
        maxGuests: 5,
        location: i <= 14 ? 'center' : 'corner'
      });
    }

    // Mesa 19 - NO RESERVABLE
    defaultTables.push({ 
      number: 19, 
      capacity: 6, 
      minGuests: 1, 
      maxGuests: 6, 
      location: 'private', 
      isActive: false, // No reservable
      notes: 'Mesa no disponible para reservas' 
    });

    // Mesas 20-29: Para grupos más grandes (4-8 personas)
    // Mesas 20-21: Grupo para 6-7 personas
    defaultTables.push({
      number: 20,
      capacity: 6,
      minGuests: 4,
      maxGuests: 8,
      location: 'center'
    });
    defaultTables.push({
      number: 21,
      capacity: 6,
      minGuests: 4,
      maxGuests: 8,
      location: 'center'
    });

    // Mesas 22-23: Grupo para 6-8 personas
    defaultTables.push({
      number: 22,
      capacity: 6,
      minGuests: 4,
      maxGuests: 8,
      location: 'corner'
    });
    defaultTables.push({
      number: 23,
      capacity: 6,
      minGuests: 4,
      maxGuests: 8,
      location: 'corner'
    });

    // Mesas 24-25: Grupo para 6-8 personas
    defaultTables.push({
      number: 24,
      capacity: 6,
      minGuests: 4,
      maxGuests: 8,
      location: 'outdoor'
    });
    defaultTables.push({
      number: 25,
      capacity: 6,
      minGuests: 4,
      maxGuests: 8,
      location: 'outdoor'
    });

    // Mesas 26-29: Para 4-5 personas (orden inverso según especificación)
    for (let i = 26; i <= 29; i++) {
      defaultTables.push({
        number: i,
        capacity: 4,
        minGuests: 3,
        maxGuests: 5,
        location: 'window'
      });
    }
    
    await this.insertMany(defaultTables);
    console.log('✅ 29 mesas inicializadas correctamente');
    return true;
  }
  return false;
};

module.exports = mongoose.model('Table', TableSchema); 