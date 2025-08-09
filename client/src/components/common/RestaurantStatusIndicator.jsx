import React, { useState, useEffect } from 'react';

// Función para obtener el estado de apertura del restaurante
const getRestaurantOpeningStatus = (currentDate = new Date()) => {
  const now = new Date(currentDate);
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinutes; // Tiempo en minutos desde medianoche
  
  // Si es lunes, está cerrado
  if (dayOfWeek === 1) {
    return {
      isOpen: false,
      closesAt: null,
      opensNext: "mañana a las 13:00"
    };
  }

  // Horarios del restaurante (en minutos desde medianoche)
  const lunchOpenTime = 13 * 60; // 13:00
  const lunchCloseTime = 16 * 60; // 16:00
  const dinnerOpenTime = 20 * 60; // 20:00
  const dinnerCloseTime = 23 * 60 + 30; // 23:30

  // Ajuste para viernes noche
  const isFriday = dayOfWeek === 5;
  const fridayDinnerCloseTime = 23 * 60 + 45; // 23:45

  // Ajuste para domingo (solo almuerzo)
  const isSunday = dayOfWeek === 0;
  
  const isLunchTime = currentTime >= lunchOpenTime && currentTime < lunchCloseTime;
  const isDinnerTime = !isSunday && currentTime >= dinnerOpenTime && currentTime < (isFriday ? fridayDinnerCloseTime : dinnerCloseTime);
  
  const isOpen = isLunchTime || isDinnerTime;
  
  let closesAt = null;
  let opensNext = null;
  
  if (isOpen) {
    if (isLunchTime) {
      closesAt = "16:00";
    } else {
      closesAt = isFriday ? "23:45" : "23:30";
    }
  } else {
    if (currentTime < lunchOpenTime) {
      // Antes del almuerzo
      opensNext = "hoy a las 13:00";
    } else if (currentTime < dinnerOpenTime && !isSunday) {
      // Entre almuerzo y cena
      opensNext = "hoy a las 20:00";
    } else {
      // Después de la cena o domingo tarde
      if (dayOfWeek === 0) {
        opensNext = "el martes a las 13:00"; // Domingo después del cierre
      } else if (dayOfWeek === 6) {
        opensNext = "mañana a las 13:00"; // Sábado noche
      } else {
        opensNext = "mañana a las 13:00";
      }
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
    const interval = setInterval(updateStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const updateStatus = () => {
    const now = new Date();
    setCurrentTime(now);
    setStatus(getRestaurantOpeningStatus(now));
  };

  return (
    <div className="restaurant-status">
      {status.isOpen ? (
        <div className="status-open">
          <span className="status-indicator open"></span>
          <span>Abierto ahora (cierra a las {status.closesAt})</span>
        </div>
      ) : (
        <div className="status-closed">
          <span className="status-indicator closed"></span>
          <span>Cerrado ahora (abre {status.opensNext})</span>
        </div>
      )}
    </div>
  );
};

export default RestaurantStatusIndicator; 