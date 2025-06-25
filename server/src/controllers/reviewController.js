const Review = require('../models/Review');
const emailService = require('../services/emailService');

// Crear una nueva opinión
exports.createReview = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    // Validaciones básicas
    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ 
        message: 'Faltan campos obligatorios: nombre, email, calificación y comentario' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Formato de email inválido' });
    }

    // Validar calificación
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La calificación debe estar entre 1 y 5' });
    }

    // Crear la opinión
    const review = new Review({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      rating: parseInt(rating),
      comment: comment.trim(),
      status: 'pending'
    });

    await review.save();

    // Enviar correos
    try {
      const reviewData = {
        name: review.name,
        email: review.email,
        rating: review.rating,
        comment: review.comment
      };

      const emailResult = await emailService.sendReviewEmails(reviewData);
      
      if (emailResult.success) {
        // Marcar correos como enviados
        review.thankYouEmailSent = true;
        review.thankYouEmailSentAt = new Date();
        review.notificationEmailSent = true;
        review.notificationEmailSentAt = new Date();
        await review.save();
      }
    } catch (emailError) {
      console.error('Error enviando correos de opinión:', emailError);
      // No fallar la opinión por error de correo
    }

    res.status(201).json({
      success: true,
      message: 'Opinión enviada exitosamente. ¡Gracias por su feedback!',
      review: {
        id: review._id,
        name: review.name,
        rating: review.rating,
        comment: review.comment,
        fecha: review.fecha,
        status: review.status
      }
    });
  } catch (error) {
    console.error('Error al crear opinión:', error);
    res.status(500).json({ 
      message: 'Error al enviar la opinión', 
      error: error.message 
    });
  }
};

// Obtener todas las opiniones (para administradores)
exports.getAllReviews = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews: reviews.map(review => review.toAdminJSON())
    });
  } catch (error) {
    console.error('Error al obtener opiniones:', error);
    res.status(500).json({ 
      message: 'Error al obtener opiniones', 
      error: error.message 
    });
  }
};

// Obtener opiniones públicas (solo las aprobadas)
exports.getPublicReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'reviewed' })
      .sort({ createdAt: -1 })
      .limit(20); // Limitar a las 20 más recientes

    res.json({
      success: true,
      reviews: reviews.map(review => review.toJSON()) // Sin email
    });
  } catch (error) {
    console.error('Error al obtener opiniones públicas:', error);
    res.status(500).json({ 
      message: 'Error al obtener opiniones', 
      error: error.message 
    });
  }
};

// Obtener una opinión por ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Opinión no encontrada' });
    }

    res.json({
      success: true,
      review: review.toAdminJSON()
    });
  } catch (error) {
    console.error('Error al obtener opinión:', error);
    res.status(500).json({ 
      message: 'Error al obtener opinión', 
      error: error.message 
    });
  }
};

// Actualizar estado de una opinión
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'reviewed', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: 'Estado inválido. Debe ser: pending, reviewed o rejected' 
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Opinión no encontrada' });
    }

    res.json({
      success: true,
      message: 'Estado de opinión actualizado exitosamente',
      review: review.toAdminJSON()
    });
  } catch (error) {
    console.error('Error al actualizar opinión:', error);
    res.status(500).json({ 
      message: 'Error al actualizar opinión', 
      error: error.message 
    });
  }
};

// Eliminar una opinión
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Opinión no encontrada' });
    }

    res.json({
      success: true,
      message: 'Opinión eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar opinión:', error);
    res.status(500).json({ 
      message: 'Error al eliminar opinión', 
      error: error.message 
    });
  }
};

// Obtener estadísticas de opiniones
exports.getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const statusStats = await Review.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        total: stats[0]?.totalReviews || 0,
        averageRating: Math.round((stats[0]?.averageRating || 0) * 10) / 10,
        byStatus: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byRating: ratingStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas', 
      error: error.message 
    });
  }
};

// Responder a una opinión
exports.respondToReview = async (req, res) => {
  try {
    const { response } = req.body;
    const reviewId = req.params.id;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({ 
        message: 'La respuesta es obligatoria' 
      });
    }

    // Buscar la opinión
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Opinión no encontrada' });
    }

    // Actualizar la opinión con la respuesta
    review.adminResponse = response.trim();
    review.adminResponseDate = new Date();
    review.adminResponseBy = req.user?.id || req.user?._id || 'admin';
    review.status = 'reviewed'; // Marcar como revisada
    
    await review.save();

    // Enviar email de respuesta al cliente
    try {
      const emailService = require('../services/emailService');
      
      // Crear datos para el email de respuesta
      const responseData = {
        name: review.name,
        email: review.email,
        rating: review.rating,
        originalComment: review.comment,
        adminResponse: response.trim(),
        restaurantName: 'El Nopal Restaurant'
      };

      // Aquí podrías crear una nueva función en emailService para respuestas
      // Por ahora, usar el email de agradecimiento modificado
      await emailService.sendReviewEmails({
        name: review.name,
        email: review.email,
        rating: review.rating,
        comment: review.comment,
        adminResponse: response.trim()
      });

      console.log('Email de respuesta enviado exitosamente');
    } catch (emailError) {
      console.error('Error enviando email de respuesta:', emailError);
      // No fallar la respuesta por error de correo
    }

    res.json({
      success: true,
      message: 'Respuesta enviada exitosamente al cliente',
      review: review.toAdminJSON()
    });
  } catch (error) {
    console.error('Error al responder opinión:', error);
    res.status(500).json({ 
      message: 'Error al enviar respuesta', 
      error: error.message 
    });
  }
}; 