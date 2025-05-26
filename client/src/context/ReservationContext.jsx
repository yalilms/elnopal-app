import React, { createContext, useState, useContext, useEffect } from 'react';
import { tablesData } from '../data/tablesData';
import { findBestTables, isTableReservable } from '../utils/tableAssignment';

// Crear el contexto
const ReservationContext = createContext();

// Proveedor del contexto
export const ReservationProvider = ({ children }) => {
  // Estado para las mesas
  const [tables, setTables] = useState(tablesData);
  
  // Estado para las reservaciones
  const [reservations, setReservations] = useState(() => {
    const savedReservations = localStorage.getItem('reservations');
    return savedReservations ? JSON.parse(savedReservations) : [];
  });
  
  // Guardar reservaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('reservations', JSON.stringify(reservations));
  }, [reservations]);
  
  // Función para actualizar el estado de una mesa
  const updateTableStatus = (tableId, newStatus) => {
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === tableId ? { ...table, status: newStatus } : table
      )
    );
  };
  
  // Función para hacer una reserva
  const makeReservation = (reservationData) => {
    // Encontrar las mesas disponibles según el tamaño del grupo
    const assignedTables = findBestTables(
      parseInt(reservationData.partySize),
      reservationData.date,
      reservationData.time,
      reservations
    );

    if (!assignedTables) {
      throw new Error('No hay mesas disponibles para el tamaño de grupo y horario seleccionado.');
    }

    // Generar un ID único para la reserva
    const reservationId = Date.now().toString();
    
    // Obtener información detallada de las mesas asignadas
    const tableDetails = assignedTables.map(table => ({
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      zone: table.zone || 'Principal'
    }));

    // Crear la nueva reserva con las mesas asignadas
    const newReservation = {
      ...reservationData,
      id: reservationId,
      status: 'confirmed',
      tableIds: tableDetails.map(t => t.id),
      tableName: tableDetails.map(t => `Mesa ${t.number}`).join(' y '),
      assignedTables: tableDetails,
      createdAt: new Date().toISOString()
    };
    
    // Añadir la reserva
    setReservations(prevReservations => [...prevReservations, newReservation]);
    
    // Actualizar el estado de las mesas
    tableDetails.forEach(table => {
      updateTableStatus(table.id, 'reserved');
    });
    
    return {
      reservationId,
      tableInfo: tableDetails
    };
  };
  
  // Función para cancelar una reserva
  const cancelReservation = (reservationId) => {
    const reservation = reservations.find(res => res.id === reservationId);
    
    if (reservation) {
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === reservationId ? { ...res, status: 'cancelled' } : res
        )
      );
      
      if (reservation.tableIds) {
        reservation.tableIds.forEach(tableId => {
          updateTableStatus(tableId, 'available');
        });
      }
      
      return true;
    }
    
    return false;
  };

  // Función para obtener estadísticas de disponibilidad
  const getAvailabilityStats = (date, time) => {
    const totalTables = tables.filter(t => isTableReservable(t.id)).length;
    const reservedTables = reservations.filter(
      r => r.date === date && r.time === time && r.status === 'confirmed'
    ).length;

    return {
      totalTables,
      availableTables: totalTables - reservedTables,
      occupancyRate: (reservedTables / totalTables) * 100
    };
  };

  // Función para obtener todas las reservaciones
  const getReservations = async () => {
    try {
      // Por ahora, como estamos usando localStorage, simplemente retornamos las reservaciones existentes
      return reservations;
    } catch (error) {
      console.error('Error al obtener reservaciones:', error);
      throw error;
    }
  };

  // Función para actualizar el estado de una reserva
  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === reservationId ? { ...res, status: newStatus } : res
        )
      );
      return true;
    } catch (error) {
      console.error('Error al actualizar estado de reserva:', error);
      throw error;
    }
  };

  return (
    <ReservationContext.Provider value={{
      tables,
      reservations,
      makeReservation,
      cancelReservation,
      getAvailabilityStats,
      updateTableStatus,
      updateReservationStatus,
      getReservations
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