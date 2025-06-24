import React, { useState, useEffect } from 'react';
import './TableSelector.css';
import { getTables } from '../../services/tableService';

const TableSelector = ({ 
  date, 
  time, 
  partySize, 
  onTableSelect, 
  selectedTableId,
  onNoTablesAvailable = () => {} 
}) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'map'
  const [availableTables, setAvailableTables] = useState([]);

  // Cargar mesas disponibles cuando cambia la fecha, hora o tamaño del grupo
  useEffect(() => {
    const loadTables = async () => {
      if (!date || !time || !partySize) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // En un caso real, esto haría una llamada a la API con los parámetros
        const tablesData = await getTables(date, time, partySize);
        setTables(tablesData);
        
        // Filtrar mesas disponibles según el tamaño del grupo
        const filteredTables = tablesData.filter(table => {
          return table.capacity >= partySize && table.maxCapacity >= partySize && table.status === 'available';
        });
        
        setAvailableTables(filteredTables);
        
        // Si no hay mesas disponibles, notificar al componente padre
        if (filteredTables.length === 0) {
          onNoTablesAvailable();
        }
        
        // Si la mesa seleccionada ya no está disponible, deseleccionarla
        if (selectedTableId && !filteredTables.some(table => table.id === selectedTableId)) {
          onTableSelect(null);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las mesas disponibles');
        setLoading(false);
      }
    };

    loadTables();
  }, [date, time, partySize, selectedTableId, onTableSelect, onNoTablesAvailable]);

  const handleTableSelect = (tableId) => {
    // Verificar si la mesa está disponible
    const table = tables.find(t => t.id === tableId);
    if (!table || table.status !== 'available') {
      return;
    }
    
    // Verificar si la mesa tiene capacidad suficiente
    if (table.capacity < partySize) {
      return;
    }
    
    onTableSelect(selectedTableId === tableId ? null : tableId);
  };

  const groupTablesByZone = () => {
    const zones = {};
    availableTables.forEach(table => {
      if (!zones[table.zone]) {
        zones[table.zone] = [];
      }
      zones[table.zone].push(table);
    });
    return zones;
  };

  if (loading) {
    return (
      <div className="table-selector-container">
        <div className="table-selector-loading">Cargando mesas disponibles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-selector-container">
        <div className="table-selector-error">{error}</div>
      </div>
    );
  }

  if (!date || !time || !partySize) {
    return (
      <div className="table-selector-container">
        <p>Por favor, seleccione una fecha, hora y tamaño de grupo para ver las mesas disponibles.</p>
      </div>
    );
  }

  if (availableTables.length === 0) {
    return (
      <div className="table-selector-container">
        <p className="no-tables-message">No hay mesas disponibles para {partySize} personas en la fecha y hora seleccionadas.</p>
        <p>Por favor, intenta con un horario diferente o contacta directamente con el restaurante.</p>
      </div>
    );
  }

  const groupedTables = groupTablesByZone();

  return (
    <div className="table-selector-container">
      <div className="table-selector-toggle">
        <button 
          className={viewMode === 'list' ? 'active' : ''}
          onClick={() => setViewMode('list')}
        >
          Vista de Lista
        </button>
        <button 
          className={viewMode === 'map' ? 'active' : ''}
          onClick={() => setViewMode('map')}
        >
          Vista de Mapa
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="table-list">
          {availableTables.map(table => (
            <div
              key={table.id}
              className={`table-list-item ${selectedTableId === table.id ? 'selected' : ''} ${table.status !== 'available' ? 'unavailable' : ''}`}
              onClick={() => handleTableSelect(table.id)}
            >
              <div className="table-list-info">
                <span className="table-number">Mesa {table.number}</span>
                <span className="table-list-details">Zona: {table.zone}</span>
              </div>
              <span className="table-list-capacity">
                {table.capacity} {table.capacity > 1 ? 'personas' : 'persona'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-map">
          <div className="table-map-container">
            <div className="table-map-zones">
              {Object.entries(groupedTables).map(([zone, zoneTables]) => (
                <div key={zone} className="map-zone">
                  <div className="map-zone-title">{zone}</div>
                  {zoneTables.map(table => (
                    <div
                      key={table.id}
                      className={`table-item ${table.shape} ${selectedTableId === table.id ? 'selected' : ''} ${table.status !== 'available' ? 'unavailable' : ''}`}
                      style={{
                        position: 'absolute',
                        left: `${table.position.x}%`,
                        top: `${table.position.y}%`,
                        width: table.width,
                        height: table.height
                      }}
                      onClick={() => handleTableSelect(table.id)}
                    >
                      <span className="table-number">{table.number}</span>
                      <span className="table-capacity">{table.capacity}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTableId && (
        <div className="selected-table-info">
          Mesa seleccionada: {tables.find(t => t.id === selectedTableId)?.number} - 
          Capacidad: {tables.find(t => t.id === selectedTableId)?.capacity} personas
        </div>
      )}
    </div>
  );
};

export default TableSelector; 