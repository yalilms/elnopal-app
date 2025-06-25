import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faCalendarAlt, 
  faClock, 
  faUsers, 
  faCheckCircle,
  faTimes,
  faCheck,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

import { createReservation } from '../../services/reservationService';

// Obtener horarios disponibles por día
const getTimeSlotsForDay = (date) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  
  // Lunes cerrado
  if (dayOfWeek === 1) {
    return [];
  }
  
  const timeSlots = [];
  
  // Horarios de comida (13:00-16:00)
  for (let hour = 13; hour <= 15; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      if (hour === 15 && minutes > 30) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }
  
  // Horarios de cena (20:00-23:30) - No domingo
  if (dayOfWeek !== 0) {
    for (let hour = 20; hour <= 23; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        if (hour === 23 && minutes > 30) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        timeSlots.push(timeString);
      }
    }
  }
  
  return timeSlots;
};

const ReservationForm = () => {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    partySize: '',
    specialRequests: '',
    needsBabyCart: false,
    needsWheelchair: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmedDetails, setConfirmedDetails] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

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
        if (!value.trim()) return 'El teléfono es requerido';
        if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Teléfono inválido';
        return '';
        
      case 'date':
        if (!value) return 'La fecha es requerida';
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'La fecha no puede ser anterior a hoy';
        return '';
        
      case 'time':
        if (!value) return 'La hora es requerida';
        return '';
        
      case 'partySize':
        const size = parseInt(value);
        if (!value) return 'El número de personas es requerido';
        if (size < 1 || size > 12) return 'Entre 1 y 12 personas';
        return '';
        
      default:
        return '';
    }
  };

  // Actualizar horarios disponibles cuando cambia la fecha
  useEffect(() => {
    if (formData.date) {
      const slots = getTimeSlotsForDay(formData.date);
      setAvailableTimeSlots(slots);
      
      // Si la hora seleccionada ya no está disponible, limpiarla
      if (formData.time && !slots.includes(formData.time)) {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [formData.date]);
  
  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Validar campo en tiempo real
    if (touched[name]) {
      const error = validateField(name, fieldValue);
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
    Object.keys(formData).forEach(key => {
      if (['name', 'email', 'phone', 'date', 'time', 'partySize'].includes(key)) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
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
              const result = await createReservation(formData);
      setConfirmedDetails({ 
        date: formData.date, 
        time: formData.time,
        partySize: formData.partySize,
        name: formData.name
      });
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setErrors({ submit: err.message || 'Error al realizar la reserva' });
      setLoading(false);
    }
  };

  // Reset del formulario
  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', date: '', time: '', 
      partySize: '', specialRequests: '', needsBabyCart: false, needsWheelchair: false
    });
    setErrors({});
    setTouched({});
    setSuccess(false);
    setConfirmedDetails(null);
  };

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Pantalla de éxito
  if (success && confirmedDetails) {
    return (
      <div className="container section">
        <div className="card elevation-3 text-center">
          <div className="card-body">
            <FontAwesomeIcon 
              icon={faCheckCircle} 
              style={{
                fontSize: '4rem', 
                marginBottom: '1.5rem',
                color: 'var(--color-success)'
              }} 
            />
            <h2 className="gradient-text">¡Reserva Confirmada!</h2>
            <div className="mexican-divider"></div>
            
            <div className="mexican-highlight">
              <h3>Detalles de su Reserva:</h3>
              <div style={{marginTop: 'var(--spacing-md)'}}>
                <p><strong>Nombre:</strong> {confirmedDetails.name}</p>
                <p><strong>Fecha:</strong> {new Date(confirmedDetails.date + 'T00:00:00').toLocaleDateString('es-ES', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}</p>
                <p><strong>Hora:</strong> {confirmedDetails.time}</p>
                <p><strong>Personas:</strong> {confirmedDetails.partySize}</p>
              </div>
              
              {(formData.needsBabyCart || formData.needsWheelchair) && (
                <div style={{marginTop: 'var(--spacing-md)'}}>
                  <h4>Necesidades especiales:</h4>
                  {formData.needsBabyCart && <p>🍼 Carrito de bebé</p>}
                  {formData.needsWheelchair && <p>♿ Silla de ruedas</p>}
              </div>
            )}
          </div>
            
            <p>Hemos enviado un correo electrónico con los detalles de su reserva.</p>
            
            <div style={{display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)', justifyContent: 'center', flexWrap: 'wrap'}}>
            <button 
                className="btn btn-primary"
                onClick={resetForm}
            >
              Hacer otra reserva
            </button>
            <button 
                className="btn btn-outline"
                onClick={() => navigate('/')}
            >
              Volver al Inicio
            </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="card elevation-2">
        <div className="card-header text-center">
          <h2 className="gradient-text">Reserva tu Mesa</h2>
          <p>Disfruta de la auténtica experiencia mexicana en El Nopal</p>
        </div>
        
        <div className="card-body">
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
                Información Personal
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
              />
                  {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label required">
                    <FontAwesomeIcon icon={faPhone} /> Teléfono
            </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                    className={`form-control ${errors.phone ? 'error' : touched.phone && !errors.phone ? 'success' : ''}`}
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="+34 123 456 789"
              />
                  {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>
          </div>
        </div>

            {/* Detalles de la reserva */}
            <div style={{marginBottom: 'var(--spacing-xl)'}}>
              <h3 style={{color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)'}}>
                Detalles de la Reserva
              </h3>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)'}}>
                <div className="form-group">
                  <label htmlFor="date" className="form-label required">
                    <FontAwesomeIcon icon={faCalendarAlt} /> Fecha
            </label>
              <input
                type="date"
                id="date"
                name="date"
                    className={`form-control ${errors.date ? 'error' : touched.date && !errors.date ? 'success' : ''}`}
                value={formData.date}
                onChange={handleChange}
                onBlur={handleBlur}
                    min={getMinDate()}
                  />
                  {errors.date && <div className="form-error">{errors.date}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="time" className="form-label required">
                    <FontAwesomeIcon icon={faClock} /> Hora
                  </label>
                  <select
                    id="time"
                    name="time"
                    className={`form-control form-select ${errors.time ? 'error' : touched.time && !errors.time ? 'success' : ''}`}
                    value={formData.time}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!formData.date}
                  >
                    <option value="">Selecciona una hora</option>
                    {availableTimeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  {errors.time && <div className="form-error">{errors.time}</div>}
                  {availableTimeSlots.length === 0 && formData.date && (
                    <div className="form-error">No hay horarios disponibles para esta fecha</div>
                  )}
        </div>

                <div className="form-group">
                  <label htmlFor="partySize" className="form-label required">
                    <FontAwesomeIcon icon={faUsers} /> Número de personas
            </label>
              <select
                id="partySize"
                name="partySize"
                    className={`form-control form-select ${errors.partySize ? 'error' : touched.partySize && !errors.partySize ? 'success' : ''}`}
                value={formData.partySize}
                onChange={handleChange}
                onBlur={handleBlur}
                  >
                    <option value="">Selecciona</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'persona' : 'personas'}
                      </option>
                    ))}
              </select>
                  {errors.partySize && <div className="form-error">{errors.partySize}</div>}
            </div>
          </div>
        </div>

            {/* Preferencias adicionales */}
            <div style={{marginBottom: 'var(--spacing-xl)'}}>
              <h3 style={{color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)'}}>
                Preferencias Adicionales
              </h3>
              
              <div className="form-group">
                <label htmlFor="specialRequests" className="form-label">
            Peticiones especiales
          </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
                  className="form-control form-textarea"
              value={formData.specialRequests}
              onChange={handleChange}
                  placeholder="Alergias, preferencias de mesa, celebraciones especiales..."
                  rows="4"
              maxLength="500"
            />
                <div style={{fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)'}}>
                  {formData.specialRequests.length}/500 caracteres
          </div>
        </div>

              <div className="form-group">
                <label className="form-label">Necesidades de accesibilidad</label>
                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)'}}>
                  <label className="form-checkbox">
              <input
                type="checkbox"
                name="needsBabyCart"
                checked={formData.needsBabyCart}
                onChange={handleChange}
              />
                    <span>🍼 Necesito espacio para carrito de bebé</span>
              </label>
                  
                  <label className="form-checkbox">
              <input
                type="checkbox"
                name="needsWheelchair"
                checked={formData.needsWheelchair}
                onChange={handleChange}
              />
                    <span>♿ Necesito acceso para silla de ruedas</span>
              </label>
            </div>
          </div>
        </div>

            {/* Botón de envío */}
            <div style={{textAlign: 'center'}}>
          <button
            type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading || Object.keys(validateForm()).length > 0}
          >
            {loading ? (
              <>
                    <div className="spinner" style={{marginRight: 'var(--spacing-sm)'}}></div>
                Procesando reserva...
              </>
            ) : (
              <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                Confirmar Reserva
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

export default ReservationForm;