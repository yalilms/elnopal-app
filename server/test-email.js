const emailService = require('./src/services/emailService');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

console.log('🌮 Testing El Nopal Email Service');
console.log('===================================\n');

// Datos de prueba para reserva
const testReservationData = {
  name: 'Usuario Prueba',
  email: 'prueba@ejemplo.com', // Cambiar por un email real para la prueba
  phone: '+34 666 123 456',
  date: new Date('2024-12-25'),
  time: '20:30',
  partySize: 4,
  specialRequests: 'Sin gluten, por favor',
  needsBabyCart: true,
  needsWheelchair: false
};

// Datos de prueba para opinión
const testReviewData = {
  name: 'Cliente Satisfecho',
  email: 'cliente@ejemplo.com', // Cambiar por un email real para la prueba
  rating: 5,
  comment: 'Excelente comida mexicana, muy auténtica. ¡Volveremos!'
};

// Datos de prueba para contacto
const testContactData = {
  name: 'Persona Interesada',
  email: 'interesado@ejemplo.com', // Cambiar por un email real para la prueba
  phone: '+34 777 987 654',
  subject: 'Consulta sobre eventos privados',
  message: 'Hola, me gustaría saber si organizan eventos privados para 20 personas. Gracias.'
};

async function testEmailConnection() {
  console.log('🔍 1. Probando conexión con servidor de correo...');
  
  const result = await emailService.testEmailConnection();
  
  if (result.success) {
    console.log('✅ Conexión exitosa\n');
    return true;
  } else {
    console.log('❌ Error de conexión:', result.error);
    console.log('\n📝 Posibles causas:');
    console.log('- Variables de entorno no configuradas correctamente');
    console.log('- EMAIL_USER no configurado');
    console.log('- EMAIL_PASS incorrecto (debe ser App Password de Gmail)');
    console.log('- Conexión a internet');
    return false;
  }
}

async function testReservationEmails() {
  console.log('📧 2. Probando envío de correos de reserva...');
  
  const result = await emailService.sendReservationEmails(testReservationData);
  
  if (result.success) {
    console.log('✅ Correos de reserva enviados exitosamente');
    console.log(`   → Cliente: ${testReservationData.email}`);
    console.log(`   → Restaurante: ${process.env.ADMIN_EMAIL || 'reservas@elnopal.es'}\n`);
  } else {
    console.log('❌ Error enviando correos de reserva:', result.error);
    console.log('   → Detalles:', result.message, '\n');
  }
}

async function testReviewEmails() {
  console.log('⭐ 3. Probando envío de correos de opinión...');
  
  const result = await emailService.sendReviewEmails(testReviewData);
  
  if (result.success) {
    console.log('✅ Correos de opinión enviados exitosamente');
    console.log(`   → Cliente: ${testReviewData.email}`);
    console.log(`   → Restaurante: ${process.env.ADMIN_EMAIL || 'reservas@elnopal.es'}\n`);
  } else {
    console.log('❌ Error enviando correos de opinión:', result.error);
    console.log('   → Detalles:', result.message, '\n');
  }
}

async function testContactEmails() {
  console.log('📨 4. Probando envío de correos de contacto...');
  
  const result = await emailService.sendContactEmails(testContactData);
  
  if (result.success) {
    console.log('✅ Correos de contacto enviados exitosamente');
    console.log(`   → Cliente: ${testContactData.email}`);
    console.log(`   → Restaurante: ${process.env.ADMIN_EMAIL || 'reservas@elnopal.es'}\n`);
  } else {
    console.log('❌ Error enviando correos de contacto:', result.error);
    console.log('   → Detalles:', result.message, '\n');
  }
}

async function showConfiguration() {
  console.log('⚙️  Configuración actual de email:');
  console.log('=====================================');
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST || 'NO CONFIGURADO'}`);
  console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || 'NO CONFIGURADO'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NO CONFIGURADO'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***CONFIGURADO***' : 'NO CONFIGURADO'}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'NO CONFIGURADO'}`);
  console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'NO CONFIGURADO'}`);
  console.log('');
}

async function runAllTests() {
  try {
    showConfiguration();
    
    const connectionOK = await testEmailConnection();
    
    if (!connectionOK) {
      console.log('🛑 No se puede continuar con las pruebas sin conexión de correo.\n');
      console.log('📋 Para configurar los correos:');
      console.log('1. Crear archivo .env en la carpeta server/');
      console.log('2. Configurar las variables de EMAIL_* según env.production.example');
      console.log('3. Para Gmail, usar App Password en EMAIL_PASS');
      console.log('4. Verificar que EMAIL_USER sea el correo correcto\n');
      return;
    }
    
    // Solo continuar si la conexión es exitosa
    await testReservationEmails();
    await testReviewEmails();
    await testContactEmails();
    
    console.log('🎉 Pruebas de correo completadas');
    console.log('================================');
    console.log('Si todos los tests pasaron, el sistema de correos está funcionando correctamente.');
    console.log('Revisar las bandejas de entrada de los emails de prueba para confirmar la recepción.');
    
  } catch (error) {
    console.error('💥 Error ejecutando pruebas:', error);
  }
}

// Ejecutar las pruebas
runAllTests(); 