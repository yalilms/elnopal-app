const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { check, validationResult } = require('express-validator');
const { authenticateJWT, authorize } = require('../middleware/authMiddleware');

// Middleware de validación para reseñas
const validateReview = [
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('email', 'Por favor incluye un email válido').isEmail(),
  check('calificacion', 'La calificación debe ser un número entre 1 y 5').isInt({ min: 1, max: 5 }),
  check('comentario', 'El comentario es obligatorio').not().isEmpty()
];

// Filtro para detectar palabras o frases inapropiadas
const containsInappropriateContent = (text) => {
  const badWords = [
    'maldito', 'horrible', 'pésimo', 'asco', 'asqueroso', 
    'mierda', 'basura', 'puta', 'joder', 'coño', 'verga', 
    'pendejo', 'estafa', 'fraude', 'denuncia', 'demanda'
  ];
  
  return badWords.some(word => 
    text.toLowerCase().includes(word.toLowerCase())
  );
};

// Rutas públicas

// GET /api/reviews - Obtener todas las reseñas aprobadas
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' })
      .sort({ createdAt: -1 });
    
    res.json({ reviews });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error del servidor al obtener reseñas' });
  }
});

// POST /api/reviews - Crear una nueva reseña
router.post('/', validateReview, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { nombre, email, calificacion, comentario, fecha } = req.body;
    
    console.log('Datos recibidos para crear reseña:', { nombre, email, calificacion, comentario, fecha });
    
    // Si la reseña contiene lenguaje inapropiado, marcarla para revisión
    const status = containsInappropriateContent(comentario) ? 'pending' : 'pending';
    
    const review = new Review({
      nombre,
      email,
      calificacion,
      comentario,
      fecha: fecha || new Date().toLocaleDateString(),
      status
    });
    
    await review.save();
    
    console.log('Reseña creada con éxito:', review);
    
    res.status(201).json({ 
      message: 'Gracias por tu opinión. Ha sido recibida con éxito.',
      review: review.toJSON()
    });
  } catch (error) {
    console.error('Error detallado al crear reseña:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Error de validación',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ 
        error: 'Ya existe un registro con estos datos',
        field: Object.keys(error.keyPattern)[0]
      });
    }
    
    res.status(500).json({ 
      error: 'Error del servidor al crear la reseña',
      message: error.message
    });
  }
});

// Rutas administrativas - Ahora corregidas para usar la ruta base correcta

// GET /api/reviews/admin - Obtener todas las reseñas (para administradores)
router.get('/admin', [authenticateJWT, authorize(['admin'])], async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    
    const adminReviews = reviews.map(review => review.toAdminJSON());
    
    res.json({ reviews: adminReviews });
  } catch (error) {
    console.error('Error al obtener reseñas para admin:', error);
    res.status(500).json({ error: 'Error del servidor al obtener reseñas' });
  }
});

// PUT /api/reviews/admin/:id/approve - Marcar reseña como atendida
router.put('/admin/:id/approve', [authenticateJWT, authorize(['admin'])], async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Opinión no encontrada' });
    }
    
    review.status = 'reviewed';
    await review.save();
    
    res.json({ 
      message: 'Opinión marcada como atendida',
      review: review.toAdminJSON()
    });
  } catch (error) {
    console.error('Error al marcar opinión como atendida:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar la opinión' });
  }
});

// DELETE /api/reviews/admin/:id - Eliminar una reseña
router.delete('/admin/:id', [authenticateJWT, authorize(['admin'])], async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Opinión no encontrada' });
    }
    
    await Review.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Opinión eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar opinión:', error);
    res.status(500).json({ error: 'Error del servidor al eliminar la opinión' });
  }
});

module.exports = router; 