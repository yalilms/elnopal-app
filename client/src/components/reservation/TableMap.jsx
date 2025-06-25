import React, { useState, useEffect } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
// import './TableMap.css'; // Archivo eliminado - estilos ahora en sistema modular

const TableMap = ({ selectedDate, selectedTime, onTableSelect, partySize }) => {
  const { tables, checkTableAvailability, getReservations } = useReservation();
  const [selectedTable, setSelectedTable] = useState(null);
  const [hoveredTable, setHoveredTable] = useState(null);
  const [tableReservations, setTableReservations] = useState({});

  // Identify actual columns based ONLY on the new image for the middle row
  // The squares explicitly marked 'X' in the close-up image are the columns.
  // Let's assume based on the *image* provided the columns are: one before 11, one between 14 and 15, one between 18 and 19.
  // We need placeholder IDs or adjust existing IDs if these columns don't have numbers in your system.
  // FOR NOW, let's re-assign numbers to represent the visual layout accurately.
  // We'll use 91, 92, 93 as *temporary* IDs for the columns in the map layout.
  const columnVisualIDs = [91, 92, 93]; // Temporary IDs for visual columns

  // Redefine layout for the middle section based on the new close-up image
  // We will need to adjust the coordinates significantly
  const layoutConfig = {
    // Top Row (1-10) - Assuming these are correct from before
    1: { x: 900, y: 50, width: 60, height: 40 },
    2: { x: 820, y: 50, width: 60, height: 40 },
    3: { x: 740, y: 50, width: 60, height: 40 },
    4: { x: 660, y: 50, width: 60, height: 40 },
    5: { x: 580, y: 50, width: 60, height: 40 },
    6: { x: 500, y: 50, width: 60, height: 40 },
    7: { x: 420, y: 50, width: 60, height: 40 },
    8: { x: 340, y: 50, width: 60, height: 40 },
    9: { x: 260, y: 50, width: 60, height: 40 },
    10: { x: 180, y: 50, width: 60, height: 40 },

    // Middle Row (Based on close-up image)
    // Group 1: Column (X) - Table 11 - Table 12
    91: { x: 100, y: 150, width: 40, height: 40, isVisualColumn: true }, // Visual Column 'X'
    11: { x: 150, y: 150, width: 40, height: 40 }, // Table 11
    12: { x: 200, y: 150, width: 40, height: 40 }, // Table 12
    // Group 2: Table 13 - Table 14 - Column (X) - Table 15 - Table 16
    13: { x: 300, y: 150, width: 40, height: 40 }, // Table 13
    14: { x: 350, y: 150, width: 40, height: 40 }, // Table 14
    92: { x: 400, y: 150, width: 40, height: 40, isVisualColumn: true }, // Visual Column 'X'
    15: { x: 450, y: 150, width: 40, height: 40 }, // Table 15
    16: { x: 500, y: 150, width: 40, height: 40 }, // Table 16
    // Group 3: Table 17 - Table 18 - Column (X) - Table 19
    17: { x: 600, y: 150, width: 40, height: 40 }, // Table 17
    18: { x: 650, y: 150, width: 40, height: 40 }, // Table 18
    93: { x: 700, y: 150, width: 40, height: 40, isVisualColumn: true }, // Visual Column 'X'
    19: { x: 750, y: 150, width: 40, height: 40 }, // Table 19

    // Middle Right Group (20-21) - Assuming correct
    20: { x: 860, y: 150, width: 40, height: 40 },
    21: { x: 860, y: 200, width: 40, height: 40 },
    // Bottom Row (22-29) - Assuming correct
    22: { x: 860, y: 300, width: 60, height: 40 },
    23: { x: 780, y: 300, width: 60, height: 40 },
    24: { x: 640, y: 300, width: 60, height: 40 },
    25: { x: 560, y: 300, width: 60, height: 40 },
    26: { x: 420, y: 300, width: 60, height: 40 },
    27: { x: 340, y: 300, width: 60, height: 40 },
    28: { x: 200, y: 300, width: 60, height: 40 },
    29: { x: 120, y: 300, width: 60, height: 40 },
  };

  // Helper function to format YYYY-MM-DD to DD/MM/YYYY
  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return null;
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString; // Return original if formatting fails
    }
  };

  useEffect(() => {
    if (selectedTable) {
      if (!columnVisualIDs.includes(selectedTable.id)) {
        // Load and filter reservations when table or date changes
        loadAndFilterReservationsForTable(selectedTable.id);
      }
    } else {
      // Clear reservations if no table is selected
      setTableReservations({});
    }
  // Depend on selectedDate as well, to refilter when date changes
  }, [selectedTable, selectedDate]);

  const isTableAvailable = (table) => {
     // Visual columns are never available for selection
    if (columnVisualIDs.includes(table.id)) return false;

    if (!selectedDate || !selectedTime) return true; 
    // Check if table exists in the main tables list and is reservable
    const tableData = tables.find(t => t.id === table.id);
    if (!tableData || !tableData.reservable) return false;
    // Actual availability check
    return checkTableAvailability(table.id, selectedDate, selectedTime);
  };

  // Renamed and modified function: Loads ALL reservations and filters locally
  const loadAndFilterReservationsForTable = async (tableId) => {
    if (columnVisualIDs.includes(tableId)) return;

    const formattedDate = formatDateToDDMMYYYY(selectedDate);
    if (!formattedDate) {
      console.log('Cannot filter reservations without a valid date.');
      setTableReservations(prev => ({ ...prev, [tableId]: [] })); // Clear for this table if date invalid
      return;
    }

    console.log(`Filtering reservations for table ${tableId} on formatted date ${formattedDate}`);
    try {
      // 1. Get ALL reservations using the existing context function
      const allReservations = await getReservations(); 
      
      // 2. Filter reservations for the specific table and formatted date
      const filteredReservations = allReservations.filter(res => 
        res.date === formattedDate && // Compare with formatted date
        res.tableIds && res.tableIds.includes(tableId) && // Check if tableId is in the reservation's tableIds array
        res.status?.toLowerCase() !== 'cancelled' // Optional: ignore cancelled ones for the info panel
      );

      console.log('Filtered reservations for panel:', filteredReservations);
      
      // 3. Update the state for the specific tableId
      setTableReservations(prev => ({
        ...prev,
        [tableId]: filteredReservations
      }));

    } catch (error) {
      console.error('Error al obtener o filtrar reservaciones:', error);
       // Set empty array on error for this table
      setTableReservations(prev => ({ ...prev, [tableId]: [] }));
    }
  };

  const getTableColor = (table) => {
    // Check if it's a visual column first
    if (columnVisualIDs.includes(table.id)) {
        return '#a0a0a0'; // Grey for columns
    }

    // Find the actual table data from context/props for non-columns
    const tableData = tables.find(t => t.id === table.id);

    // Check reservable status from the actual table data
    if (!tableData || !tableData.reservable) return '#cccccc'; // Non-reservable tables (different grey)
    if (selectedTable && selectedTable.id === table.id) return '#4CAF50'; // Selected (Green)
    if (!isTableAvailable(table)) return '#ff4d4d'; // Unavailable (Red)
    if (hoveredTable && hoveredTable.id === table.id) return '#66bb6a'; // Hover available (Lighter Green)
    return '#e0e0e0'; // Default available (Light Grey)
  };

  const handleTableClick = (table) => {
     // Prevent clicking on visual columns
    if (columnVisualIDs.includes(table.id)) return;

    // Find actual table data for non-columns
    const tableData = tables.find(t => t.id === table.id);
    // Prevent clicking non-reservable tables
    if (!tableData || !tableData.reservable) return;

    // Only allow selection if the table is available
    if (!isTableAvailable(table)) {
         alert("Esta mesa no está disponible para la fecha y hora seleccionadas.");
         return;
    }
    const newSelectedTable = selectedTable?.id === table.id ? null : tableData;
    setSelectedTable(newSelectedTable);
    if (onTableSelect) onTableSelect(newSelectedTable);
  };

  const renderTableInfo = () => {
    if (!selectedTable || columnVisualIDs.includes(selectedTable.id)) return null;

    const displayDate = selectedDate ? formatDateToDDMMYYYY(selectedDate) : 'hoy';
    
    // Read the already filtered reservations from the state
    const reservations = tableReservations[selectedTable.id] || []; 
    
    return (
      <div className="table-info-panel">
        <h4>Mesa {selectedTable.number}</h4>
        <div className="table-details">
          <p>Capacidad: {selectedTable.capacity} personas</p>
          {/* Use displayDate for consistency */}
          <p><FontAwesomeIcon icon={faCalendarAlt} /> Reservas para {displayDate}:</p> 
          {reservations.length > 0 ? (
            <ul className="reservations-list">
              {reservations.map((res, idx) => (
                <li key={idx} className={`reservation-item ${res.status?.toLowerCase() || 'unknown'}`}>
                  <span className="time">{res.time}</span>
                  <span className="status">{res.status || 'Estado Desconocido'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-reservations">Sin reservas para este día</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="table-map-container">
      <div className="map-legend">
        <span className="legend-item"><span className="legend-color available"></span> Disponible</span>
        <span className="legend-item"><span className="legend-color unavailable"></span> No disponible</span>
        <span className="legend-item"><span className="legend-color selected"></span> Seleccionada</span>
        <span className="legend-item"><span className="legend-color column"></span> Columna</span>
      </div>
      <div className="map-content">
        <svg
          width="100%"
          height="450"
          viewBox="0 0 1000 400"
          className="table-map"
        >
          <rect x="0" y="0" width="1000" height="400" fill="#f0f0f0" />

          {Object.entries(layoutConfig).map(([idStr, config]) => {
            const id = parseInt(idStr, 10);
            // Determine if the current element is a visual column
            const isVisualColumn = config.isVisualColumn || false; 
            // Get table data if it's not a visual column
            const table = !isVisualColumn ? (tables.find(t => t.id === id) || { id: id, number: id }) : { id: id, number: 'X' }; // Basic info for rendering
            const tableData = !isVisualColumn ? tables.find(t => t.id === id) : null; // Actual data for checks
            const isReservable = tableData?.reservable ?? false; // Only actual tables can be reservable

            return (
              <g
                key={id}
                onClick={() => handleTableClick(table)} // Pass basic info
                onMouseEnter={() => !isVisualColumn && isReservable && setHoveredTable(table)}
                onMouseLeave={() => !isVisualColumn && setHoveredTable(null)}
                                  className={`${isVisualColumn ? 'column-element' : 'table-element'} ${!isVisualColumn && isReservable ? 'clickable' : ''}`}
              >
                <rect
                  x={config.x}
                  y={config.y}
                  width={config.width}
                  height={config.height}
                  fill={getTableColor(table)} // Pass basic info {id, number}
                  stroke="#333"
                  strokeWidth="1"
                  rx={isVisualColumn ? 0 : 4}
                />
                <text
                  x={config.x + config.width / 2}
                  y={config.y + config.height / 2 + 5}
                  textAnchor="middle"
                  fill={isVisualColumn ? "#fff" : "#000"}
                  fontSize="14"
                  fontWeight="bold"
                >
                  {isVisualColumn ? 'X' : table.number}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {renderTableInfo()}
    </div>
  );
};

export default TableMap; 