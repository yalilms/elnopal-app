import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import ReviewForm from './ReviewForm';
import { handleHashScroll } from '../../utils/scrollUtils';
import './LeaveReviewPage.css';

const LeaveReviewPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const history = useHistory();

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
      history.push('/');
    }, 3000);
  };

  return (
    <div className="page leave-review-page">
      <section id="review-header" className="review-page-header">
        <h2>Comparte tu experiencia</h2>
        <p className="subtitle">Tu opinión es muy valiosa para nosotros. Nos ayuda a mejorar constantemente nuestro servicio.</p>
      </section>

      {submitted ? (
        <section id="thank-you" className="thank-you-message">
          <div className="success-icon">✓</div>
          <h3>¡Gracias por tu opinión!</h3>
          <p>Tu reseña ha sido enviada con éxito. Valoramos mucho tus comentarios y los tomaremos en cuenta para mejorar.</p>
          <p>Serás redirigido a la página principal en unos segundos...</p>
        </section>
      ) : (
        <section id="review-form">
          <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
        </section>
      )}

      <section id="review-guidelines" className="review-guidelines">
        <h4>Pautas para reseñas</h4>
        <ul>
          <li>Comparte tu experiencia genuina en El Nopal</li>
          <li>Sé específico sobre los platillos, el servicio y el ambiente</li>
          <li>Evita lenguaje ofensivo o inapropiado</li>
          <li>Todas las reseñas son revisadas por nuestro equipo interno</li>
        </ul>
      </section>
    </div>
  );
};

export default LeaveReviewPage; 