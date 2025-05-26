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
    const defaultTables = [
      // Mesas de 2 personas
      { number: 1, capacity: 2, minGuests: 1, maxGuests: 3, location: 'window' },
      { number: 2, capacity: 2, minGuests: 1, maxGuests: 3, location: 'window' },
      { number: 3, capacity: 2, minGuests: 1, maxGuests: 3, location: 'center' },
      { number: 4, capacity: 2, minGuests: 1, maxGuests: 3, location: 'center' },
      
      // Mesas de 4 personas
      { number: 5, capacity: 4, minGuests: 3, maxGuests: 5, location: 'window' },
      { number: 6, capacity: 4, minGuests: 3, maxGuests: 5, location: 'window' },
      { number: 7, capacity: 4, minGuests: 3, maxGuests: 5, location: 'center' },
      { number: 8, capacity: 4, minGuests: 3, maxGuests: 5, location: 'center' },
      
      // Mesas de 6 personas
      { number: 9, capacity: 6, minGuests: 5, maxGuests: 7, location: 'corner' },
      { number: 10, capacity: 6, minGuests: 5, maxGuests: 7, location: 'corner' },
      
      // Mesas de 8 personas
      { number: 11, capacity: 8, minGuests: 6, maxGuests: 10, location: 'private' },
      { number: 12, capacity: 8, minGuests: 6, maxGuests: 10, location: 'outdoor' }
    ];
    
    await this.insertMany(defaultTables);
    return true;
  }
  return false;
};

module.exports = mongoose.model('Table', TableSchema); 