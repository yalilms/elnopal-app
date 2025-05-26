// Definición de mesas del restaurante para desarrollo y pruebas

export const tables = [
  // Mesas de 2 personas (zona principal)
  {
    id: 'table-1',
    number: 1,
    capacity: 2,
    maxCapacity: 3,
    zone: 'Principal',
    shape: 'round',
    position: { x: 10, y: 20 },
    width: 60,
    height: 60,
    description: 'Mesa para dos con vista a la calle',
    status: 'available'
  },
  {
    id: 'table-2',
    number: 2,
    capacity: 2,
    maxCapacity: 3,
    zone: 'Principal',
    shape: 'round',
    position: { x: 10, y: 50 },
    width: 60,
    height: 60,
    description: 'Mesa para dos con vista a la calle',
    status: 'available'
  },
  {
    id: 'table-3',
    number: 3,
    capacity: 2,
    maxCapacity: 3,
    zone: 'Principal',
    shape: 'round',
    position: { x: 10, y: 80 },
    width: 60,
    height: 60,
    description: 'Mesa para dos con vista a la calle',
    status: 'available'
  },

  // Mesas de 4 personas (zona principal)
  {
    id: 'table-4',
    number: 4,
    capacity: 4,
    maxCapacity: 5,
    zone: 'Principal',
    shape: 'rectangular',
    position: { x: 40, y: 20 },
    width: 80,
    height: 60,
    description: 'Mesa rectangular para cuatro personas',
    status: 'available'
  },
  {
    id: 'table-5',
    number: 5,
    capacity: 4,
    maxCapacity: 5,
    zone: 'Principal',
    shape: 'rectangular',
    position: { x: 40, y: 50 },
    width: 80,
    height: 60,
    description: 'Mesa rectangular para cuatro personas',
    status: 'available'
  },
  {
    id: 'table-6',
    number: 6,
    capacity: 4,
    maxCapacity: 5,
    zone: 'Principal',
    shape: 'rectangular',
    position: { x: 40, y: 80 },
    width: 80,
    height: 60,
    description: 'Mesa rectangular para cuatro personas',
    status: 'available'
  },

  // Mesas de terraza
  {
    id: 'table-7',
    number: 7,
    capacity: 2,
    maxCapacity: 2,
    zone: 'Terraza',
    shape: 'round',
    position: { x: 20, y: 20 },
    width: 50,
    height: 50,
    description: 'Mesa pequeña en terraza',
    status: 'available'
  },
  {
    id: 'table-8',
    number: 8,
    capacity: 2,
    maxCapacity: 2,
    zone: 'Terraza',
    shape: 'round',
    position: { x: 20, y: 50 },
    width: 50,
    height: 50,
    description: 'Mesa pequeña en terraza',
    status: 'available'
  },
  {
    id: 'table-9',
    number: 9,
    capacity: 4,
    maxCapacity: 4,
    zone: 'Terraza',
    shape: 'rectangular',
    position: { x: 50, y: 30 },
    width: 70,
    height: 50,
    description: 'Mesa mediana en terraza',
    status: 'available'
  },
  {
    id: 'table-10',
    number: 10,
    capacity: 6,
    maxCapacity: 6,
    zone: 'Terraza',
    shape: 'rectangular',
    position: { x: 50, y: 70 },
    width: 100,
    height: 60,
    description: 'Mesa grande en terraza',
    status: 'available'
  },

  // Mesas en zona privada
  {
    id: 'table-11',
    number: 11,
    capacity: 6,
    maxCapacity: 8,
    zone: 'Privada',
    shape: 'rectangular',
    position: { x: 30, y: 40 },
    width: 120,
    height: 70,
    description: 'Mesa para grupos en sala privada',
    status: 'available'
  },
  {
    id: 'table-12',
    number: 12,
    capacity: 8,
    maxCapacity: 10,
    zone: 'Privada',
    shape: 'rectangular',
    position: { x: 60, y: 40 },
    width: 150,
    height: 80,
    description: 'Mesa grande para grupos en sala privada',
    status: 'available'
  }
];

// Datos de las mesas del restaurante
export const tablesData = [
  // Mesa 1 - No reservable (solo walk-in)
  { id: 1, number: 1, capacity: 1, position: { x: 770, y: 50 }, size: { width: 60, height: 60 }, status: 'free', reservable: false },
  
  // Mesas 2-10 (1-3 personas)
  { id: 2, number: 2, capacity: 3, position: { x: 690, y: 50 }, size: { width: 60, height: 60 }, status: 'free', reservable: true },
  { id: 3, number: 3, capacity: 3, position: { x: 610, y: 50 }, size: { width: 60, height: 60 }, status: 'free', reservable: true },
  { id: 4, number: 4, capacity: 3, position: { x: 530, y: 50 }, size: { width: 60, height: 60 }, status: 'free', reservable: true },
  { id: 5, number: 5, capacity: 3, position: { x: 450, y: 50 }, size: { width: 60, height: 60 }, status: 'free', reservable: true },
  { id: 6, number: 6, capacity: 3, position: { x: 370, y: 50 }, size: { width: 60, height: 60 }, status: 'free', reservable: true },
  { id: 7, number: 7, capacity: 3, position: { x: 290, y: 50 }, size: { width: 60, height: 60 }, status: 'free', reservable: true },
  { id: 8, number: 8, capacity: 3, position: { x: 210, y: 50 }, size: { width: 60, height: 60 }, status: 'free', reservable: true },
  { id: 9, number: 9, capacity: 3, position: { x: 130, y: 50 }, size: { width: 60, height: 60 }, status: 'free', reservable: true },
  { id: 10, number: 10, capacity: 3, position: { x: 50, y: 50 }, size: { width: 60, height: 60 }, status: 'free', reservable: true },

  // Mesas 11-18 (4-5 personas, van en pares)
  { id: 11, number: 11, capacity: 5, position: { x: 50, y: 160 }, size: { width: 120, height: 60 }, status: 'free', reservable: true, pairedWith: 12 },
  { id: 12, number: 12, capacity: 5, position: { x: 180, y: 160 }, size: { width: 120, height: 60 }, status: 'free', reservable: true, pairedWith: 11 },
  { id: 13, number: 13, capacity: 5, position: { x: 320, y: 160 }, size: { width: 120, height: 60 }, status: 'free', reservable: true, pairedWith: 14 },
  { id: 14, number: 14, capacity: 5, position: { x: 440, y: 160 }, size: { width: 120, height: 60 }, status: 'free', reservable: true, pairedWith: 13 },
  { id: 15, number: 15, capacity: 5, position: { x: 580, y: 160 }, size: { width: 120, height: 60 }, status: 'free', reservable: true, pairedWith: 16 },
  { id: 16, number: 16, capacity: 5, position: { x: 700, y: 160 }, size: { width: 120, height: 60 }, status: 'free', reservable: true, pairedWith: 15 },
  { id: 17, number: 17, capacity: 5, position: { x: 580, y: 160 }, size: { width: 120, height: 60 }, status: 'free', reservable: true, pairedWith: 18 },
  { id: 18, number: 18, capacity: 5, position: { x: 700, y: 160 }, size: { width: 120, height: 60 }, status: 'free', reservable: true, pairedWith: 17 },

  // Mesa 19 - No reservable (solo walk-in)
  { id: 19, number: 19, capacity: 1, position: { x: 720, y: 160 }, size: { width: 60, height: 60 }, status: 'free', reservable: false },
  
  // Mesas 20-21 (6-7 personas, siempre juntas)
  { id: 20, number: 20, capacity: 7, position: { x: 720, y: 240 }, size: { width: 60, height: 120 }, status: 'free', reservable: true, pairedWith: 21 },
  { id: 21, number: 21, capacity: 7, position: { x: 720, y: 240 }, size: { width: 60, height: 120 }, status: 'free', reservable: true, pairedWith: 20 },

  // Mesas 22-29 (para 4-8 personas, van en pares)
  { id: 22, number: 22, capacity: 8, position: { x: 50, y: 360 }, size: { width: 60, height: 60 }, status: 'free', reservable: true, pairedWith: 23 },
  { id: 23, number: 23, capacity: 8, position: { x: 130, y: 360 }, size: { width: 60, height: 60 }, status: 'free', reservable: true, pairedWith: 22 },
  { id: 24, number: 24, capacity: 8, position: { x: 290, y: 360 }, size: { width: 60, height: 60 }, status: 'free', reservable: true, pairedWith: 25 },
  { id: 25, number: 25, capacity: 8, position: { x: 370, y: 360 }, size: { width: 60, height: 60 }, status: 'free', reservable: true, pairedWith: 24 },
  { id: 26, number: 26, capacity: 5, position: { x: 530, y: 360 }, size: { width: 60, height: 60 }, status: 'free', reservable: true, pairedWith: 27 },
  { id: 27, number: 27, capacity: 5, position: { x: 610, y: 360 }, size: { width: 60, height: 60 }, status: 'free', reservable: true, pairedWith: 26 },
  { id: 28, number: 28, capacity: 5, position: { x: 720, y: 360 }, size: { width: 60, height: 60 }, status: 'free', reservable: true, pairedWith: 29 },
  { id: 29, number: 29, capacity: 5, position: { x: 800, y: 360 }, size: { width: 60, height: 60 }, status: 'free', reservable: true, pairedWith: 28 }
];

// Función auxiliar para obtener una mesa por su ID
export const getTableById = (id) => {
  return tablesData.find(table => table.id === id);
};

// Función para filtrar mesas por zona
export const getTablesByZone = (zone) => {
  return tables.filter(table => table.zone === zone);
};

// Función para filtrar mesas por capacidad
export const getTablesByCapacity = (minCapacity, maxCapacity) => {
  return tablesData.filter(table => 
    table.capacity >= minCapacity && 
    (maxCapacity ? table.capacity <= maxCapacity : true)
  );
};

// Función para obtener mesas adecuadas según el tamaño del grupo
export const getTablesByPartySize = (partySize) => {
  if (partySize <= 3) {
    // Para grupos pequeños (1-3 personas), mesas pequeñas
    return tablesData.filter(table => table.type === 'small' && table.reservable);
  } else if (partySize <= 5) {
    // Para grupos medianos (4-5 personas), mesas medianas
    return tablesData.filter(table => 
      (table.type === 'medium' || table.type === 'large') && table.reservable
    );
  } else if (partySize <= 8) {
    // Para grupos grandes (6-8 personas), mesas grandes
    return tablesData.filter(table => table.type === 'large' && table.reservable);
  } else if (partySize <= 10) {
    // Para grupos muy grandes (9-10 personas), mesas combinables
    return tablesData.filter(table => 
      table.combinableWith && table.combinableWith.length > 0 && table.reservable
    );
  } else {
    // Para grupos extremadamente grandes, será necesario combinar múltiples mesas
    return [];
  }
};

// Horarios del restaurante
const RESTAURANT_HOURS = {
  start: 13, // 1 PM
  end: 23,   // 11 PM
  interval: 30 // intervalos de 30 minutos
};

export const getTimeSlotsForDay = (date) => {
  const slots = [];
  const now = new Date();
  const selectedDate = new Date(date);
  const isToday = selectedDate.toDateString() === now.toDateString();
  const dayOfWeek = selectedDate.getDay();

  // Obtener los horarios del día seleccionado
  const dayHours = operatingHours[dayOfWeek];

  // Si es lunes o el restaurante está cerrado ese día, retornar array vacío
  if (!dayHours || dayHours.length === 0) {
    return [];
  }

  // Para cada turno (almuerzo y cena)
  dayHours.forEach(shift => {
    const [openHour, openMinute] = shift.open.split(':').map(Number);
    const [closeHour, closeMinute] = shift.close.split(':').map(Number);
    
    // Convertir la hora de cierre a minutos desde medianoche
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
    
    let startHour = openHour;
    let startMinute = openMinute;

    // Si es hoy, ajustar la hora de inicio según la hora actual
    if (isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      // Si el turno ya pasó, saltar al siguiente
      if (currentTimeInMinutes >= closeTimeInMinutes) {
        return;
      }
      
      // Si estamos dentro del turno, ajustar la hora de inicio
      if (currentHour >= openHour) {
        startHour = currentHour;
        // Redondear al siguiente intervalo de 30 minutos
        startMinute = currentMinute >= 30 ? 60 : 30;
        
        // Si los minutos son 60, incrementar la hora
        if (startMinute === 60) {
          startHour++;
          startMinute = 0;
        }
      }
    }

    // Generar slots hasta 1 hora antes del cierre
    const lastPossibleSlotMinutes = closeTimeInMinutes - 60; // 1 hora antes del cierre

    // Generar slots de tiempo para este turno (intervalos de 30 minutos)
    for (let hour = startHour; hour <= closeHour; hour++) {
      for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 30) {
        const currentSlotMinutes = hour * 60 + minute;
        
        // Si este slot está a más de 1 hora del cierre
        if (currentSlotMinutes <= lastPossibleSlotMinutes) {
          const formattedHour = hour.toString().padStart(2, '0');
          const formattedMinute = minute.toString().padStart(2, '0');
          slots.push(`${formattedHour}:${formattedMinute}`);
        }
      }
    }

    // Verificar si hay un slot especial exactamente 1 hora antes del cierre
    // (para casos como viernes que cierra a 23:45, última reserva a 22:45)
    const lastSlotHour = Math.floor(lastPossibleSlotMinutes / 60);
    const lastSlotMinute = lastPossibleSlotMinutes % 60;
    const lastSlotTime = `${lastSlotHour.toString().padStart(2, '0')}:${lastSlotMinute.toString().padStart(2, '0')}`;
    
    // Si el slot especial no está ya incluido y es válido, agregarlo
    if (!slots.includes(lastSlotTime) && lastPossibleSlotMinutes >= (startHour * 60 + startMinute)) {
      slots.push(lastSlotTime);
    }
  });

  return slots.sort();
};

// Ejemplo de uso (se puede eliminar o comentar)
// const today = new Date().toISOString().split('T')[0];
// console.log(`Slots para hoy (${new Date(today).toLocaleDateString('es-ES', { weekday: 'long' })}):`, getTimeSlotsForDay(today));
// console.log("Todos los slots (sin filtrar por día):", availableTimeSlots);

// Función para encontrar la mejor mesa según el tamaño del grupo y las reglas de asignación
export const findBestTable = (partySize, date, time, reservations) => {
  // Verificar que el tamaño del grupo sea válido
  if (partySize > 8) {
    throw new Error('Para grupos de más de 8 personas, por favor contacte directamente con el restaurante.');
  }

  // Función auxiliar para verificar disponibilidad
  const isTableAvailable = (tableId, date, time) => {
    return !reservations.some(res => 
      res.date === date && 
      res.time === time && 
      res.status === 'confirmed' &&
      (res.tableIds.includes(tableId) || res.tableIds.includes(tablesData.find(t => t.id === tableId)?.pairedWith))
    );
  };

  // 1. Para grupos de 1-3 personas
  if (partySize <= 3) {
    for (let i = 2; i <= 10; i++) {
      const table = tablesData.find(t => t.number === i);
      if (table && table.reservable && isTableAvailable(table.id, date, time)) {
        return [table];
      }
    }
  }

  // 2. Para grupos de 4-5 personas
  if (partySize <= 5) {
    // Primero intentar con las mesas 11-18
    for (let i = 11; i <= 18; i += 2) {
      const table1 = tablesData.find(t => t.number === i);
      const table2 = tablesData.find(t => t.number === i + 1);
      if (table1 && table2 && isTableAvailable(table1.id, date, time) && isTableAvailable(table2.id, date, time)) {
        return [table1, table2];
      }
    }
    
    // Luego intentar con las mesas 26-29
    for (let i = 26; i <= 28; i += 2) {
      const table1 = tablesData.find(t => t.number === i);
      const table2 = tablesData.find(t => t.number === i + 1);
      if (table1 && table2 && isTableAvailable(table1.id, date, time) && isTableAvailable(table2.id, date, time)) {
        return [table1, table2];
      }
    }
    
    // Finalmente intentar con las mesas 22-25
    for (let i = 22; i <= 24; i += 2) {
      const table1 = tablesData.find(t => t.number === i);
      const table2 = tablesData.find(t => t.number === i + 1);
      if (table1 && table2 && isTableAvailable(table1.id, date, time) && isTableAvailable(table2.id, date, time)) {
        return [table1, table2];
      }
    }
  }

  // 3. Para grupos de 6-7 personas
  if (partySize <= 7) {
    // Primero intentar con las mesas 20-21
    const table20 = tablesData.find(t => t.number === 20);
    const table21 = tablesData.find(t => t.number === 21);
    if (table20 && table21 && isTableAvailable(table20.id, date, time) && isTableAvailable(table21.id, date, time)) {
      return [table20, table21];
    }
    
    // Luego intentar con las mesas 22-25
    for (let i = 22; i <= 24; i += 2) {
      const table1 = tablesData.find(t => t.number === i);
      const table2 = tablesData.find(t => t.number === i + 1);
      if (table1 && table2 && isTableAvailable(table1.id, date, time) && isTableAvailable(table2.id, date, time)) {
        return [table1, table2];
      }
    }
  }

  // 4. Para grupos de 8 personas
  if (partySize === 8) {
    // Intentar con las mesas 22-25
    for (let i = 22; i <= 24; i += 2) {
      const table1 = tablesData.find(t => t.number === i);
      const table2 = tablesData.find(t => t.number === i + 1);
      if (table1 && table2 && isTableAvailable(table1.id, date, time) && isTableAvailable(table2.id, date, time)) {
        return [table1, table2];
      }
    }
  }

  // Si no se encontró ninguna mesa disponible
  return null;
};

// Horarios de Operación del Restaurante
const operatingHours = {
  0: [{ open: "13:00", close: "16:30" }], // Domingo
  1: [], // Lunes (Cerrado)
  2: [{ open: "13:00", close: "15:30" }, { open: "20:00", close: "23:30" }], // Martes
  3: [{ open: "13:00", close: "16:00" }, { open: "20:00", close: "23:30" }], // Miércoles
  4: [{ open: "13:00", close: "16:00" }, { open: "20:00", close: "23:30" }], // Jueves
  5: [{ open: "13:00", close: "16:30" }, { open: "20:00", close: "23:45" }], // Viernes
  6: [{ open: "13:00", close: "16:30" }, { open: "20:00", close: "23:30" }], // Sábado
};

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Función para convertir HH:MM a minutos desde la medianoche
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const getRestaurantOpeningStatus = (currentDate = new Date()) => {
  const currentDay = currentDate.getDay();
  const currentTimeInMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  
  const todayHours = operatingHours[currentDay];
  let isOpen = false;
  let closesAt = null;
  let opensNext = null;

  // Verificar si el restaurante está abierto ahora
  if (todayHours && todayHours.length > 0) {
    for (const slot of todayHours) {
      const openTime = timeToMinutes(slot.open);
      const closeTime = timeToMinutes(slot.close);
      
      if (currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime) {
        isOpen = true;
        closesAt = slot.close;
        break;
      }
    }
  }

  // Si está cerrado, encontrar la próxima apertura
  if (!isOpen) {
    // Primero verificar si abre más tarde hoy
    let foundNextOpening = false;
    
    if (todayHours && todayHours.length > 0) {
      for (const slot of todayHours) {
        const openTime = timeToMinutes(slot.open);
        if (currentTimeInMinutes < openTime) {
          opensNext = `Hoy a las ${slot.open}`;
          foundNextOpening = true;
          break;
        }
      }
    }
    
    // Si no abre más tarde hoy, buscar en los próximos días
    if (!foundNextOpening) {
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDay + i) % 7;
        const nextDayHours = operatingHours[nextDayIndex];
        
        if (nextDayHours && nextDayHours.length > 0) {
          const dayLabel = i === 1 ? "Mañana" : dayNames[nextDayIndex];
          opensNext = `${dayLabel} a las ${nextDayHours[0].open}`;
          break;
        }
      }
    }
  }
  
  return { isOpen, closesAt, opensNext };
};