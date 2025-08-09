import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useReservation } from '../../context/ReservationContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faSignOutAlt, 
  faSearch, 
  faPlus, 
  faEdit, 
  faTrash, 
  faEye, 
  faUserSlash,
  faCalendarAlt,
  faFilter,
  faPhone,
  faEnvelope,
  faUsers,
  faClock,
  faUtensils,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
  faCommentDots
} from '@fortawesome/free-solid-svg-icons';
import * as reservationService from '../../services/reservationService';
import CreateReservationModal from './CreateReservationModal';
import EditReservationModal from './EditReservationModal';
import CancelReservationModal from './CancelReservationModal';
import BlacklistModal from './BlacklistModal';
import BlacklistManagement from './BlacklistManagement';
import './AdminReservationsPanel.css';

const AdminReservationsPanel = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showBlacklistManagement, setShowBlacklistManagement] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    today: 0
  });

  const { currentUser, logout } = useAuth();
  const { fetchReservations } = useReservation();
  const navigate = useNavigate();

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getAllReservations();
      setReservations(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reservationsList) => {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
      total: reservationsList.length,
      confirmed: reservationsList.filter(r => r.status === 'confirmed').length,
      pending: reservationsList.filter(r => r.status === 'pending').length,
      cancelled: reservationsList.filter(r => r.status === 'cancelled').length,
      today: reservationsList.filter(r => {
        const resDate = new Date(r.date).toISOString().split('T')[0];
        return resDate === today;
      }).length
    };
    
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...reservations];

    if (searchTerm) {
      filtered = filtered.filter(res =>
        res.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.customer?.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(res => res.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(res => {
        const resDate = new Date(res.date).toISOString().split('T')[0];
        return resDate === dateFilter;
      });
    }

    setFilteredReservations(filtered);
  };

  const handleDeleteReservation = async (reservationId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      try {
        await reservationService.deleteReservation(reservationId);
        toast.success('Reserva eliminada correctamente');
        // Optimización: Remover del estado local sin recargar
        setReservations(prev => {
          const updated = prev.filter(r => r._id !== reservationId);
          calculateStats(updated);
          return updated;
        });
      } catch (error) {
        console.error('Error deleting reservation:', error);
        toast.error('Error al eliminar la reserva');
      }
    }
  };

  const handleAddToBlacklist = (reservation) => {
    setSelectedReservation(reservation);
    setShowBlacklistModal(true);
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    toast.info(`Detalles de la reserva de ${reservation.customer?.name}`);
  };

  const handleEditReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowEditModal(true);
  };

  const handleCancelReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { 
        color: 'success', 
        icon: faCheckCircle, 
        text: 'Confirmada' 
      },
      pending: { 
        color: 'warning', 
        icon: faExclamationTriangle, 
        text: 'Pendiente' 
      },
      cancelled: { 
        color: 'danger', 
        icon: faTimesCircle, 
        text: 'Cancelada' 
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`status-badge status-${config.color}`}>
        <FontAwesomeIcon icon={config.icon} />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.substring(0, 5) : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleNavigateToReviews = () => {
    navigate('/admin/reviews');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="admin-reservations-panel">
      <div className="panel-header">
        <h1 className="panel-title">
          <FontAwesomeIcon icon={faCalendarAlt} />
          Panel de Administración - Reservas
        </h1>
        <div className="panel-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Nueva Reserva
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowBlacklistManagement(true)}
          >
            <FontAwesomeIcon icon={faUserSlash} />
            Lista Negra
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleNavigateToReviews}
          >
            <FontAwesomeIcon icon={faCommentDots} />
            Opiniones
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleBackToHome}
          >
            <FontAwesomeIcon icon={faHome} />
            Volver
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Salir
          </button>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Reservas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.confirmed}</div>
          <div className="stat-label">Confirmadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pendientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.cancelled}</div>
          <div className="stat-label">Canceladas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.today}</div>
          <div className="stat-label">Hoy</div>
        </div>
      </div>

      <div className="filters-container">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending">Pendientes</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        <div className="filter-group">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-date"
          />
        </div>

        <button 
          className="btn btn-outline"
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setDateFilter('');
          }}
        >
          <FontAwesomeIcon icon={faFilter} />
          Limpiar Filtros
        </button>
      </div>

      <div className="reservations-table-container">
        <table className="reservations-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Fecha y Hora</th>
              <th>Mesa</th>
              <th>Personas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No se encontraron reservas
                </td>
              </tr>
            ) : (
              filteredReservations.map((reservation) => (
                <tr key={reservation._id} className="reservation-row">
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{reservation.customer?.name}</div>
                      {reservation.specialRequests && (
                        <div className="special-requests">
                          <FontAwesomeIcon icon={faCommentDots} />
                          {reservation.specialRequests.substring(0, 30)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="contact-item">
                        <FontAwesomeIcon icon={faPhone} />
                        {reservation.customer?.phone}
                      </div>
                      <div className="contact-item">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {reservation.customer?.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="datetime-info">
                      <div className="date">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {formatDate(reservation.date)}
                      </div>
                      <div className="time">
                        <FontAwesomeIcon icon={faClock} />
                        {formatTime(reservation.time)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="table-info">
                      {reservation.table ? (
                        <span className="table-number">
                          Mesa {reservation.table.number}
                        </span>
                      ) : (
                        <span className="no-table">Sin asignar</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="guests-info">
                      <FontAwesomeIcon icon={faUsers} />
                      {reservation.partySize}
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(reservation.status)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleViewDetails(reservation)}
                        title="Ver detalles"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditReservation(reservation)}
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn-action btn-cancel"
                        onClick={() => handleCancelReservation(reservation)}
                        title="Cancelar"
                      >
                        <FontAwesomeIcon icon={faTimesCircle} />
                      </button>
                      <button
                        className="btn-action btn-blacklist"
                        onClick={() => handleAddToBlacklist(reservation)}
                        title="Añadir a lista negra"
                      >
                        <FontAwesomeIcon icon={faUserSlash} />
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteReservation(reservation._id)}
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateReservationModal
          onClose={() => setShowCreateModal(false)}
          onReservationCreated={() => {
            setShowCreateModal(false);
            // Solo recargar si realmente necesitamos los datos actualizados
            loadReservations();
          }}
        />
      )}

      {showEditModal && selectedReservation && (
        <EditReservationModal
          reservation={selectedReservation}
          onClose={() => setShowEditModal(false)}
          onReservationUpdated={() => {
            setShowEditModal(false);
            loadReservations();
          }}
        />
      )}

      {showCancelModal && selectedReservation && (
        <CancelReservationModal
          reservation={selectedReservation}
          onClose={() => setShowCancelModal(false)}
          onReservationCancelled={() => {
            setShowCancelModal(false);
            loadReservations();
          }}
        />
      )}

      {showBlacklistModal && selectedReservation && (
        <BlacklistModal
          reservation={selectedReservation}
          onClose={() => setShowBlacklistModal(false)}
          onBlacklistAdded={() => {
            setShowBlacklistModal(false);
            // No necesitamos recargar reservas al añadir a lista negra
            toast.success('Cliente añadido a la lista negra');
          }}
        />
      )}

      {showBlacklistManagement && (
        <div className="modal-overlay">
          <div className="modal-content">
            <BlacklistManagement
              getBlacklist={reservationService.getBlacklist}
              removeFromBlacklist={reservationService.removeFromBlacklist}
              onClose={() => setShowBlacklistManagement(false)}
            />
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminReservationsPanel;
 