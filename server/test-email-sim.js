// Script para simular el envío de correos en El Nopal
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

console.log('🌮 Simulación de Correos de El Nopal');
console.log('===================================\n');

// Mostrar la configuración actual de email
console.log('⚙️  Configuración actual de email:');
console.log('=====================================');
console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST || 'NO CONFIGURADO'}`);
console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || 'NO CONFIGURADO'}`);
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NO CONFIGURADO'}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***CONFIGURADO***' : 'NO CONFIGURADO'}`);
console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'NO CONFIGURADO'}`);
console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'NO CONFIGURADO'}`);
console.log('');

// Datos de prueba para reserva
const testReservationData = {
  name: 'Usuario Prueba',
  email: 'prueba@ejemplo.com',
  phone: '+34 666 123 456',
  date: new Date('2025-12-25'),
  time: '20:30',
  partySize: 4,
  specialRequests: 'Sin gluten, por favor',
  needsBabyCart: true,
  needsWheelchair: false
};

// Datos de prueba para opinión
const testReviewData = {
  name: 'Cliente Satisfecho',
  email: 'cliente@ejemplo.com',
  rating: 5,
  comment: 'Excelente comida mexicana, muy auténtica. ¡Volveremos!'
};

// Datos de prueba para contacto
const testContactData = {
  name: 'Persona Interesada',
  email: 'interesado@ejemplo.com',
  phone: '+34 777 987 654',
  subject: 'Consulta sobre eventos privados',
  message: 'Hola, me gustaría saber si organizan eventos privados para 20 personas. Gracias.'
};

// Simulador del servicio de email
class EmailSimulator {
  constructor() {
    this.emailsSent = [];
  }

  async sendMail(options) {
    console.log(`📧 Simulando envío de correo a: ${options.to}`);
    console.log(`   Asunto: ${options.subject}`);
    console.log(`   De: ${options.from}`);
    
    // Simular demora de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Guardar el email simulado
    this.emailsSent.push({
      to: options.to,
      subject: options.subject,
      from: options.from,
      timestamp: new Date(),
      simulatedId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    return { 
      messageId: `sim_${Date.now()}@elnopal.es`,
      accepted: [options.to],
      rejected: [],
      pending: [],
      response: '250 Message accepted'
    };
  }
  
  getEmailsSent() {
    return this.emailsSent;
  }
}

// Servicio de email simulado
const emailService = {
  transporter: new EmailSimulator(),
  
  async testEmailConnection() {
    console.log('🔍 1. Simulando conexión con servidor de correo...');
    return { success: true, message: 'Conexión simulada exitosa' };
  },
  
  async sendReservationEmails(data) {
    console.log('\n📧 2. Simulando envío de correos de reserva...');
    
    try {
      // Enviar correo al cliente
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'El Nopal Restaurant <reservas@elnopal.es>',
        to: data.email,
        subject: '🌮 Confirmación de Reserva - El Nopal Restaurant',
        html: `<p>Estimado/a ${data.name},</p><p>Su reserva ha sido confirmada para ${data.date} a las ${data.time}.</p>`
      });
      
      // Enviar correo al restaurante
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'El Nopal Restaurant <reservas@elnopal.es>',
        to: process.env.ADMIN_EMAIL || 'reservas@elnopal.es',
        subject: `🔔 Nueva Reserva - ${data.name} - ${data.date} ${data.time}`,
        html: `<p>Nueva reserva recibida de ${data.name} para ${data.date} a las ${data.time}.</p>`
      });
      
      console.log('✅ Correos de reserva simulados exitosamente');
      console.log(`   → Cliente: ${data.email}`);
      console.log(`   → Restaurante: ${process.env.ADMIN_EMAIL || 'reservas@elnopal.es'}\n`);
      return { success: true, message: 'Correos simulados exitosamente' };
    } catch (error) {
      console.error('❌ Error simulando correos de reserva:', error);
      return { success: false, message: error.message, error };
    }
  },
  
  async sendReviewEmails(data) {
    console.log('\n⭐ 3. Simulando envío de correos de opinión...');
    
    try {
      // Enviar correo al cliente
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'El Nopal Restaurant <reservas@elnopal.es>',
        to: data.email,
        subject: '🙏 Gracias por su Opinión - El Nopal Restaurant',
        html: `<p>Estimado/a ${data.name},</p><p>Gracias por su opinión de ${data.rating} estrellas.</p>`
      });
      
      // Enviar correo al restaurante
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'El Nopal Restaurant <reservas@elnopal.es>',
        to: process.env.ADMIN_EMAIL || 'reservas@elnopal.es',
        subject: `💬 Nueva Opinión ${data.rating}⭐ - ${data.name}`,
        html: `<p>Nueva opinión recibida de ${data.name} (${data.rating} estrellas):<br>${data.comment}</p>`
      });
      
      console.log('✅ Correos de opinión simulados exitosamente');
      console.log(`   → Cliente: ${data.email}`);
      console.log(`   → Restaurante: ${process.env.ADMIN_EMAIL || 'reservas@elnopal.es'}\n`);
      return { success: true, message: 'Correos simulados exitosamente' };
    } catch (error) {
      console.error('❌ Error simulando correos de opinión:', error);
      return { success: false, message: error.message, error };
    }
  },
  
  async sendContactEmails(data) {
    console.log('\n📨 4. Simulando envío de correos de contacto...');
    
    try {
      // Enviar correo al cliente
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'El Nopal Restaurant <reservas@elnopal.es>',
        to: data.email,
        subject: '📧 Mensaje Recibido - El Nopal Restaurant',
        html: `<p>Estimado/a ${data.name},</p><p>Hemos recibido su mensaje. Nos pondremos en contacto pronto.</p>`
      });
      
      // Enviar correo al restaurante
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'El Nopal Restaurant <reservas@elnopal.es>',
        to: process.env.ADMIN_EMAIL || 'reservas@elnopal.es',
        subject: `📨 Nuevo Contacto - ${data.name} - ${data.subject || 'Consulta'}`,
        html: `<p>Nuevo mensaje de ${data.name}:<br>${data.message}</p>`
      });
      
      console.log('✅ Correos de contacto simulados exitosamente');
      console.log(`   → Cliente: ${data.email}`);
      console.log(`   → Restaurante: ${process.env.ADMIN_EMAIL || 'reservas@elnopal.es'}\n`);
      return { success: true, message: 'Correos simulados exitosamente' };
    } catch (error) {
      console.error('❌ Error simulando correos de contacto:', error);
      return { success: false, message: error.message, error };
    }
  },
  
  getEmailLog() {
    return this.transporter.getEmailsSent();
  }
};

async function runAllTests() {
  try {
    const connectionOK = await emailService.testEmailConnection();
    console.log('✅ Simulación de conexión exitosa\n');
    
    // Ejecutar todos los tests
    await emailService.sendReservationEmails(testReservationData);
    await emailService.sendReviewEmails(testReviewData);
    await emailService.sendContactEmails(testContactData);
    
    // Mostrar resumen de correos enviados
    const emailsSent = emailService.getEmailLog();
    
    console.log('\n📋 Resumen de correos simulados:');
    console.log(`Total: ${emailsSent.length} correos`);
    emailsSent.forEach((email, index) => {
      console.log(`\n${index + 1}. Email ${email.simulatedId}`);
      console.log(`   Para: ${email.to}`);
      console.log(`   Asunto: ${email.subject}`);
      console.log(`   Fecha: ${email.timestamp.toLocaleString()}`);
    });
    
    console.log('\n🎉 Pruebas de simulación de correo completadas');
    console.log('================================');
    console.log('✅ Las simulaciones funcionaron correctamente.');
    console.log('\n📝 Para configurar el envío de correos reales:');
    console.log('1. Asegúrate de tener una cuenta de Gmail con verificación en dos pasos activada');
    console.log('2. Genera una contraseña de aplicación específica para esta aplicación');
    console.log('3. Configura esa contraseña en el archivo .env (EMAIL_PASS)');
    
  } catch (error) {
    console.error('💥 Error ejecutando pruebas:', error);
  }
}

// Ejecutar las pruebas
runAllTests();
