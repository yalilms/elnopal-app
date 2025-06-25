import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faSignOutAlt, faCalendarAlt, faCheck, faTimes, faEye, 
  faUsers, faCommentDots, faUserSlash, faPlus, faMapMarkedAlt,
  faChartBar, faClock, faExclamationTriangle, faFilter
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

// Importar componentes existentes
import AdminReviewsPanel from './AdminReviewsPanel';
import BlacklistManagement from './BlacklistManagement';
import AdminForm from './AdminForm';
import TableMap from './TableMap';

const AdminMainPanel = () => {
  const { currentUser, logout } = useAuth();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateReservationModal, setShowCreateReservationModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [filter, setFilter] = useState('all');

  // Datos mock para pruebas
  const mockReservations = [
    {
      _id: '1',
      customerName: 'Ana García',
      customerEmail: 'ana@email.com',
      customerPhone: '+34 666 777 888',
      date: '2024-01-15',
      time: '20:00',
      guests: 4,
      status: 'confirmed',
      table: { number: 5, capacity: 4 },
      specialRequests: 'Mesa cerca de la ventana',
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      _id: '2',
      customerName: 'Carlos López',
      customerEmail: 'carlos@email.com',
      customerPhone: '+34 655 444 333',
      date: '2024-01-15',
      time: '21:30',
      guests: 2,
      status: 'pending',
      table: { number: 8, capacity: 2 },
      specialRequests: 'Celebración de aniversario',
      createdAt: '2024-01-11T14:30:00Z'
    },
    {
      _id: '3',
      customerName: 'María Rodríguez',
      customerEmail: 'maria@email.com',
      customerPhone: '+34 622 111 999',
      date: '2024-01-16',
      time: '19:30',
      guests: 6,
      status: 'cancelled',
      table: { number: 12, capacity: 6 },
      specialRequests: 'Menú vegetariano',
      createdAt: '2024-01-12T16:45:00Z'
    }
  ];

  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    }
  }, [activeTab]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // Simular carga de reservaciones
      setTimeout(() => {
        setReservations(mockReservations);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error al cargar reservaciones:', error);
      toast.error('Error al cargar las reservaciones');
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      const updatedReservations = reservations.map(res => 
        res._id === reservationId ? { ...res, status: newStatus } : res
      );
      setReservations(updatedReservations);
      toast.success(`Reservación ${newStatus === 'confirmed' ? 'confirmada' : 'actualizada'} correctamente`);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar la reservación');
    }
  };

  const handleLogout = () => {
    logout();
    history.push('/admin/login');
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const filteredReservations = reservations.filter(res => {
    if (filter === 'all') return true;
    return res.status === filter;
  });

  const getTabCount = () => {
    switch (activeTab) {
      case 'reservations':
        return reservations.length;
      default:
        return null;
    }
  };

  const reservationFormFields = [
    { name: 'customerName', label: 'Nombre del Cliente', type: 'text', required: true },
    { name: 'customerEmail', label: 'Email', type: 'email', required: true },
    { name: 'customerPhone', label: 'Teléfono', type: 'tel', required: true },
    { name: 'date', label: 'Fecha', type: 'date', required: true },
    { name: 'time', label: 'Hora', type: 'time', required: true },
    { name: 'guests', label: 'Número de Personas', type: 'number', required: true },
    { name: 'specialRequests', label: 'Peticiones Especiales', type: 'textarea', required: false },
  ];

  const handleCreateReservation = async (formData) => {
    try {
      // Simular creación de reservación
      const newReservation = {
        _id: Date.now().toString(),
        ...formData,
        status: 'confirmed',
        table: { number: Math.floor(Math.random() * 20) + 1, capacity: formData.guests },
        createdAt: new Date().toISOString()
      };
      
      setReservations([...reservations, newReservation]);
      setShowCreateReservationModal(false);
      toast.success('Reservación creada exitosamente');
    } catch (error) {
      console.error('Error al crear reservación:', error);
      toast.error('Error al crear la reservación');
    }
  };

  // Funciones para la lista negra (simuladas)
  const getBlacklist = async () => {
    // Datos simulados
    return [
      {
        id: '1',
        name: 'Juan Problemático',
        phone: '+34 666 000 111',
        email: 'juan@problema.com',
        reason: 'Comportamiento inapropiado y falta de respeto al personal',
        dateAdded: '2024-01-05T15:30:00Z',
        addedBy: 'Admin'
      }
    ];
  };

  const removeFromBlacklist = async (entryId) => {
    // Simular eliminación
    console.log('Eliminando entrada de lista negra:', entryId);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card">
          <div className="admin-card-icon bg-blue-500">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className="admin-card-content">
            <h3>Reservaciones Hoy</h3>
            <p className="admin-card-number">{reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length}</p>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-icon bg-green-500">
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <div className="admin-card-content">
            <h3>Confirmadas</h3>
            <p className="admin-card-number">{reservations.filter(r => r.status === 'confirmed').length}</p>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-icon bg-yellow-500">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="admin-card-content">
            <h3>Pendientes</h3>
            <p className="admin-card-number">{reservations.filter(r => r.status === 'pending').length}</p>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-icon bg-purple-500">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="admin-card-content">
            <h3>Total Clientes</h3>
            <p className="admin-card-number">{reservations.reduce((sum, r) => sum + r.guests, 0)}</p>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="admin-card">
        <h3 className="admin-card-title">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveTab('reservations')}
            className="admin-quick-action"
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Ver Reservaciones</span>
          </button>
          
          <button 
            onClick={() => setShowCreateReservationModal(true)}
            className="admin-quick-action"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Nueva Reserva</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('reviews')}
            className="admin-quick-action"
          >
            <FontAwesomeIcon icon={faCommentDots} />
            <span>Gestionar Opiniones</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('tablemap')}
            className="admin-quick-action"
          >
            <FontAwesomeIcon icon={faMapMarkedAlt} />
            <span>Mapa de Mesas</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderReservations = () => (
    <div className="space-y-6">
      {/* Filtros y acciones */}
      <div className="admin-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">Todas las reservaciones</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowCreateReservationModal(true)}
            className="admin-btn-primary"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Nueva Reservación
          </button>
        </div>
      </div>

      {/* Tabla de reservaciones */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Cargando reservaciones...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Personas</th>
                  <th>Mesa</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation._id}>
                    <td>
                      <div>
                        <div className="font-medium">{reservation.customerName}</div>
                        <div className="text-sm text-gray-500">{reservation.customerEmail}</div>
                      </div>
                    </td>
                    <td>{new Date(reservation.date).toLocaleDateString('es-ES')}</td>
                    <td>{reservation.time}</td>
                    <td>{reservation.guests}</td>
                    <td>Mesa {reservation.table?.number}</td>
                    <td>
                      <span className={`admin-status-badge ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(reservation)}
                          className="admin-btn-icon text-blue-600 hover:bg-blue-100"
                          title="Ver detalles"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        
                        {reservation.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(reservation._id, 'confirmed')}
                            className="admin-btn-icon text-green-600 hover:bg-green-100"
                            title="Confirmar"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        )}
                        
                        {reservation.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(reservation._id, 'cancelled')}
                            className="admin-btn-icon text-red-600 hover:bg-red-100"
                            title="Cancelar"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="admin-main-panel">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <h1>Panel de Administración - El Nopal</h1>
            <p>Bienvenido, {currentUser?.email}</p>
          </div>
          
          <div className="admin-header-right">
            <button 
              onClick={() => history.push('/')} 
              className="admin-btn-secondary"
            >
              <FontAwesomeIcon icon={faHome} />
              <span className="hidden md:inline ml-2">Inicio</span>
            </button>
            
            <button 
              onClick={handleLogout} 
              className="admin-btn-danger"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span className="hidden md:inline ml-2">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Navegación por pestañas */}
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faChartBar} />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('reservations')}
            className={`admin-tab ${activeTab === 'reservations' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Reservaciones</span>
            {getTabCount() && activeTab === 'reservations' && (
              <span className="admin-tab-badge">{getTabCount()}</span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('reviews')}
            className={`admin-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faCommentDots} />
            <span>Opiniones</span>
          </button>
          
          <button
            onClick={() => setActiveTab('blacklist')}
            className={`admin-tab ${activeTab === 'blacklist' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faUserSlash} />
            <span>Lista Negra</span>
          </button>
          
          <button
            onClick={() => setActiveTab('tablemap')}
            className={`admin-tab ${activeTab === 'tablemap' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faMapMarkedAlt} />
            <span>Mapa de Mesas</span>
          </button>
        </div>

        {/* Contenido de las pestañas */}
        <div className="admin-tab-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'reservations' && renderReservations()}
          {activeTab === 'reviews' && <AdminReviewsPanel />}
          {activeTab === 'blacklist' && (
            <BlacklistManagement 
              getBlacklist={getBlacklist}
              removeFromBlacklist={removeFromBlacklist}
              onClose={() => setActiveTab('dashboard')}
            />
          )}
          {activeTab === 'tablemap' && (
            <div className="admin-card">
              <h3 className="admin-card-title mb-4">Mapa de Mesas del Restaurante</h3>
              <TableMap 
                isAdmin={true}
                selectedDate={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetailModal && selectedReservation && (
        <div className="admin-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Detalles de la Reservación</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="admin-modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="admin-modal-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4>Información del Cliente</h4>
                  <div className="space-y-2">
                    <p><strong>Nombre:</strong> {selectedReservation.customerName}</p>
                    <p><strong>Email:</strong> {selectedReservation.customerEmail}</p>
                    <p><strong>Teléfono:</strong> {selectedReservation.customerPhone}</p>
                  </div>
                </div>
                
                <div>
                  <h4>Detalles de la Reserva</h4>
                  <div className="space-y-2">
                    <p><strong>Fecha:</strong> {new Date(selectedReservation.date).toLocaleDateString('es-ES')}</p>
                    <p><strong>Hora:</strong> {selectedReservation.time}</p>
                    <p><strong>Personas:</strong> {selectedReservation.guests}</p>
                    <p><strong>Mesa:</strong> {selectedReservation.table?.number}</p>
                    <p><strong>Estado:</strong> 
                      <span className={`ml-2 admin-status-badge ${getStatusColor(selectedReservation.status)}`}>
                        {getStatusText(selectedReservation.status)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedReservation.specialRequests && (
                <div className="mt-6">
                  <h4>Peticiones Especiales</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedReservation.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear reservación */}
      {showCreateReservationModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateReservationModal(false)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Crear Nueva Reservación</h3>
              <button 
                onClick={() => setShowCreateReservationModal(false)}
                className="admin-modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="admin-modal-content">
              <AdminForm
                title=""
                fields={reservationFormFields}
                onSubmit={handleCreateReservation}
                initialData={{}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMainPanel; 