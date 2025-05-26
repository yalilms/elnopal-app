import React, { useState, useEffect } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { useHistory } from 'react-router-dom';
import './ReservationForm.css';
import { FaCheckCircle } from 'react-icons/fa';
import { getTimeSlotsForDay } from '../../data/tablesData';
import { handleHashScroll } from '../../utils/scrollUtils';


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
  
  // Manejar scroll automático al cargar la página con hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      handleHashScroll(hash);
    }
  }, []);
  
  // Función para validar que la reserva sea al menos 1 hora antes
  const isValidReservationTime = (selectedDate, selectedTime) => {
    if (!selectedDate || !selectedTime) return true; // Si no hay fecha o tiempo seleccionado, permitir
    
    const now = new Date();
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const reservationTime = new Date(selectedDate);
    reservationTime.setHours(hours, minutes, 0, 0);
    
    // Calcular la diferencia en minutos
    const diffInMinutes = (reservationTime - now) / (1000 * 60);
    
    // Retornar true si la reserva es al menos 60 minutos (1 hora) en el futuro
    return diffInMinutes >= 60;
  };
  
  // Efecto para actualizar los slots cuando cambia la fecha
  useEffect(() => {
    if (formData.date) {
      const slots = getTimeSlotsForDay(formData.date);
      
      // Si la fecha es hoy, filtrar las horas que son menos de 1 hora en el futuro
      const now = new Date();
      const filteredSlots = slots.filter(slot => {
        const [hours, minutes] = slot.split(':').map(Number);
        const slotTime = new Date(formData.date);
        slotTime.setHours(hours, minutes, 0, 0);
        return (slotTime - now) >= (60 * 60 * 1000); // 1 hora en milisegundos
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
  
  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Limpiar error previo
    setError(null);
    
    // Si es un cambio de fecha, validar que no sea anterior a hoy ni lunes
    if (name === 'date') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setError('No se pueden hacer reservas para fechas pasadas');
        return;
      }

      // Verificar si es lunes
      if (selectedDate.getDay() === 1) {
        // Permitir seleccionar el día pero limpiar la hora si existe
        setFormData(prev => ({
          ...prev,
          [name]: value,
          time: '' // Limpiar la hora si se selecciona un lunes
        }));
        return;
      }
    }
    
    // Si es un cambio de hora, validar que sea al menos 1 hora en el futuro
    if (name === 'time' && formData.date) {
      const [hours, minutes] = value.split(':').map(Number);
      const reservationTime = new Date(formData.date);
      reservationTime.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      const diffInMinutes = (reservationTime - now) / (1000 * 60);
      
      if (diffInMinutes < 60) {
        setError('La reserva debe realizarse con al menos 1 hora de anticipación');
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Si el tamaño del grupo es mayor a 8, redirigir al formulario de contacto
    if (name === 'partySize' && parseInt(value, 10) > 8) {
      alert('Para grupos de más de 8 personas, por favor contáctenos directamente para una reserva especial.');
      history.push('/contacto');
      return;
    }
  };
  
  // Validar el formulario
  const validateForm = () => {
    const { name, email, phone, date, time, partySize } = formData;
    
    if (!name || !email || !phone || !date || !time || !partySize) {
      return false;
    }
    
    // Validar que la reserva sea al menos 1 hora antes
    if (!isValidReservationTime(date, time)) {
      setError('La reserva debe realizarse con al menos 1 hora de anticipación');
      return false;
    }
    
    return true;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Intentar hacer la reserva con asignación automática de mesa
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
            <label htmlFor="name" style={labelStyle}>Nombre completo <span style={{color: '#D62828'}}>*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
        </div>

        <div style={formRowStyle}>
          <div style={formGroupStyle}>
            <label htmlFor="email" style={labelStyle}>Email <span style={{color: '#D62828'}}>*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          <div style={formGroupStyle}>
            <label htmlFor="phone" style={labelStyle}>Teléfono <span style={{color: '#D62828'}}>*</span></label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
        </div>

        <div style={formRowStyle}>
          <div style={formGroupStyle}>
            <label htmlFor="date" style={labelStyle}>Fecha <span style={{color: '#D62828'}}>*</span></label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Máximo 30 días en el futuro
              style={inputStyle}
              required
            />
          </div>
          <div style={formGroupStyle}>
            <label htmlFor="time" style={labelStyle}>Hora <span style={{color: '#D62828'}}>*</span></label>
            {formData.date && new Date(formData.date).getDay() === 1 ? (
              <div style={{
                padding: '0.8rem',
                backgroundColor: 'rgba(214, 40, 40, 0.1)',
                borderRadius: '8px',
                color: '#D62828',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{fontSize: '1.2rem'}}>⚠️</span>
                Lo sentimos, los lunes el restaurante permanece cerrado. Por favor, seleccione otro día.
              </div>
            ) : (
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                style={inputStyle}
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
            )}
          </div>
        </div>

        <div style={formRowStyle}>
          <div style={formGroupStyle}>
            <label htmlFor="partySize" style={labelStyle}>Número de personas <span style={{color: '#D62828'}}>*</span></label>
            <select
              id="partySize"
              name="partySize"
              value={formData.partySize}
              onChange={handleChange}
              style={inputStyle}
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
          </div>
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="specialRequests" style={labelStyle}>Peticiones especiales</label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Indícanos si tienes alguna petición especial..."
            style={{...inputStyle, minHeight: '120px', resize: 'vertical'}}
          />
        </div>

        {/* Sección de Accesibilidad */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Necesidades de accesibilidad</label>
          <div className="accessibility-checkboxes">
            <div 
              className="accessibility-checkbox-item"
              onClick={(e) => {
                // Solo activar si no se hizo clic directamente en el checkbox
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
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="needsBabyCart">
                <span className="emoji">🍼</span>
                Vengo con carrito de bebé
              </label>
            </div>
            
            <div 
              className="accessibility-checkbox-item"
              onClick={(e) => {
                // Solo activar si no se hizo clic directamente en el checkbox
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
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="needsWheelchair">
                <span className="emoji">♿</span>
                Vengo con silla de ruedas
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div style={errorMessageStyle}>
            <span style={{marginRight: '10px', fontSize: '1.2rem'}}>⚠️</span>
            {error}
          </div>
        )}

        <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
          <button
            type="submit"
            style={buttonStyle}
            disabled={!validateForm() || loading}
          >
            {loading ? 'Procesando...' : 'Confirmar Reserva'}
          </button>
        </div>
        </form>
      </section>
    </div>
  );
};

export default ReservationForm;