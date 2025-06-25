import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faCalendarAlt, 
  faClock, 
  faUsers, 
  faUser,
  faPhone,
  faEnvelope,
  faCommentDots,
  faCheck,
  faTimes,
  faEye
} from '@fortawesome/free-solid-svg-icons';

const AdminReservationPanel = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const { logout, currentUser } = useAuth();
  const history = useHistory();

  useEffect(() => {
    // Simular carga de reservaciones
    const mockReservations = [
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan@email.com',
        phone: '+34 666 123 456',
        date: '2024-01-15',
        time: '20:00',
        guests: 4,
        message: 'Mesa cerca de la ventana, por favor',
        status: 'pending'
      },
      {
        id: 2,
        name: 'María García',
        email: 'maria@email.com',
        phone: '+34 777 987 654',
        date: '2024-01-16',
        time: '19:30',
        guests: 2,
        message: 'Cena romántica de aniversario',
        status: 'confirmed'
      }
    ];
    
    setTimeout(() => {
      setReservations(mockReservations);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    logout();
    history.push('/');
    toast.success('Sesión cerrada correctamente');
  };

  const handleStatusChange = (id, newStatus) => {
    setReservations(prev => 
      prev.map(res => res.id === id ? { ...res, status: newStatus } : res)
    );
    toast.success('Estado de reservación actualizado');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'cancelled': return 'Cancelada';
      default: return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Cargando reservaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Panel de Administración - Reservaciones</h1>
          <div className="admin-user-info">
            <span>Bienvenido, {currentUser?.name || currentUser?.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              <FontAwesomeIcon icon={faSignOutAlt} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="reservations-summary">
          <div className="summary-card">
            <h3>Total Reservaciones</h3>
            <p className="summary-number">{reservations.length}</p>
          </div>
          <div className="summary-card">
            <h3>Pendientes</h3>
            <p className="summary-number pending">
              {reservations.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="summary-card">
            <h3>Confirmadas</h3>
            <p className="summary-number confirmed">
              {reservations.filter(r => r.status === 'confirmed').length}
            </p>
          </div>
        </div>

        <div className="reservations-table">
          <h2>Reservaciones Recientes</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Comensales</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(reservation => (
                  <tr key={reservation.id}>
                    <td>
                      <div className="client-info">
                        <FontAwesomeIcon icon={faUser} />
                        <span>{reservation.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>{reservation.date}</span>
                      </div>
                    </td>
                    <td>
                      <div className="time-info">
                        <FontAwesomeIcon icon={faClock} />
                        <span>{reservation.time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="guests-info">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{reservation.guests}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(reservation.status) }}
                      >
                        {getStatusText(reservation.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => setSelectedReservation(reservation)}
                          className="action-btn view-btn"
                          title="Ver detalles"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        {reservation.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                              className="action-btn confirm-btn"
                              title="Confirmar"
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                              className="action-btn cancel-btn"
                              title="Cancelar"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedReservation && (
        <div className="modal-overlay" onClick={() => setSelectedReservation(null)}>
          <div className="modal-content reservation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles de Reservación</h3>
              <button 
                onClick={() => setSelectedReservation(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="reservation-details">
                <div className="detail-group">
                  <FontAwesomeIcon icon={faUser} />
                  <div>
                    <label>Cliente:</label>
                    <span>{selectedReservation.name}</span>
                  </div>
                </div>
                <div className="detail-group">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <div>
                    <label>Email:</label>
                    <span>{selectedReservation.email}</span>
                  </div>
                </div>
                <div className="detail-group">
                  <FontAwesomeIcon icon={faPhone} />
                  <div>
                    <label>Teléfono:</label>
                    <span>{selectedReservation.phone}</span>
                  </div>
                </div>
                <div className="detail-group">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <div>
                    <label>Fecha:</label>
                    <span>{selectedReservation.date}</span>
                  </div>
                </div>
                <div className="detail-group">
                  <FontAwesomeIcon icon={faClock} />
                  <div>
                    <label>Hora:</label>
                    <span>{selectedReservation.time}</span>
                  </div>
                </div>
                <div className="detail-group">
                  <FontAwesomeIcon icon={faUsers} />
                  <div>
                    <label>Comensales:</label>
                    <span>{selectedReservation.guests}</span>
                  </div>
                </div>
                {selectedReservation.message && (
                  <div className="detail-group message-group">
                    <FontAwesomeIcon icon={faCommentDots} />
                    <div>
                      <label>Mensaje:</label>
                      <span>{selectedReservation.message}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservationPanel; 