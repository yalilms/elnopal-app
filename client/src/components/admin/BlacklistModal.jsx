import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';


const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10000
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
  boxShadow: '0 5px 30px rgba(0,0,0,0.3)',
  color: '#333333',
  border: '2px solid #dc3545'
};

const BlacklistModal = ({ isOpen, onClose, customer, onAddToBlacklist, reservationId }) => {
  const [reason, setReason] = useState('');
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Bloquear scroll del body cuando el modal está abierto
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'visible';
    };
  }, [isOpen]);

  if (!isOpen) return null;

      const validateData = () => {
      if (!customer?.name || !customer?.email || !customer?.phone) {
      console.error('Datos del cliente incompletos:', customer);
      toast.error('Faltan datos del cliente');
      return false;
    }
    if (!reason.trim()) {
      toast.error('Por favor, proporciona un motivo');
      return false;
    }
    if (!confirmationChecked) {
      toast.error('Por favor, confirma que deseas añadir al cliente a la lista negra');
      return false;
    }
    if (!reservationId) {
      console.error('ID de reserva faltante');
      toast.error('No se encontró el ID de la reserva');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateData()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const blacklistData = {
        customerId: customer.id || '',
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        reason: reason.trim(),
        reservationId: reservationId
            };
        
        // Llamar a la función para añadir a la lista negra
      await onAddToBlacklist(blacklistData);
      
      // Si llegamos aquí, significa que la operación fue exitosa
      toast.success('Cliente añadido a la lista negra correctamente');
      
      // Limpiar el formulario
      setReason('');
      setConfirmationChecked(false);
      onClose();
    } catch (error) {
      console.error('Error al añadir a la lista negra:', error);
      toast.error(error.message || 'Error al añadir cliente a la lista negra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={modalOverlayStyle} className="modal-overlay">
      <div style={modalContentStyle} className="modal-content">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <h3 style={{
            margin: 0,
            color: '#dc3545',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            <FontAwesomeIcon icon={faUserSlash} /> Añadir a Lista Negra
          </h3>
          <button 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              color: '#666',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={onClose} 
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div style={{ color: '#333333' }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            border: '1px solid #e5e5e5'
          }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              color: '#333333',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>
              Datos del Cliente
            </h4>
            <div style={{
              display: 'flex',
              marginBottom: '0.8rem',
              lineHeight: '1.5'
            }}>
              <label style={{
                flex: '0 0 100px',
                fontWeight: 600,
                color: '#333333'
              }}>
                Nombre:
              </label>
              <span style={{ flex: 1, color: '#333333' }}>
                {customer?.name || 'No disponible'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              marginBottom: '0.8rem',
              lineHeight: '1.5'
            }}>
              <label style={{
                flex: '0 0 100px',
                fontWeight: 600,
                color: '#333333'
              }}>
                Email:
              </label>
              <span style={{ flex: 1, color: '#333333' }}>
                {customer?.email || 'No disponible'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              marginBottom: '0.8rem',
              lineHeight: '1.5'
            }}>
              <label style={{
                flex: '0 0 100px',
                fontWeight: 600,
                color: '#333333'
              }}>
                Teléfono:
              </label>
              <span style={{ flex: 1, color: '#333333' }}>
                {customer?.phone || 'No disponible'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              marginBottom: '0',
              lineHeight: '1.5'
            }}>
              <label style={{
                flex: '0 0 100px',
                fontWeight: 600,
                color: '#333333'
              }}>
                ID Reserva:
              </label>
              <span style={{ flex: 1, color: '#333333' }}>
                {reservationId || 'No disponible'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                htmlFor="reason" 
                style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#333333',
                  fontWeight: 500
                }}
              >
                Motivo de la inclusión en lista negra:
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explica el motivo (ej: No se presentó a la reserva sin avisar)"
                rows={4}
                required
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #999',
                  borderRadius: '4px',
                  resize: 'vertical',
                  minHeight: '100px',
                  fontSize: '0.9rem',
                  color: '#333333',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            <div style={{
              marginBottom: '1.5rem',
              backgroundColor: '#fff3f4',
              padding: '1.2rem',
              borderRadius: '8px',
              border: '2px solid #ffdee1',
              boxShadow: '0 2px 4px rgba(220, 53, 69, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
              onClick={() => !isSubmitting && setConfirmationChecked(!confirmationChecked)}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: `3px solid ${confirmationChecked ? '#dc3545' : '#ccc'}`,
                  borderRadius: '4px',
                  backgroundColor: confirmationChecked ? '#dc3545' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                  cursor: 'pointer'
                }}>
                  {confirmationChecked && (
                    <span style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      lineHeight: 1
                    }}>
                      ✓
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={confirmationChecked}
                  onChange={(e) => setConfirmationChecked(e.target.checked)}
                  disabled={isSubmitting}
                  style={{ display: 'none' }}
                />
                <div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#dc3545',
                    fontWeight: 'bold',
                    marginBottom: '0.3rem'
                  }}>
                    ⚠️ Confirmación Requerida
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#333333',
                    lineHeight: '1.4'
                  }}>
                    Confirmo que deseo añadir a este cliente a la lista negra. 
                    Entiendo que esto impedirá que realice futuras reservas en el sistema.
                  </div>
                </div>
              </div>
              
              {!confirmationChecked && (
                <div style={{
                  marginTop: '0.8rem',
                  padding: '0.6rem',
                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: '#856404',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>💡</span>
                  Marca la casilla de confirmación para continuar
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  color: '#495057'
                }}
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={!confirmationChecked || !reason.trim() || isSubmitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#dc3545',
                  border: 'none',
                  color: 'white',
                  opacity: (!confirmationChecked || !reason.trim() || isSubmitting) ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'AÑADIENDO...' : 'CONFIRMAR'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlacklistModal; 