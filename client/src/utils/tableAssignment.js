// Configuración de mesas
const tables = {
  // Mesas no reservables
  nonReservable: [1, 19],
  
  // Mesas para 1-3 personas (individuales)
  small: [2, 3, 4, 5, 6, 7, 8, 9, 10],
  
  // Mesas para 4-5 personas (en pares)
  medium: [
    { group: [11, 12], status: "available" },
    { group: [13, 14], status: "available" },
    { group: [15, 16], status: "available" },
    { group: [17, 18], status: "available" },
    { group: [20, 21], status: "available" },
    { group: [28, 29], status: "available" },
    { group: [26, 27], status: "available" },
    { group: [24, 25], status: "available" },
    { group: [22, 23], status: "available" }
  ],
  
  // Mesas para 6-7 personas
  large: [
    { group: [20, 21], status: "available" },
    { group: [22, 23], status: "available" },
    { group: [24, 25], status: "available" }
  ],
  
  // Mesas para 8 personas
  extraLarge: [
    { group: [22, 23], status: "available" },
    { group: [24, 25], status: "available" }
  ]
};

/**
 * Encuentra las mejores mesas disponibles según el tamaño del grupo
 * @param {number} partySize - Número de personas
 * @param {string} date - Fecha de la reserva
 * @param {string} time - Hora de la reserva
 * @param {Array} reservations - Lista de reservas existentes
 * @returns {Array|null} - Array de mesas asignadas o null si no hay disponibilidad
 */
export const findBestTables = (partySize, date, time, reservations) => {
  // Obtener mesas ya reservadas para esta fecha y hora
  const reservedTables = getReservedTables(date, time, reservations);

  // Para grupos de más de 8 personas
  if (partySize > 8) {
    throw new Error('Para grupos de más de 8 personas, por favor contacte directamente con el restaurante.');
  }

  // Para grupos de 1-3 personas
  if (partySize <= 3) {
    for (const tableId of tables.small) {
      if (!reservedTables.includes(tableId)) {
        return [{
          id: tableId,
          number: tableId,
          capacity: 3,
          zone: 'Principal',
          type: 'small'
        }];
      }
    }
  }

  // Para grupos de 4-5 personas
  if (partySize <= 5) {
    for (const tableGroup of tables.medium) {
      const [table1Id, table2Id] = tableGroup.group;
      if (!reservedTables.includes(table1Id) && !reservedTables.includes(table2Id)) {
        return [
          {
            id: table1Id,
            number: table1Id,
            capacity: 5,
            zone: 'Principal',
            type: 'medium'
          },
          {
            id: table2Id,
            number: table2Id,
            capacity: 5,
            zone: 'Principal',
            type: 'medium'
          }
        ];
      }
    }
  }

  // Para grupos de 6-7 personas
  if (partySize <= 7) {
    for (const tableGroup of tables.large) {
      const [table1Id, table2Id] = tableGroup.group;
      if (!reservedTables.includes(table1Id) && !reservedTables.includes(table2Id)) {
        return [
          {
            id: table1Id,
            number: table1Id,
            capacity: 7,
            zone: 'Principal',
            type: 'large'
          },
          {
            id: table2Id,
            number: table2Id,
            capacity: 7,
            zone: 'Principal',
            type: 'large'
          }
        ];
      }
    }
  }

  // Para grupos de 8 personas
  if (partySize === 8) {
    for (const tableGroup of tables.extraLarge) {
      const [table1Id, table2Id] = tableGroup.group;
      if (!reservedTables.includes(table1Id) && !reservedTables.includes(table2Id)) {
        return [
          {
            id: table1Id,
            number: table1Id,
            capacity: 8,
            zone: 'Principal',
            type: 'extraLarge'
          },
          {
            id: table2Id,
            number: table2Id,
            capacity: 8,
            zone: 'Principal',
            type: 'extraLarge'
          }
        ];
      }
    }
  }

  return null;
};

/**
 * Obtiene las mesas reservadas para una fecha y hora específicas
 */
function getReservedTables(date, time, reservations) {
  return reservations
    .filter(res => res.date === date && res.time === time && res.status === 'confirmed')
    .flatMap(res => res.tableIds);
}

export const isTableReservable = (tableId) => {
  return !tables.nonReservable.includes(tableId);
}; 