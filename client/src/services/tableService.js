import axios from 'axios';

// Importamos los datos de ejemplo para uso en desarrollo
import { tables } from '../data/tablesData';

// Función para obtener mesas disponibles según fecha, hora y tamaño del grupo
export const getTables = async (date, time, partySize) => {
  try {
    // En un entorno de producción, esto sería una llamada a la API:
    // const response = await axios.get('/api/tables/available', {
    //   params: { date, time, partySize }
    // });
    // return response.data;
    
    // Para desarrollo, simulamos la respuesta del servidor con datos locales
    // y un pequeño retraso para simular la latencia de red
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulamos disponibilidad: algunas mesas están ocupadas en ciertas fechas/horas
        const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
        const isPeakHour = ['19:00', '20:00', '21:00'].includes(time);
        
        // Simulamos que algunas mesas están ocupadas en momentos de alta demanda
        const simulatedTables = tables.map(table => {
          // Para simular ocupación, marcamos algunas mesas como no disponibles
          // basándonos en condiciones como fin de semana o hora pico
          const isAvailable = !(
            // Mesas pequeñas tienden a llenarse en horas pico
            (table.capacity <= 2 && isPeakHour) ||
            // Las mesas de la zona Privada se llenan los fines de semana
            (table.zone === 'Privada' && isWeekend && isPeakHour) ||
            // Algunas mesas específicas están en mantenimiento
            (table.id === 'table-5' || table.id === 'table-12') ||
            // Simulación aleatoria para algunas mesas
            (Math.random() < 0.2 && isPeakHour)
          );
          
          return {
            ...table,
            status: isAvailable ? 'available' : 'reserved'
          };
        });
        
        resolve(simulatedTables);
      }, 500); // Simulamos 500ms de latencia
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
};

// Función para reservar una mesa específica
export const reserveTable = async (tableId, reservationData) => {
  try {
    // En producción:
    // const response = await axios.post(`/api/tables/${tableId}/reserve`, reservationData);
    // return response.data;
    
    // Para desarrollo, simulamos la respuesta
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Mesa ${tableId} reservada exitosamente`,
          reservation: {
            ...reservationData,
            tableId,
            status: 'confirmed',
            confirmationCode: `RES-${Math.floor(Math.random() * 10000)}`
          }
        });
      }, 700);
    });
  } catch (error) {
    console.error('Error reserving table:', error);
    throw error;
  }
};

// Función para obtener información detallada de una mesa específica
export const getTableDetails = async (tableId) => {
  try {
    // En producción:
    // const response = await axios.get(`/api/tables/${tableId}`);
    // return response.data;
    
    // Para desarrollo, buscamos en los datos locales
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const table = tables.find(t => t.id === tableId);
        if (table) {
          resolve(table);
        } else {
          reject(new Error('Mesa no encontrada'));
        }
      }, 300);
    });
  } catch (error) {
    console.error('Error fetching table details:', error);
    throw error;
  }
}; 