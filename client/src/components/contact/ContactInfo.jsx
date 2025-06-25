import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
// import './ContactInfo.css'; // Archivo eliminado - estilos ahora en sistema modular
import logoImage from '../../images/logo_elnopal.png';
import RestaurantStatusIndicator from '../common/RestaurantStatusIndicator';

const ContactInfo = () => {
  useEffect(() => {
    // Efecto para las animaciones al hacer scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.2 }
    );
    
    // Observar elementos para animar
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="contact-info-container">
      <div className="logo-section animate-on-scroll">
        <img src={logoImage} alt="El Nopal Logo" className="contact-logo" />
      </div>

      <div className="contact-section animate-on-scroll">
        <h2 className="section-title floating-title">Horario</h2>
        <RestaurantStatusIndicator />
        <div className="schedule-container detailed-schedule">
          <div className="schedule-item card-3d">
            <div className="schedule-item-inner">
            <h3>Martes</h3>
            <p>13:00 - 15:30</p>
            <p>20:00 - 23:30</p>
          </div>
          </div>
          <div className="schedule-item card-3d">
            <div className="schedule-item-inner">
            <h3>Miércoles</h3>
            <p>13:00 - 16:00</p>
            <p>20:00 - 23:30</p>
          </div>
          </div>
          <div className="schedule-item card-3d">
            <div className="schedule-item-inner">
            <h3>Jueves</h3>
            <p>13:00 - 16:00</p>
            <p>20:00 - 23:30</p>
          </div>
          </div>
          <div className="schedule-item card-3d">
            <div className="schedule-item-inner">
            <h3>Viernes</h3>
            <p>13:00 - 16:30</p>
            <p>20:00 - 23:45</p>
          </div>
          </div>
          <div className="schedule-item card-3d">
            <div className="schedule-item-inner">
            <h3>Sábado</h3>
            <p>13:00 - 16:30</p>
            <p>20:00 - 23:30</p>
          </div>
          </div>
          <div className="schedule-item card-3d">
            <div className="schedule-item-inner">
            <h3>Domingo</h3>
            <p>13:00 - 16:30</p>
            </div>
          </div>
          <div className="schedule-item schedule-item-closed card-3d">
            <div className="schedule-item-inner">
            <h3>Lunes</h3>
            <p>Cerrado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-section animate-on-scroll">
        <h2 className="section-title floating-title">Ubicación</h2>
        <div className="location-container">
          <div className="location-info">
            <div className="address-info location-card">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon pulse-icon" />
              <div className="location-text">
            <p>C. Martínez Campos, 23, bajo</p>
            <p>18002 Granada, España</p>
          </div>
            </div>
            <div className="location-details location-card">
              <div className="location-text">
            <p><strong>Zona:</strong> Figares</p>
            <p><strong>Parking:</strong> Aparcamiento en la calle</p>
          </div>
            </div>
            <div className="phone-info location-card">
              <FontAwesomeIcon icon={faPhone} className="location-icon pulse-icon" />
              <div className="location-text">
                <a href="tel:+34653733111" className="phone-link">+34 653 73 31 11</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="video-curtain animate-on-scroll">
          <div className="curtain-left"></div>
          <div className="curtain-right"></div>
          <div className="map-container glow-effect">
          <iframe
            title="Ubicación El Nopal"
            width="100%"
              height="450"
            frameBorder="0"
            style={{ border: 0 }}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3178.4677898363145!2d-3.6012799!3d37.1725799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd71fcb96d75cd45%3A0x41e5f89c3c7b357d!2sC.%20Mart%C3%ADnez%20Campos%2C%2023%2C%2018002%20Granada!5e0!3m2!1ses!2ses!4v1709925433793!5m2!1ses!2ses"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          </div>
        </div>
        
        <div className="mexican-stamps animate-on-scroll">
          <div className="stamp teal">
            <div className="stamp-snowflake"></div>
          </div>
          <div className="stamp red">
            <div className="stamp-star"></div>
          </div>
          <div className="stamp yellow">
            <div className="stamp-snowflake"></div>
          </div>
          <div className="stamp green">
            <div className="stamp-star"></div>
          </div>
          <div className="stamp teal">
            <div className="stamp-snowflake"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo; 