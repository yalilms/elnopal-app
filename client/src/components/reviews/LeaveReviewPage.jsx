import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewForm from './ReviewForm';
import { handleHashScroll } from '../../utils/scrollUtils';
// import './LeaveReviewPage.css'; // Archivo eliminado - estilos ahora en sistema modular

const LeaveReviewPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  // Manejar scroll automático al cargar la página con hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      handleHashScroll(hash);
    }
  }, []);

  const handleReviewSubmitted = () => {
    setSubmitted(true);
    // Después de 3 segundos, redirigir a la página principal
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  return (
    <div className="page leave-review-page">
      <section id="review-header" className="review-page-header">
        <h2>Comparte tu experiencia en El Nopal</h2>
        <p className="subtitle">Tu opinión es muy valiosa para nosotros y nos ayuda a mejorar constantemente. Queremos conocer todos los detalles de tu visita para ofrecer la mejor experiencia mexicana.</p>
      </section>

      {submitted ? (
        <section id="thank-you" className="thank-you-message">
          <div className="success-icon">✓</div>
          <h3>¡Gracias por compartir tu experiencia!</h3>
          <p>Tu reseña ha sido enviada exitosamente. Valoramos mucho tus comentarios y los tomaremos en cuenta para seguir mejorando nuestro servicio y ofrecerte la mejor experiencia culinaria mexicana.</p>
          <p>¡Esperamos verte pronto de nuevo en El Nopal! 🌮🌶️🥑</p>
          <p><em>Serás redirigido a la página principal en unos segundos...</em></p>
        </section>
      ) : (
        <section id="review-form">
          <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
        </section>
      )}

      <section id="review-guidelines" className="review-guidelines">
        <h4>Guía para escribir tu reseña</h4>
        <ul>
          <li>Comparte tu experiencia genuina y personal en El Nopal</li>
          <li>Menciona los platillos que probaste, la calidad del servicio y el ambiente</li>
          <li>Mantén un lenguaje respetuoso y constructivo</li>
          <li>Todas las reseñas son revisadas por nuestro equipo antes de ser publicadas</li>
        </ul>
      </section>
    </div>
  );
};

export default LeaveReviewPage; 