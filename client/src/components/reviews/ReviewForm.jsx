import React, { useState } from 'react';
import { toast } from 'react-toastify';
// import './ReviewForm.css'; // Archivo eliminado - estilos ahora en sistema modular

// Configurar base URL para desarrollo y producción
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://elnopal.es' // En producción, usar HTTPS del dominio principal (nginx manejará el proxy)
  : 'http://localhost:5000'; // En desarrollo, puerto del backend

const ReviewForm = ({ onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    calificacion: 5,
    comentario: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      calificacion: rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email || !formData.comentario) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.nombre,
          email: formData.email,
          rating: formData.calificacion,
          comment: formData.comentario,
          fecha: new Date().toLocaleDateString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar la reseña');
      }
      
      const data = await response.json();
      
      toast.success("¡Gracias por compartir tu opinión!");
      setFormData({
        nombre: '',
        email: '',
        calificacion: 5,
        comentario: ''
      });
      
      if (onReviewSubmitted) {
        onReviewSubmitted(data.review);
      }
      
    } catch (error) {
      toast.error(error.message || "Hubo un error al enviar tu reseña. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3>Comparte tu experiencia en El Nopal</h3>
      <form className="review-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre*</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Tu nombre"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="tu@email.com"
          />
          <small>Tu email no será publicado</small>
        </div>
        
        <div className="form-group">
          <label>Calificación*</label>
          <div className="rating-input">
            {[5, 4, 3, 2, 1].map(star => (
              <button
                key={star}
                type="button"
                className={`star-btn ${formData.calificacion >= star ? 'active' : ''}`}
                onClick={() => handleRatingChange(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="comentario">Tu opinión*</label>
          <textarea
            id="comentario"
            name="comentario"
            value={formData.comentario}
            onChange={handleChange}
            required
            placeholder="Cuéntanos sobre tu experiencia..."
            rows="5"
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="submit-review-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar opinión'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm; 