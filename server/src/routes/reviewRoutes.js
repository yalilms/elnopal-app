const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { authenticateJWT, authorize } = require('../middleware/authMiddleware');

// Validaciones para crear opinión (formulario público)
const createReviewValidation = [
  body('name').notEmpty().trim().withMessage('El nombre es obligatorio'),
  body('email').isEmail().normalizeEmail().withMessage('El email no es válido'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('La calificación debe estar entre 1 y 5'),
  body('comment').notEmpty().trim().withMessage('El comentario es obligatorio')
];

// Validaciones para actualizar estado de opinión
const updateStatusValidation = [
  body('status').isIn(['pending', 'reviewed', 'rejected']).withMessage('Estado no válido')
];

// Rutas públicas (sin autenticación)
router.post('/', createReviewValidation, reviewController.createReview);
router.get('/public', reviewController.getPublicReviews);

// Rutas con autenticación (administradores)
router.get('/', authenticateJWT, authorize(['admin']), reviewController.getAllReviews);
router.get('/stats', authenticateJWT, authorize(['admin']), reviewController.getReviewStats);
router.get('/:id', authenticateJWT, authorize(['admin']), reviewController.getReviewById);
router.patch('/:id/status', authenticateJWT, authorize(['admin']), updateStatusValidation, reviewController.updateReviewStatus);
router.delete('/:id', authenticateJWT, authorize(['admin']), reviewController.deleteReview);

module.exports = router; 