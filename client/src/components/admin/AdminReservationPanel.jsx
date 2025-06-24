import React, { useState, useEffect } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, faPlus, faEdit, faTimes, faUser, faPhone, faEnvelope, 
  faClock, faUsers, faUtensils, faCheck, faList, faUserSlash, faEye,
  faComments, faHome, faSignOutAlt, faFilter, faArrowLeft, faArrowRight,
  faCheckCircle, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import BlacklistModal from './BlacklistModal';
import CancelReservationModal from './CancelReservationModal';
import BlacklistManagement from './BlacklistManagement';

// Estilos CSS completos para el panel de administración
const adminPanelStyles = `
  .admin-reservation-panel {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f5132 0%, #198754 100%);
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  .admin-reservation-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="adminPattern" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 0h60v60H0z" fill="none"/><circle cx="30" cy="30" r="0.8" fill="%23ffffff" opacity="0.03"/></pattern></defs><rect width="60" height="60" fill="url(%23adminPattern)"/></svg>');
    pointer-events: none;
    z-index: 0;
  }

  .admin-reservation-panel > * {
    position: relative;
    z-index: 1;
  }

  .panel-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-bottom: 3px solid #F8B612;
  }

  .panel-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .panel-title {
    color: #0f5132;
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    font-weight: 700;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
  }

  .panel-title::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #F8B612, #FFD700);
    border-radius: 2px;
  }

  .panel-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .panel-date .fa-calendar-alt {
    color: #D62828;
  }

  .panel-header-actions-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .action-group-left {
    display: flex;
    gap: 1rem;
  }

  .action-group-right {
    display: flex;
    gap: 1rem;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.8rem 1.2rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;
  }

  .btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .btn:hover::before {
    left: 100%;
  }

  .btn-highlight {
    background: linear-gradient(135deg, #D62828, #B71C1C);
    color: white;
    box-shadow: 0 4px 15px rgba(214, 40, 40, 0.3);
  }

  .btn-highlight:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(214, 40, 40, 0.4);
    background: linear-gradient(135deg, #B71C1C, #8B0000);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.9);
    color: #666;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 1);
    color: #333;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .btn-text {
    display: inline;
  }

  .view-toggles {
    display: flex;
    gap: 0.5rem;
    margin: 1.5rem 2rem;
    justify-content: center;
  }

  .view-toggle {
    padding: 0.8rem 1.5rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
  }

  .view-toggle:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  .view-toggle.active {
    background: rgba(255, 255, 255, 0.95);
    color: #0f5132;
    border-color: #F8B612;
    box-shadow: 0 4px 15px rgba(248, 182, 18, 0.3);
  }

  .panel-content {
    padding: 0 2rem 2rem;
  }

  .reservations-container,
  .blacklist-container {
    display: flex;
    justify-content: center;
    padding: 0;
  }

  .reservations-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    max-width: 1400px;
    width: 100%;
    min-height: 60vh;
  }

  .reservations-list-panel,
  .sidebar-panel {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .reservations-list-panel {
    overflow: hidden;
    min-height: 500px;
  }

  .sidebar-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 500px;
    position: sticky;
    top: 2rem;
    align-self: flex-start;
  }

  /* Filtros de reservas */
  .filter-section {
    margin-bottom: 1.5rem;
  }

  .filter-section h3 {
    color: #333;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .filter-results {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #e0e0e0;
    background: white;
    color: #666;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .filter-btn:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }

  .filter-btn.active {
    background: #0f5132;
    color: white;
    border-color: #0f5132;
  }

  .filter-btn.confirmed {
    background: #198754;
    color: white;
    border-color: #198754;
  }

  .filter-btn.cancelled {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
  }

  /* Selector de fecha */
  .date-selector {
    margin-bottom: 1.5rem;
  }

  .date-selector label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .date-selector input {
    width: 100%;
    padding: 0.8rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #333;
    background: white;
    transition: all 0.3s ease;
  }

  .date-selector input:focus {
    outline: none;
    border-color: #0f5132;
    box-shadow: 0 0 0 3px rgba(15, 81, 50, 0.1);
  }

  /* Tabla de reservas */
  .reservations-table-container {
    overflow-x: auto;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .reservations-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 12px;
    overflow: hidden;
  }

  .reservations-table thead {
    background: linear-gradient(135deg, #0f5132, #198754);
    color: white;
  }

  .reservations-table th {
    padding: 1.2rem 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #F8B612;
  }

  .reservations-table tbody tr {
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .reservations-table tbody tr:nth-child(even) {
    background: rgba(248, 182, 18, 0.05);
  }

  .reservations-table tbody tr:hover {
    background: rgba(15, 81, 50, 0.1);
    transform: scale(1.01);
  }

  .reservations-table tbody tr.selected {
    background: rgba(214, 40, 40, 0.1);
    border-left: 4px solid #D62828;
  }

  .reservations-table td {
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.9rem;
    vertical-align: middle;
  }

  .status-badge {
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-badge.confirmed {
    background: rgba(25, 135, 84, 0.1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, 0.3);
  }

  .status-badge.cancelled {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.3);
  }

  .status-badge.no-show {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
    border: 1px solid rgba(255, 193, 7, 0.3);
  }

  .action-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .view-button {
    background: #0f5132;
    color: white;
  }

  .view-button:hover {
    background: #198754;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(15, 81, 50, 0.3);
  }

  /* Estadísticas */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.9);
    padding: 1.2rem;
    border-radius: 12px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.3rem;
  }

  .stat-number.confirmed { color: #198754; }
  .stat-number.cancelled { color: #dc3545; }
  .stat-number.comensales { color: #0f5132; }
  .stat-number.ocupacion { color: #F8B612; }

  .stat-label {
    font-size: 0.8rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f0f0f0;
  }

  .modal-title {
    color: #0f5132;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .close-button:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #333;
  }

  /* Form Styles dentro de modales */
  .modal-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 0.8rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #333;
    background: white;
    transition: all 0.3s ease;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #0f5132;
    box-shadow: 0 0 0 3px rgba(15, 81, 50, 0.1);
  }

  /* Responsive Design */
  @media (max-width: 1200px) {
    .reservations-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .sidebar-panel {
      position: static;
    }

    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 992px) {
    .panel-header {
      padding: 1.5rem;
    }

    .panel-header-top {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .panel-header-actions-row {
      flex-direction: column;
      gap: 1rem;
    }

    .action-group-left,
    .action-group-right {
      justify-content: center;
    }

    .button-group {
      justify-content: center;
    }

    .btn-text {
      display: none;
    }

    .reservations-table th,
    .reservations-table td {
      padding: 0.8rem 0.5rem;
      font-size: 0.8rem;
    }
  }

  @media (max-width: 768px) {
    .panel-content {
      padding: 0 1rem 1rem;
    }

    .view-toggles {
      margin: 1rem;
      flex-direction: column;
    }

    .view-toggle {
      padding: 0.6rem 1rem;
      text-align: center;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .reservations-table-container {
      overflow-x: scroll;
    }

    .reservations-table {
      min-width: 600px;
    }

    .modal-content {
      padding: 1.5rem;
      margin: 1rem;
    }

    .modal-form {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  @media (max-width: 480px) {
    .panel-header {
      padding: 1rem;
    }

    .panel-title {
      font-size: 1.2rem;
    }

    .btn {
      padding: 0.6rem 0.8rem;
      font-size: 0.8rem;
    }

    .view-toggle {
      padding: 0.5rem 0.8rem;
      font-size: 0.8rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
      gap: 0.8rem;
    }

    .stat-card {
      padding: 1rem;
    }

    .stat-number {
      font-size: 1.5rem;
    }

    .modal-content {
      padding: 1rem;
      margin: 0.5rem;
    }
  }

  @media (max-width: 360px) {
    .panel-content {
      padding: 0 0.5rem 0.5rem;
    }

    .view-toggles {
      margin: 0.5rem;
    }

    .btn {
      padding: 0.5rem 0.6rem;
      font-size: 0.75rem;
    }

    .reservations-table th,
    .reservations-table td {
      padding: 0.6rem 0.3rem;
      font-size: 0.75rem;
    }
  }

  /* Loading and Error States */
  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #0f5132;
    font-size: 1.2rem;
  }

  .error-message {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    margin: 1rem 0;
    border: 1px solid rgba(220, 53, 69, 0.3);
  }

  /* Animations */
  .fade-in {
    animation: fadeIn 0.5s ease-out;
  }

  .slide-in-up {
    animation: slideInUp 0.6s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const AdminReservationPanel = () => {
  const { 
    reservations, 
    loading: contextLoading,
    error: contextError,
    loadReservations,
    updateReservationStatus,
    cancelReservation,
    refreshData,
    makeReservation,
    tables
  } = useReservation();
  
  const { logout } = useAuth();
  const history = useHistory();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'blacklist'
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [adminFormAvailableSlots, setAdminFormAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blacklistEntries, setBlacklistEntries] = useState([]);
  
  // Nuevos estados para validación
  const [newFormErrors, setNewFormErrors] = useState({});
  const [newFormTouched, setNewFormTouched] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editFormTouched, setEditFormTouched] = useState({});
  
  // Nuevos estados para los modales
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  
  // useEffect para inyectar estilos CSS
  useEffect(() => {
    if (!document.getElementById('admin-panel-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'admin-panel-styles';
      styleSheet.textContent = adminPanelStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);
  
  // Función para obtener slots de tiempo disponibles
  const getTimeSlotsForDay = (date) => {
    const timeSlots = [];
    
    // Obtener día de la semana (0 = domingo, 1 = lunes, etc.)
    const dayOfWeek = new Date(date).getDay();
    
    // Horarios del restaurante
    const schedules = {
      0: [{ start: '13:00', end: '16:30' }], // Domingo
      1: [], // Lunes - cerrado
      2: [{ start: '13:00', end: '16:00' }, { start: '20:00', end: '23:30' }], // Martes
      3: [{ start: '13:00', end: '16:00' }, { start: '20:00', end: '23:30' }], // Miércoles
      4: [{ start: '13:00', end: '16:00' }, { start: '20:00', end: '23:30' }], // Jueves
      5: [{ start: '13:00', end: '16:30' }, { start: '20:00', end: '23:45' }], // Viernes
      6: [{ start: '13:00', end: '16:30' }, { start: '20:00', end: '23:30' }]  // Sábado
    };
    
    const daySchedule = schedules[dayOfWeek] || [];
    
    daySchedule.forEach(period => {
      const startTime = new Date(`2000-01-01T${period.start}:00`);
      const endTime = new Date(`2000-01-01T${period.end}:00`);
      
      for (let time = new Date(startTime); time <= endTime; time.setMinutes(time.getMinutes() + 30)) {
        const timeString = time.toTimeString().slice(0, 5);
        timeSlots.push(timeString);
      }
    });
    
    return timeSlots;
  };

  // Función para obtener el estado de apertura del restaurante
  const getRestaurantOpeningStatus = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    // Horarios del restaurante en formato HHMM
    const schedules = {
      0: [{ start: 1300, end: 1630 }], // Domingo
      1: [], // Lunes - cerrado
      2: [{ start: 1300, end: 1600 }, { start: 2000, end: 2330 }], // Martes
      3: [{ start: 1300, end: 1600 }, { start: 2000, end: 2330 }], // Miércoles
      4: [{ start: 1300, end: 1600 }, { start: 2000, end: 2330 }], // Jueves
      5: [{ start: 1300, end: 1630 }, { start: 2000, end: 2345 }], // Viernes
      6: [{ start: 1300, end: 1630 }, { start: 2000, end: 2330 }]  // Sábado
    };
    
    const todaySchedule = schedules[currentDay] || [];
    
    if (todaySchedule.length === 0) {
      return { isOpen: false, message: 'Cerrado' };
    }
    
    const isCurrentlyOpen = todaySchedule.some(period => 
      currentTime >= period.start && currentTime <= period.end
    );
    
    if (isCurrentlyOpen) {
      return { isOpen: true, message: 'Abierto' };
    } else {
      const nextPeriod = todaySchedule.find(period => currentTime < period.start);
      if (nextPeriod) {
        const openTime = `${Math.floor(nextPeriod.start / 100)}:${(nextPeriod.start % 100).toString().padStart(2, '0')}`;
        return { isOpen: false, message: `Abre a las ${openTime}` };
      } else {
        return { isOpen: false, message: 'Cerrado por hoy' };
      }
    }
  };
  
  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {

      return null; // Devuelve null si no hay string o es inválido
    }

    // Intenta parsear como YYYY-MM-DD primero
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        if (year && month && day && year.length === 4 && month.length >= 1 && month.length <= 2 && day.length >= 1 && day.length <= 2 &&
            !isNaN(parseInt(year)) && !isNaN(parseInt(month)) && !isNaN(parseInt(day))) {
          return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        }
      }
    }

    // Si ya está en formato DD/MM/YYYY y parece válido
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        if (year && month && day && year.length === 4 && month.length >= 1 && month.length <= 2 && day.length >= 1 && day.length <= 2 &&
            !isNaN(parseInt(year)) && !isNaN(parseInt(month)) && !isNaN(parseInt(day))) {
          // Asegurar que las partes sean de la longitud correcta después de un posible undefined/undefined
          if (day !== 'undefined' && month !== 'undefined') {
             return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
          }
        }
      }
    }
    

    return null; // Fallback si ningún formato coincide o es válido
  };
  
  // Función para comparar fechas independientemente del formato
  const areDatesEqual = (date1, date2) => {
    // Función auxiliar para extraer partes de la fecha
    const formatDateParts = (dateStr) => {
      if (!dateStr || typeof dateStr !== 'string') {
        return null;
      }

      let day, month, year;

      if (dateStr.includes('/') && dateStr.split('/').length === 3) { // DD/MM/YYYY
        [day, month, year] = dateStr.split('/');
      } else if (dateStr.includes('-') && dateStr.split('-').length === 3) { // YYYY-MM-DD
        [year, month, day] = dateStr.split('-');
      } else {
        return null;
      }

      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) ||
          String(day).trim().length === 0 || String(day).trim().length > 2 ||
          String(month).trim().length === 0 || String(month).trim().length > 2 ||
          String(year).trim().length !== 4) {
        return null;
      }
      return {
        day: String(dayNum).padStart(2, '0'),
        month: String(monthNum).padStart(2, '0'),
        year: String(yearNum)
      };
    };
    
    const parts1 = formatDateParts(date1);
    const parts2 = formatDateParts(date2);
    
    if (!parts1 || !parts2) return false;
    
    return parts1.day === parts2.day && 
           parts1.month === parts2.month && 
           parts1.year === parts2.year;
  };
  
  // Estado para formulario de edición
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    partySize: '',
    tableId: '', // Agregar tableId para edición
    tableIds: [],
    specialRequests: '',
    needsBabyCart: false,
    needsWheelchair: false
  });
  
  // Estado para nuevo formulario de reserva telefónica
  const [newReservationForm, setNewReservationForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: selectedDate,
    time: '',
    partySize: '',
    tableId: '',
    specialRequests: '',
    needsBabyCart: false,
    needsWheelchair: false
  });
  
  // Actualizar la fecha en el formulario cuando cambia la fecha seleccionada
  useEffect(() => {
    setNewReservationForm(prev => ({
      ...prev,
      date: selectedDate
    }));
  }, [selectedDate]);
  
  // Efecto para actualizar los slots del formulario de nueva reserva cuando cambia su fecha
  useEffect(() => {
    if (newReservationForm.date) {
      const slots = getTimeSlotsForDay(newReservationForm.date);
      setAdminFormAvailableSlots(slots);
      if (!slots.includes(newReservationForm.time)) {
        setNewReservationForm(prev => ({ ...prev, time: '' }));
      }
    } else {
      setAdminFormAvailableSlots([]);
    }
  }, [newReservationForm.date]);
  
  // Filtrar reservaciones por fecha y estado
  const filteredReservations = reservations.filter(
    reservation => {
      // Comprobar si la fecha de la reserva coincide con la seleccionada, independientemente del formato
      const dateMatch = areDatesEqual(reservation.date, selectedDate);
      const statusMatch = filterStatus === 'all' || reservation.status === filterStatus;
      return dateMatch && statusMatch;
    }
  );
  
  // Ordenar por hora
  const sortedReservations = [...filteredReservations].sort((a, b) => {
    // Ordenar primero por hora
    return a.time.localeCompare(b.time);
  });
  
  // Obtener conteo de reservas por fecha para mostrar en el filtro
  const reservationCounts = {};
  reservations.forEach(res => {
    // Normalizar el formato de la fecha para garantizar consistencia
    let normalizedDate = res.date;
    
    // Si la fecha incluye guiones (formato YYYY-MM-DD), convertirla a DD/MM/YYYY
    if (res.date.includes('-')) {
      normalizedDate = formatDateToDDMMYYYY(res.date) || res.date;
    }
    
    // Si la fecha convertida a formato DD/MM/YYYY coincide con selectedDate
    // cuando selectedDate se convierte a DD/MM/YYYY, entonces son la misma fecha
    const selectedDateFormatted = selectedDate.includes('-') ? 
      formatDateToDDMMYYYY(selectedDate) : selectedDate;
    
    if (!reservationCounts[normalizedDate]) {
      reservationCounts[normalizedDate] = 0;
    }
    
    // Solo contar reservas confirmadas
    if (res.status === 'confirmed') {
      reservationCounts[normalizedDate]++;
    }
  });
  
  // Asegurar que tengamos un contador para la fecha seleccionada
  const selectedDateFormatted = selectedDate.includes('-') ? 
    formatDateToDDMMYYYY(selectedDate) : selectedDate;
  
  if (!reservationCounts[selectedDateFormatted]) {
    reservationCounts[selectedDateFormatted] = 0;
  }
  
  // Obtener mesas disponibles para la fecha y hora seleccionada
  const getAvailableTables = () => {
    if (!newReservationForm.date || !newReservationForm.time || !newReservationForm.partySize) {
      return [];
    }
    
    // Filtrar mesas por capacidad
    const partySize = parseInt(newReservationForm.partySize, 10);
    const suitableTables = tables.filter(table => 
      table.reservable && 
      table.capacity >= partySize && 
      table.capacity <= partySize + 2
    );
    
    // Formatear la fecha para comparar
    const formattedDate = formatDateToDDMMYYYY(newReservationForm.date);
    
    // Filtrar por disponibilidad
    return suitableTables.filter(table => {
      const reservationsForDateTime = reservations.filter(res => {
        // Comprobar si la fecha de la reserva coincide (en cualquier formato)
        const dateMatch = (res.date === newReservationForm.date) || (res.date === formattedDate);
        return dateMatch && res.time === newReservationForm.time && res.status === 'confirmed';
      });
      
      // La mesa está disponible si no está incluida en ninguna reserva existente
      return !reservationsForDateTime.some(res => 
        res.tableIds && res.tableIds.includes(table.id)
      );
    });
  };
  
  // Manejar cambio de fecha
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedReservation(null);
  };
  
  // Manejar selección de reserva con modal
  const handleSelectReservation = (reservation) => {
    setSelectedReservation(reservation);
    setIsEditing(false);
    setIsCreatingReservation(false);
    setShowDetailsModal(true);
  };
  
  // Iniciar edición de reserva
  const handleEditClick = () => {
    if (!selectedReservation) return;
    
    setEditForm({
      name: selectedReservation.name,
      email: selectedReservation.email,
      phone: selectedReservation.phone,
      date: selectedReservation.date,
      time: selectedReservation.time,
      partySize: selectedReservation.partySize,
      tableId: selectedReservation.table?._id || selectedReservation.table || '', // Mesa principal
      tableIds: selectedReservation.tableIds || [],
      specialRequests: selectedReservation.specialRequests || '',
      needsBabyCart: selectedReservation.needsBabyCart || false,
      needsWheelchair: selectedReservation.needsWheelchair || false
    });
    
    setIsEditing(true);
    setIsCreatingReservation(false);
  };
  
  // Iniciar creación de reserva telefónica con modal
  const handleNewReservationClick = () => {
    setShowNewReservationModal(true);
    setSelectedReservation(null);
    setIsEditing(false);
    setIsCreatingReservation(false);
    
    // Inicializar el formulario con la fecha actual
    setNewReservationForm({
      name: '',
      email: '',
      phone: '',
      date: selectedDate,
      time: '',
      partySize: '',
      tableId: '',
      specialRequests: '',
      needsBabyCart: false,
      needsWheelchair: false
    });
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  // Cancelar creación de reserva
  const handleCancelCreate = () => {
    setIsCreatingReservation(false);
  };
  
  // Manejar cambios en el formulario de edición
  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setEditForm(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Si el campo ya fue tocado, validar en tiempo real
    if (editFormTouched[name]) {
      const error = validateField(name, newValue);
      setEditFormErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  
  // Manejar cambios en el formulario de nueva reserva
  const handleNewReservationFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setNewReservationForm(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Si el campo ya fue tocado, validar en tiempo real
    if (newFormTouched[name]) {
      const error = validateField(name, newValue);
      setNewFormErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  
  // Validar formulario de nueva reserva completo
  const validateNewReservationForm = () => {
    const errors = {};
    const requiredFields = ['name', 'phone', 'date', 'time', 'partySize'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, newReservationForm[field]);
      if (error) errors[field] = error;
    });
    
    // Validar email si se proporciona
    if (newReservationForm.email) {
      const emailError = validateField('email', newReservationForm.email);
      if (emailError) errors.email = emailError;
    }
    
    // Validar peticiones especiales
    const specialError = validateField('specialRequests', newReservationForm.specialRequests);
    if (specialError) errors.specialRequests = specialError;
    
    setNewFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validar formulario de edición completo
  const validateEditForm = () => {
    const errors = {};
    const requiredFields = ['name', 'phone', 'date', 'time', 'partySize'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, editForm[field]);
      if (error) errors[field] = error;
    });
    
    // Validar email
    const emailError = validateField('email', editForm.email);
    if (emailError) errors.email = emailError;
    
    // Validar peticiones especiales
    const specialError = validateField('specialRequests', editForm.specialRequests);
    if (specialError) errors.specialRequests = specialError;
    
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Guardar cambios en la reserva con validación mejorada
  const handleSaveEdit = () => {
    if (!selectedReservation) return;
    
    // Marcar todos los campos como tocados
    const allFields = Object.keys(editForm);
    const touchedState = {};
    allFields.forEach(field => touchedState[field] = true);
    setEditFormTouched(touchedState);
    
    // Validar formulario
    if (!validateEditForm()) {
      toast.error('Por favor, corrige los errores marcados en el formulario');
      return;
    }
    
    // Cancelar reserva actual
    cancelReservation(selectedReservation.id);
    
    // Crear nueva reserva con datos actualizados
    const updatedReservation = {
      ...editForm,
      date: editForm.date.includes('/') ? editForm.date : formatDateToDDMMYYYY(editForm.date),
      createdAt: new Date().toISOString()
    };
    
    const newReservationId = makeReservation(updatedReservation);
    
    // Actualizar selección
    const newReservation = reservations.find(res => res.id === newReservationId);
    setSelectedReservation(newReservation);
    setIsEditing(false);
    
    // Limpiar estados de validación
    setEditFormErrors({});
    setEditFormTouched({});
    
    toast.success('Reserva actualizada correctamente');
  };
  
  // Crear nueva reserva telefónica con validación mejorada
  const handleCreateReservation = (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const requiredFields = ['name', 'phone', 'date', 'time', 'partySize'];
    const touchedState = {};
    requiredFields.forEach(field => touchedState[field] = true);
    if (newReservationForm.email) touchedState.email = true;
    if (newReservationForm.specialRequests) touchedState.specialRequests = true;
    setNewFormTouched(touchedState);
    
    // Validar formulario
    if (!validateNewReservationForm()) {
      toast.error('Por favor, corrige los errores marcados en el formulario');
      return;
    }
    
    // Crear objeto de reserva
    const newReservation = {
      name: newReservationForm.name,
      email: newReservationForm.email || 'telefonica@reserva.com',
      phone: newReservationForm.phone,
      date: formatDateToDDMMYYYY(newReservationForm.date),
      time: newReservationForm.time,
      partySize: newReservationForm.partySize,
      ...(newReservationForm.tableId && { tableId: newReservationForm.tableId }),
      specialRequests: newReservationForm.specialRequests,
      needsBabyCart: newReservationForm.needsBabyCart,
      needsWheelchair: newReservationForm.needsWheelchair,
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      channel: 'telefónica'
    };
    
    // Obtener información de la mesa para el nombre (solo si se seleccionó)
    if (newReservationForm.tableId) {
      const selectedTable = tables.find(t => t.id === newReservationForm.tableId);
      if (selectedTable) {
        newReservation.tableName = selectedTable.number;
      }
    }
    
    // Realizar la reserva
    const id = makeReservation(newReservation);
    
    if (id) {
      toast.success('Reserva telefónica creada correctamente');
      setShowNewReservationModal(false);
      
      // Limpiar el formulario y estados de validación
      setNewReservationForm({
        name: '',
        email: '',
        phone: '',
        date: selectedDate,
        time: '',
        partySize: '',
        tableId: '',
        specialRequests: '',
        needsBabyCart: false,
        needsWheelchair: false
      });
      setNewFormErrors({});
      setNewFormTouched({});
    }
  };
  
  // Validar si el formulario de nueva reserva está completo
  const isNewReservationFormValid = () => {
    const requiredFields = ['name', 'phone', 'date', 'time', 'partySize'];
    const hasRequiredFields = requiredFields.every(field => newReservationForm[field]);
    const hasNoErrors = Object.keys(newFormErrors).every(key => !newFormErrors[key]);
    return hasRequiredFields && hasNoErrors;
  };
  
  // Validar si el formulario de edición está completo
  const isEditFormValid = () => {
    const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'partySize'];
    const hasRequiredFields = requiredFields.every(field => editForm[field]);
    const hasNoErrors = Object.keys(editFormErrors).every(key => !editFormErrors[key]);
    return hasRequiredFields && hasNoErrors;
  };
  
  // Función para manejar no-show
  const handleNoShow = (reservation) => {
    const customerData = {
      id: reservation.id,
      name: reservation.name,
      email: reservation.email,
      phone: reservation.phone
    };
    
    setSelectedCustomer(customerData);
    setSelectedReservation(reservation);
    setShowBlacklistModal(true);
  };

  // Función para cancelar una reservación con modal
  const handleCancelReservation = async (reservationId) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      setSelectedReservation(reservation);
      setShowCancelModal(true);
    }
  };

  // Confirmar cancelación con motivo
  const handleConfirmCancellation = async (reason) => {
    if (!selectedReservation) return;

    try {
      setLoading(true);
      
      await cancelReservation(selectedReservation.id, reason);
      
      // Recargar datos
      await loadData();
      
      toast.success('Reservación cancelada exitosamente');
      setSelectedReservation(null);
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error al cancelar reservación:', error);
      toast.error('Error al cancelar la reservación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar cierre de sesión
  const handleLogout = () => {
    logout();
    history.push('/');
  };
  
  // Volver a la página principal
  const handleBackToHome = () => {
    history.push('/');
  };
  
  // Cerrar panel de detalles
  const handleCloseDetails = () => {
    setSelectedReservation(null);
    setIsEditing(false);
  };

  // Funciones para manejo de blacklist
  const addToBlacklist = async (blacklistData) => {
    // Simular API call - en producción sería una llamada real al backend
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/blacklist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(blacklistData)
    });
    
    if (!response.ok) {
      throw new Error('Error al agregar a blacklist');
    }
    
    return await response.json();
  };

  const getBlacklist = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/blacklist`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener blacklist');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading blacklist:', error);
      return [];
    }
  };

  const removeFromBlacklist = async (entryId) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/blacklist/${entryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al remover de blacklist');
    }
    
    return await response.json();
  };
  
  const handleAddToBlacklist = async (blacklistData) => {
    try {


      await addToBlacklist({
        ...blacklistData,
        reservationId: selectedReservation.id
      });
      
      // Actualizar el estado de la reserva a "no-show"
      await updateReservationStatus(selectedReservation.id, 'no-show');
      
      // Recargar las reservaciones
      await loadData();
      
      // Cerrar el modal
      setShowBlacklistModal(false);
      
      // Limpiar la selección
      setSelectedCustomer(null);
      setSelectedReservation(null);
      
      // Mostrar mensaje de éxito
      toast.success('Cliente añadido a la lista negra correctamente');
    } catch (error) {
      console.error('Error al añadir a la lista negra:', error);
      toast.error(error.message || 'Error al añadir cliente a la lista negra');
    }
  };
  
  // Función para cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (viewMode === 'blacklist') {
        await loadBlacklistData();
      } else {
        // Cargar reservas para la fecha seleccionada
        await loadReservations({ date: selectedDate });
        
        // También refrescar las mesas
        await refreshData();
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente y cuando cambie la fecha
  useEffect(() => {
    loadData();
  }, [selectedDate]);
  
  // Renderizar formulario de nueva reserva telefónica
  const renderNewReservationForm = () => {
    // Obtener mesas disponibles según los datos del formulario
    const availableTables = getAvailableTables();
    
    return (
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        animation: 'fadeIn 0.3s ease-in-out',
        color: '#333333',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{
          color: '#333333',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '2rem',
          textAlign: 'center',
          position: 'relative',
          padding: '1rem 0',
          backgroundColor: 'rgba(255, 183, 3, 0.15)',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '10px', color: '#D62828', fontSize: '1.2rem' }} />
          Nueva Reserva Telefónica
        </h3>
        <form onSubmit={handleCreateReservation}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="name" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Nombre del cliente: *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newReservationForm.name}
              onChange={handleNewReservationFormChange}
              required
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="phone" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Teléfono: *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={newReservationForm.phone}
              onChange={handleNewReservationFormChange}
              required
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={newReservationForm.email}
              onChange={handleNewReservationFormChange}
              placeholder="Opcional"
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label 
                htmlFor="date" 
                style={{ 
                  display: 'block', 
                  marginBottom: '0.6rem', 
                  color: '#333333', 
                  fontWeight: '600', 
                  fontSize: '0.95rem' 
                }}
              >
                Fecha: *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={newReservationForm.date}
                onChange={handleNewReservationFormChange}
                min={new Date().toISOString().split('T')[0]}
                required
                style={{
                  width: '100%',
                  padding: '0.9rem 1.2rem',
                  borderRadius: '8px',
                  border: '2px solid #d0d0d0',
                  color: '#333333',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label 
                htmlFor="time" 
                style={{ 
                  display: 'block', 
                  marginBottom: '0.6rem', 
                  color: '#333333', 
                  fontWeight: '600', 
                  fontSize: '0.95rem' 
                }}
              >
                Hora: *
              </label>
              <select
                id="time"
                name="time"
                value={newReservationForm.time}
                onChange={handleNewReservationFormChange}
                required
                style={{
                  width: '100%',
                  padding: '0.9rem 1.2rem',
                  borderRadius: '8px',
                  border: '2px solid #d0d0d0',
                  color: '#333333',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                  appearance: 'none',
                  backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '16px',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="" style={{ color: '#333333' }}>Seleccionar hora</option>
                {adminFormAvailableSlots.length > 0 ? (
                  adminFormAvailableSlots.map(time => (
                    <option key={time} value={time} style={{ color: '#333333' }}>{time}</option>
                  ))
                ) : (
                  <option value="" disabled style={{ color: '#333333' }}>Seleccione una fecha válida</option>
                )}
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="partySize" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Número de personas: *
            </label>
            <select
              id="partySize"
              name="partySize"
              value={newReservationForm.partySize}
              onChange={handleNewReservationFormChange}
              required
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                appearance: 'none',
                backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '16px',
                paddingRight: '2.5rem'
              }}
            >
              <option value="" style={{ color: '#333333' }}>Seleccionar</option>
              {[...Array(8)].map((_, i) => (
                <option key={i + 1} value={i + 1} style={{ color: '#333333' }}>
                  {i + 1} {i === 0 ? 'persona' : 'personas'}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="tableId" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Mesa:
            </label>
            <select
              id="tableId"
              name="tableId"
              value={newReservationForm.tableId}
              onChange={handleNewReservationFormChange}
              disabled={!newReservationForm.time || !newReservationForm.partySize}
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                appearance: 'none',
                backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '16px',
                paddingRight: '2.5rem',
                opacity: !newReservationForm.time || !newReservationForm.partySize ? 0.7 : 1
              }}
            >
              <option value="">🤖 Asignación automática (recomendado)</option>
              {availableTables.map(table => (
                <option key={table.id} value={table.id} style={{ color: '#333333' }}>
                  Mesa {table.number} - {table.capacity} personas ({table.location})
                </option>
              ))}
            </select>
            <p style={{
              color: '#666',
              fontSize: '0.85rem',
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              💡 La asignación automática usa las reglas del restaurante: mesas 2-10 para 1-3 personas, 11-18 para 4-5 personas, mesas juntas para grupos grandes
            </p>
            {newReservationForm.time && newReservationForm.partySize && availableTables.length === 0 && (
              <p style={{
                color: '#dc3545',
                fontSize: '0.9rem',
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: 'rgba(230, 57, 70, 0.08)',
                borderRadius: '8px',
                borderLeft: '3px solid #dc3545'
              }}>
                No hay mesas disponibles para esta fecha, hora y tamaño de grupo.
              </p>
            )}
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="specialRequests" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Peticiones especiales:
            </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={newReservationForm.specialRequests}
              onChange={handleNewReservationFormChange}
              rows="3"
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                resize: 'vertical'
              }}
            ></textarea>
          </div>

          {/* Sección de Accesibilidad en formulario de nueva reserva */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.6rem', 
              color: '#333333', 
              fontWeight: '600', 
              fontSize: '0.95rem' 
            }}>
              Necesidades de accesibilidad:
            </label>
            <div className="accessibility-checkboxes">
              <div 
                className="accessibility-checkbox-item"
                onClick={(e) => {
                  // Solo activar si no se hizo clic directamente en el checkbox
                  if (e.target.type !== 'checkbox') {
                    const checkbox = document.getElementById('new-needsBabyCart');
                    checkbox.checked = !checkbox.checked;
                    handleNewReservationFormChange({ target: { name: 'needsBabyCart', type: 'checkbox', checked: checkbox.checked } });
                  }
                }}
              >
                <input
                  type="checkbox"
                  id="new-needsBabyCart"
                  name="needsBabyCart"
                  checked={newReservationForm.needsBabyCart}
                  onChange={handleNewReservationFormChange}
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor="new-needsBabyCart">
                  <span className="emoji">🍼</span>
                  Viene con carrito de bebé
                </label>
              </div>
              
              <div 
                className="accessibility-checkbox-item"
                onClick={(e) => {
                  // Solo activar si no se hizo clic directamente en el checkbox
                  if (e.target.type !== 'checkbox') {
                    const checkbox = document.getElementById('new-needsWheelchair');
                    checkbox.checked = !checkbox.checked;
                    handleNewReservationFormChange({ target: { name: 'needsWheelchair', type: 'checkbox', checked: checkbox.checked } });
                  }
                }}
              >
                <input
                  type="checkbox"
                  id="new-needsWheelchair"
                  name="needsWheelchair"
                  checked={newReservationForm.needsWheelchair}
                  onChange={handleNewReservationFormChange}
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor="new-needsWheelchair">
                  <span className="emoji">♿</span>
                  Viene con silla de ruedas
                </label>
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            borderTop: '1px solid #d0d0d0',
            paddingTop: '1.5rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleCancelCreate}
              style={{
                backgroundColor: '#f0f0f0',
                color: '#333333',
                border: 'none',
                minWidth: '140px',
                padding: '0.9rem 1.5rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: '#009B9B',
                color: 'white',
                border: 'none',
                minWidth: '140px',
                padding: '0.9rem 1.5rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem'
              }}
            >
              Crear Reserva
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  // Renderizar lista de reservaciones
  const renderReservationsList = () => {
    if (sortedReservations.length === 0) {
      return <p className="no-reservations">No hay reservaciones para esta fecha.</p>;
    }
    
    return (
      <div className="reservations-list">
        <div className="filters-enhanced">
          <div className="filter-header">
            <h4>Filtrar reservas</h4>
            <span className="results-count">
              {sortedReservations.length} resultados
            </span>
          </div>
          
          <div className="filter-tabs-container">
            <button 
              className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              <FontAwesomeIcon icon={faList} />
              <span>Todas</span>
              <span className="filter-count">{dayStats.total}</span>
            </button>
            
            <button 
              className={`filter-tab confirmed ${filterStatus === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('confirmed')}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>Confirmadas</span>
              <span className="filter-count">{dayStats.confirmed}</span>
            </button>
            
            <button 
              className={`filter-tab cancelled ${filterStatus === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('cancelled')}
            >
              <FontAwesomeIcon icon={faTimesCircle} />
              <span>Canceladas</span>
              <span className="filter-count">{dayStats.cancelled}</span>
            </button>
          </div>
        </div>
        
        {/* Tabla para desktop */}
        <div className="reservations-table-container">
          <table className="reservations-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Mesa</th>
                <th>Personas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedReservations.map(reservation => (
                <tr 
                  key={reservation.id} 
                  className={`${selectedReservation && selectedReservation.id === reservation.id ? 'selected' : ''} status-${reservation.status}`}
                  onClick={() => handleSelectReservation(reservation)}
                >
                  <td>{reservation.time}</td>
                  <td>{reservation.name}</td>
                  <td>{reservation.tableName || 'N/A'}</td>
                  <td>{reservation.partySize}</td>
                  <td>
                    <span className={`status-badge ${reservation.status}`}>
                      {reservation.status === 'confirmed' ? 'Confirmada' : 
                       reservation.status === 'cancelled' ? 'Cancelada' : reservation.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-button view-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectReservation(reservation);
                      }}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards para móvil */}
        <div className="mobile-cards">
          {sortedReservations.map(reservation => (
            <div 
              key={reservation.id} 
              className={`reservation-card ${selectedReservation && selectedReservation.id === reservation.id ? 'selected' : ''}`}
              onClick={() => handleSelectReservation(reservation)}
            >
              <div className="reservation-card-header">
                <div className="reservation-time">{reservation.time}</div>
                <span className={`status-badge ${reservation.status}`}>
                  {reservation.status === 'confirmed' ? 'Confirmada' : 
                   reservation.status === 'cancelled' ? 'Cancelada' : reservation.status}
                </span>
              </div>
              
              <div className="reservation-card-body">
                <div className="reservation-info-item">
                  <div className="reservation-info-label">Cliente</div>
                  <div className="reservation-info-value">{reservation.name}</div>
                </div>
                
                <div className="reservation-info-item">
                  <div className="reservation-info-label">Mesa</div>
                  <div className="reservation-info-value">{reservation.tableName || 'N/A'}</div>
                </div>
                
                <div className="reservation-info-item">
                  <div className="reservation-info-label">Personas</div>
                  <div className="reservation-info-value">{reservation.partySize}</div>
                </div>
                
                <div className="reservation-info-item">
                  <div className="reservation-info-label">Teléfono</div>
                  <div className="reservation-info-value">{reservation.phone || 'N/A'}</div>
                </div>
              </div>
              
              <div className="reservation-card-actions">
                <button 
                  className="action-button view-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectReservation(reservation);
                  }}
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Renderizar detalles de reservación
  const renderReservationDetails = () => {
    if (isCreatingReservation) {
      return renderNewReservationForm();
    }
    
    if (!selectedReservation) {
      return <p className="select-message">Selecciona una reserva para ver sus detalles.</p>;
    }
    
    if (isEditing) {
      return (
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          animation: 'fadeIn 0.3s ease-in-out',
          color: '#333333',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <button 
            onClick={handleCloseDetails}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              color: '#555555',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <h3 style={{
            color: '#009B9B',
            fontSize: '1.4rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            textAlign: 'center',
            position: 'relative',
            paddingBottom: '0.8rem',
            backgroundColor: 'rgba(0, 155, 155, 0.08)',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            Editar Reserva
          </h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="edit-name" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Nombre:
            </label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={editForm.name}
              onChange={handleEditFormChange}
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="edit-email" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Email:
            </label>
            <input
              type="email"
              id="edit-email"
              name="email"
              value={editForm.email}
              onChange={handleEditFormChange}
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="edit-phone" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Teléfono:
            </label>
            <input
              type="tel"
              id="edit-phone"
              name="phone"
              value={editForm.phone}
              onChange={handleEditFormChange}
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, marginBottom: 0 }}>
              <label 
                htmlFor="edit-date" 
                style={{ 
                  display: 'block', 
                  marginBottom: '0.6rem', 
                  color: '#333333', 
                  fontWeight: '600', 
                  fontSize: '0.95rem' 
                }}
              >
                Fecha:
              </label>
              <input
                type="date"
                id="edit-date"
                name="date"
                value={editForm.date}
                onChange={handleEditFormChange}
                style={{
                  width: '100%',
                  padding: '0.9rem 1.2rem',
                  borderRadius: '8px',
                  border: '2px solid #d0d0d0',
                  color: '#333333',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              />
            </div>
            
            <div style={{ flex: 1, marginBottom: 0 }}>
              <label 
                htmlFor="edit-time" 
                style={{ 
                  display: 'block', 
                  marginBottom: '0.6rem', 
                  color: '#333333', 
                  fontWeight: '600', 
                  fontSize: '0.95rem' 
                }}
              >
                Hora:
              </label>
              <input
                type="time"
                id="edit-time"
                name="time"
                value={editForm.time}
                onChange={handleEditFormChange}
                style={{
                  width: '100%',
                  padding: '0.9rem 1.2rem',
                  borderRadius: '8px',
                  border: '2px solid #d0d0d0',
                  color: '#333333',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="edit-partySize" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Personas:
            </label>
            <input
              type="number"
              id="edit-partySize"
              name="partySize"
              value={editForm.partySize}
              onChange={handleEditFormChange}
              min="1"
              max="10"
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>
          
          {/* SELECTOR DE MESAS PARA EDICIÓN */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="edit-tableId" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Mesa:
            </label>
            <select
              id="edit-tableId"
              name="tableId"
              value={editForm.tableId || ''}
              onChange={handleEditFormChange}
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                appearance: 'none',
                backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '16px',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">Sin mesa asignada (asignación automática)</option>
              {tables && tables.map(table => (
                <option key={table._id} value={table._id}>
                  Mesa {table.number} - {table.capacity} personas ({table.location})
                </option>
              ))}
            </select>
            <p style={{
              color: '#666',
              fontSize: '0.85rem',
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              💡 Deja "Sin mesa asignada" para usar asignación automática según las reglas del restaurante
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="edit-specialRequests" 
              style={{ 
                display: 'block', 
                marginBottom: '0.6rem', 
                color: '#333333', 
                fontWeight: '600', 
                fontSize: '0.95rem' 
              }}
            >
              Peticiones especiales:
            </label>
            <textarea
              id="edit-specialRequests"
              name="specialRequests"
              value={editForm.specialRequests}
              onChange={handleEditFormChange}
              rows="3"
              style={{
                width: '100%',
                padding: '0.9rem 1.2rem',
                borderRadius: '8px',
                border: '2px solid #d0d0d0',
                color: '#333333',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                resize: 'vertical'
              }}
            ></textarea>
          </div>

          {/* Sección de Accesibilidad en formulario de edición */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.6rem', 
              color: '#333333', 
              fontWeight: '600', 
              fontSize: '0.95rem' 
            }}>
              Necesidades de accesibilidad:
            </label>
            <div className="accessibility-checkboxes">
              <div 
                className="accessibility-checkbox-item"
                onClick={(e) => {
                  // Solo activar si no se hizo clic directamente en el checkbox
                  if (e.target.type !== 'checkbox') {
                    const checkbox = document.getElementById('edit-needsBabyCart');
                    checkbox.checked = !checkbox.checked;
                    handleEditFormChange({ target: { name: 'needsBabyCart', type: 'checkbox', checked: checkbox.checked } });
                  }
                }}
              >
                <input
                  type="checkbox"
                  id="edit-needsBabyCart"
                  name="needsBabyCart"
                  checked={editForm.needsBabyCart}
                  onChange={handleEditFormChange}
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor="edit-needsBabyCart">
                  <span className="emoji">🍼</span>
                  Vengo con carrito de bebé
                </label>
              </div>
              
              <div 
                className="accessibility-checkbox-item"
                onClick={(e) => {
                  // Solo activar si no se hizo clic directamente en el checkbox
                  if (e.target.type !== 'checkbox') {
                    const checkbox = document.getElementById('edit-needsWheelchair');
                    checkbox.checked = !checkbox.checked;
                    handleEditFormChange({ target: { name: 'needsWheelchair', type: 'checkbox', checked: checkbox.checked } });
                  }
                }}
              >
                <input
                  type="checkbox"
                  id="edit-needsWheelchair"
                  name="needsWheelchair"
                  checked={editForm.needsWheelchair}
                  onChange={handleEditFormChange}
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor="edit-needsWheelchair">
                  <span className="emoji">♿</span>
                  Vengo con silla de ruedas
                </label>
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            borderTop: '1px solid #d0d0d0',
            paddingTop: '1.5rem',
            justifyContent: 'flex-end'
          }}>
            <button 
              type="button" 
              onClick={handleCancelEdit}
              style={{
                backgroundColor: '#f0f0f0',
                color: '#333333',
                border: 'none',
                minWidth: '140px',
                padding: '0.9rem 1.5rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem'
              }}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={handleSaveEdit}
              style={{
                backgroundColor: '#009B9B',
                color: 'white',
                border: 'none',
                minWidth: '140px',
                padding: '0.9rem 1.5rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem'
              }}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      );
    }
  };
  
  // Renderizar la gestión de lista negra
  const renderBlacklistManagement = () => (
    <BlacklistManagement />
  );

  const handleNavigateToOpiniones = () => {
    history.push('/admin/opiniones');
  };
  
  // Calcular estadísticas del día seleccionado
  const calculateDayStats = () => {
    const dayReservations = reservations.filter(reservation => 
      areDatesEqual(reservation.date, selectedDate)
    );
    
    const confirmed = dayReservations.filter(res => res.status === 'confirmed').length;
    const cancelled = dayReservations.filter(res => res.status === 'cancelled').length;
    const noShow = dayReservations.filter(res => res.status === 'no-show').length;
    const totalGuests = dayReservations
      .filter(res => res.status === 'confirmed')
      .reduce((sum, res) => sum + parseInt(res.partySize || 0), 0);
    
    // Calcular capacidad utilizada (asumiendo 50 personas como capacidad total del restaurante)
    const totalCapacity = 50;
    const occupancyRate = totalCapacity > 0 ? Math.round((totalGuests / totalCapacity) * 100) : 0;
    
    // Calcular horarios más populares
    const timeSlots = {};
    dayReservations
      .filter(res => res.status === 'confirmed')
      .forEach(res => {
        timeSlots[res.time] = (timeSlots[res.time] || 0) + 1;
      });
    
    const mostPopularTime = Object.keys(timeSlots).length > 0 
      ? Object.keys(timeSlots).reduce((a, b) => timeSlots[a] > timeSlots[b] ? a : b)
      : 'N/A';
    
    return {
      total: dayReservations.length,
      confirmed,
      cancelled,
      noShow,
      totalGuests,
      occupancyRate,
      mostPopularTime,
      averagePartySize: confirmed > 0 ? Math.round((totalGuests / confirmed) * 10) / 10 : 0
    };
  };

  const dayStats = calculateDayStats();
  
  // Función para cargar datos de la lista negra
  const loadBlacklistData = async () => {
    try {
      const blacklistData = await getBlacklist();
      setBlacklistEntries(blacklistData.entries || blacklistData || []);
    } catch (error) {
      console.error('Error al cargar lista negra:', error);
      toast.error('Error al cargar la lista negra: ' + error.message);
      setBlacklistEntries([]);
    }
  };

  // Función para remover de la lista negra
  const handleRemoveFromBlacklist = async (entryId) => {
    if (window.confirm('¿Estás seguro de que quieres remover este cliente de la lista negra?')) {
      try {
        setLoading(true);
        
        await removeFromBlacklist(entryId);
        
        // Recargar lista negra
        await loadBlacklistData();
        
        toast.success('Cliente removido de la lista negra');
      } catch (error) {
        console.error('Error al remover de lista negra:', error);
        toast.error('Error al remover cliente: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

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
        
      case 'phone':
        if (!value.trim()) {
          error = 'El teléfono es obligatorio';
        } else if (!/^[+]?[\d\s-()]{9,15}$/.test(value.replace(/\s/g, ''))) {
          error = 'Introduce un teléfono válido (mínimo 9 dígitos)';
        }
        break;
        
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Introduce un email válido (ejemplo@correo.com)';
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
          }
        }
        break;
        
      case 'time':
        if (!value) {
          error = 'La hora es obligatoria';
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
  
  // Modal para nueva reserva telefónica
  const renderNewReservationModal = () => {
    if (!showNewReservationModal) return null;
    
    return (
      <div style={{
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
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          color: '#333333',
          border: '2px solid #009B9B'
        }}>
          {/* Crucecita para cerrar */}
          <button 
            onClick={() => setShowNewReservationModal(false)}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: '#666',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              zIndex: 10001
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f5f5f5';
              e.target.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#666';
            }}
            title="Cerrar"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #e5e5e5'
          }}>
            <h3 style={{
              margin: 0,
              color: '#009B9B',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              fontSize: '1.6rem',
              fontWeight: 'bold'
            }}>
              <div style={{
                backgroundColor: '#009B9B',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
              Nueva Reserva Telefónica
            </h3>
          </div>

          {renderNewReservationForm()}
        </div>
      </div>
    );
  };
  
  // Modal para detalles de reserva
  const renderDetailsModal = () => {
    if (!showDetailsModal || !selectedReservation) return null;
    
    return (
      <div style={{
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
      }}>
        <div style={{
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
          border: '2px solid #006B3C'
        }}>
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
              color: '#006B3C',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              <FontAwesomeIcon icon={faList} /> Detalles de la Reserva
            </h3>
            <button 
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                color: '#666',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '4px'
              }}
              onClick={() => setShowDetailsModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            border: '1px solid #e5e5e5'
          }}>
            <div style={{ marginBottom: '0.8rem', display: 'flex' }}>
              <label style={{ flex: '0 0 120px', fontWeight: 600, color: '#333333' }}>Cliente:</label>
              <span style={{ flex: 1, color: '#333333' }}>{selectedReservation.name}</span>
            </div>
            <div style={{ marginBottom: '0.8rem', display: 'flex' }}>
              <label style={{ flex: '0 0 120px', fontWeight: 600, color: '#333333' }}>Email:</label>
              <span style={{ flex: 1, color: '#333333' }}>{selectedReservation.email}</span>
            </div>
            <div style={{ marginBottom: '0.8rem', display: 'flex' }}>
              <label style={{ flex: '0 0 120px', fontWeight: 600, color: '#333333' }}>Teléfono:</label>
              <span style={{ flex: 1, color: '#333333' }}>{selectedReservation.phone}</span>
            </div>
            <div style={{ marginBottom: '0.8rem', display: 'flex' }}>
              <label style={{ flex: '0 0 120px', fontWeight: 600, color: '#333333' }}>Fecha:</label>
              <span style={{ flex: 1, color: '#333333' }}>{selectedReservation.date}</span>
            </div>
            <div style={{ marginBottom: '0.8rem', display: 'flex' }}>
              <label style={{ flex: '0 0 120px', fontWeight: 600, color: '#333333' }}>Hora:</label>
              <span style={{ flex: 1, color: '#333333' }}>{selectedReservation.time}</span>
            </div>
            <div style={{ marginBottom: '0.8rem', display: 'flex' }}>
              <label style={{ flex: '0 0 120px', fontWeight: 600, color: '#333333' }}>Personas:</label>
              <span style={{ flex: 1, color: '#333333' }}>{selectedReservation.partySize}</span>
            </div>
            <div style={{ marginBottom: '0.8rem', display: 'flex' }}>
              <label style={{ flex: '0 0 120px', fontWeight: 600, color: '#333333' }}>Mesa:</label>
              <span style={{ flex: 1, color: '#333333' }}>{selectedReservation.tableName || 'N/A'}</span>
            </div>
            <div style={{ marginBottom: '0.8rem', display: 'flex' }}>
              <label style={{ flex: '0 0 120px', fontWeight: 600, color: '#333333' }}>Estado:</label>
              <span className={`status-badge ${selectedReservation.status}`} style={{ fontSize: '0.8rem' }}>
                {selectedReservation.status === 'confirmed' ? 'Confirmada' : 
                 selectedReservation.status === 'cancelled' ? 'Cancelada' : selectedReservation.status}
              </span>
            </div>
            <div style={{ display: 'flex' }}>
              <label style={{ flex: '0 0 120px', fontWeight: 600, color: '#333333' }}>ID Reserva:</label>
              <span style={{ flex: 1, color: '#333333', fontSize: '0.9rem', fontFamily: 'monospace' }}>{selectedReservation.id}</span>
            </div>
          </div>
          
          {selectedReservation.specialRequests && (
            <div style={{
              backgroundColor: '#fff8e1',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              border: '1px solid #ffe082'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#f57c00', fontSize: '1rem' }}>
                Peticiones especiales:
              </h4>
              <p style={{ margin: 0, color: '#333333', lineHeight: '1.4' }}>
                {selectedReservation.specialRequests}
              </p>
            </div>
          )}
          
          {(selectedReservation.needsBabyCart || selectedReservation.needsWheelchair) && (
            <div style={{
              backgroundColor: 'rgba(248, 182, 18, 0.1)',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              border: '1px solid rgba(248, 182, 18, 0.3)'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#F8B612', fontSize: '1rem' }}>
                Necesidades de accesibilidad:
              </h4>
              <div>
                {selectedReservation.needsBabyCart && (
                  <p style={{ margin: '0.2rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>🍼</span>
                    Carrito de bebé
                  </p>
                )}
                {selectedReservation.needsWheelchair && (
                  <p style={{ margin: '0.2rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>♿</span>
                    Silla de ruedas
                  </p>
                )}
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e5e5e5',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => {
                setShowDetailsModal(false);
                handleEditClick();
              }}
              style={{
                backgroundColor: '#009B9B',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: '1',
                minWidth: '120px',
                justifyContent: 'center'
              }}
            >
              <FontAwesomeIcon icon={faEdit} /> Editar
            </button>
            <button 
              onClick={() => {
                setShowDetailsModal(false);
                handleCancelReservation(selectedReservation.id);
              }}
              style={{
                backgroundColor: '#E63946',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: '1',
                minWidth: '120px',
                justifyContent: 'center'
              }}
            >
              <FontAwesomeIcon icon={faTimes} /> Cancelar
            </button>
            <button 
              onClick={() => {
                setShowDetailsModal(false);
                handleNoShow(selectedReservation);
              }}
              style={{
                backgroundColor: '#DC3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: '1',
                minWidth: '120px',
                justifyContent: 'center'
              }}
            >
              <FontAwesomeIcon icon={faUserSlash} /> No Show
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Función para obtener el estilo del campo según su estado
  return (
    <div className="admin-reservation-panel">
      <div className="panel-header">
        {/* Fila del Título */}
        <div className="panel-header-title-row">
          <h2>Panel de Administración de Reservas</h2>
          {viewMode !== 'blacklist' && (
            <div className="selected-date-info">
              <FontAwesomeIcon icon={faClock} />
              <span>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Fila de Botones */}
        <div className="panel-header-actions-row">
          <div className="action-group-left"> {/* Botón Nueva Reserva */}
            <button 
              className="btn btn-highlight" 
              onClick={handleNewReservationClick}
            >
              <FontAwesomeIcon icon={faPlus} /> Nueva Reserva
            </button>
          </div>

          <div className="action-group-right"> {/* Botones de Navegación */}
            <div className="button-group">
              <button 
                className="btn btn-secondary" 
                onClick={handleNavigateToOpiniones}
                aria-label="Opiniones"
              >
                <FontAwesomeIcon icon={faComments} /> 
                <span className="btn-text">Opiniones</span>
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleBackToHome}
                aria-label="Volver al Sitio"
              >
                <FontAwesomeIcon icon={faHome} />
                <span className="btn-text">Volver</span>
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleLogout}
                aria-label="Cerrar Sesión"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span className="btn-text">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="view-toggles">
        <button 
          className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <FontAwesomeIcon icon={faList} /> Lista de Reservas
        </button>
        <button 
          className={`view-toggle ${viewMode === 'blacklist' ? 'active' : ''}`}
          onClick={() => setViewMode('blacklist')}
        >
          <FontAwesomeIcon icon={faUserSlash} /> Lista Negra
        </button>
      </div>

      <div className="panel-content">
        {viewMode === 'list' && (
          <div className="reservations-container">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              padding: '0 2rem'
            }}>
                          <div className="reservations-grid">
                {/* Columna izquierda - Lista de reservas */}
                <div className="reservations-list-panel">
                  {renderReservationsList()}
                </div>
                
                {/* Columna derecha - Panel lateral */}
                <div className="sidebar-panel">
                  {/* Selector de fecha más compacto */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '0.9rem', fontWeight: '600' }}>
                      📅 Seleccionar Fecha
                    </h4>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}
                    />
                    <p style={{ 
                      margin: '0.5rem 0 0 0', 
                      fontSize: '0.8rem', 
                      color: '#6c757d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <FontAwesomeIcon icon={faList} />
                      {dayStats.total} {dayStats.total === 1 ? 'reserva' : 'reservas'}
                    </p>
                  </div>

                  {/* Estadísticas compactas */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(40, 167, 69, 0.1)',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      textAlign: 'center',
                      border: '1px solid rgba(40, 167, 69, 0.2)'
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                        {dayStats.confirmed}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#28a745', textTransform: 'uppercase' }}>
                        Confirmadas
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: 'rgba(220, 53, 69, 0.1)',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      textAlign: 'center',
                      border: '1px solid rgba(220, 53, 69, 0.2)'
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545' }}>
                        {dayStats.cancelled}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#dc3545', textTransform: 'uppercase' }}>
                        Canceladas
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: 'rgba(0, 155, 155, 0.1)',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      textAlign: 'center',
                      border: '1px solid rgba(0, 155, 155, 0.2)'
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#009B9B' }}>
                        {dayStats.totalGuests}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#009B9B', textTransform: 'uppercase' }}>
                        Comensales
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 193, 7, 0.2)'
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffc107' }}>
                        {dayStats.occupancyRate}%
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#ffc107', textTransform: 'uppercase' }}>
                        Ocupación
                      </div>
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  <div style={{
                    backgroundColor: '#fff3cd',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #ffeaa7'
                  }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#856404', fontSize: '0.9rem', fontWeight: '600' }}>
                      ⚡ Acciones Rápidas
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        onClick={handleNewReservationClick}
                        style={{
                          backgroundColor: '#009B9B',
                          color: 'white',
                          border: 'none',
                          padding: '0.6rem 1rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        Nueva Reserva Telefónica
                      </button>
                      
                      <button
                        onClick={() => setViewMode('blacklist')}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '0.6rem 1rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FontAwesomeIcon icon={faUserSlash} />
                        Gestionar Lista Negra
                      </button>
                      
                      <button
                        onClick={handleNavigateToOpiniones}
                        style={{
                          backgroundColor: '#6f42c1',
                          color: 'white',
                          border: 'none',
                          padding: '0.6rem 1rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FontAwesomeIcon icon={faComments} />
                        Ver Opiniones
                      </button>
                    </div>
                  </div>

                  {/* Información adicional si hay reserva seleccionada */}
                  {selectedReservation && (
                    <div style={{
                      backgroundColor: '#e7f3ff',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #b3d4fc'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#0066cc', fontSize: '0.9rem', fontWeight: '600' }}>
                        📋 Reserva Seleccionada
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#495057' }}>
                        <p style={{ margin: '0.2rem 0' }}><strong>{selectedReservation.name}</strong></p>
                        <p style={{ margin: '0.2rem 0' }}>{selectedReservation.time} - {selectedReservation.partySize} personas</p>
                        <p style={{ margin: '0.2rem 0' }}>Mesa: {selectedReservation.tableName || 'N/A'}</p>
                        <button
                          onClick={() => setShowDetailsModal(true)}
                          style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                            width: '100%'
                          }}
                        >
                          Ver Detalles Completos
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {viewMode === 'blacklist' && (
          <div className="blacklist-container" style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '0 2rem'
          }}>
            <div style={{ maxWidth: '1400px', width: '100%' }}>
              {renderBlacklistManagement()}
            </div>
          </div>
        )}
      </div>
      
      {showBlacklistModal && (
        <BlacklistModal
          isOpen={showBlacklistModal}
          onClose={() => setShowBlacklistModal(false)}
          customer={selectedCustomer}
          onAddToBlacklist={handleAddToBlacklist}
          reservationId={selectedReservation?.id}
        />
      )}
      {showCancelModal && (
        <CancelReservationModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          reservationData={selectedReservation}
          onConfirm={handleConfirmCancellation}
        />
      )}
      
      {/* Modal para nueva reserva telefónica */}
      {renderNewReservationModal()}
      
      {/* Modal para detalles de reserva */}
      {renderDetailsModal()}
    </div>
  );
};

export default AdminReservationPanel; 
