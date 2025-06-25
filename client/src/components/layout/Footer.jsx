import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt, faLock } from '@fortawesome/free-solid-svg-icons';
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
      <div className="footer-container">
        <div className="footer-main">
          {/* Marca y descripción a la izquierda */}
          <div className="footer-brand">
            <h3 className="footer-logo">El Nopal</h3>
            <p className="footer-description">
              El auténtico sabor mexicano en Granada. Ofrecemos una experiencia culinaria única con platos tradicionales y modernos.
            </p>
            <div className="footer-social">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-icon"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-icon"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-icon"
                aria-label="Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a 
                href="https://wa.me/34653733111" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-icon"
                aria-label="WhatsApp"
              >
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
                  <a 
                    href="/reservaciones#reservation-form" 
                    onClick={(e) => handleNavigationClick(e, '/reservaciones', 'reservation-form')}
                  >
                    Reservar Mesa
                  </a>
                </li>
                <li>
                  <Link to="/blog">Blog</Link>
                </li>
                <li>
                  <Link to="/nosotros">Sobre Nosotros</Link>
                </li>
                <li>
                  <a 
                    href="/contacto#contact-form" 
                    onClick={(e) => handleNavigationClick(e, '/contacto', 'contact-form')}
                  >
                    Contacto
                  </a>
                </li>
                <li>
                  <a 
                    href="/dejar-opinion#review-form" 
                    onClick={(e) => handleNavigationClick(e, '/dejar-opinion', 'review-form')}
                  >
                    Dejar Opinión
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Contacto */}
            <div className="footer-column">
              <h4>Contacto</h4>
              <div className="footer-contact">
                <div className="footer-contact-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>C. Martínez Campos, 23, Granada</span>
                </div>
                <div className="footer-contact-item">
                  <FontAwesomeIcon icon={faPhone} />
                  <a href="tel:+34653733111">+34 653 73 31 11</a>
                </div>
                <div className="footer-contact-item">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>reservas@elnopal.es</span>
                </div>
              </div>
            </div>
            
            {/* Horario */}
            <div className="footer-column">
              <h4>Horario</h4>
              <div className="footer-schedule">
                <div className="footer-schedule-item">
                  <span className="footer-schedule-day">Martes-Sábado</span>
                  <span className="footer-schedule-time">13:00-16:30</span>
                </div>
                <div className="footer-schedule-item">
                  <span className="footer-schedule-day">Martes-Sábado</span>
                  <span className="footer-schedule-time">20:00-23:45</span>
                </div>
                <div className="footer-schedule-item">
                  <span className="footer-schedule-day">Domingo</span>
                  <span className="footer-schedule-time">13:00-16:30</span>
                </div>
                <div className="footer-schedule-item closed">
                  <span className="footer-schedule-day">Lunes</span>
                  <span className="footer-schedule-time">Cerrado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-links">
            <a 
              href="https://elnopal.es/politica-privacidad" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Política de privacidad
            </a>
            <a 
              href="#" 
              onClick={handleAdminClick} 
              className="footer-admin-link"
            >
              <FontAwesomeIcon icon={faLock} /> Administración
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-copyright">
        &copy; {new Date().getFullYear()} El Nopal - Todos los derechos reservados
      </div>
    </footer>
  );
};

export default Footer; 