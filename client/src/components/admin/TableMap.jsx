import React, { useState, useEffect } from 'react';
import { tablesData } from '../../data/tablesData';
import { useReservation } from '../../context/ReservationContext';

const TableMap = ({ onSelectTable, selectedTableId, selectedDate, isAdmin }) => {
  const { reservations } = useReservation();
  const [tableReservationMap, setTableReservationMap] = useState({});
  
  // Verificar directamente el localStorage
  useEffect(() => {
    try {
      const savedReservations = localStorage.getItem('reservations');
      if (savedReservations) {
        const parsedReservations = JSON.parse(savedReservations);
        console.log('TableMap - Reservas desde localStorage:', parsedReservations);
        
        // Imprimir información detallada de tableIds en las reservas
        parsedReservations.forEach((res, idx) => {
          console.log(`Reserva ${idx + 1} - ID: ${res.id}, Fecha: ${res.date}, tableIds:`, res.tableIds);
        });
      } else {
        console.log('TableMap - No hay reservas en localStorage');
      }
    } catch (error) {
      console.error('Error al leer reservas del localStorage:', error);
    }
  }, []);
  
  // Log para depuración de la fecha recibida
  console.log('TableMap - Fecha recibida:', selectedDate);
  console.log('TableMap - Todas las reservas disponibles:', reservations);
  
  // Cargar las reservas para la fecha seleccionada cuando cambia la fecha
  useEffect(() => {
    if (!selectedDate) return;
    
    console.log('TableMap - Filtrando reservas para fecha:', selectedDate);
    
    const formatDateParts = (dateStr) => {
      if (!dateStr || typeof dateStr !== 'string') {
        // console.warn('[TableMap] formatDateParts: Entrada no válida o no es string:', dateStr);
        return null;
      }

      let day, month, year;

      // Intenta parsear como DD/MM/YYYY primero
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          [day, month, year] = parts;
          if (year && month && day && year.length === 4 && month.length >= 1 && month.length <= 2 && day.length >= 1 && day.length <= 2 &&
              !isNaN(parseInt(year)) && !isNaN(parseInt(month)) && !isNaN(parseInt(day)) &&
              day !== 'undefined' && month !== 'undefined') {
            return {
              day: String(day).padStart(2, '0'),
              month: String(month).padStart(2, '0'),
              year: String(year)
            };
          }
        }
      }
      
      // Intenta parsear como YYYY-MM-DD
      if (dateStr.includes('-')) {
         const parts = dateStr.split('-');
         if (parts.length === 3) {
          [year, month, day] = parts;
          if (year && month && day && year.length === 4 && month.length >= 1 && month.length <= 2 && day.length >= 1 && day.length <= 2 &&
              !isNaN(parseInt(year)) && !isNaN(parseInt(month)) && !isNaN(parseInt(day))) {
            return {
              day: String(day).padStart(2, '0'),
              month: String(month).padStart(2, '0'),
              year: String(year)
            };
          }
        }
      }
      
      // console.warn('[TableMap] formatDateParts: Formato no reconocido, devolviendo null:', dateStr);
      return null;
    };
    
    // Comparar fechas independientemente del formato
    const areDatesEqual = (date1, date2) => {
      const parts1 = formatDateParts(date1);
      const parts2 = formatDateParts(date2);
      
      if (!parts1 || !parts2) return false;
      
      return parts1.day === parts2.day && 
             parts1.month === parts2.month && 
             parts1.year === parts2.year;
    };
    
    // Filtrar reservas para la fecha seleccionada
    const reservationsForDate = reservations.filter(res => {
      console.log(`Comparando: reserva.date=${res.date} con selectedDate=${selectedDate}`);
      
      const dateMatch = areDatesEqual(res.date, selectedDate);
      const statusOk = res.status === 'confirmed' || !res.status;
      
      console.log(`- Match: ${dateMatch}, Status OK: ${statusOk}`);
      return dateMatch && statusOk;
    });
    
    console.log('TableMap - Reservas filtradas por fecha:', reservationsForDate.length);
    
    // Crear mapa de mesas a reservas
    const tableMap = {};
    reservationsForDate.forEach(res => {
      if (res.tableIds && res.tableIds.length > 0) {
        res.tableIds.forEach(tableId => {
          // Convertir el ID a número si es necesario
          const id = typeof tableId === 'string' ? parseInt(tableId, 10) : tableId;
          
          if (!tableMap[id]) tableMap[id] = [];
          tableMap[id].push(res);
        });
      } else if (res.tableId) {
        // Caso alternativo si la reserva usa tableId en lugar de tableIds
        const id = typeof res.tableId === 'string' ? parseInt(res.tableId, 10) : res.tableId;
        
        if (!tableMap[id]) tableMap[id] = [];
        tableMap[id].push(res);
      }
    });
    
    console.log('TableMap - Mapa de reservas por mesa:', tableMap);
    setTableReservationMap(tableMap);
  }, [selectedDate, reservations]);
  
  // Color según estado de la mesa
  const getTableColor = (table) => {
    // Si la mesa está seleccionada, usar un borde azul
    if (selectedTableId === table.id) {
      return 'bg-blue-500';
    }
    
    // Si hay reservas para esta mesa en la fecha seleccionada
    if (tableReservationMap[table.id] && tableReservationMap[table.id].length > 0) {
      return 'bg-yellow-500'; // Reservada
    }
    
    // Usar el estado existente de la mesa
    switch (table.status) {
      case 'free':
        return 'bg-green-500';
      case 'reserved':
        return 'bg-yellow-500';
      case 'occupied':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const handleTableClick = (table) => {
    // Añadir las reservas asociadas a la mesa
    const tableWithReservations = {
      ...table,
      reservations: tableReservationMap[table.id] || []
    };
    
    console.log('TableMap - Mesa seleccionada:', table.id, table.number);
    console.log('TableMap - Reservas de la mesa:', tableWithReservations.reservations);
    
    // Mostrar las reservas asociadas con esta mesa
    if (onSelectTable) {
      onSelectTable(tableWithReservations);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Plano del Restaurante</h2>
      
      {/* Indicador de fecha */}
      <div className="text-sm text-gray-600 mb-2">
        Mostrando disponibilidad para: {selectedDate || 'Todas las fechas'}
      </div>
      
      {/* Leyenda */}
      <div className="flex space-x-4 text-sm mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-sm mr-1"></div>
          <span>Libre</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 rounded-sm mr-1"></div>
          <span>Reservada</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-sm mr-1"></div>
          <span>Ocupada</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-sm mr-1"></div>
          <span>Seleccionada</span>
        </div>
      </div>
      
      {/* Área de mapa */}
      <div 
        className="relative border bg-gray-100 h-[500px] w-full overflow-hidden"
        style={{ minWidth: '900px' }}
      >
        {tablesData.map((table) => (
          <div
            key={table.id}
            className={`absolute rounded-md shadow cursor-pointer flex items-center justify-center border-2 ${
              selectedTableId === table.id ? 'border-blue-600' : 'border-transparent'
            } ${getTableColor(table)}`}
            style={{
              left: `${table.position.x}px`,
              top: `${table.position.y}px`,
              width: `${table.size.width}px`,
              height: `${table.size.height}px`
            }}
            onClick={() => handleTableClick(table)}
          >
            <div className="text-center">
              <div className="font-bold text-white">Mesa {table.number}</div>
              <div className="text-xs text-white">{table.capacity} pers.</div>
              {tableReservationMap[table.id] && tableReservationMap[table.id].length > 0 && (
                <div className="text-xs font-bold bg-white text-red-600 rounded px-1 mt-1">
                  {tableReservationMap[table.id].length} reserva(s)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableMap; 