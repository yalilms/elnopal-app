const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  location: {
    type: String,
    enum: ['interior', 'terraza'],
    default: 'interior'
  },
  status: {
    type: String,
    enum: ['free', 'reserved', 'occupied', 'cleaning'],
    default: 'free'
  },
  currentReservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Método estático para obtener mesas disponibles
tableSchema.statics.getAvailableTables = async function(date, time, partySize) {
  return this.find({
    isActive: true,
    status: 'free',
    capacity: { $gte: partySize }
  }).sort({ capacity: 1 });
};

// Método estático para inicializar mesas por defecto
tableSchema.statics.initializeDefaultTables = async function() {
  const count = await this.countDocuments();
  
  if (count > 0) {
    return false; // Ya hay mesas, no inicializar
  }
  
  // Mesas por defecto
  const defaultTables = [
    { number: 1, capacity: 2, location: 'interior' },
    { number: 2, capacity: 4, location: 'interior' },
    { number: 3, capacity: 6, location: 'interior' },
    { number: 4, capacity: 8, location: 'interior' },
    { number: 5, capacity: 2, location: 'terraza' },
    { number: 6, capacity: 4, location: 'terraza' },
    { number: 7, capacity: 6, location: 'terraza' }
  ];
  
  await this.insertMany(defaultTables);
  return true;
};

module.exports = mongoose.model('Table', tableSchema);