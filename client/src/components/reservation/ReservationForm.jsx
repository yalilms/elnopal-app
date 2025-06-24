import React, { useState, useEffect } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { useHistory } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaCheck, FaTimes } from 'react-icons/fa';
import { handleHashScroll } from '../../utils/scrollUtils';

// Función para obtener slots de tiempo (movida aquí desde tablesData eliminado)
const getTimeSlotsForDay = (date) => {
  // Slots básicos para todos los días
  const baseSlots = [
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
  ];
  
  const dayOfWeek = new Date(date).getDay();
  
  // Domingo (0) - Solo comida
  if (dayOfWeek === 0) {
    return ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
  }
  
  // Lunes (1) - Cerrado
  if (dayOfWeek === 1) {
    return [];
  }
  
  // Martes a Jueves (2-4) - Horario normal
  if (dayOfWeek >= 2 && dayOfWeek <= 4) {
    return baseSlots;
  }
  
  // Viernes y Sábado (5-6) - Horario extendido
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    return [
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
      '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
    ];
  }
  
  return baseSlots;
};

// Estilos inline para asegurar visibilidad (solo los utilizados)
const inputStyle = {
  width: '100%',
  padding: '0.9rem',
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
  fontSize: '1rem',
  color: '#421f16',
  backgroundColor: 'white'
};

const errorMessageStyle = {
  color: '#D62828',
  backgroundColor: 'rgba(214, 40, 40, 0.1)',
  padding: '0.8rem 1rem',
  borderRadius: '8px',
  marginBottom: '1.5rem',
  fontSize: '0.95rem',
  display: 'flex',
  alignItems: 'center'
};

const ReservationForm = () => {
  const { makeReservation } = useReservation();
  const history = useHistory();
  
  // Estado del formulario
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [assignedTable, setAssignedTable] = useState(null);
  const [confirmedDetails, setConfirmedDetails] = useState(null);
  const [availableSlotsForDate, setAvailableSlotsForDate] = useState([]);
  
  // Nuevos estados para validación en tiempo real
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Función para validar campos individuales
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 50) {
          error = 'El nombre no puede tener más de 50 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
          error = 'El nombre solo puede contener letras y espacios';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          error = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Introduce un email válido (ejemplo@correo.com)';
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          error = 'El teléfono es obligatorio';
        } else if (!/^[+]?[\d\s-()]{9,15}$/.test(value.replace(/\s/g, ''))) {
          error = 'Introduce un teléfono válido (mínimo 9 dígitos)';
        }
        break;
        
      case 'date':
        if (!value) {
          error = 'La fecha es obligatoria';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            error = 'No se pueden hacer reservas para fechas pasadas';
          } else if (selectedDate.getDay() === 1) {
            error = 'Los lunes el restaurante permanece cerrado';
          }
        }
        break;
        
      case 'time':
        if (!value) {
          error = 'La hora es obligatoria';
        } else if (formData.date && !isValidReservationTime(formData.date, value)) {
          error = 'La reserva debe realizarse con al menos 30 minutos de anticipación';
        }
        break;
        
      case 'partySize':
        if (!value) {
          error = 'El número de personas es obligatorio';
        } else if (parseInt(value) > 8) {
          error = 'Para grupos de más de 8 personas, contacta directamente';
        }
        break;
        
      case 'specialRequests':
        if (value && value.length > 500) {
          error = 'Las peticiones especiales no pueden tener más de 500 caracteres';
        }
        break;
    }
    
    return error;
  };
  
  // Validar formulario completo
  const validateFormComplete = () => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'specialRequests' && key !== 'needsBabyCart' && key !== 'needsWheelchair') {
        const error = validateField(key, formData[key]);
        if (error) errors[key] = error;
      }
    });
    
    setFieldErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };
  
  // Manejar scroll automático al cargar la página con hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      handleHashScroll(hash);
    }
  }, []);
  
  // Validar formulario cuando cambie formData
  useEffect(() => {
    const isValid = validateFormComplete();
    setIsFormValid(isValid);
  }, [formData]);
  
  // Función para validar que la reserva sea al menos 30 minutos antes
  const isValidReservationTime = (selectedDate, selectedTime) => {
    if (!selectedDate || !selectedTime) return true;
    
    const now = new Date();
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const reservationTime = new Date(selectedDate);
    reservationTime.setHours(hours, minutes, 0, 0);
    
    const diffInMinutes = (reservationTime - now) / (1000 * 60);
    return diffInMinutes >= 30;
  };
  
  // Efecto para actualizar los slots cuando cambia la fecha
  useEffect(() => {
    if (formData.date) {
      const slots = getTimeSlotsForDay(formData.date);
      
      // Si la fecha es hoy, filtrar las horas que son menos de 30 minutos en el futuro
      const now = new Date();
      const filteredSlots = slots.filter(slot => {
        const [hours, minutes] = slot.split(':').map(Number);
        const slotTime = new Date(formData.date);
        slotTime.setHours(hours, minutes, 0, 0);
        return (slotTime - now) >= (30 * 60 * 1000); // 30 minutos en milisegundos
      });
      
      setAvailableSlotsForDate(filteredSlots);
      
      // Si la hora seleccionada ya no está en los slots filtrados, resetearla
      if (!filteredSlots.includes(formData.time)) {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    } else {
      setAvailableSlotsForDate([]);
    }
  }, [formData.date, formData.time]);
  
  // Manejar cuando un campo pierde el foco
  const handleBlur = (e) => {
    const { name } = e.target;
    setFieldTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, formData[name]);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };
  
  // Manejar cambios en el formulario con validación en tiempo real
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Actualizar datos del formulario
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Limpiar error general
    setError(null);
    
    // Si el campo ya fue tocado, validar en tiempo real
    if (fieldTouched[name]) {
      const fieldError = validateField(name, newValue);
      setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    }
    
    // Validaciones especiales
    if (name === 'partySize' && parseInt(value, 10) > 8) {
      setTimeout(() => {
        if (window.confirm('Para grupos de más de 8 personas necesitamos contacto directo. ¿Quieres ir al formulario de contacto?')) {
          history.push('/contacto');
        }
      }, 100);
      return;
    }
  };
  
  // Función para obtener el estilo del campo según su estado
  const getFieldStyle = (fieldName) => {
    const hasError = fieldTouched[fieldName] && fieldErrors[fieldName];
    const isValid = fieldTouched[fieldName] && !fieldErrors[fieldName] && formData[fieldName];
    
    let borderColor = '#e0e0e0';
    if (hasError) borderColor = '#D62828';
    else if (isValid) borderColor = '#28a745';
    
    return {
      ...inputStyle,
      borderColor,
      boxShadow: hasError ? '0 0 0 2px rgba(214, 40, 40, 0.1)' : 
                  isValid ? '0 0 0 2px rgba(40, 167, 69, 0.1)' : 'none',
      transition: 'all 0.3s ease'
    };
  };
  
  // Renderizar indicador de campo
  const renderFieldIndicator = (fieldName) => {
    if (!fieldTouched[fieldName]) return null;
    
    if (fieldErrors[fieldName]) {
      return <FaTimes className="field-error-icon" />;
    } else {
      return <FaCheck className="field-success-icon" />;
    }
  };
  
  // Renderizar mensaje de error para un campo
  const renderFieldError = (fieldName) => {
    if (!fieldErrors[fieldName] || !fieldTouched[fieldName]) return null;
    
    return (
      <div className="field-error-message">
        <FaExclamationCircle className="error-icon" />
        <span>{fieldErrors[fieldName]}</span>
      </div>
    );
  };
  
  // Renderizar contador de caracteres
  const renderCharCounter = (fieldName, maxLength) => {
    const currentLength = formData[fieldName]?.length || 0;
    const isNearLimit = currentLength > maxLength * 0.8;
    
    return (
      <div className={`char-counter ${isNearLimit ? 'near-limit' : ''}`}>
        <span>{currentLength}/{maxLength}</span>
      </div>
    );
  };
  
  // Validar el formulario para el botón de envío
  const validateForm = () => {
    return isFormValid && formData.name && formData.email && formData.phone && 
           formData.date && formData.time && formData.partySize;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Marcar todos los campos como tocados para mostrar errores
    const allFields = Object.keys(formData);
    const touchedState = {};
    allFields.forEach(field => touchedState[field] = true);
    setFieldTouched(touchedState);
    
    // Validar formulario completo
    if (!validateFormComplete()) {
      setError('Por favor, corrige los errores marcados en el formulario');
      return;
    }
    
    setLoading(true);

    try {
      const result = await makeReservation(formData);
      
      setAssignedTable(result.tableInfo);
      setConfirmedDetails({ date: formData.date, time: formData.time });
      setSuccess(true);
      setLoading(false);
      
      // Limpiar el formulario
      setFormData({
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
      setFieldTouched({});
      setFieldErrors({});
    } catch (err) {
      setError(err.message || 'Error al realizar la reserva. Por favor, intente con un horario diferente.');
      setLoading(false);
    }
  };



  if (success && confirmedDetails) {
    return (
      <div className="reservation-form-container">
        <div className="success-message-container">
          <FaCheckCircle className="success-icon" />
          <h2 className="success-title">¡Reserva Confirmada!</h2>
          <div className="success-divider"></div>
          <div className="reservation-details-container">
            <h3 className="details-title">Detalles de su Reserva:</h3>
            <p className="detail-item">
              Fecha: <strong className="detail-value">
                {new Date(confirmedDetails.date).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </strong>
            </p>
            <p className="detail-item">
              Hora: <strong className="detail-value">
                {confirmedDetails.time}
              </strong>
            </p>
            {assignedTable && (
              <p className="detail-item">Mesa: <strong className="detail-value">{assignedTable}</strong></p>
            )}
            
            {(confirmedDetails.needsBabyCart || confirmedDetails.needsWheelchair) && (
              <div className="accessibility-details">
                <p className="accessibility-title">Necesidades de accesibilidad:</p>
                {confirmedDetails.needsBabyCart && (
                  <p className="accessibility-item">
                    <span className="accessibility-icon">🍼</span>
                    Trona para bebé disponible
                  </p>
                )}
                {confirmedDetails.needsWheelchair && (
                  <p className="accessibility-item">
                    <span className="accessibility-icon">♿</span>
                    Mesa accesible para silla de ruedas
                  </p>
                )}
              </div>
            )}
          </div>
          
          <p className="confirmation-message">
            Hemos enviado un email de confirmación con todos los detalles. 
            ¡Esperamos verte pronto en El Nopal!
          </p>
          
          <div className="success-buttons">
            <button 
              className="success-primary-btn"
              onClick={() => {
                setSuccess(false);
                setFormData({
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
                setConfirmedDetails(null);
                setAssignedTable(null);
                setFieldErrors({});
                setFieldTouched({});
              }}
            >
              Nueva Reserva
            </button>
            
            <button 
              className="success-secondary-btn"
              onClick={() => history.push('/')}
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-form-container">
      <div className="form-header">
        <h2 className="form-title">Reserva tu Mesa</h2>
        <p className="form-subtitle">Completa el formulario para reservar tu mesa en El Nopal</p>
      </div>

      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre completo <span className="required">*</span>
              <span className="label-hint">
                (Mínimo 2 caracteres, máximo 50)
              </span>
            </label>
            <div className="input-container">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${fieldErrors.name && fieldTouched.name ? 'error' : ''} ${!fieldErrors.name && fieldTouched.name && formData.name ? 'success' : ''}`}
                placeholder="Introduce tu nombre completo"
                autoComplete="name"
              />
              {renderFieldIndicator('name')}
            </div>
            {renderFieldError('name')}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email <span className="required">*</span>
              <span className="label-hint">
                (ejemplo@correo.com)
              </span>
            </label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${fieldErrors.email && fieldTouched.email ? 'error' : ''} ${!fieldErrors.email && fieldTouched.email && formData.email ? 'success' : ''}`}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
              />
              {renderFieldIndicator('email')}
            </div>
            {renderFieldError('email')}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Teléfono <span className="required">*</span>
              <span className="label-hint">
                (9-15 dígitos)
              </span>
            </label>
            <div className="input-container">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${fieldErrors.phone && fieldTouched.phone ? 'error' : ''} ${!fieldErrors.phone && fieldTouched.phone && formData.phone ? 'success' : ''}`}
                placeholder="+34 123 456 789"
                autoComplete="tel"
              />
              {renderFieldIndicator('phone')}
            </div>
            {renderFieldError('phone')}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Fecha <span className="required">*</span>
              <span className="label-hint">
                (No disponible los lunes)
              </span>
            </label>
            <div className="input-container">
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                onBlur={handleBlur}
                min={new Date().toISOString().split('T')[0]}
                className={`form-input ${fieldErrors.date && fieldTouched.date ? 'error' : ''} ${!fieldErrors.date && fieldTouched.date && formData.date ? 'success' : ''}`}
              />
              {renderFieldIndicator('date')}
            </div>
            {renderFieldError('date')}
          </div>
          
          <div className="form-group">
            <label htmlFor="time" className="form-label">
              Hora <span className="required">*</span>
              <span className="label-hint">
                (Ver horarios disponibles)
              </span>
            </label>
            <div className="input-container">
              {formData.date && availableSlotsForDate.length === 0 && (
                <div className="no-slots-warning">
                  <span className="warning-icon">⚠️</span>
                  No hay horarios disponibles para la fecha seleccionada
                </div>
              )}
              
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!formData.date || availableSlotsForDate.length === 0}
                className={`form-input ${fieldErrors.time && fieldTouched.time ? 'error' : ''} ${!fieldErrors.time && fieldTouched.time && formData.time ? 'success' : ''}`}
              >
                <option value="">Selecciona una hora</option>
                {availableSlotsForDate.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {renderFieldIndicator('time')}
            </div>
            
            {formData.time && !isValidReservationTime(formData.date, formData.time) && (
              <div className="time-warning">
                <FaExclamationCircle className="warning-icon" />
                <span>La reserva debe realizarse con al menos 30 minutos de anticipación</span>
              </div>
            )}
            
            {renderFieldError('time')}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="partySize" className="form-label">
              Número de personas <span className="required">*</span>
              <span className="label-hint">
                (Máximo 8 personas)
              </span>
            </label>
            <div className="input-container">
              <select
                id="partySize"
                name="partySize"
                value={formData.partySize}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${fieldErrors.partySize && fieldTouched.partySize ? 'error' : ''} ${!fieldErrors.partySize && fieldTouched.partySize && formData.partySize ? 'success' : ''}`}
              >
                <option value="">Selecciona número de personas</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>
                    {num} persona{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              {renderFieldIndicator('partySize')}
            </div>
            
            {formData.partySize && parseInt(formData.partySize) > 8 && (
              <div className="party-size-warning">
                <FaExclamationCircle className="warning-icon" />
                <span>Para grupos de más de 8 personas, por favor contáctanos directamente</span>
              </div>
            )}
            
            {renderFieldError('partySize')}
          </div>
          
          <div className="form-group">
            <label htmlFor="specialRequests" className="form-label">
              Peticiones especiales
              <span className="label-hint">
                (Opcional, máximo 500 caracteres)
              </span>
            </label>
            <div className="input-container">
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Alergias alimentarias, celebraciones especiales, preferencias de mesa..."
                maxLength="500"
                className={`form-textarea ${fieldErrors.specialRequests && fieldTouched.specialRequests ? 'error' : ''}`}
              />
            </div>
            {renderCharCounter('specialRequests', 500)}
            {renderFieldError('specialRequests')}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Necesidades de accesibilidad
            <span className="label-hint">
              (Opcional)
            </span>
          </label>
          <div className="accessibility-checkboxes">
            <label className={`checkbox-label ${formData.needsBabyCart ? 'checked' : ''}`}>
              <input
                type="checkbox"
                id="needsBabyCart"
                name="needsBabyCart"
                checked={formData.needsBabyCart}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <span>🍼</span>
            </label>
            
            <label className={`checkbox-label ${formData.needsWheelchair ? 'checked' : ''}`}>
              <input
                type="checkbox"
                id="needsWheelchair"
                name="needsWheelchair"
                checked={formData.needsWheelchair}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <span>♿</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <button
            type="submit"
            className={`submit-button ${!validateForm() || loading ? 'disabled' : ''}`}
            disabled={!validateForm() || loading}
          >
            {loading ? (
              <>
                <span>⏳</span>
                Procesando reserva...
              </>
            ) : (
              <>
                <span>🍽️</span>
                Confirmar Reserva
              </>
            )}
          </button>
          
          {!validateForm() && !loading && (
            <div className="form-error">
              Complete todos los campos obligatorios marcados con *
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;