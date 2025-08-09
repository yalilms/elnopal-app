import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  getAllReservations, 
  createReservation as apiCreateReservation,
  updateReservation as apiUpdateReservation,
  cancelReservation as apiCancelReservation,
  markReservationNoShow as apiMarkNoShow,
  checkAvailability as apiCheckAvailability,
  getAllTables
} from '../services/reservationService';

// Crear el contexto
const ReservationContext = createContext();

// Proveedor del contexto
export const ReservationProvider = ({ children }) => {
  // Estado para las mesas (obtenidas de la API)
  const [tables, setTables] = useState([]);
  
  // Estado para las reservaciones (obtenidas de la API)
  const [reservations, setReservations] = useState([]);
  
  // Estado de carga
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar mesas desde la API al inicializar
  useEffect(() => {
    loadTables();
  }, []);

  // Función para cargar mesas desde la API
  const loadTables = async () => {
    try {
      setLoading(true);
      const tablesData = await getAllTables();
      
      // Convertir formato de la API al formato esperado por el frontend
      const formattedTables = tablesData.map(table => ({
        id: table._id || table.id,
        number: table.number,
        capacity: table.capacity || table.maxGuests,
        maxCapacity: table.maxGuests || table.capacity,
        minCapacity: table.minGuests || 1,
        zone: table.location || 'Principal',
        shape: table.capacity <= 2 ? 'round' : 'rectangular',
        position: { 
          x: table.positionX || 50, 
          y: table.positionY || 50 
        },
        width: table.capacity <= 2 ? 60 : (table.capacity <= 4 ? 80 : 120),
        height: table.capacity <= 2 ? 60 : (table.capacity <= 4 ? 60 : 80),
        description: table.notes || `Mesa ${table.number}`,
        status: 'available',
        reservable: table.isActive !== false,
        isAccessible: table.isAccessible || false
      }));
      
      setTables(formattedTables);
      setError(null);
    } catch (error) {
      console.error('Error al cargar mesas desde la API:', error);
      const errorMessage = error.response?.data?.message || 'No se pudieron cargar los datos de las mesas desde el servidor. Por favor, contacta con el soporte técnico.';
      setError(errorMessage);
      toast.error(errorMessage);
      setTables([]); // Dejar las mesas vacías en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar reservas desde la API
  const loadReservations = async (filters = {}) => {
    try {
      setLoading(true);
      const reservationsData = await getAllReservations(filters);
      
      // Convertir formato de la API al formato esperado por el frontend
      const formattedReservations = reservationsData.map(reservation => ({
        id: reservation._id || reservation.id,
        name: reservation.customer?.name || '',
        email: reservation.customer?.email || '',
        phone: reservation.customer?.phone || '',
        date: reservation.date ? new Date(reservation.date).toISOString().split('T')[0] : '',
        time: reservation.time || '',
        partySize: reservation.partySize || 1,
        status: reservation.status || 'confirmed',
        tableIds: reservation.table ? [reservation.table._id || reservation.table] : [],
        tableName: reservation.table ? `Mesa ${reservation.table.number}` : 'Sin asignar',
        assignedTables: reservation.table ? [{
          id: reservation.table._id || reservation.table,
          number: reservation.table.number || 0,
          capacity: reservation.table.capacity || 2,
          zone: reservation.table.location || 'Principal'
        }] : [],
        specialRequests: reservation.specialRequests || '',
        needsBabyCart: reservation.needsBabyCart || false,
        needsWheelchair: reservation.needsWheelchair || false,
        createdAt: reservation.createdAt || new Date().toISOString(),
        // Campos adicionales del backend
        tableId: reservation.table?._id || reservation.table,
        duration: reservation.duration || 90,
        endTime: reservation.endTime || '',
        occasion: reservation.occasion || 'none',
        source: reservation.source || 'online',
        notes: reservation.notes || ''
      }));
      
      setReservations(formattedReservations);
      setError(null);
      return formattedReservations;
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      setError('Error al cargar las reservas');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Función para hacer una reserva
  const makeReservation = async (reservationData) => {
    try {
      setLoading(true);
      
      // Preparar datos para la API
      const apiData = {
        name: reservationData.name,
        email: reservationData.email,
        phone: reservationData.phone,
        date: reservationData.date,
        time: reservationData.time,
        partySize: parseInt(reservationData.partySize),
        tableId: reservationData.tableId || null,
        specialRequests: reservationData.specialRequests || '',
        needsBabyCart: reservationData.needsBabyCart || false,
        needsWheelchair: reservationData.needsWheelchair || false
      };

      console.log('Creando reserva con datos:', apiData);
      
      const response = await apiCreateReservation(apiData);
      
      // Recargar reservas después de crear una nueva
      await loadReservations();
      
      setError(null);
      
      return {
        reservationId: response.reservation.id || response.reservation._id,
        tableInfo: response.reservation.table ? [{
          id: response.reservation.table._id || response.reservation.table,
          number: response.reservation.table.number || 0,
          capacity: response.reservation.table.capacity || 2,
          zone: response.reservation.table.location || 'Principal'
        }] : []
      };
    } catch (error) {
      console.error('Error al crear reserva:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar una reserva
  const cancelReservation = async (reservationId, reason = '') => {
    try {
      setLoading(true);
      
      await apiCancelReservation(reservationId, reason);
      
      // Recargar reservas después de cancelar
      await loadReservations();
      
      setError(null);
      return true;
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar el estado de una reserva
  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      setLoading(true);
      
      if (newStatus === 'no-show') {
        await apiMarkNoShow(reservationId);
      } else {
        await apiUpdateReservation(reservationId, { status: newStatus });
      }
      
      // Recargar reservas después de actualizar
      await loadReservations();
      
      setError(null);
      return true;
    } catch (error) {
      console.error('Error al actualizar estado de reserva:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar una reserva completa
  const updateReservation = async (reservationId, updateData) => {
    try {
      setLoading(true);
      
      await apiUpdateReservation(reservationId, updateData);
      
      // Recargar reservas después de actualizar
      await loadReservations();
      
      setError(null);
      return true;
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener estadísticas de disponibilidad
  const getAvailabilityStats = async (date, time) => {
    try {
      const availability = await apiCheckAvailability(date, time, 1);
      
      const totalTables = tables.filter(t => t.reservable !== false).length;
      const availableTables = availability.availableTables || 0;
      const occupancyRate = totalTables > 0 ? ((totalTables - availableTables) / totalTables) * 100 : 0;

      return {
        totalTables,
        availableTables,
        occupancyRate
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      
      // Fallback a cálculo local
      const totalTables = tables.filter(t => t.reservable !== false).length;
      const dateReservations = reservations.filter(
        r => r.date === date && r.time === time && r.status === 'confirmed'
      );
      const reservedTables = dateReservations.length;

      return {
        totalTables,
        availableTables: Math.max(0, totalTables - reservedTables),
        occupancyRate: totalTables > 0 ? (reservedTables / totalTables) * 100 : 0
      };
    }
  };

  // Función para obtener todas las reservaciones (alias para compatibilidad)
  const getReservations = async (filters = {}) => {
    return await loadReservations(filters);
  };

  // Función para verificar disponibilidad
  const checkAvailability = async (date, time, partySize) => {
    try {
      return await apiCheckAvailability(date, time, partySize);
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  };

  // Función para actualizar el estado de una mesa (mantenida para compatibilidad)
  const updateTableStatus = (tableId, newStatus) => {
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === tableId ? { ...table, status: newStatus } : table
      )
    );
  };

  // Función para refrescar datos
  const refreshData = async () => {
    await Promise.all([
      loadTables(),
      loadReservations()
    ]);
  };

  return (
    <ReservationContext.Provider value={{
      // Estados
      tables,
      reservations,
      loading,
      error,
      
      // Funciones principales
      makeReservation,
      cancelReservation,
      updateReservationStatus,
      updateReservation,
      getAvailabilityStats,
      getReservations,
      checkAvailability,
      
      // Funciones de carga
      loadReservations,
      loadTables,
      refreshData,
      
      // Funciones auxiliares (mantenidas para compatibilidad)
      updateTableStatus
    }}>
      {children}
    </ReservationContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation debe ser usado dentro de un ReservationProvider');
  }
  return context;
};

export default ReservationContext; 