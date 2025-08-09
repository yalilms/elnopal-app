import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUserSlash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import * as reservationService from '../../services/reservationService';

const BlacklistModal = ({ reservation, onClose, onBlacklistAdded }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const predefinedReasons = [
    'No se presentó sin avisar',
    'Comportamiento inapropiado',
    'Cancelaciones frecuentes',
    'Problemas de pago',
    'Violación de las normas del restaurante',
    'Otro motivo (especificar)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Por favor, proporciona una razón para agregar a la lista negra');
      return;
    }

    setLoading(true);
    try {
      const blacklistData = {
        customerName: reservation.customer?.name,
        customerEmail: reservation.customer?.email,
        customerPhone: reservation.customer?.phone,
        reason: reason,
        reservationId: reservation._id
            };
        
      await reservationService.addToBlacklist(blacklistData);
      
      toast.success('Cliente agregado a la lista negra exitosamente');
      onBlacklistAdded();
      onClose();
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      toast.error(error.message || 'Error al agregar a la lista negra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <FontAwesomeIcon icon={faUserSlash} />
            Agregar a Lista Negra
          </h3>
          <button className="modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div style={{
            padding: '1rem',
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '4px', 
            color: '#856404',
            marginBottom: '1rem'
          }}>
            <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '0.5rem' }} />
            <strong>Advertencia:</strong> Esta acción impedirá que el cliente pueda hacer futuras reservas.
            </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Cliente a agregar:</h4>
            <p><strong>Nombre:</strong> {reservation.customer?.name}</p>
            <p><strong>Email:</strong> {reservation.customer?.email}</p>
            <p><strong>Teléfono:</strong> {reservation.customer?.phone}</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Razón para agregar a la lista negra *
            </label>
            
            <div style={{ marginBottom: '1rem' }}>
              {predefinedReasons.map((predefinedReason, index) => (
                <label key={index} style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="reason"
                    value={predefinedReason}
                    checked={reason === predefinedReason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {predefinedReason}
              </label>
              ))}
            </div>

            {reason === 'Otro motivo (especificar)' && (
              <textarea
                value={reason === 'Otro motivo (especificar)' ? '' : reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Especifica el motivo..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
              )}
            </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
              disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                border: '1px solid #ced4da',
                  borderRadius: '4px',
                background: 'white',
                cursor: 'pointer'
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
                  borderRadius: '4px',
                background: '#dc3545',
                color: 'white',
                  cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
                }}
              >
              <FontAwesomeIcon icon={faUserSlash} />
              {loading ? 'Agregando...' : 'Agregar a Lista Negra'}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default BlacklistModal; 