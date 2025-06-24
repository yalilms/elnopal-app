const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss');

// Función para manejar resultados de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      error: 'Errores de validación',
      details: formattedErrors
    });
  }
  next();
};

// Sanitización personalizada
const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  
  // Limpiar XSS
  let clean = xss(value, {
    whiteList: {}, // No permitir ningún HTML
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
  
  // Limpiar caracteres peligrosos adicionales
  clean = clean.replace(/[<>'"]/g, '');
  
  return clean.trim();
};

// Validaciones para autenticación
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .customSanitizer(sanitizeInput)
    .isLength({ max: 254 })
    .withMessage('Email demasiado largo'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .customSanitizer(sanitizeInput),
  
  handleValidationErrors
];

const validateRegister = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios')
    .customSanitizer(sanitizeInput),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .customSanitizer(sanitizeInput)
    .isLength({ max: 254 })
    .withMessage('Email demasiado largo'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un símbolo')
    .customSanitizer(sanitizeInput),
  
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'host', 'waiter'])
    .withMessage('Rol inválido'),
  
  handleValidationErrors
];

// Validaciones para reservas
const validateReservation = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios')
    .customSanitizer(sanitizeInput),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .customSanitizer(sanitizeInput),
  
  body('phone')
    .matches(/^[+]?[\d\s\-()]{9,15}$/)
    .withMessage('Teléfono inválido')
    .customSanitizer(sanitizeInput),
  
  body('date')
    .isISO8601()
    .withMessage('Fecha inválida')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        throw new Error('No se pueden hacer reservas para fechas pasadas');
      }
      
      // Límite de 90 días en el futuro
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 90);
      
      if (date > maxDate) {
        throw new Error('No se pueden hacer reservas con más de 90 días de anticipación');
      }
      
      return true;
    }),
  
  body('time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora inválida (formato HH:MM)')
    .custom((value) => {
      const validTimes = [
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
        '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
      ];
      
      if (!validTimes.includes(value)) {
        throw new Error('Hora no disponible');
      }
      
      return true;
    }),
  
  body('partySize')
    .isInt({ min: 1, max: 12 })
    .withMessage('El número de personas debe estar entre 1 y 12'),
  
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las solicitudes especiales no pueden superar los 500 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('needsBabyCart')
    .optional()
    .isBoolean()
    .withMessage('needsBabyCart debe ser verdadero o falso'),
  
  body('needsWheelchair')
    .optional()
    .isBoolean()
    .withMessage('needsWheelchair debe ser verdadero o falso'),
  
  handleValidationErrors
];

// Validaciones para actualizar reserva
const validateUpdateReservation = [
  param('id')
    .isMongoId()
    .withMessage('ID de reserva inválido'),
  
  body('status')
    .optional()
    .isIn(['confirmed', 'pending', 'cancelled', 'completed', 'no-show'])
    .withMessage('Estado de reserva inválido'),
  
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las solicitudes especiales no pueden superar los 500 caracteres')
    .customSanitizer(sanitizeInput),
  
  handleValidationErrors
];

// Validaciones para contacto
const validateContact = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios')
    .customSanitizer(sanitizeInput),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .customSanitizer(sanitizeInput),
  
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-()]{9,15}$/)
    .withMessage('Teléfono inválido')
    .customSanitizer(sanitizeInput),
  
  body('subject')
    .isLength({ min: 5, max: 100 })
    .withMessage('El asunto debe tener entre 5 y 100 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('message')
    .isLength({ min: 10, max: 1000 })
    .withMessage('El mensaje debe tener entre 10 y 1000 caracteres')
    .customSanitizer(sanitizeInput),
  
  handleValidationErrors
];

// Validaciones para reseñas
const validateReview = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios')
    .customSanitizer(sanitizeInput),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .customSanitizer(sanitizeInput),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe estar entre 1 y 5'),
  
  body('comment')
    .isLength({ min: 10, max: 500 })
    .withMessage('El comentario debe tener entre 10 y 500 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('foodRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación de comida debe estar entre 1 y 5'),
  
  body('serviceRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación de servicio debe estar entre 1 y 5'),
  
  body('ambienceRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación de ambiente debe estar entre 1 y 5'),
  
  handleValidationErrors
];

// Validaciones para lista negra
const validateBlacklist = [
  body('customerName')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios')
    .customSanitizer(sanitizeInput),
  
  body('customerEmail')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .customSanitizer(sanitizeInput),
  
  body('customerPhone')
    .matches(/^[+]?[\d\s\-()]{9,15}$/)
    .withMessage('Teléfono inválido')
    .customSanitizer(sanitizeInput),
  
  body('reason')
    .isLength({ min: 10, max: 500 })
    .withMessage('La razón debe tener entre 10 y 500 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('severity')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Severidad inválida'),
  
  handleValidationErrors
];

// Validaciones para parámetros de ID
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} inválido`),
  
  handleValidationErrors
];

// Validaciones para queries de paginación
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Página debe ser un número entre 1 y 1000'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser un número entre 1 y 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'date', 'name', 'email', 'status'])
    .withMessage('Campo de ordenamiento inválido'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden debe ser asc o desc'),
  
  handleValidationErrors
];

// Validación de fechas
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida')
    .custom((value, { req }) => {
      if (req.query.startDate && value) {
        const start = new Date(req.query.startDate);
        const end = new Date(value);
        
        if (end <= start) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        
        // Máximo rango de 1 año
        const maxRange = new Date(start);
        maxRange.setFullYear(maxRange.getFullYear() + 1);
        
        if (end > maxRange) {
          throw new Error('El rango de fechas no puede superar 1 año');
        }
      }
      
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validateReservation,
  validateUpdateReservation,
  validateContact,
  validateReview,
  validateBlacklist,
  validateMongoId,
  validatePagination,
  validateDateRange,
  handleValidationErrors,
  sanitizeInput
}; 