import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api'; // Importar la instancia de axios
// import './ReviewForm.css'; // Archivo eliminado - estilos ahora en sistema modular

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
      
      const response = await api.post('/reviews', {
        name: formData.nombre,
        email: formData.email,
        rating: formData.calificacion,
        comment: formData.comentario,
        fecha: new Date().toLocaleDateString()
      });
      
      const data = response.data;
      
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
      const errorMessage = error.response?.data?.message || error.message || "Hubo un error al enviar tu reseña. Inténtalo de nuevo.";
      toast.error(errorMessage);
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
            placeholder="Tu nombre completo"
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
            placeholder="tu.email@ejemplo.com"
          />
          <small>Tu email no será publicado ni compartido</small>
        </div>
        
        <div className="form-group">
          <label>¿Cómo calificarías tu experiencia?*</label>
          <div className="rating-input">
            {[5, 4, 3, 2, 1].map(star => (
              <button
                key={star}
                type="button"
                className={`star-btn ${formData.calificacion >= star ? 'active' : ''}`}
                onClick={() => handleRatingChange(star)}
                title={`${star} estrella${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#666' }}>
            {formData.calificacion === 5 && '¡Excelente! 🌟'}
            {formData.calificacion === 4 && 'Muy bueno 👍'}
            {formData.calificacion === 3 && 'Bueno 👌'}
            {formData.calificacion === 2 && 'Regular 😐'}
            {formData.calificacion === 1 && 'Necesita mejorar 😔'}
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="comentario">Comparte tu experiencia*</label>
          <textarea
            id="comentario"
            name="comentario"
            value={formData.comentario}
            onChange={handleChange}
            required
            placeholder="Cuéntanos sobre tu experiencia en El Nopal: ¿qué platillos probaste? ¿cómo fue el servicio? ¿qué te gustó más?"
            rows="6"
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