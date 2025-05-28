const nodemailer = require('nodemailer');

// Configuración del transportador de correo
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER || 'reservas@elnopal.es',
      pass: process.env.EMAIL_PASS || 'mexicanoelnopal.es'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Plantilla base HTML
const getBaseTemplate = (content, title = 'El Nopal Restaurant') => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #D62828;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #D62828;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          font-style: italic;
        }
        .content {
          margin-bottom: 30px;
        }
        .highlight {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
        }
        .details {
          background-color: #f8f9fa;
          border-left: 4px solid #D62828;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          border-top: 1px solid #eee;
          padding-top: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .contact-info {
          margin-top: 20px;
        }
        .mexican-decoration {
          text-align: center;
          font-size: 20px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background-color: #D62828;
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌮 El Nopal Restaurant</div>
          <div class="subtitle">Auténtica Cocina Mexicana</div>
        </div>
        ${content}
        <div class="footer">
          <div class="mexican-decoration">🌶️ 🌵 🥑 🌮 🌶️</div>
          <div class="contact-info">
            <strong>El Nopal Restaurant</strong><br>
            📍 ${process.env.RESTAURANT_ADDRESS || 'Dirección del restaurante'}<br>
            📞 ${process.env.RESTAURANT_PHONE || 'Teléfono del restaurante'}<br>
            🌐 ${process.env.RESTAURANT_WEBSITE || 'http://elnopal.es'}<br>
            📧 reservas@elnopal.es
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            Este correo fue enviado automáticamente. Por favor, no responda a este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Plantillas específicas para cada tipo de correo

// 1. RESERVAS - Confirmación al cliente
const getReservationConfirmationTemplate = (reservationData) => {
  const content = `
    <div class="content">
      <h2 style="color: #D62828;">¡Reserva Confirmada! 🎉</h2>
      <p>Estimado/a <strong>${reservationData.name}</strong>,</p>
      <p>Nos complace confirmar que hemos recibido su reserva en El Nopal Restaurant. ¡Estamos emocionados de recibirle!</p>
      
      <div class="details">
        <h3 style="color: #D62828; margin-top: 0;">📋 Detalles de su Reserva:</h3>
        <p><strong>👤 Nombre:</strong> ${reservationData.name}</p>
        <p><strong>📧 Email:</strong> ${reservationData.email}</p>
        <p><strong>📞 Teléfono:</strong> ${reservationData.phone}</p>
        <p><strong>📅 Fecha:</strong> ${new Date(reservationData.date).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p><strong>🕐 Hora:</strong> ${reservationData.time}</p>
        <p><strong>👥 Número de personas:</strong> ${reservationData.partySize}</p>
        ${reservationData.specialRequests ? `<p><strong>📝 Solicitudes especiales:</strong> ${reservationData.specialRequests}</p>` : ''}
        ${reservationData.needsBabyCart ? '<p><strong>👶 Trona para bebé:</strong> Solicitada</p>' : ''}
        ${reservationData.needsWheelchair ? '<p><strong>♿ Acceso para silla de ruedas:</strong> Solicitado</p>' : ''}
      </div>

      <div class="highlight">
        <h3 style="margin-top: 0;">⏰ Información Importante:</h3>
        <ul>
          <li>Por favor, llegue 10 minutos antes de su hora reservada</li>
          <li>Si necesita cancelar o modificar su reserva, contáctenos con al menos 2 horas de anticipación</li>
          <li>Mantenemos su mesa reservada por 15 minutos después de la hora acordada</li>
        </ul>
      </div>

      <p>¡Esperamos ofrecerle una experiencia culinaria mexicana inolvidable!</p>
      <p>¡Gracias por elegir El Nopal Restaurant!</p>
    </div>
  `;
  return getBaseTemplate(content, 'Confirmación de Reserva - El Nopal');
};

// 2. RESERVAS - Notificación al restaurante
const getReservationNotificationTemplate = (reservationData) => {
  const content = `
    <div class="content">
      <h2 style="color: #D62828;">🔔 Nueva Reserva Recibida</h2>
      
      <div class="details">
        <h3 style="color: #D62828; margin-top: 0;">📋 Detalles de la Reserva:</h3>
        <p><strong>👤 Cliente:</strong> ${reservationData.name}</p>
        <p><strong>📧 Email:</strong> ${reservationData.email}</p>
        <p><strong>📞 Teléfono:</strong> ${reservationData.phone}</p>
        <p><strong>📅 Fecha:</strong> ${new Date(reservationData.date).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p><strong>🕐 Hora:</strong> ${reservationData.time}</p>
        <p><strong>👥 Comensales:</strong> ${reservationData.partySize}</p>
        ${reservationData.specialRequests ? `<p><strong>📝 Solicitudes especiales:</strong> ${reservationData.specialRequests}</p>` : ''}
        ${reservationData.needsBabyCart ? '<p><strong>👶 Trona para bebé:</strong> ✅ Solicitada</p>' : ''}
        ${reservationData.needsWheelchair ? '<p><strong>♿ Acceso para silla de ruedas:</strong> ✅ Solicitado</p>' : ''}
      </div>

      <div class="highlight">
        <p><strong>⏰ Hora de recepción:</strong> ${new Date().toLocaleString('es-ES')}</p>
      </div>
    </div>
  `;
  return getBaseTemplate(content, 'Nueva Reserva - El Nopal');
};

// 3. OPINIONES - Agradecimiento al cliente
const getReviewThankYouTemplate = (reviewData) => {
  const content = `
    <div class="content">
      <h2 style="color: #D62828;">¡Gracias por su Opinión! 🙏</h2>
      <p>Estimado/a <strong>${reviewData.name}</strong>,</p>
      <p>Muchas gracias por tomarse el tiempo de compartir su experiencia en El Nopal Restaurant.</p>
      
      <div class="details">
        <h3 style="color: #D62828; margin-top: 0;">⭐ Su Opinión:</h3>
        <p><strong>Calificación:</strong> ${'⭐'.repeat(reviewData.rating)} (${reviewData.rating}/5)</p>
        <p><strong>Comentario:</strong> "${reviewData.comment}"</p>
      </div>

      <div class="highlight">
        <p>Su opinión es muy valiosa para nosotros y nos ayuda a mejorar continuamente nuestro servicio y la calidad de nuestros platillos mexicanos auténticos.</p>
      </div>

      <p>Esperamos tenerle de vuelta pronto para seguir deleitándole con los sabores tradicionales de México.</p>
      <p>¡Muchas gracias por ser parte de la familia El Nopal!</p>
    </div>
  `;
  return getBaseTemplate(content, 'Gracias por su Opinión - El Nopal');
};

// 4. OPINIONES - Notificación al restaurante
const getReviewNotificationTemplate = (reviewData) => {
  const content = `
    <div class="content">
      <h2 style="color: #D62828;">💬 Nueva Opinión Recibida</h2>
      
      <div class="details">
        <h3 style="color: #D62828; margin-top: 0;">👤 Cliente:</h3>
        <p><strong>Nombre:</strong> ${reviewData.name}</p>
        <p><strong>Email:</strong> ${reviewData.email}</p>
        <p><strong>Calificación:</strong> ${'⭐'.repeat(reviewData.rating)} (${reviewData.rating}/5)</p>
      </div>

      <div class="highlight">
        <h3 style="margin-top: 0;">💭 Comentario:</h3>
        <p style="font-style: italic;">"${reviewData.comment}"</p>
      </div>

      <p><strong>⏰ Recibida:</strong> ${new Date().toLocaleString('es-ES')}</p>
    </div>
  `;
  return getBaseTemplate(content, 'Nueva Opinión - El Nopal');
};

// 5. CONTACTO - Confirmación al cliente
const getContactConfirmationTemplate = (contactData) => {
  const content = `
    <div class="content">
      <h2 style="color: #D62828;">¡Mensaje Recibido! 📧</h2>
      <p>Estimado/a <strong>${contactData.name}</strong>,</p>
      <p>Hemos recibido su mensaje y le agradecemos por contactarnos. Nuestro equipo revisará su consulta y le responderemos a la brevedad posible.</p>
      
      <div class="details">
        <h3 style="color: #D62828; margin-top: 0;">📋 Resumen de su Mensaje:</h3>
        <p><strong>Nombre:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Teléfono:</strong> ${contactData.phone || 'No proporcionado'}</p>
        <p><strong>Asunto:</strong> ${contactData.subject || 'Consulta general'}</p>
        <p><strong>Mensaje:</strong> "${contactData.message}"</p>
      </div>

      <div class="highlight">
        <p><strong>⏰ Tiempo de respuesta estimado:</strong> 24-48 horas</p>
        <p>Para consultas urgentes, puede llamarnos directamente al ${process.env.RESTAURANT_PHONE || 'teléfono del restaurante'}.</p>
      </div>

      <p>¡Gracias por su interés en El Nopal Restaurant!</p>
    </div>
  `;
  return getBaseTemplate(content, 'Mensaje Recibido - El Nopal');
};

// 6. CONTACTO - Notificación al restaurante
const getContactNotificationTemplate = (contactData) => {
  const content = `
    <div class="content">
      <h2 style="color: #D62828;">📨 Nuevo Mensaje de Contacto</h2>
      
      <div class="details">
        <h3 style="color: #D62828; margin-top: 0;">👤 Datos del Cliente:</h3>
        <p><strong>Nombre:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Teléfono:</strong> ${contactData.phone || 'No proporcionado'}</p>
        <p><strong>Asunto:</strong> ${contactData.subject || 'Consulta general'}</p>
      </div>

      <div class="highlight">
        <h3 style="margin-top: 0;">💬 Mensaje:</h3>
        <p style="font-style: italic;">"${contactData.message}"</p>
      </div>

      <p><strong>⏰ Recibido:</strong> ${new Date().toLocaleString('es-ES')}</p>
      
      <div style="margin-top: 20px; padding: 10px; background-color: #e8f5e8; border-radius: 5px;">
        <p><strong>📞 Responder a:</strong> ${contactData.email}</p>
      </div>
    </div>
  `;
  return getBaseTemplate(content, 'Nuevo Contacto - El Nopal');
};

// Funciones principales para enviar correos

const sendReservationEmails = async (reservationData) => {
  const transporter = createTransporter();
  
  try {
    // Correo de confirmación al cliente
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"El Nopal Restaurant" <reservas@elnopal.es>',
      to: reservationData.email,
      subject: '🌮 Confirmación de Reserva - El Nopal Restaurant',
      html: getReservationConfirmationTemplate(reservationData)
    });

    // Notificación al restaurante
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"El Nopal Restaurant" <reservas@elnopal.es>',
      to: process.env.ADMIN_EMAIL || 'reservas@elnopal.es',
      subject: `🔔 Nueva Reserva - ${reservationData.name} - ${reservationData.date} ${reservationData.time}`,
      html: getReservationNotificationTemplate(reservationData)
    });

    console.log('Correos de reserva enviados exitosamente');
    return { success: true, message: 'Correos enviados exitosamente' };
  } catch (error) {
    console.error('Error enviando correos de reserva:', error);
    return { success: false, message: 'Error enviando correos', error: error.message };
  }
};

const sendReviewEmails = async (reviewData) => {
  const transporter = createTransporter();
  
  try {
    // Agradecimiento al cliente
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"El Nopal Restaurant" <reservas@elnopal.es>',
      to: reviewData.email,
      subject: '🙏 Gracias por su Opinión - El Nopal Restaurant',
      html: getReviewThankYouTemplate(reviewData)
    });

    // Notificación al restaurante
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"El Nopal Restaurant" <reservas@elnopal.es>',
      to: process.env.ADMIN_EMAIL || 'reservas@elnopal.es',
      subject: `💬 Nueva Opinión ${reviewData.rating}⭐ - ${reviewData.name}`,
      html: getReviewNotificationTemplate(reviewData)
    });

    console.log('Correos de opinión enviados exitosamente');
    return { success: true, message: 'Correos enviados exitosamente' };
  } catch (error) {
    console.error('Error enviando correos de opinión:', error);
    return { success: false, message: 'Error enviando correos', error: error.message };
  }
};

const sendContactEmails = async (contactData) => {
  const transporter = createTransporter();
  
  try {
    // Confirmación al cliente
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"El Nopal Restaurant" <reservas@elnopal.es>',
      to: contactData.email,
      subject: '📧 Mensaje Recibido - El Nopal Restaurant',
      html: getContactConfirmationTemplate(contactData)
    });

    // Notificación al restaurante
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"El Nopal Restaurant" <reservas@elnopal.es>',
      to: process.env.ADMIN_EMAIL || 'reservas@elnopal.es',
      subject: `📨 Nuevo Contacto - ${contactData.name} - ${contactData.subject || 'Consulta'}`,
      html: getContactNotificationTemplate(contactData)
    });

    console.log('Correos de contacto enviados exitosamente');
    return { success: true, message: 'Correos enviados exitosamente' };
  } catch (error) {
    console.error('Error enviando correos de contacto:', error);
    return { success: false, message: 'Error enviando correos', error: error.message };
  }
};

// Función de prueba
const testEmailConnection = async () => {
  const transporter = createTransporter();
  
  try {
    await transporter.verify();
    console.log('✅ Conexión de correo verificada exitosamente');
    return { success: true, message: 'Conexión de correo exitosa' };
  } catch (error) {
    console.error('❌ Error en la conexión de correo:', error);
    return { success: false, message: 'Error en la conexión de correo', error: error.message };
  }
};

module.exports = {
  sendReservationEmails,
  sendReviewEmails,
  sendContactEmails,
  testEmailConnection
}; 