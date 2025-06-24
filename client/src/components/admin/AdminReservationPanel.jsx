import React, { useState, useEffect } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { markAsNoShow as apiMarkNoShow } from '../../services/reservationService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faTimes, faUser, faPhone, faEnvelope, 
  faCheck, faList, faUserSlash,
  faComments, faHome, faSignOutAlt
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

  /* Fila del título principal */
  .panel-header-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .panel-header-title-row h2 {
    color: #0f5132;
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    font-weight: 700;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
  }

  .panel-header-title-row h2::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #F8B612, #FFD700);
    border-radius: 2px;
  }

  /* Información de fecha seleccionada */
  .selected-date-info {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: rgba(15, 81, 50, 0.1);
    padding: 0.8rem 1.5rem;
    border-radius: 25px;
    border: 2px solid rgba(15, 81, 50, 0.2);
    backdrop-filter: blur(5px);
  }

  .selected-date-info svg {
    color: #D62828;
    font-size: 1.1rem;
  }

  .selected-date-info span {
    color: #0f5132;
    font-size: 1rem;
    font-weight: 600;
    text-transform: capitalize;
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
  
  // Estados de validación utilizados
  const [newFormErrors, setNewFormErrors] = useState({});
  const [newFormTouched, setNewFormTouched] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editFormTouched, setEditFormTouched] = useState({});
  
  // Estados de modales utilizados
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
      await loadReservations();
      
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

  // Funciones para manejo de blacklist usando servicios
  const handleAddToBlacklistService = async (blacklistData) => {
    try {
      await addToBlacklist({
        ...blacklistData,
        reservationId: selectedReservation.id
      });
      
      // Actualizar el estado de la reserva a "no-show"
      await apiMarkNoShow(selectedReservation.id);
      
      // Recargar las reservaciones
      await loadReservations();
      
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
  
  const loadBlacklistDataService = async () => {
    try {
      // Llamar directamente a la API de blacklist
      const response = await fetch('/api/blacklist', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setBlacklistEntries(Array.isArray(data) ? data : (data.data || data.entries || []));
      return data;
    } catch (error) {
      console.error('Error loading blacklist:', error);
      setBlacklistEntries([]);
      throw error;
    }
  };

  const handleRemoveFromBlacklistService = async (entryId) => {
    try {
      // Llamar directamente a la API para remover de blacklist
      const response = await fetch(`/api/blacklist/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Recargar la lista después de eliminar
      await loadBlacklistDataService();
    } catch (error) {
      console.error('Error al remover de blacklist:', error);
      throw error;
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
  
  // Funciones faltantes para corregir errores ESLint
  const addToBlacklist = async (blacklistData) => {
    try {
      const response = await fetch('/api/blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(blacklistData)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      throw error;
    }
  };

  const removeFromBlacklist = async (entryId) => {
    try {
      const response = await fetch(`/api/blacklist/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      throw error;
    }
  };

  const loadBlacklistData = async () => {
    return await loadBlacklistDataService();
  };

  const handleNavigateToOpiniones = () => {
    history.push('/admin/reviews');
  };

  // Calcular estadísticas del día
  const dayStats = React.useMemo(() => {
    const dayReservations = reservations.filter(res => areDatesEqual(res.date, selectedDate));
    
    const total = dayReservations.length;
    const confirmed = dayReservations.filter(res => res.status === 'confirmed').length;
    const cancelled = dayReservations.filter(res => res.status === 'cancelled').length;
    const totalGuests = dayReservations.reduce((sum, res) => sum + (res.partySize || 0), 0);
    
    // Calcular tasa de ocupación aproximada (asumiendo capacidad total de 40 personas)
    const maxCapacity = 40;
    const occupancyRate = total > 0 ? Math.round((totalGuests / maxCapacity) * 100) : 0;
    
    return {
      total,
      confirmed,
      cancelled,
      totalGuests,
      occupancyRate: Math.min(occupancyRate, 100)
    };
  }, [reservations, selectedDate]);

  const renderNewReservationForm = () => {
    return (
      <div>
        <p>Formulario de nueva reserva (función placeholder)</p>
      </div>
    );
  };

  const renderReservationsList = () => {
    return (
      <div>
        <p>Lista de reservaciones (función placeholder)</p>
      </div>
    );
  };

  const renderBlacklistManagement = () => {
    return (
      <BlacklistManagement
        blacklistEntries={blacklistEntries}
        onLoadData={loadBlacklistDataService}
        onRemoveFromBlacklist={handleRemoveFromBlacklistService}
        loading={loading}
      />
    );
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
          onAddToBlacklist={handleAddToBlacklistService}
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
