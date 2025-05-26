import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt, faClock, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { navigateAndScroll } from '../../utils/scrollUtils';

const Footer = () => {
  const history = useHistory();
  const { currentUser } = useAuth();

  const handleAdminClick = (e) => {
    e.preventDefault();
    
    // Si ya está autenticado, ir directo al panel de administración
    if (currentUser) {
      history.push('/admin/reservaciones');
    } else {
      // Si no está autenticado, ir a la página de login
      history.push('/admin/login');
    }
  };

  const handleNavigationClick = (e, path, sectionId = null) => {
    e.preventDefault();
    navigateAndScroll(history, path, sectionId);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          {/* Marca y descripción a la izquierda */}
          <div className="footer-brand">
            <h3 className="footer-logo">El Nopal</h3>
            <p>El auténtico sabor mexicano en Granada. Ofrecemos una experiencia culinaria única con platos tradicionales y modernos.</p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="https://wa.me/34600000000" target="_blank" rel="noopener noreferrer" className="social-icon">
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
            </div>
          </div>
          
          {/* Información distribuida horizontalmente */}
          <div className="footer-info">
            {/* Enlaces rápidos */}
            <div className="footer-column">
              <h4>Enlaces</h4>
              <ul className="footer-links">
                <li>
                  <a href="/reservaciones#reservation-form" onClick={(e) => handleNavigationClick(e, '/reservaciones', 'reservation-form')}>
                    Reservar Mesa
                  </a>
                </li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/nosotros">Sobre Nosotros</Link></li>
                <li>
                  <a href="/contacto#contact-form" onClick={(e) => handleNavigationClick(e, '/contacto', 'contact-form')}>
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="/dejar-opinion#review-form" onClick={(e) => handleNavigationClick(e, '/dejar-opinion', 'review-form')}>
                    Dejar Opinión
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Contacto */}
            <div className="footer-column">
              <h4>Contacto</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>C. Martínez Campos, 23, Granada</span>
                </div>
                <div className="contact-item">
                  <FontAwesomeIcon icon={faPhone} />
                  <a href="tel:+34653733111">+34 653 73 31 11</a>
                </div>
                <div className="contact-item">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>reservas@elnopal.es</span>
                </div>
              </div>
            </div>
            
            {/* Horario */}
            <div className="footer-column">
              <h4>Horario</h4>
              <div className="schedule-info">
                <div className="schedule-item">
                  <span>Martes-Sábado</span>
                  <span>13:00-16:30</span>
                </div>
                <div className="schedule-item">
                  <span>Martes-Sábado</span>
                  <span>20:00-23:45</span>
                </div>
                <div className="schedule-item">
                  <span>Domingo</span>
                  <span>13:00-16:30</span>
                </div>
                <div className="schedule-item closed">
                  <span>Lunes</span>
                  <span>Cerrado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-links">
            <Link to="/privacidad">Política de privacidad</Link>
            <Link to="/terminos">Términos y condiciones</Link>
            <a href="#" onClick={handleAdminClick} className="admin-link">
              <FontAwesomeIcon icon={faLock} className="admin-icon" /> Administración
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} El Nopal - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 