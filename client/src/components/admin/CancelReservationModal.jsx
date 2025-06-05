import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle, faCheck } from '@fortawesome/free-solid-svg-icons';


const CancelReservationModal = ({ isOpen, onClose, onConfirm, reservationData }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const predefinedReasons = [
    'Cliente no se presentó',
    'Cliente canceló por teléfono',
    'Problema con la mesa asignada',
    'Overbooking - error del sistema',
    'Emergencia del restaurante',
    'Cliente solicitó cancelación',
    'Otro motivo (especificar abajo)'
  ];

  const validateReason = (value) => {
    if (!value.trim()) {
      return 'Debe seleccionar o escribir un motivo para la cancelación';
    }
    if (value.length < 5) {
      return 'El motivo debe tener al menos 5 caracteres';
    }
    if (value.length > 200) {
      return 'El motivo no puede tener más de 200 caracteres';
    }
    return '';
  };

  const handleConfirm = async () => {
    const finalReason = reason === 'Otro motivo (especificar abajo)' ? customReason : reason;
    const error = validateReason(finalReason);
    
    if (error) {
      setReasonError(error);
      return;
    }

    setLoading(true);
    try {
      await onConfirm(finalReason);
      setReason('');
      setCustomReason('');
      setReasonError('');
      onClose();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      setReasonError('Error al cancelar la reserva. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReasonSelect = (selectedReason) => {
    setReason(selectedReason);
    setReasonError('');
    
    if (selectedReason !== 'Otro motivo (especificar abajo)') {
      setCustomReason('');
    }
  };

  const handleCustomReasonChange = (e) => {
    const value = e.target.value;
    setCustomReason(value);
    setReasonError('');
    
    if (reason === 'Otro motivo (especificar abajo)') {
      const error = validateReason(value);
      if (error) {
        setReasonError(error);
      }
    }
  };

  const getFinalReason = () => {
    return reason === 'Otro motivo (especificar abajo)' ? customReason : reason;
  };

  const isFormValid = () => {
    const finalReason = getFinalReason();
    return finalReason.trim().length >= 5 && finalReason.length <= 200;
  };

  const getCharacterCount = () => {
    if (reason === 'Otro motivo (especificar abajo)') {
      return customReason.length;
    }
    return reason.length;
  };

  if (!isOpen) return null;

  return (
    <div className="cancel-modal-overlay">
      <div className="cancel-modal">
        <div className="cancel-modal-header">
          <div className="cancel-modal-title">
            <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
            <h3>Cancelar Reserva</h3>
          </div>
          <button className="cancel-modal-close" onClick={onClose} disabled={loading}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="cancel-modal-content">
          {reservationData && (
            <div className="reservation-info">
              <h4>Datos de la reserva a cancelar:</h4>
              <div className="reservation-details">
                <p><strong>Cliente:</strong> {reservationData.name}</p>
                <p><strong>Fecha:</strong> {reservationData.date}</p>
                <p><strong>Hora:</strong> {reservationData.time}</p>
                <p><strong>Personas:</strong> {reservationData.partySize}</p>
                {reservationData.tableName && (
                  <p><strong>Mesa:</strong> {reservationData.tableName}</p>
                )}
              </div>
            </div>
          )}

          <div className="reason-selection">
            <h4>
              Motivo de la cancelación: <span style={{color: '#dc3545'}}>*</span>
              <span style={{fontSize: '0.8rem', color: '#666', marginLeft: '5px'}}>
                (5-200 caracteres)
              </span>
            </h4>
            <div className="predefined-reasons">
              {predefinedReasons.map((predefinedReason, index) => (
                <button
                  key={index}
                  className={`reason-button ${reason === predefinedReason ? 'selected' : ''}`}
                  onClick={() => handleReasonSelect(predefinedReason)}
                  disabled={loading}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{predefinedReason}</span>
                  {reason === predefinedReason && (
                    <FontAwesomeIcon 
                      icon={faCheck} 
                      style={{color: 'white', fontSize: '14px'}} 
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="custom-reason">
              <label htmlFor="custom-reason-input">
                Motivo específico o detalles adicionales:
                {reason === 'Otro motivo (especificar abajo)' && (
                  <span style={{color: '#dc3545'}}> *</span>
                )}
              </label>
              <div style={{position: 'relative'}}>
                <textarea
                  id="custom-reason-input"
                  value={customReason}
                  onChange={handleCustomReasonChange}
                  placeholder="Escribe el motivo de la cancelación..."
                  rows="3"
                  maxLength="200"
                  disabled={loading}
                  style={{
                    borderColor: reasonError ? '#dc3545' : (reason === 'Otro motivo (especificar abajo)' && customReason.length >= 5 ? '#28a745' : '#e0e0e0'),
                    boxShadow: reasonError ? '0 0 0 2px rgba(220, 53, 69, 0.1)' : 
                               (reason === 'Otro motivo (especificar abajo)' && customReason.length >= 5 ? '0 0 0 2px rgba(40, 167, 69, 0.1)' : 'none')
                  }}
                />
                {reason === 'Otro motivo (especificar abajo)' && customReason.length >= 5 && !reasonError && (
                  <FontAwesomeIcon 
                    icon={faCheck} 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      color: '#28a745',
                      fontSize: '14px'
                    }} 
                  />
                )}
              </div>
              
              {/* Contador de caracteres */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.4rem'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: getCharacterCount() > 160 ? '#dc3545' : '#666'
                }}>
                  {getCharacterCount()}/200 caracteres
                </div>
                {reason === 'Otro motivo (especificar abajo)' && customReason.length < 5 && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#F8B612'
                  }}>
                    Mínimo 5 caracteres
                  </div>
                )}
              </div>

              {/* Mensaje de error */}
              {reasonError && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '0.85rem',
                  marginTop: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} style={{fontSize: '12px'}} />
                  {reasonError}
                </div>
              )}
            </div>
          </div>

          <div className="warning-message">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <p>
              Se enviará un correo de notificación al cliente y al administrador 
              con el motivo especificado.
            </p>
          </div>

          {/* Indicador de validez del formulario */}
          <div style={{
            padding: '0.8rem',
            backgroundColor: isFormValid() ? 'rgba(40, 167, 69, 0.05)' : 'rgba(248, 182, 18, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${isFormValid() ? 'rgba(40, 167, 69, 0.2)' : 'rgba(248, 182, 18, 0.2)'}`,
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: isFormValid() ? '#28a745' : '#F8B612'
            }}>
              <FontAwesomeIcon 
                icon={isFormValid() ? faCheck : faExclamationTriangle} 
                style={{fontSize: '14px'}} 
              />
              <span style={{fontSize: '0.9rem', fontWeight: '600'}}>
                {isFormValid() ? 'Formulario completado correctamente' : 'Selecciona o escribe un motivo válido'}
              </span>
            </div>
          </div>
        </div>

        <div className="cancel-modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleConfirm}
            disabled={loading || !isFormValid()}
            style={{
              opacity: isFormValid() ? 1 : 0.6,
              cursor: isFormValid() ? 'pointer' : 'not-allowed'
            }}
          >
            {loading ? (
              <>
                <span style={{marginRight: '8px'}}>⏳</span>
                Cancelando...
              </>
            ) : (
              <>
                <span style={{marginRight: '8px'}}>❌</span>
                Confirmar Cancelación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReservationModal; 