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


// Estilos inline para asegurar visibilidad
const formContainerStyle = {
  backgroundColor: 'white',
  color: '#421f16',
  padding: '2.5rem',
  maxWidth: '800px',
  margin: '2rem auto',
  borderRadius: '15px',
  boxShadow: '0 10px 30px rgba(66, 31, 22, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(66, 31, 22, 0.08)'
};

const formTitleStyle = {
  color: '#D62828',
  fontSize: '2.2rem',
  textAlign: 'center',
  marginBottom: '2rem',
  fontFamily: 'Poppins, sans-serif',
  fontWeight: '700',
  position: 'relative',
  paddingBottom: '0.8rem'
};

const formStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.6rem',
  color: '#421f16',
  fontWeight: '500',
  fontSize: '0.95rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.9rem',
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
  fontSize: '1rem',
  color: '#421f16',
  backgroundColor: 'white'
};

const formRowStyle = {
  display: 'flex',
  gap: '1.5rem',
  marginBottom: '1.2rem'
};

const formGroupStyle = {
  flex: '1',
  marginBottom: '1.5rem'
};

const buttonStyle = {
  background: 'linear-gradient(135deg, #D62828, #ad1457)',
  color: 'white',
  border: 'none',
  padding: '1rem 2.5rem',
  borderRadius: '50px',
  fontSize: '1.1rem',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 4px 15px rgba(214, 40, 40, 0.3)',
  display: 'inline-block',
  letterSpacing: '0.5px'
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
    validateFormComplete();
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
  }, [formData.date]);
  
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
    const hasError = fieldTouched[fieldName] && fieldErrors[fieldName];
    const isValid = fieldTouched[fieldName] && !fieldErrors[fieldName] && formData[fieldName];
    
    if (hasError) {
      return <FaTimes style={{ color: '#D62828', marginLeft: '8px', fontSize: '14px' }} />;
    } else if (isValid) {
      return <FaCheck style={{ color: '#28a745', marginLeft: '8px', fontSize: '14px' }} />;
    }
    return null;
  };
  
  // Renderizar mensaje de error para un campo
  const renderFieldError = (fieldName) => {
    const hasError = fieldTouched[fieldName] && fieldErrors[fieldName];
    if (!hasError) return null;
    
    return (
      <div style={{
        color: '#D62828',
        fontSize: '0.85rem',
        marginTop: '0.4rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem'
      }}>
        <FaExclamationCircle style={{ fontSize: '12px' }} />
        {fieldErrors[fieldName]}
      </div>
    );
  };
  
  // Renderizar contador de caracteres
  const renderCharCounter = (fieldName, maxLength) => {
    const currentLength = formData[fieldName]?.length || 0;
    const isNearLimit = currentLength > maxLength * 0.8;
    
    return (
      <div style={{
        fontSize: '0.75rem',
        color: isNearLimit ? '#D62828' : '#666',
        textAlign: 'right',
        marginTop: '0.3rem'
      }}>
        {currentLength}/{maxLength} caracteres
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
      <div style={formContainerStyle}>
        <div style={{textAlign: 'center', padding: '3rem 2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 5px 20px rgba(66, 31, 22, 0.1)'}}>
          <FaCheckCircle style={{color: '#006B3C', fontSize: '5rem', marginBottom: '1.5rem'}} />
          <h2 style={{color: '#006B3C', fontSize: '2.2rem', marginBottom: '1.5rem', fontFamily: 'Poppins, sans-serif', fontWeight: '700'}}>¡Reserva Confirmada!</h2>
          <div style={{width: '80px', height: '4px', background: 'linear-gradient(90deg, #006B3C, #F8B612)', margin: '0 auto 2rem', borderRadius: '2px'}}></div>
          <div style={{backgroundColor: 'rgba(0, 107, 60, 0.05)', padding: '1.5rem 2rem', borderRadius: '12px', marginBottom: '2rem', borderLeft: '4px solid #006B3C'}}>
            <h3 style={{color: '#421f16', fontSize: '1.3rem', marginBottom: '1.2rem', fontWeight: '600'}}>Detalles de su Reserva:</h3>
            <p style={{marginBottom: '0.8rem', fontSize: '1.1rem', color: '#421f16'}}>
              Fecha: <strong style={{color: '#006B3C', fontWeight: '600'}}>
                {confirmedDetails?.date ? new Date(confirmedDetails.date + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </strong>
            </p>
            <p style={{marginBottom: '0.8rem', fontSize: '1.1rem', color: '#421f16'}}>
              Hora: <strong style={{color: '#006B3C', fontWeight: '600'}}>
                {confirmedDetails?.time || 'N/A'}
              </strong>
            </p>

            {(formData.needsBabyCart || formData.needsWheelchair) && (
              <div style={{marginTop: '1rem', padding: '0.8rem', backgroundColor: 'rgba(248, 182, 18, 0.1)', borderRadius: '8px', borderLeft: '4px solid #F8B612'}}>
                <p style={{margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#421f16', fontWeight: '600'}}>Necesidades de accesibilidad:</p>
                {formData.needsBabyCart && (
                  <p style={{margin: '0.2rem 0', fontSize: '0.95rem', color: '#421f16'}}>
                    <span style={{marginRight: '0.5rem'}}>🍼</span>
                    Carrito de bebé
                  </p>
                )}
                {formData.needsWheelchair && (
                  <p style={{margin: '0.2rem 0', fontSize: '0.95rem', color: '#421f16'}}>
                    <span style={{marginRight: '0.5rem'}}>♿</span>
                    Silla de ruedas
                  </p>
                )}
              </div>
            )}
          </div>
          <p style={{color: '#421f16', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6'}}>
            Hemos enviado un correo electrónico con los detalles de su reserva.
          </p>
          <div style={{display: 'flex', gap: '1.5rem', marginTop: '1rem', justifyContent: 'center'}}>
            <button 
              style={{background: 'linear-gradient(135deg, #006B3C, #F8B612)', color: 'white', border: 'none', padding: '1rem 1.5rem', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 107, 60, 0.3)'}}
              onClick={() => {
                setSuccess(false);
                setAssignedTable(null);
                setConfirmedDetails(null);
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
              }}
            >
              Hacer otra reserva
            </button>
            <button 
              style={{backgroundColor: '#f5f5f5', color: '#421f16', border: '2px solid #e0e0e0', padding: '1rem 1.5rem', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer'}}
              onClick={() => {
                setSuccess(false);
                setAssignedTable(null);
                setConfirmedDetails(null);
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
                history.push('/');
              }}
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={formContainerStyle}>
      <section id="reservation-header">
        <h2 style={formTitleStyle}>Reserva tu Mesa</h2>
      </section>
      
      <section id="reservation-form">
        <form onSubmit={handleSubmit} style={formStyle}>
        <div style={formRowStyle}>
          <div style={formGroupStyle}>
            <label htmlFor="name" style={labelStyle}>
              Nombre completo <span style={{color: '#D62828'}}>*</span>
              <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '5px'}}>
                (2-50 caracteres, solo letras)
              </span>
            </label>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                style={getFieldStyle('name')}
                placeholder="Introduce tu nombre completo"
                maxLength="50"
                required
              />
              {renderFieldIndicator('name')}
            </div>
            {renderFieldError('name')}
            {renderCharCounter('name', 50)}
          </div>
        </div>

        <div style={formRowStyle}>
          <div style={formGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email <span style={{color: '#D62828'}}>*</span>
              <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '5px'}}>
                (para confirmación de reserva)
              </span>
            </label>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                style={getFieldStyle('email')}
                placeholder="ejemplo@correo.com"
                required
              />
              {renderFieldIndicator('email')}
            </div>
            {renderFieldError('email')}
          </div>
          <div style={formGroupStyle}>
            <label htmlFor="phone" style={labelStyle}>
              Teléfono <span style={{color: '#D62828'}}>*</span>
              <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '5px'}}>
                (mínimo 9 dígitos)
              </span>
            </label>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                style={getFieldStyle('phone')}
                placeholder="+34 123 456 789"
                required
              />
              {renderFieldIndicator('phone')}
            </div>
            {renderFieldError('phone')}
          </div>
        </div>

        <div style={formRowStyle}>
          <div style={formGroupStyle}>
            <label htmlFor="date" style={labelStyle}>
              Fecha <span style={{color: '#D62828'}}>*</span>
              <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '5px'}}>
                (cerrados los lunes)
              </span>
            </label>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                onBlur={handleBlur}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                style={getFieldStyle('date')}
                required
              />
              {renderFieldIndicator('date')}
            </div>
            {renderFieldError('date')}
          </div>
          <div style={formGroupStyle}>
            <label htmlFor="time" style={labelStyle}>
              Hora <span style={{color: '#D62828'}}>*</span>
              <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '5px'}}>
                (30 min anticipación)
              </span>
            </label>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              {formData.date && new Date(formData.date).getDay() === 1 ? (
                <div style={{
                  padding: '0.8rem',
                  backgroundColor: 'rgba(214, 40, 40, 0.1)',
                  borderRadius: '8px',
                  color: '#D62828',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{fontSize: '1.2rem'}}>⚠️</span>
                  Lo sentimos, los lunes el restaurante permanece cerrado. Por favor, seleccione otro día.
                </div>
              ) : (
                <>
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={getFieldStyle('time')}
                    required
                  >
                    <option value="">Seleccionar hora</option>
                    {availableSlotsForDate.length > 0 ? (
                      availableSlotsForDate.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {formData.date ? 'No hay horarios disponibles para este día' : 'Seleccione una fecha primero'}
                      </option>
                    )}
                  </select>
                  {renderFieldIndicator('time')}
                </>
              )}
            </div>
            {renderFieldError('time')}
            {availableSlotsForDate.length === 0 && formData.date && new Date(formData.date).getDay() !== 1 && (
              <div style={{
                fontSize: '0.85rem',
                color: '#F8B612',
                marginTop: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <FaExclamationCircle style={{ fontSize: '12px' }} />
                Todos los horarios están ocupados para esta fecha
              </div>
            )}
          </div>
        </div>

        <div style={formRowStyle}>
          <div style={formGroupStyle}>
            <label htmlFor="partySize" style={labelStyle}>
              Número de personas <span style={{color: '#D62828'}}>*</span>
              <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '5px'}}>
                (máximo 8 por reserva online)
              </span>
            </label>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              <select
                id="partySize"
                name="partySize"
                value={formData.partySize}
                onChange={handleChange}
                onBlur={handleBlur}
                style={getFieldStyle('partySize')}
                required
              >
                <option value="">Seleccionar</option>
                <option value="1">1 persona</option>
                <option value="2">2 personas</option>
                <option value="3">3 personas</option>
                <option value="4">4 personas</option>
                <option value="5">5 personas</option>
                <option value="6">6 personas</option>
                <option value="7">7 personas</option>
                <option value="8">8 personas</option>
              </select>
              {renderFieldIndicator('partySize')}
            </div>
            {renderFieldError('partySize')}
            {parseInt(formData.partySize) > 6 && (
              <div style={{
                fontSize: '0.85rem',
                color: '#F8B612',
                marginTop: '0.4rem',
                padding: '0.5rem',
                backgroundColor: 'rgba(248, 182, 18, 0.1)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <FaExclamationCircle style={{ fontSize: '12px' }} />
                Para grupos grandes te asignaremos mesas juntas automáticamente
              </div>
            )}
          </div>
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="specialRequests" style={labelStyle}>
            Peticiones especiales
            <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '5px'}}>
              (opcional, máximo 500 caracteres)
            </span>
          </label>
          <div style={{position: 'relative'}}>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Indícanos si tienes alguna petición especial (cumpleaños, aniversario, alergias, etc.)..."
              maxLength="500"
              style={{...getFieldStyle('specialRequests'), minHeight: '120px', resize: 'vertical'}}
            />
            {renderFieldIndicator('specialRequests')}
          </div>
          {renderFieldError('specialRequests')}
          {renderCharCounter('specialRequests', 500)}
        </div>

        {/* Sección de Accesibilidad mejorada */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Necesidades de accesibilidad
            <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '5px'}}>
              (nos ayuda a preparar tu mesa)
            </span>
          </label>
          <div className="accessibility-checkboxes" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginTop: '0.8rem'
          }}>
            <div 
              className="accessibility-checkbox-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.8rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: formData.needsBabyCart ? 'rgba(0, 107, 60, 0.05)' : 'white'
              }}
              onClick={(e) => {
                if (e.target.type !== 'checkbox') {
                  const checkbox = document.getElementById('needsBabyCart');
                  checkbox.checked = !checkbox.checked;
                  handleChange({ target: { name: 'needsBabyCart', type: 'checkbox', checked: checkbox.checked } });
                }
              }}
            >
              <input
                type="checkbox"
                id="needsBabyCart"
                name="needsBabyCart"
                checked={formData.needsBabyCart}
                onChange={handleChange}
                onBlur={handleBlur}
                onClick={(e) => e.stopPropagation()}
                style={{marginRight: '0.8rem'}}
              />
              <label htmlFor="needsBabyCart" style={{margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                <span style={{marginRight: '0.5rem', fontSize: '1.2rem'}}>🍼</span>
                Vengo con carrito de bebé
              </label>
            </div>
            
            <div 
              className="accessibility-checkbox-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.8rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: formData.needsWheelchair ? 'rgba(0, 107, 60, 0.05)' : 'white'
              }}
              onClick={(e) => {
                if (e.target.type !== 'checkbox') {
                  const checkbox = document.getElementById('needsWheelchair');
                  checkbox.checked = !checkbox.checked;
                  handleChange({ target: { name: 'needsWheelchair', type: 'checkbox', checked: checkbox.checked } });
                }
              }}
            >
              <input
                type="checkbox"
                id="needsWheelchair"
                name="needsWheelchair"
                checked={formData.needsWheelchair}
                onChange={handleChange}
                onBlur={handleBlur}
                onClick={(e) => e.stopPropagation()}
                style={{marginRight: '0.8rem'}}
              />
              <label htmlFor="needsWheelchair" style={{margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                <span style={{marginRight: '0.5rem', fontSize: '1.2rem'}}>♿</span>
                Vengo con silla de ruedas
              </label>
            </div>
          </div>
        </div>

        {/* Indicador de progreso del formulario */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: 'rgba(0, 107, 60, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 107, 60, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{fontSize: '0.9rem', color: '#421f16', fontWeight: '600'}}>
              Progreso del formulario
            </span>
            <span style={{fontSize: '0.9rem', color: '#006B3C', fontWeight: '600'}}>
              {Math.round((Object.keys(formData).filter(key => {
                // Solo contar campos obligatorios: name, email, phone, date, time, partySize
                const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'partySize'];
                return requiredFields.includes(key) && formData[key] && formData[key].toString().trim() !== '';
              }).length / 6) * 100)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e0e0e0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.round((Object.keys(formData).filter(key => {
                // Solo contar campos obligatorios: name, email, phone, date, time, partySize
                const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'partySize'];
                return requiredFields.includes(key) && formData[key] && formData[key].toString().trim() !== '';
              }).length / 6) * 100)}%`,
              height: '100%',
              backgroundColor: '#006B3C',
              transition: 'width 0.3s ease',
              borderRadius: '3px'
            }} />
          </div>
        </div>

        {error && (
          <div style={{
            ...errorMessageStyle,
            marginBottom: '1.5rem'
          }}>
            <FaExclamationCircle style={{marginRight: '10px', fontSize: '1.2rem'}} />
            {error}
          </div>
        )}

        <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
          <button
            type="submit"
            style={{
              ...buttonStyle,
              opacity: validateForm() ? 1 : 0.6,
              cursor: validateForm() ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
            disabled={!validateForm() || loading}
          >
            {loading ? (
              <>
                <span style={{marginRight: '8px'}}>⏳</span>
                Procesando reserva...
              </>
            ) : (
              <>
                <span style={{marginRight: '8px'}}>🍽️</span>
                Confirmar Reserva
              </>
            )}
          </button>
          
          {!validateForm() && !loading && (
            <div style={{
              marginTop: '0.8rem',
              fontSize: '0.85rem',
              color: '#666',
              textAlign: 'center'
            }}>
              Complete todos los campos obligatorios marcados con *
            </div>
          )}
        </div>
        </form>
      </section>
    </div>
  );
};

export default ReservationForm;