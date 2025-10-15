require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');

// Rutas
const reservationRoutes = require('./routes/reservations');
const tableRoutes = require('./routes/tables');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const blacklistRoutes = require('./routes/blacklist');
const reviewRoutes = require('./routes/reviewRoutes');
const contactRoutes = require('./routes/contact');
const postRoutes = require('./routes/posts');

const app = express();
const server = http.createServer(app);

// CONFIGURACIÓN DE TRUST PROXY - CRÍTICO para rate limiting
app.set('trust proxy', 1); // Confiar en el primer proxy (nginx)

// Optimización de JSON para mejor performance
app.use(express.json({ 
  limit: '10mb',
  strict: true,
  type: 'application/json'
}));

// Configuración de CORS segura
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'https://localhost:3000',
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
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'https://localhost:3000'
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
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Configuración optimizada de MongoDB local
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10, // Máximo de conexiones simultáneas
  minPoolSize: 1, // Mínimo de conexiones en el pool
  maxIdleTimeMS: 30000, // Cerrar conexiones inactivas después de 30s
  connectTimeoutMS: 10000, // Timeout de conexión
  family: 4, // Usar IPv4
};

// Configuración de Mongoose para evitar warnings
mongoose.set('strictQuery', false);

// Variable para tracking del estado de MongoDB
let mongoConnected = false;

// Conexión a la base de datos (no bloquear el servidor si falla)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elnopal', mongoOptions);
    console.log(`Conectado a MongoDB: ${conn.connection.host}`);
    mongoConnected = true;
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    console.log('Servidor continuará sin MongoDB (modo de desarrollo)');
    mongoConnected = false;
    
    // Reintentar conexión cada 30 segundos
    setTimeout(connectDB, 30000);
  }
};

connectDB();

// Manejar errores de MongoDB después de la conexión inicial
mongoose.connection.on('error', err => {
  console.error('Error en la conexión de MongoDB:', err);
  mongoConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.warn('Desconectado de MongoDB');
  mongoConnected = false;
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

// Middleware para verificar estado de MongoDB
const checkMongo = (req, res, next) => {
  if (!mongoConnected) {
    return res.status(503).json({ 
      message: 'Base de datos no disponible temporalmente',
      success: false
    });
  }
  next();
};

// Rutas temporales para desarrollo (sin MongoDB)
app.post('/api/contact', (req, res) => {
  console.log('Contacto recibido:', req.body);
  
  // Validaciones básicas
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ 
      message: 'Faltan campos obligatorios: nombre, email y mensaje',
      success: false
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: 'Formato de email inválido',
      success: false
    });
  }

  // Simular éxito temporal
  res.status(201).json({
    success: true,
    message: 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.',
    contact: {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: req.body.subject || '',
      status: 'pending',
      createdAt: new Date()
    }
  });
});

app.post('/api/reservations', (req, res) => {
  console.log('Reserva recibida:', req.body);
  
  // Validaciones básicas
  const { name, email, phone, date, time, partySize } = req.body;
  if (!name || !email || !phone || !date || !time || !partySize) {
    return res.status(400).json({ 
      message: 'Faltan campos obligatorios: nombre, email, teléfono, fecha, hora y número de comensales',
      success: false
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: 'Formato de email inválido',
      success: false
    });
  }

  // Validar número de comensales
  const partySizeNum = parseInt(partySize);
  if (isNaN(partySizeNum) || partySizeNum < 1 || partySizeNum > 20) {
    return res.status(400).json({ 
      message: 'El número de comensales debe estar entre 1 y 20',
      success: false
    });
  }

  // Validar fecha (no debe ser en el pasado)
  const reservationDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (reservationDate < today) {
    return res.status(400).json({ 
      message: 'No se pueden hacer reservas para fechas pasadas',
      success: false
    });
  }

  // Simular éxito temporal - todas las reservas son aceptadas en desarrollo
  res.status(201).json({
    success: true,
    message: 'Reserva creada exitosamente',
    reservation: {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      date: date,
      time: time,
      partySize: partySizeNum,
      status: 'confirmed',
      createdAt: new Date()
    }
  });
});

// Rutas de la API (solo usar si MongoDB está conectado)
app.use('/api/reservations', checkMongo, reservationRoutes);
app.use('/api/tables', checkMongo, tableRoutes);
app.use('/api/users', checkMongo, userRoutes);
app.use('/api/auth', checkMongo, authRoutes);
app.use('/api/blacklist', checkMongo, blacklistRoutes);
app.use('/api/reviews', checkMongo, reviewRoutes);
app.use('/api/contact', checkMongo, contactRoutes);
app.use('/api/blog', checkMongo, postRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    mongodb: mongoConnected ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Ruta de prueba - comentada para permitir que el frontend maneje la ruta raíz
// app.get('/', (req, res) => {
//   res.send('API de El Nopal funcionando correctamente');
// });

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../client/build')));

// Middleware para manejar rutas del frontend (SPA) - debe ir después de las rutas de la API
app.get('*', (req, res, next) => {
  // Si la ruta comienza con /api, continuar con las rutas de la API
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Para todas las demás rutas, servir el index.html del frontend
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
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

// Iniciar el servidor inmediatamente (no esperar MongoDB)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Manejar señales de terminación
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB desconectado a través de la terminación de la app');
    process.exit(0);
  });
});

module.exports = app; 