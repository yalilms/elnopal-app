import React, { useState, useEffect } from 'react';

// Función para obtener el estado de apertura del restaurante
const getRestaurantOpeningStatus = (currentDate = new Date()) => {
  const now = new Date(currentDate);
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinutes; // Tiempo en minutos desde medianoche
  
  // Horarios del restaurante (en minutos desde medianoche)
  const openTime = 12 * 60; // 12:00 PM
  const closeTime = 22 * 60; // 10:00 PM
  
  const isOpen = currentTime >= openTime && currentTime < closeTime;
  
  let closesAt = null;
  let opensNext = null;
  
  if (isOpen) {
    // Si está abierto, calcular cuándo cierra
    closesAt = "10:00 PM";
  } else {
    // Si está cerrado, calcular cuándo abre
    if (currentTime < openTime) {
      // Antes de la hora de apertura del mismo día
      opensNext = "hoy a las 12:00 PM";
    } else {
      // Después de la hora de cierre, abre mañana
      opensNext = "mañana a las 12:00 PM";
    }
  }
  
  return {
    isOpen,
    closesAt,
    opensNext
  };
};

const RestaurantStatusIndicator = () => {
  const [status, setStatus] = useState({ isOpen: false, closesAt: null, opensNext: null });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Actualizar el estado inicial con la hora actual
    updateStatus();

    // Actualizar cada minuto
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60000 ms = 1 minuto

    return () => clearInterval(intervalId);
  }, []);

  // Actualizar el estado cuando cambie la hora actual
  useEffect(() => {
    updateStatus();
  }, [currentTime]);

  // Función para actualizar el estado según la hora actual
  const updateStatus = () => {
    try {
      const restaurantStatus = getRestaurantOpeningStatus(new Date());
      setStatus(restaurantStatus);
    } catch (error) {
      console.error("Error al obtener el estado del restaurante:", error);
    }
  };
  
  // Si no hay información de estado o el restaurante está cerrado y no hay información de próxima apertura,
  // no renderizar nada para evitar mostrar "Cerrado ahora" sin detalles.
  if (!status || (!status.isOpen && !status.opensNext)) {
    return null;
  }

  return (
    <div className={`status-indicator ${status.isOpen ? 'open' : 'closed'}`}>
      <span className="status-icon"></span>
      {status.isOpen ? (
        <p>
          <strong>Abierto ahora</strong>
          {status.closesAt && <span className="details"> (cierra a las {status.closesAt})</span>}
        </p>
      ) : (
        // No mostrar nada si está cerrado y no hay información de opensNext
        status.opensNext && (
          <p>
            <strong>Cerrado ahora</strong>
            <span className="details"> (abre {status.opensNext})</span>
          </p>
        )
      )}
    </div>
  );
};

export default RestaurantStatusIndicator; 