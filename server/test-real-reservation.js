const axios = require('axios');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

console.log('🌮 Testing Real Reservation Email Flow');
console.log('======================================\n');

// Configuración de la API
const API_BASE_URL = 'http://localhost:5000'; // URL del backend en el VPS
// Si estás probando en producción, cambiar a: 'http://elnopal.es:5000'

// Datos de prueba para reserva real
const testReservationData = {
  customer: {
    name: 'Usuario Prueba Real',
    email: 'tu-email-real@gmail.com', // ¡CAMBIAR POR TU EMAIL REAL!
    phone: '+34 666 123 456'
  },
  date: '2024-12-25',
  time: '20:30',
  partySize: 4,
  specialRequests: 'Prueba de correos desde API',
  needsBabyCart: false,
  needsWheelchair: false
};

async function testRealReservation() {
  try {
    console.log('📧 Enviando reserva real a la API...');
    console.log('Datos:', JSON.stringify(testReservationData, null, 2));
    console.log('URL:', `${API_BASE_URL}/api/reservations`);
    console.log('');

    const response = await axios.post(`${API_BASE_URL}/api/reservations`, testReservationData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000 // 30 segundos
    });

    console.log('✅ Reserva creada exitosamente!');
    console.log('Respuesta del servidor:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');

    console.log('📋 Qué verificar ahora:');
    console.log('1. ¿Llegó correo de confirmación a:', testReservationData.customer.email, '?');
    console.log('2. ¿Llegó correo de notificación al restaurante?');
    console.log('3. Revisar logs del servidor para errores de email');
    console.log('');

    // Verificar en la base de datos si se guardó correctamente
    const reservationId = response.data.reservation.id;
    console.log(`🔍 ID de la reserva creada: ${reservationId}`);
    
    // Intentar obtener la reserva para verificar estado de emails
    try {
      const getResponse = await axios.get(`${API_BASE_URL}/api/reservations/${reservationId}`);
      const reservation = getResponse.data.reservation;
      
      console.log('📊 Estado de envío de correos:');
      console.log(`- Correo de confirmación enviado: ${reservation.confirmationEmailSent || 'No'}`);
      console.log(`- Fecha envío confirmación: ${reservation.confirmationEmailSentAt || 'No disponible'}`);
      console.log(`- Correo de notificación enviado: ${reservation.notificationEmailSent || 'No'}`);
      console.log(`- Fecha envío notificación: ${reservation.notificationEmailSentAt || 'No disponible'}`);
      
    } catch (getError) {
      console.log('⚠️  No se pudo verificar el estado de la reserva:', getError.message);
    }

  } catch (error) {
    console.error('❌ Error en la reserva:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
      console.error('¿Está corriendo el servidor backend?');
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testBackendConnection() {
  try {
    console.log('🔍 Verificando conexión al backend...');
    const response = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });
    console.log('✅ Backend responde correctamente');
    return true;
  } catch (error) {
    console.log('❌ Backend no responde:');
    console.log('- Error:', error.message);
    console.log('- ¿Está corriendo pm2?');
    console.log('- ¿Está corriendo en el puerto correcto?');
    console.log('- Verificar: pm2 status');
    console.log('- Verificar: pm2 logs elnopal-backend');
    return false;
  }
}

async function runTest() {
  console.log('⚠️  IMPORTANTE: Cambiar el email en testReservationData por uno real!');
  console.log('');
  
  const backendOK = await testBackendConnection();
  console.log('');
  
  if (!backendOK) {
    console.log('🛑 No se puede continuar sin conexión al backend');
    return;
  }
  
  await testRealReservation();
  
  console.log('');
  console.log('🎯 Próximos pasos si no llegan correos:');
  console.log('1. Revisar logs del backend: pm2 logs elnopal-backend');
  console.log('2. Verificar variables de entorno EMAIL_* en el VPS');
  console.log('3. Verificar que el servicio emailService se esté cargando');
  console.log('4. Comprobar que no haya errores en la consola del servidor');
}

// Ejecutar el test
runTest(); 