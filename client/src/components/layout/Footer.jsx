import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt, faLock, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { navigateAndScroll } from '../../utils/scrollUtils';

const Footer = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleAdminClick = (e) => {
    e.preventDefault();
    
    // Si ya está autenticado, ir directo al panel de administración
    if (currentUser) {
      navigate('/admin/reservaciones');
    } else {
      // Si no está autenticado, ir a la página de login
      navigate('/admin/login');
    }
  };

  const handleNavigationClick = (e, path, sectionId = null) => {
    e.preventDefault();
    navigateAndScroll(navigate, path, sectionId);
  };

  const handlePrivacyClick = (e) => {
    e.preventDefault();
    setShowPrivacyModal(true);
  };

  const closePrivacyModal = () => {
    setShowPrivacyModal(false);
  };

  return (
    <>
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
                href="#" 
                onClick={handlePrivacyClick}
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

      {/* Modal de Política de Privacidad */}
      {showPrivacyModal && (
        <div className="modal-overlay active" onClick={closePrivacyModal}>
          <div className="modal-content privacy-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePrivacyModal} aria-label="Cerrar">
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="privacy-header">
              <h2>Política de Privacidad</h2>
              <p>Restaurante El Nopal</p>
            </div>
            
            <div className="privacy-content">
              <section>
                <h3>1. Responsable del Tratamiento</h3>
                <p>
                  <strong>Restaurante El Nopal</strong><br />
                  Dirección: C. Martínez Campos, 23, Granada<br />
                  Teléfono: +34 653 73 31 11<br />
                  Email: reservas@elnopal.es
                </p>
              </section>

              <section>
                <h3>2. Finalidad del Tratamiento</h3>
                <p>Los datos personales que nos proporciones serán utilizados para:</p>
                <ul>
                  <li>Gestionar las reservas de mesa</li>
                  <li>Atender consultas y solicitudes de información</li>
                  <li>Enviar comunicaciones comerciales (solo con tu consentimiento)</li>
                  <li>Gestionar opiniones y valoraciones del servicio</li>
                </ul>
              </section>

              <section>
                <h3>3. Base Jurídica</h3>
                <p>
                  El tratamiento de tus datos se basa en tu consentimiento expreso y en la ejecución 
                  de la relación contractual establecida para la prestación de nuestros servicios.
                </p>
              </section>

              <section>
                <h3>4. Conservación de Datos</h3>
                <p>
                  Los datos se conservarán durante el tiempo necesario para cumplir con la finalidad 
                  para la que fueron recogidos y para cumplir con las obligaciones legales.
                </p>
              </section>

              <section>
                <h3>5. Derechos del Usuario</h3>
                <p>Tienes derecho a:</p>
                <ul>
                  <li>Acceder a tus datos personales</li>
                  <li>Rectificar datos inexactos o incompletos</li>
                  <li>Solicitar la supresión de tus datos</li>
                  <li>Oponerte al tratamiento</li>
                  <li>Solicitar la limitación del tratamiento</li>
                  <li>Solicitar la portabilidad de tus datos</li>
                </ul>
                <p>
                  Para ejercer estos derechos, contacta con nosotros en: 
                  <strong>reservas@elnopal.es</strong>
                </p>
              </section>

              <section>
                <h3>6. Cookies</h3>
                <p>
                  Nuestro sitio web utiliza cookies técnicas necesarias para su funcionamiento. 
                  No utilizamos cookies de terceros para seguimiento o publicidad.
                </p>
              </section>

              <section>
                <h3>7. Seguridad</h3>
                <p>
                  Implementamos medidas técnicas y organizativas apropiadas para proteger tus 
                  datos personales contra el acceso no autorizado, alteración, divulgación o destrucción.
                </p>
              </section>

              <section>
                <h3>8. Modificaciones</h3>
                <p>
                  Nos reservamos el derecho a modificar esta política de privacidad. Los cambios 
                  serán comunicados a través de nuestro sitio web.
                </p>
              </section>

              <div className="privacy-footer">
                <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer; 