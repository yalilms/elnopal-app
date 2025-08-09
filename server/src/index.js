require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rutas
const reservationRoutes = require('./routes/reservations');
const tableRoutes = require('./routes/tables');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const blacklistRoutes = require('./routes/blacklist');
const reviewRoutes = require('./routes/reviewRoutes');
const contactRoutes = require('./routes/contact');

const app = express();
const server = http.createServer(app);

// CONFIGURACIÓN DE TRUST PROXY - CRÍTICO para rate limiting
app.set('trust proxy', 1); // Confiar en el primer proxy (nginx)

// Configuración de CORS segura
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://elnopal.es',
      'https://elnopal.es', // IONOS puede activar HTTPS automáticamente
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Permitir requests sin origin (aplicaciones móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
};

// Socket.io con CORS seguro
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.CORS_ORIGIN || 'http://elnopal.es',
      'https://elnopal.es' // IONOS puede activar HTTPS automáticamente
    ],
    methods: ['GET', 'POST']
  }
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting para prevenir ataques de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  message: {
    error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting para localhost en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      return req.ip === '127.0.0.1' || req.ip === '::1';
    }
    return false;
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // aumentado para evitar problemas en desarrollo
  message: {
    error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting para localhost en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      return req.ip === '127.0.0.1' || req.ip === '::1';
    }
    return false;
  }
});

// Aplicar rate limiting solo en producción o de forma más permisiva
if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth/login', authLimiter);
  app.use('/api/', generalLimiter);
}

// Middleware básico
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Configuración de MongoDB
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Configuración de Mongoose para evitar warnings
mongoose.set('strictQuery', false);

// Conexión a la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elnopal', mongoOptions)
.then(() => {
  console.log('Conectado a MongoDB');
  
  // Solo iniciar el servidor después de conectar a MongoDB
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
})
.catch(err => {
  console.error('Error conectando a MongoDB:', err);
  process.exit(1);
});

// Manejar errores de MongoDB después de la conexión inicial
mongoose.connection.on('error', err => {
  console.error('Error en la conexión de MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Desconectado de MongoDB');
});

// Inicialización de Socket.io
io.on('connection', (socket) => {
  console.log('Cliente conectado');
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
  
  // Manejar eventos de reservas
  socket.on('newReservation', (data) => {
    io.emit('reservationUpdate', data);
  });
  
  socket.on('cancelReservation', (data) => {
    io.emit('reservationUpdate', data);
  });
});

// Rutas de la API
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/blacklist', blacklistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de El Nopal funcionando correctamente');
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  // No loguear errores en producción para evitar exposición de información
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error en el servidor:', err);
  }
  
  res.status(500).json({
    message: 'Error interno del servidor'
  });
});

// Manejar señales de terminación
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB desconectado a través de la terminación de la app');
    process.exit(0);
  });
});

module.exports = app; 