const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  fecha: {
    type: String,
    default: () => new Date().toLocaleDateString()
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'rejected'],
    default: 'pending',
    // Nota: Mantenemos 'reviewed' como valor para compatibilidad, 
    // pero ahora representa "atendida" en la interfaz
  },
  // Nuevos campos para seguimiento de correos
  thankYouEmailSent: {
    type: Boolean,
    default: false
  },
  thankYouEmailSentAt: {
    type: Date
  },
  notificationEmailSent: {
    type: Boolean,
    default: false
  },
  notificationEmailSentAt: {
    type: Date
  },
  // Campos para respuesta del administrador
  adminResponse: {
    type: String,
    trim: true
  },
  adminResponseDate: {
    type: Date
  },
  adminResponseBy: {
    type: String
  },
  imagen: {
    type: String,
    default: function() {
      // Generar avatar basado en las iniciales del nombre
      const initials = this.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
        
      // Colores predefinidos para el fondo del avatar
      const colors = [
        '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
        '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
        '#f1c40f', '#e67e22', '#e74c3c', '#d35400', '#c0392b'
      ];
      
      // Seleccionar un color basado en el nombre
      const colorIndex = this.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
      
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors[colorIndex].substring(1)}&color=fff`;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Método para ocultar campos sensibles como el email
reviewSchema.methods.toJSON = function() {
  const review = this.toObject();
  delete review.email; // No exponemos el email en la API pública
  return review;
};

// Método para revisión detallada para administradores (incluye email)
reviewSchema.methods.toAdminJSON = function() {
  return this.toObject();
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 