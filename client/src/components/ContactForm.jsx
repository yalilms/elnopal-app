import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faClock, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

// Configurar base URL para desarrollo y producción
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://elnopal.es' // En producción, usar HTTPS del dominio principal (nginx manejará el proxy)
  : 'http://localhost:5000'; // En desarrollo, puerto del backend

// Estilos CSS completos para el formulario de contacto
const contactFormStyles = `
  .contact-form-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, #fff8e1 0%, #ffffff 100%);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(214, 40, 40, 0.1);
    position: relative;
    overflow: hidden;
  }

  .contact-form-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="contactPattern" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 0h60v60H0z" fill="none"/><circle cx="30" cy="30" r="1.5" fill="%23D62828" opacity="0.05"/></pattern></defs><rect width="60" height="60" fill="url(%23contactPattern)"/></svg>');
    pointer-events: none;
    z-index: 0;
  }

  .contact-form-container > * {
    position: relative;
    z-index: 1;
  }

  .contact-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .contact-header .section-title {
    font-size: clamp(2rem, 5vw, 3rem);
    color: #D62828;
    margin-bottom: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    position: relative;
  }

  .contact-header .section-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #D62828, #F8B612);
    border-radius: 2px;
  }

  .form-subtitle {
    font-size: 1.1rem;
    color: #666;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }

  .contact-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .contact-info-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(214, 40, 40, 0.1);
    transition: all 0.3s ease;
    transform: translateY(0);
  }

  .contact-info-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(214, 40, 40, 0.15);
    border-color: rgba(214, 40, 40, 0.2);
  }

  .contact-icon {
    color: #D62828;
    font-size: 1.5rem;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    margin-top: 0.2rem;
  }

  .contact-info-item h3 {
    color: #333;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .contact-info-item p {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0;
  }

  .contact-link {
    color: #D62828;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .contact-link:hover {
    color: #B71C1C;
    text-decoration: underline;
  }

  .contact-form {
    background: rgba(255, 255, 255, 0.95);
    padding: 2.5rem;
    border-radius: 20px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(214, 40, 40, 0.1);
    backdrop-filter: blur(10px);
    margin-top: 2rem;
  }

  .form-group {
    margin-bottom: 2rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.7rem;
    color: #333;
    font-weight: 600;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-group label.required::after {
    content: ' *';
    color: #D62828;
    font-weight: 700;
  }

  .form-field {
    width: 100%;
    padding: 1rem 1.2rem;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 1rem;
    color: #333;
    background: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
  }

  .form-field:focus {
    outline: none;
    border-color: #D62828;
    box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.1);
    background: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
  }

  .form-field:hover {
    border-color: #ccc;
  }

  .form-field::placeholder {
    color: #999;
    font-style: italic;
  }

  textarea.form-field {
    min-height: 120px;
    resize: vertical;
    font-family: inherit;
  }

  .form-actions {
    text-align: center;
    margin-top: 2rem;
  }

  .btn {
    background: linear-gradient(135deg, #D62828, #ad1457);
    color: white;
    border: none;
    padding: 1rem 2.5rem;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 8px 25px rgba(214, 40, 40, 0.3);
    position: relative;
    overflow: hidden;
  }

  .btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .btn:hover::before {
    left: 100%;
  }

  .btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(214, 40, 40, 0.4);
    background: linear-gradient(135deg, #B71C1C, #880E4F);
  }

  .btn:active {
    transform: translateY(-1px);
  }

  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .send-icon {
    font-size: 1rem;
    transition: transform 0.3s ease;
  }

  .btn:hover .send-icon {
    transform: translateX(3px);
  }

  .mexican-decorations {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .decoration-item {
    position: absolute;
    width: 60px;
    height: 60px;
    background: linear-gradient(45deg, #F8B612, #FFD700);
    border-radius: 50%;
    opacity: 0.1;
  }

  .decoration-item.left {
    top: 20%;
    left: -30px;
    animation: float 6s ease-in-out infinite;
  }

  .decoration-item.right {
    bottom: 20%;
    right: -30px;
    animation: float 6s ease-in-out infinite reverse;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }

  /* Responsive Design */
  @media (max-width: 992px) {
    .contact-form-container {
      padding: 2rem 1.5rem;
    }

    .contact-info {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .contact-form {
      padding: 2rem;
    }

    .contact-header .section-title {
      font-size: 2.2rem;
    }
  }

  @media (max-width: 768px) {
    .contact-form-container {
      padding: 1.5rem 1rem;
      border-radius: 15px;
    }

    .contact-info {
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .contact-info-item {
      padding: 1.2rem;
      flex-direction: column;
      text-align: center;
      gap: 0.8rem;
    }

    .contact-icon {
      font-size: 2rem;
      margin-top: 0;
    }

    .contact-form {
      padding: 1.5rem;
      border-radius: 15px;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-field {
      padding: 0.9rem 1rem;
      font-size: 16px; /* Prevent zoom on iOS */
    }

    .btn {
      padding: 0.9rem 2rem;
      font-size: 1rem;
      width: 100%;
      justify-content: center;
    }

    .contact-header .section-title {
      font-size: 1.8rem;
    }
  }

  @media (max-width: 480px) {
    .contact-form-container {
      padding: 1rem 0.8rem;
    }

    .contact-info-item {
      padding: 1rem;
    }

    .contact-form {
      padding: 1.2rem;
    }

    .form-field {
      padding: 0.8rem;
    }

    .btn {
      padding: 0.8rem 1.5rem;
      font-size: 0.9rem;
    }

    .contact-header .section-title {
      font-size: 1.6rem;
    }

    .form-subtitle {
      font-size: 1rem;
    }
  }

  @media (max-width: 360px) {
    .contact-form-container {
      padding: 0.8rem 0.6rem;
    }

    .contact-header .section-title {
      font-size: 1.4rem;
    }

    .contact-info-item h3 {
      font-size: 1rem;
    }

    .contact-info-item p {
      font-size: 0.9rem;
    }
  }

  /* Animations */
  .contact-form-container.animate-in {
    animation: slideInUp 0.8s ease-out;
  }

  .contact-form.form-animate {
    animation: fadeInScale 0.6s ease-out 0.3s both;
  }

  .contact-info-item {
    animation: fadeInUp 0.6s ease-out both;
  }

  .contact-info-item:nth-child(1) { animation-delay: 0.1s; }
  .contact-info-item:nth-child(2) { animation-delay: 0.2s; }
  .contact-info-item:nth-child(3) { animation-delay: 0.3s; }
  .contact-info-item:nth-child(4) { animation-delay: 0.4s; }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Form submission animation */
  .contact-form.form-submitted {
    animation: submitPulse 1s ease-in-out;
  }

  @keyframes submitPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
`;

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  
  const [animateForm, setAnimateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Inyectar estilos CSS
    if (!document.getElementById('contact-form-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'contact-form-styles';
      styleSheet.textContent = contactFormStyles;
      document.head.appendChild(styleSheet);
    }

    // Efecto para las animaciones al hacer scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            
            // Para el formulario activamos la animación con un delay
            if (entry.target.classList.contains('contact-form-container')) {
              setTimeout(() => setAnimateForm(true), 300);
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    
    // Observar elementos para animar
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    setTimeout(() => setAnimateForm(true), 1000);
    
    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Animación de envío
      e.target.classList.add('form-submitted');
      
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.nombre,
          email: formData.email,
          subject: formData.asunto,
          message: formData.mensaje
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar el mensaje');
      }
      
      const data = await response.json();
      
      // Éxito
      setTimeout(() => {
        alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
        setFormData({
          nombre: '',
          email: '',
          asunto: '',
          mensaje: ''
        });
        e.target.classList.remove('form-submitted');
      }, 1000);
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setTimeout(() => {
        alert('Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo o contáctanos directamente.');
        e.target.classList.remove('form-submitted');
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-container animate-on-scroll">
      <div className="contact-header">
        <h2 className="section-title floating-title">Contáctanos</h2>
        <p className="form-subtitle">Estamos encantados de atender tus consultas y comentarios</p>
      </div>

      <div className="contact-info">
        <div className="contact-info-item" data-delay="100">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon pulse-icon" />
          <div>
            <h3>Dirección</h3>
            <p>C. Martínez Campos, 23, bajo, 18002 Granada España</p>
          </div>
        </div>
        <div className="contact-info-item" data-delay="200">
          <FontAwesomeIcon icon={faPhone} className="contact-icon pulse-icon" />
          <div>
            <h3>Teléfono</h3>
            <p><a href="tel:+34653733111" className="contact-link">+34 653 73 31 11</a></p>
          </div>
        </div>
        <div className="contact-info-item" data-delay="300">
          <FontAwesomeIcon icon={faEnvelope} className="contact-icon pulse-icon" />
          <div>
            <h3>Email</h3>
            <p><a href="mailto:reservas@elnopal.es" className="contact-link">reservas@elnopal.es</a></p>
          </div>
        </div>
        <div className="contact-info-item" data-delay="400">
          <FontAwesomeIcon icon={faClock} className="contact-icon pulse-icon" />
          <div>
            <h3>Horario</h3>
            <p>Mar-Jue: 13:00-16:00, 20:00-23:30</p>
            <p>Vie-Sáb: 13:00-16:30, 20:00-23:45 (Sáb hasta 23:30)</p>
            <p>Domingo: 13:00-16:30</p>
            <p>Lunes: Cerrado</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`contact-form ${animateForm ? 'form-animate' : ''}`}>
        <div className="form-group">
          <label htmlFor="nombre" className="required">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="form-field"
            placeholder="Tu nombre"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="required">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-field"
            placeholder="Tu correo electrónico"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="asunto">Asunto</label>
          <input
            type="text"
            id="asunto"
            name="asunto"
            value={formData.asunto}
            onChange={handleChange}
            className="form-field"
            placeholder="Tema de tu mensaje"
          />
        </div>

        <div className="form-group">
          <label htmlFor="mensaje" className="required">Mensaje</label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            required
            className="form-field"
            placeholder="¿En qué podemos ayudarte?"
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}</span>
            <FontAwesomeIcon icon={faPaperPlane} className="send-icon" />
          </button>
        </div>
      </form>
      
      <div className="mexican-decorations">
        <div className="decoration-item left"></div>
        <div className="decoration-item right"></div>
      </div>
    </div>
  );
};

export default ContactForm; 