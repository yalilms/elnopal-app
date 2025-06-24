require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const xss = require('xss');

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

// Validar variables de entorno críticas
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Error: Variables de entorno faltantes: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Configuración de CORS segura y completa
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://elnopal.es',
      'https://elnopal.es', // IONOS puede activar HTTPS automáticamente
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Permitir requests sin origin cuando vienen del mismo servidor
    // Esto es normal cuando frontend y backend están en el mismo dominio
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'Content-Range'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight por 24 horas
};

// Socket.io con CORS seguro
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.CORS_ORIGIN || 'http://elnopal.es',
      'https://elnopal.es' // IONOS puede activar HTTPS automáticamente
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware de seguridad avanzado
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "ws:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
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

// Rate limiting general más estricto para producción
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
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

// Slow down para prevenir abuse
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // Permitir 50 requests a velocidad normal
  delayMs: 500, // Añadir 500ms de delay por request
  maxDelayMs: 5000, // Máximo delay de 5 segundos
  skip: (req) => {
    if (process.env.NODE_ENV !== 'production') {
      return req.ip === '127.0.0.1' || req.ip === '::1';
    }
    return false;
  }
});

// Aplicar rate limiting y speed limiting
app.use('/api/auth/login', authLimiter);
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', generalLimiter);
  app.use('/api/', speedLimiter);
}

// Middleware básico
app.use(cors(corsOptions));

// Middleware adicional para asegurar headers CORS en todas las respuestas
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://elnopal.es',
    'https://elnopal.es',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];

  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Manejar preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware para sanitizar entrada XSS
app.use((req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
});

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'JSON inválido' });
      return;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging seguro - solo en desarrollo o errores críticos
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // En producción, solo loguear errores y requests importantes
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400,
    stream: {
      write: (message) => {
        console.error('HTTP Error:', message.trim());
      }
    }
  }));
}

// Configuración de MongoDB
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
};

// Conexión a la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elnopal', mongoOptions)
.then(() => {
  console.log('✅ Conectado a MongoDB');
  
  // Solo iniciar el servidor después de conectar a MongoDB
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      console.log('🔒 Modo producción activado con seguridad reforzada');
    }
  });
})
.catch(err => {
  console.error('❌ Error conectando a MongoDB:', err.message);
  process.exit(1);
});

// Manejar errores de MongoDB después de la conexión inicial
mongoose.connection.on('error', err => {
  console.error('❌ Error en la conexión de MongoDB:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Desconectado de MongoDB');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Señal SIGTERM recibida, cerrando servidor...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('👋 Servidor cerrado correctamente');
      process.exit(0);
    });
  });
});

// Inicialización de Socket.io
io.on('connection', (socket) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔌 Cliente conectado:', socket.id);
  }
  
  socket.on('disconnect', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Cliente desconectado:', socket.id);
    }
  });
  
  // Manejar eventos de reservas
  socket.on('newReservation', (data) => {
    // Validar datos antes de emitir
    if (data && typeof data === 'object') {
      io.emit('reservationUpdate', data);
    }
  });
  
  socket.on('cancelReservation', (data) => {
    // Validar datos antes de emitir
    if (data && typeof data === 'object') {
      io.emit('reservationUpdate', data);
    }
  });
});

// Hacer io disponible para las rutas
app.set('io', io);

// Ruta de health check para tests (antes de otras rutas)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de health check adicional
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas de la API con manejo de errores mejorado
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/blacklist', blacklistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);

// Ruta de prueba (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'API de El Nopal funcionando correctamente',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });
}

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  // Log del error (sin información sensible)
  const errorInfo = {
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error en el servidor:', errorInfo);
    console.error('Stack trace:', err.stack);
  } else {
    console.error('❌ Error en producción:', errorInfo);
  }
  
  // Respuesta de error sin información sensible
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Error interno del servidor' 
    : err.message;
  
  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString()
  });
});

// Manejar errores no capturados
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection en:', promise, 'razón:', reason);
  if (process.env.NODE_ENV === 'development') {
    console.error(reason);
  }
  process.exit(1);
});

module.exports = app; 