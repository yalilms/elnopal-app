const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlacklistSchema = new Schema({
  customerId: { 
    type: String,
    required: true 
  },
  customerName: { 
    type: String, 
    required: true 
  },
  customerEmail: { 
    type: String,
    required: true 
  },
  customerPhone: { 
    type: String,
    required: true 
  },
  reason: { 
    type: String,
    required: true 
  },
  addedBy: { 
    type: String,
    required: true 
  },
  addedAt: { 
    type: Date,
    default: Date.now 
  },
  expiresAt: { 
    type: Date,
    // Por defecto, la restricción dura 6 meses
    default: () => new Date(+new Date() + 180 * 24 * 60 * 60 * 1000)
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reservationId: {
    type: String,
    required: true
  }
});

// Índices para búsquedas eficientes
BlacklistSchema.index({ customerEmail: 1 });
BlacklistSchema.index({ customerPhone: 1 });
BlacklistSchema.index({ isActive: 1 });

module.exports = mongoose.model('Blacklist', BlacklistSchema); 