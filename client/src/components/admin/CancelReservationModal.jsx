import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import * as reservationService from '../../services/reservationService';

const CancelReservationModal = ({ reservation, onClose, onReservationCancelled }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error('Por favor, proporciona una razón para la cancelación');
      return;
    }

    setLoading(true);
    try {
      await reservationService.updateReservation(reservation._id, {
        status: 'cancelled',
        cancellationReason: reason
      });
      
      toast.success('Reserva cancelada exitosamente');
      onReservationCancelled();
      onClose();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error('Error al cancelar la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            Cancelar Reserva
          </h3>
          <button className="modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: '1rem' }}>
            <p><strong>Cliente:</strong> {reservation.customer?.name}</p>
            <p><strong>Fecha:</strong> {new Date(reservation.date).toLocaleDateString()}</p>
            <p><strong>Hora:</strong> {reservation.time}</p>
            <p><strong>Personas:</strong> {reservation.partySize}</p>
            </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="reason" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Razón de cancelación *
              </label>
                <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explica el motivo de la cancelación..."
                  rows="3"
                  style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
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
              type="button"
              onClick={handleCancel}
              disabled={loading}
            style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                background: '#dc3545',
                color: 'white',
                cursor: 'pointer'
            }}
          >
              {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelReservationModal; 