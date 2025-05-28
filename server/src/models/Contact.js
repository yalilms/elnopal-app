const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
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
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'resolved'],
    default: 'pending'
  },
  // Campos para seguimiento de correos
  confirmationEmailSent: {
    type: Boolean,
    default: false
  },
  confirmationEmailSentAt: {
    type: Date
  },
  notificationEmailSent: {
    type: Boolean,
    default: false
  },
  notificationEmailSentAt: {
    type: Date
  },
  // Campos de respuesta
  responseMessage: {
    type: String,
    trim: true
  },
  respondedAt: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
contactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para marcar como respondido
contactSchema.methods.markAsResponded = function(responseMessage, userId) {
  this.status = 'responded';
  this.responseMessage = responseMessage;
  this.respondedAt = new Date();
  this.respondedBy = userId;
  return this.save();
};

// Método para marcar como resuelto
contactSchema.methods.markAsResolved = function(userId) {
  this.status = 'resolved';
  this.respondedBy = userId;
  return this.save();
};

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact; 