import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faCalendarAlt, 
  faClock,
  faUsers,
  faUtensils,
  faComment,
  faTimes,
  faSave,
  faRobot,
  faBaby,
  faWheelchair,
  faChair
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import * as reservationService from '../../services/reservationService';


const CreateReservationModal = ({ onClose, onReservationCreated }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    tableId: '',
    specialRequests: '',
    autoAssignTable: false,
    needsBabyCart: false,
    needsWheelchair: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (formData.date && formData.time && formData.guests) {
      checkAvailableTables();
    }
  }, [formData.date, formData.time, formData.guests]);

  const loadTables = async () => {
    try {
      const tablesData = await reservationService.getTables();
      setTables(tablesData || []);
    } catch (error) {
      console.error('Error loading tables:', error);
      toast.error('Error al cargar las mesas');
    }
  };

  const checkAvailableTables = async () => {
    try {
      const available = await reservationService.getAvailableTables({
        date: formData.date,
        time: formData.time,
        guests: formData.guests
      });
      setAvailableTables(available || []);
    } catch (error) {
      console.error('Error checking available tables:', error);
      setAvailableTables([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'El nombre es requerido';
    }

    // Email opcional para admin, solo validar formato si se proporciona
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'No se pueden hacer reservas para fechas pasadas';
      }
    }

    if (!formData.time) {
      newErrors.time = 'La hora es requerida';
    }

    if (formData.guests < 1 || formData.guests > 12) {
      newErrors.guests = 'El número de personas debe estar entre 1 y 12';
    }

    if (!formData.autoAssignTable && !formData.tableId) {
      newErrors.tableId = 'Debe seleccionar una mesa o activar asignación automática';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      const reservationData = {
        name: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        partySize: formData.guests,
        tableId: formData.autoAssignTable ? null : formData.tableId,
        specialRequests: formData.specialRequests,
        needsBabyCart: formData.needsBabyCart,
        needsWheelchair: formData.needsWheelchair
      };

      const response = await reservationService.createReservation(reservationData);
      toast.success('Reserva creada exitosamente');
      onReservationCreated(response.reservation);
      onClose();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(error.message || 'Error al crear la reserva');
      setErrors(error.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setFormData(prev => ({
      ...prev,
      tableId: table._id
    }));
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getTimeSlots = () => {
    const slots = [];
    
    // Horario de almuerzo: 13:00 - 15:30
    for (let hour = 13; hour <= 15; hour++) {
      if (hour === 15) {
        slots.push('15:00', '15:30');
      } else {
        slots.push(`${hour}:00`, `${hour}:30`);
      }
    }
    
    // Horario de cena: 20:00 - 23:30
    for (let hour = 20; hour <= 23; hour++) {
      if (hour === 23) {
        slots.push('23:00', '23:30');
      } else {
        slots.push(`${hour}:00`, `${hour}:30`);
      }
    }
    
    return slots;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faCalendarAlt} />
            Crear Nueva Reserva
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Información del cliente */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#495057', borderBottom: '2px solid #dee2e6', paddingBottom: '0.5rem' }}>
              Información del Cliente
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.5rem' }} />
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Nombre del cliente"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${errors.customerName ? '#dc3545' : '#e9ecef'}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.customerName && (
                  <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.customerName}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '0.5rem' }} />
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="cliente@email.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${errors.email ? '#dc3545' : '#e9ecef'}`,
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                  {errors.email && (
                    <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    <FontAwesomeIcon icon={faPhone} style={{ marginRight: '0.5rem' }} />
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+34 123 456 789"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `2px solid ${errors.phone ? '#dc3545' : '#e9ecef'}`,
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                  {errors.phone && (
                    <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información de la reserva */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#495057', borderBottom: '2px solid #dee2e6', paddingBottom: '0.5rem' }}>
              Detalles de la Reserva
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '0.5rem' }} />
                  Fecha *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${errors.date ? '#dc3545' : '#e9ecef'}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.date && (
                  <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.date}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <FontAwesomeIcon icon={faClock} style={{ marginRight: '0.5rem' }} />
                  Hora *
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${errors.time ? '#dc3545' : '#e9ecef'}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="">Seleccionar hora</option>
                  {getTimeSlots().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.time && (
                  <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.time}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <FontAwesomeIcon icon={faUsers} style={{ marginRight: '0.5rem' }} />
                  Personas *
                </label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  min="1"
                  max="12"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${errors.guests ? '#dc3545' : '#e9ecef'}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.guests && (
                  <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.guests}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Selección de mesa */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#495057', borderBottom: '2px solid #dee2e6', paddingBottom: '0.5rem' }}>
              <FontAwesomeIcon icon={faChair} style={{ marginRight: '0.5rem' }} />
              Selección de Mesa
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="autoAssignTable"
                  checked={formData.autoAssignTable}
                  onChange={handleInputChange}
                />
                <FontAwesomeIcon icon={faRobot} />
                Asignación automática de mesa
              </label>
            </div>

            {!formData.autoAssignTable && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  <FontAwesomeIcon icon={faUtensils} style={{ marginRight: '0.5rem' }} />
                  Mesa *
                </label>
                <select
                  name="tableId"
                  value={formData.tableId}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${errors.tableId ? '#dc3545' : '#e9ecef'}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                  disabled={formData.autoAssignTable}
                >
                  <option value="">Seleccionar mesa</option>
                  {tables.map(table => (
                    <option 
                      key={table._id} 
                      value={table._id}
                      disabled={!availableTables.some(t => t._id === table._id)}
                    >
                      Mesa {table.number} ({table.capacity} personas)
                      {!availableTables.some(t => t._id === table._id) ? ' - No disponible' : ''}
                    </option>
                  ))}
                </select>
                {errors.tableId && (
                  <span style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.tableId}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Necesidades Especiales */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#495057', borderBottom: '2px solid #dee2e6', paddingBottom: '0.5rem' }}>
              Necesidades Especiales
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                backgroundColor: formData.needsBabyCart ? '#e9ecef' : 'transparent'
              }}>
                <input
                  type="checkbox"
                  name="needsBabyCart"
                  checked={formData.needsBabyCart}
                  onChange={handleInputChange}
                />
                <FontAwesomeIcon icon={faBaby} />
                Necesita carrito de bebé
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                backgroundColor: formData.needsWheelchair ? '#e9ecef' : 'transparent'
              }}>
                <input
                  type="checkbox"
                  name="needsWheelchair"
                  checked={formData.needsWheelchair}
                  onChange={handleInputChange}
                />
                <FontAwesomeIcon icon={faWheelchair} />
                Necesita silla de ruedas
              </label>
            </div>
          </div>

          {/* Peticiones especiales */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#495057', borderBottom: '2px solid #dee2e6', paddingBottom: '0.5rem' }}>
              Peticiones Especiales
            </h3>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                <FontAwesomeIcon icon={faComment} style={{ marginRight: '0.5rem' }} />
                Comentarios adicionales
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Celebración especial, alergias, preferencias de mesa..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #dee2e6', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid #6c757d',
                borderRadius: '8px',
                background: 'white',
                color: '#6c757d',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                background: loading ? '#6c757d' : 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FontAwesomeIcon icon={faSave} />
              {loading ? 'Creando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReservationModal; 