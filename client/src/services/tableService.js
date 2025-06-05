import api from './api';

// Función para obtener todas las mesas
export const getAllTables = async () => {
  try {
    const response = await api.get('/api/tables');
    return response.data.tables || response.data;
  } catch (error) {
    console.error('Error al obtener todas las mesas:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener mesas');
  }
};

// Función para inicializar mesas por defecto
export const initializeDefaultTables = async () => {
  try {
    const response = await api.post('/api/tables/initialize');
    return response.data;
  } catch (error) {
    console.error('Error al inicializar mesas:', error);
    throw new Error(error.response?.data?.message || 'Error al inicializar mesas');
  }
};

// Función para obtener mesas disponibles según fecha, hora y tamaño del grupo
export const getTables = async (date, time, partySize) => {
  try {
    const response = await api.get('/api/tables/available', {
      params: { date, time, partySize }
    });
    return response.data.tables || response.data;
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener mesas');
  }
};

// Función para reservar una mesa específica
export const reserveTable = async (tableId, reservationData) => {
  try {
    const response = await api.post(`/api/tables/${tableId}/reserve`, reservationData);
    return response.data;
  } catch (error) {
    console.error('Error al reservar mesa:', error);
    throw new Error(error.response?.data?.message || 'Error al reservar mesa');
  }
};

// Función para obtener información detallada de una mesa específica
export const getTableDetails = async (tableId) => {
  try {
    const response = await api.get(`/api/tables/${tableId}`);
    return response.data.table || response.data;
  } catch (error) {
    console.error('Error al obtener detalles de mesa:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener detalles de mesa');
  }
}; 