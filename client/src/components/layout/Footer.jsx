import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt, faClock, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { navigateAndScroll } from '../../utils/scrollUtils';

// Estilos CSS completos para el footer
const footerStyles = `
  .footer-improved {
    background: linear-gradient(135deg, #6B4226 0%, #2a1f1d 100%);
    color: #E8E3D3;
    padding: 2.5rem 0 0 0;
    margin-top: auto;
    position: relative;
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
  }

  .footer-improved::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="footerPattern" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 0h60v60H0z" fill="none"/><path d="M30 0L60 30L30 60L0 30z" fill="%23f8b612" opacity="0.03"/></pattern></defs><rect width="60" height="60" fill="url(%23footerPattern)"/></svg>');
    pointer-events: none;
    z-index: 1;
  }

  .footer-improved > * {
    position: relative;
    z-index: 2;
  }

  .footer-content-improved {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .footer-main-improved {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
    align-items: start;
    width: 100%;
  }

  .footer-brand-improved {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .footer-logo-improved {
    font-family: 'Poppins', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: #FFB703;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    margin-bottom: 0.5rem;
    letter-spacing: 1px;
  }

  .footer-brand-improved p {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #E8E3D3;
    margin-bottom: 1rem;
    text-align: left;
  }

  .social-icons-improved {
    display: flex;
    gap: 1rem;
    justify-content: flex-start;
  }

  .social-icon-improved {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 183, 3, 0.15);
    border: 1px solid rgba(255, 183, 3, 0.3);
    border-radius: 50%;
    color: #FFB703;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    text-decoration: none;
  }

  .social-icon-improved:hover {
    background: #FFB703;
    color: #6B4226;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 183, 3, 0.3);
  }

  .footer-info-improved {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    width: 100%;
  }

  .footer-column-improved {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .footer-column-improved h4 {
    color: #FFB703;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
  }

  .footer-column-improved h4::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 30px;
    height: 2px;
    background: #FFB703;
    border-radius: 2px;
  }

  .footer-links-improved {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .footer-links-improved a {
    color: #E8E3D3;
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    display: block;
    padding: 0.3rem 0;
  }

  .footer-links-improved a:hover {
    color: #FFB703;
    transform: translateX(4px);
  }

  .contact-info-improved {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .contact-item-improved {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 0.85rem;
    color: #E8E3D3;
  }

  .contact-item-improved svg {
    color: #FFB703;
    font-size: 0.9rem;
    width: 16px;
    flex-shrink: 0;
  }

  .contact-item-improved a {
    color: #E8E3D3;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .contact-item-improved a:hover {
    color: #FFB703;
  }

  .schedule-info-improved {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .schedule-item-improved {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    padding: 0.4rem 0.8rem;
    white-space: nowrap;
  }

  .schedule-item-improved span:first-child {
    font-weight: 600;
    color: #FFB703;
    flex-shrink: 0;
  }

  .schedule-item-improved span:last-child {
    text-align: right;
    font-weight: 500;
    flex-shrink: 0;
  }

  .schedule-item-improved.closed {
    background-color: rgba(211, 47, 47, 0.15);
    color: #ffcdd2;
  }

  .schedule-item-improved.closed span:first-child {
    color: #f48fb1;
  }

  .schedule-item-improved.closed span:last-child {
    color: #f48fb1;
    font-style: italic;
  }

  .footer-bottom-improved {
    border-top: 1px solid rgba(255, 183, 3, 0.2);
    padding: 1.5rem 0 0 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    position: relative;
  }

  .footer-bottom-links-improved {
    display: flex;
    gap: 2rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }

  .footer-bottom-links-improved a {
    color: #D4B895;
    text-decoration: none;
    font-size: 0.8rem;
    transition: color 0.3s ease;
    padding: 0.3rem 0;
  }

  .footer-bottom-links-improved a:hover {
    color: #FFB703;
  }

  .admin-link-improved {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 183, 3, 0.1);
    border: 1px solid rgba(255, 183, 3, 0.3);
    border-radius: 15px;
    transition: all 0.3s ease;
    text-decoration: none;
    color: #D4B895;
  }

  .admin-link-improved:hover {
    background: rgba(255, 183, 3, 0.2);
    border-color: #FFB703;
    color: #FFB703;
    transform: translateY(-1px);
  }

  .admin-icon-improved {
    font-size: 0.7rem;
  }

  .copyright-improved {
    background: linear-gradient(135deg, rgba(107, 66, 38, 0.9), rgba(90, 58, 32, 0.9));
    color: #E8E3D3;
    text-align: center;
    padding: 1rem 0;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    border-top: 1px solid rgba(255, 183, 3, 0.3);
    margin-top: 1.5rem;
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
  }

  /* RESPONSIVE DESIGN MEJORADO */
  @media (max-width: 1200px) {
    .footer-main-improved {
      grid-template-columns: 1fr;
      gap: 2.5rem;
      text-align: center;
    }
    
    .footer-brand-improved {
      align-items: center;
      text-align: center;
    }
    
    .footer-info-improved {
      justify-content: center;
    }
    
    .social-icons-improved {
      justify-content: center;
    }
  }

  @media (max-width: 992px) {
    .footer-improved {
      padding: 2rem 0 0 0;
    }
    
    .footer-content-improved {
      padding: 0 1.5rem;
      gap: 2rem;
    }
    
    .footer-info-improved {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
    
    .footer-logo-improved {
      font-size: 1.8rem;
    }
  }

  @media (max-width: 768px) {
    .footer-improved {
      padding: 1.8rem 0 0 0;
    }
    
    .footer-content-improved {
      padding: 0 1rem;
      gap: 1.8rem;
    }
    
    .footer-main-improved {
      gap: 2rem;
    }
    
    .footer-info-improved {
      grid-template-columns: 1fr;
      gap: 1.8rem;
      text-align: center;
    }
    
    .footer-column-improved {
      align-items: center;
    }
    
    .footer-column-improved h4::after {
      left: 50%;
      transform: translateX(-50%);
    }
    
    .footer-bottom-links-improved {
      flex-direction: column;
      gap: 1rem;
    }
    
    .copyright-improved {
      font-size: 0.75rem;
      padding: 0.8rem 0;
    }
  }

  @media (max-width: 480px) {
    .footer-improved {
      padding: 1.5rem 0 0 0;
    }
    
    .footer-content-improved {
      padding: 0 0.8rem;
      gap: 1.5rem;
    }
    
    .footer-logo-improved {
      font-size: 1.6rem;
    }
    
    .footer-brand-improved p {
      font-size: 0.85rem;
      text-align: center;
    }
    
    .social-icons-improved {
      gap: 0.8rem;
    }
    
    .social-icon-improved {
      width: 36px;
      height: 36px;
      font-size: 1rem;
    }
    
    .footer-column-improved h4 {
      font-size: 1rem;
    }
    
    .footer-links-improved a {
      font-size: 0.85rem;
    }
    
    .contact-item-improved {
      font-size: 0.8rem;
      justify-content: center;
    }
    
    .schedule-item-improved {
      font-size: 0.75rem;
      padding: 0.3rem 0.6rem;
    }
    
    .copyright-improved {
      font-size: 0.7rem;
      padding: 0.6rem 0;
    }
  }

  @media (max-width: 360px) {
    .footer-content-improved {
      padding: 0 0.6rem;
      gap: 1.2rem;
    }
    
    .footer-logo-improved {
      font-size: 1.4rem;
    }
    
    .social-icon-improved {
      width: 32px;
      height: 32px;
      font-size: 0.9rem;
    }
    
    .footer-column-improved h4 {
      font-size: 0.95rem;
    }
    
    .footer-links-improved a {
      font-size: 0.8rem;
    }
    
    .contact-item-improved {
      font-size: 0.75rem;
    }
    
    .schedule-item-improved {
      font-size: 0.7rem;
    }
    
    .admin-link-improved {
      font-size: 0.7rem;
      padding: 0.4rem 0.8rem;
    }
    
    .copyright-improved {
      font-size: 0.65rem;
    }
  }

  /* Fixes adicionales para zoom y overflow */
  @media (max-width: 320px) {
    .footer-content-improved {
      padding: 0 0.4rem;
    }
    
    .footer-logo-improved {
      font-size: 1.3rem;
    }
    
    .contact-item-improved {
      flex-direction: column;
      gap: 0.2rem;
      text-align: center;
    }
    
    .schedule-item-improved {
      flex-direction: column;
      gap: 0.1rem;
      text-align: center;
    }
  }

  /* Alto contraste y accesibilidad */
  @media (prefers-contrast: high) {
    .footer-improved {
      background: #000;
      color: #fff;
    }
    
    .footer-logo-improved,
    .footer-column-improved h4 {
      color: #ffff00;
    }
    
    .social-icon-improved {
      background: #fff;
      color: #000;
      border-color: #fff;
    }
  }

  /* Reducción de movimiento */
  @media (prefers-reduced-motion: reduce) {
    .social-icon-improved,
    .footer-links-improved a,
    .admin-link-improved {
      transition: none;
    }
    
    .social-icon-improved:hover,
    .admin-link-improved:hover {
      transform: none;
    }
  }
`;

const Footer = () => {
  const history = useHistory();
  const { currentUser } = useAuth();

  // useEffect para inyectar estilos CSS
  useEffect(() => {
    if (!document.getElementById('footer-improved-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'footer-improved-styles';
      styleSheet.textContent = footerStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);

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
    <footer className="footer-improved">
      <div className="footer-content-improved">
        <div className="footer-main-improved">
          {/* Marca y descripción a la izquierda */}
          <div className="footer-brand-improved">
            <h3 className="footer-logo-improved">El Nopal</h3>
            <p>El auténtico sabor mexicano en Granada. Ofrecemos una experiencia culinaria única con platos tradicionales y modernos.</p>
            <div className="social-icons-improved">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-improved">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-improved">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-improved">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="https://wa.me/34653733111" target="_blank" rel="noopener noreferrer" className="social-icon-improved">
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
            </div>
          </div>
          
          {/* Información distribuida horizontalmente */}
          <div className="footer-info-improved">
            {/* Enlaces rápidos */}
            <div className="footer-column-improved">
              <h4>Enlaces</h4>
              <ul className="footer-links-improved">
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
            <div className="footer-column-improved">
              <h4>Contacto</h4>
              <div className="contact-info-improved">
                <div className="contact-item-improved">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>C. Martínez Campos, 23, Granada</span>
                </div>
                <div className="contact-item-improved">
                  <FontAwesomeIcon icon={faPhone} />
                  <a href="tel:+34653733111">+34 653 73 31 11</a>
                </div>
                <div className="contact-item-improved">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>reservas@elnopal.es</span>
                </div>
              </div>
            </div>
            
            {/* Horario */}
            <div className="footer-column-improved">
              <h4>Horario</h4>
              <div className="schedule-info-improved">
                <div className="schedule-item-improved">
                  <span>Martes-Sábado</span>
                  <span>13:00-16:30</span>
                </div>
                <div className="schedule-item-improved">
                  <span>Martes-Sábado</span>
                  <span>20:00-23:45</span>
                </div>
                <div className="schedule-item-improved">
                  <span>Domingo</span>
                  <span>13:00-16:30</span>
                </div>
                <div className="schedule-item-improved closed">
                  <span>Lunes</span>
                  <span>Cerrado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom-improved">
          <div className="footer-bottom-links-improved">
            <Link to="/privacidad">Política de privacidad</Link>
            <Link to="/terminos">Términos y condiciones</Link>
            <a href="#" onClick={handleAdminClick} className="admin-link-improved">
              <FontAwesomeIcon icon={faLock} className="admin-icon-improved" /> Administración
            </a>
          </div>
        </div>
      </div>
      
      <div className="copyright-improved">
        &copy; {new Date().getFullYear()} El Nopal - Todos los derechos reservados
      </div>
    </footer>
  );
};

export default Footer; 