import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faComment,
  faPaperPlane,
  faCheckCircle,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import '../styles/contact-form.css';
import { sendContactMessage } from '../services/contactService';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validaciones
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        return '';
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return 'El email es requerido';
        if (!emailRegex.test(value)) return 'Email inválido';
        return '';
        
      case 'phone':
        const phoneRegex = /^[+]?[\d\s\-()]{9,15}$/;
        if (value && !phoneRegex.test(value.replace(/\s/g, ''))) return 'Teléfono inválido';
        return '';
        
      case 'subject':
        if (!value.trim()) return 'El asunto es requerido';
        // No validar longitud para opciones predefinidas del dropdown
        return '';
        
      case 'message':
        if (!value.trim()) return 'El mensaje es requerido';
        if (value.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres';
        return '';
        
      default:
        return '';
    }
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar campo en tiempo real si ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Manejar blur (cuando se sale del campo)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Validar formulario completo
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['name', 'email', 'subject', 'message'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Validar teléfono si está presente
    if (formData.phone) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    return newErrors;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(formData).forEach(key => allTouched[key] = true);
    setTouched(allTouched);
    
    // Validar formulario
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }
    
    try {
      // Enviar el formulario usando la API real
      const result = await sendContactMessage(formData);
      
      if (result.success) {
      setSuccess(true);
      setLoading(false);
      
      // Reset del formulario después del éxito
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setErrors({});
        setTouched({});
        setSuccess(false);
        }, 5000); // Aumentado a 5 segundos para que el usuario vea el mensaje
      } else {
        throw new Error('Error al enviar el mensaje');
      }
      
    } catch (err) {
      console.error('Error enviando formulario de contacto:', err);
      setErrors({ submit: err.message || 'Error al enviar el mensaje. Inténtalo de nuevo.' });
      setLoading(false);
    }
  };

  // Opciones de asunto predefinidas
  const subjectOptions = [
    'Consulta general',
    'Reserva de mesa',
    'Eventos privados',
    'Catering',
    'Quejas y sugerencias',
    'Trabajo',
    'Información nutricional',
    'Otro'
  ];

  return (
    <div className="contact-form-container">
      <div className="contact-form-card">
        <div className="contact-form-header">
          <h2 className="contact-form-title">Contáctanos</h2>
          <p className="contact-form-subtitle">¿Tienes alguna pregunta? Estamos aquí para ayudarte</p>
        </div>
        
          {success && (
          <div className="form-status-message success">
              <FontAwesomeIcon icon={faCheckCircle} />
              ¡Mensaje enviado correctamente! Te contactaremos pronto.
          </div>
          )}

        <form className="contact-form" onSubmit={handleSubmit}>
            {errors.submit && (
            <div className="form-status-message error">
                <FontAwesomeIcon icon={faExclamationCircle} />
                {errors.submit}
        </div>
            )}

            {/* Información personal */}
          <div className="form-group full">
                <label htmlFor="name" className="form-label required">
                  Nombre completo
                </label>
            <div className="form-group with-icon">
          <input
            type="text"
                  id="name"
                  name="name"
                className={`form-input ${errors.name ? 'error' : touched.name && !errors.name ? 'success' : ''}`}
                  value={formData.name}
            onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tu nombre completo"
                  disabled={loading || success}
                />
              <FontAwesomeIcon icon={faUser} className="form-icon" />
            </div>
            {errors.name && <div className="form-error-message">{errors.name}</div>}
        </div>

          <div className="form-group half">
                  <label htmlFor="email" className="form-label required">
                    Email
                  </label>
            <div className="form-group with-icon">
          <input
            type="email"
            id="email"
            name="email"
                className={`form-input ${errors.email ? 'error' : touched.email && !errors.email ? 'success' : ''}`}
            value={formData.email}
            onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="tu@email.com"
                    disabled={loading || success}
                  />
              <FontAwesomeIcon icon={faEnvelope} className="form-icon" />
            </div>
            {errors.email && <div className="form-error-message">{errors.email}</div>}
        </div>
        
          <div className="form-group half">
                  <label htmlFor="phone" className="form-label">
                    Teléfono (opcional)
                  </label>
            <div className="form-group with-icon">
          <input
                    type="tel"
                    id="phone"
                    name="phone"
                className={`form-input ${errors.phone ? 'error' : touched.phone && !errors.phone && formData.phone ? 'success' : ''}`}
                    value={formData.phone}
            onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+34 123 456 789"
                    disabled={loading || success}
                  />
              <FontAwesomeIcon icon={faPhone} className="form-icon" />
            </div>
            {errors.phone && <div className="form-error-message">{errors.phone}</div>}
          </div>
              
          <div className="form-group full">
                <label htmlFor="subject" className="form-label required">
                  Asunto
                </label>
                <select
                  id="subject"
                  name="subject"
              className={`form-select ${errors.subject ? 'error' : touched.subject && !errors.subject ? 'success' : ''}`}
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading || success}
                >
                  <option value="">Selecciona un asunto</option>
                  {subjectOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
            {errors.subject && <div className="form-error-message">{errors.subject}</div>}
        </div>

          <div className="form-group full">
                <label htmlFor="message" className="form-label required">
                  Mensaje
                </label>
          <textarea
                  id="message"
                  name="message"
              className={`form-textarea ${errors.message ? 'error' : touched.message && !errors.message ? 'success' : ''}`}
                  value={formData.message}
            onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Escribe tu mensaje aquí..."
                  rows="6"
                  maxLength="1000"
                  disabled={loading || success}
                />
            <div className="character-count">
                  {formData.message.length}/1000 caracteres
                </div>
            {errors.message && <div className="form-error-message">{errors.message}</div>}
            </div>

            {/* Información adicional */}
          <div className="contact-form-info">
              <h4>💡 Información útil</h4>
            <p>• Respondemos en un plazo máximo de 24 horas</p>
            <p>• Para reservas urgentes, llama al +34 653 73 31 11</p>
            <p>• También puedes visitarnos en C. Martínez Campos, 23, Granada</p>
        </div>

            {/* Botón de envío */}
              <button
                type="submit"
            className={`form-submit-button ${loading ? 'loading' : ''}`}
                disabled={loading || success || Object.keys(validateForm()).length > 0}
              >
                {loading ? (
                  <>
                <FontAwesomeIcon icon={faPaperPlane} className="form-submit-icon" />
                    Enviando...
                  </>
                ) : success ? (
                  <>
                <FontAwesomeIcon icon={faCheckCircle} className="form-submit-icon" />
                    ¡Enviado!
                  </>
                ) : (
                  <>
                <FontAwesomeIcon icon={faPaperPlane} className="form-submit-icon" />
                    Enviar Mensaje
                  </>
                )}
          </button>

          <div className="privacy-notice">
            <small>
              Al enviar este formulario aceptas nuestra <a href="#privacy">Política de Privacidad</a> y el tratamiento de tus datos personales.
            </small>
        </div>
      </form>
      </div>
    </div>
  );
};

export default ContactForm; 