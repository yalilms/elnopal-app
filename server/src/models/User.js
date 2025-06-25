const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'host', 'waiter'],
    default: 'host'
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Índices para mejorar rendimiento
UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1 });

// Virtual para verificar si la cuenta está bloqueada
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Middleware para hashear contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  // Solo hashear si la contraseña ha sido modificada
  if (!this.isModified('password')) return next();
  
  try {
    // Validar fortaleza de contraseña
    if (this.password.length < 8) {
      return next(new Error('La contraseña debe tener al menos 8 caracteres'));
    }
    
    const salt = await bcrypt.genSalt(12); // Aumentar cost factor para mayor seguridad
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isLocked) {
    throw new Error('Cuenta temporalmente bloqueada');
  }
  
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  
  // Si la contraseña es incorrecta, incrementar intentos fallidos
  if (!isMatch) {
    this.loginAttempts += 1;
    
    // Bloquear cuenta después de 5 intentos fallidos
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutos
    }
    
    await this.save();
    return false;
  }
  
  // Si la contraseña es correcta, resetear intentos
  if (this.loginAttempts > 0) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
  }
  
  return true;
};

// Método para desbloquear cuenta manualmente
UserSchema.methods.unlock = function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

module.exports = mongoose.model('User', UserSchema); 