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
        if (value.trim().length < 5) return 'El asunto debe tener al menos 5 caracteres';
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
      // Simular envío del formulario
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      }, 3000);
      
    } catch (err) {
      setErrors({ submit: 'Error al enviar el mensaje. Inténtalo de nuevo.' });
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
    <div className="container section" id="contact-form">
      <div className="card elevation-2">
        <div className="card-header text-center">
          <h2 className="gradient-text">Contáctanos</h2>
          <p>¿Tienes alguna pregunta? Estamos aquí para ayudarte</p>
        </div>
        
        <div className="card-body">
          {success && (
            <div className="alert alert-success">
              <FontAwesomeIcon icon={faCheckCircle} />
              ¡Mensaje enviado correctamente! Te contactaremos pronto.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="alert alert-error">
                <FontAwesomeIcon icon={faExclamationCircle} />
                {errors.submit}
              </div>
            )}

            {/* Información personal */}
            <div style={{marginBottom: 'var(--spacing-xl)'}}>
              <h3 style={{color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)'}}>
                Información de Contacto
              </h3>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label required">
                  <FontAwesomeIcon icon={faUser} /> Nombre completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? 'error' : touched.name && !errors.name ? 'success' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tu nombre completo"
                  disabled={loading || success}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)'}}>
                <div className="form-group">
                  <label htmlFor="email" className="form-label required">
                    <FontAwesomeIcon icon={faEnvelope} /> Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? 'error' : touched.email && !errors.email ? 'success' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="tu@email.com"
                    disabled={loading || success}
                  />
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    <FontAwesomeIcon icon={faPhone} /> Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-control ${errors.phone ? 'error' : touched.phone && !errors.phone && formData.phone ? 'success' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+34 123 456 789"
                    disabled={loading || success}
                  />
                  {errors.phone && <div className="form-error">{errors.phone}</div>}
                </div>
              </div>
            </div>

            {/* Mensaje */}
            <div style={{marginBottom: 'var(--spacing-xl)'}}>
              <h3 style={{color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)'}}>
                Tu Mensaje
              </h3>
              
              <div className="form-group">
                <label htmlFor="subject" className="form-label required">
                  <FontAwesomeIcon icon={faComment} /> Asunto
                </label>
                <select
                  id="subject"
                  name="subject"
                  className={`form-control form-select ${errors.subject ? 'error' : touched.subject && !errors.subject ? 'success' : ''}`}
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
                {errors.subject && <div className="form-error">{errors.subject}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label required">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  className={`form-control form-textarea ${errors.message ? 'error' : touched.message && !errors.message ? 'success' : ''}`}
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Escribe tu mensaje aquí..."
                  rows="6"
                  maxLength="1000"
                  disabled={loading || success}
                />
                <div style={{fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)'}}>
                  {formData.message.length}/1000 caracteres
                </div>
                {errors.message && <div className="form-error">{errors.message}</div>}
              </div>
            </div>

            {/* Información adicional */}
            <div className="mexican-highlight" style={{marginBottom: 'var(--spacing-lg)'}}>
              <h4>💡 Información útil</h4>
              <ul style={{marginBottom: 0, paddingLeft: 'var(--spacing-lg)'}}>
                <li>Respondemos en un plazo máximo de 24 horas</li>
                <li>Para reservas urgentes, llama al +34 653 73 31 11</li>
                <li>También puedes visitarnos en C. Martínez Campos, 23, Granada</li>
              </ul>
            </div>

            {/* Botón de envío */}
            <div style={{textAlign: 'center'}}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || success || Object.keys(validateForm()).length > 0}
                style={{minWidth: '200px'}}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{marginRight: 'var(--spacing-sm)'}}></div>
                    Enviando...
                  </>
                ) : success ? (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    ¡Enviado!
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm; 