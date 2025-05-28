const nodemailer = require('nodemailer');

// Configuración del transportador de correo
const createTransporter = () => {
  return nodemailer.createTransport({
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

// Plantilla base HTML mejorada con logo y tematización mexicana
const getBaseTemplate = (content, title = 'El Nopal Restaurant') => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
          font-family: 'Inter', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333333;
          max-width: 650px;
          margin: 0 auto;
          padding: 0;
          background: linear-gradient(135deg, #F8B612 0%, #FFD700 50%, #F8B612 100%);
          min-height: 100vh;
        }
        
        .email-wrapper {
          background-color: #ffffff;
          margin: 20px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
          border: 3px solid #D62828;
        }
        
        .header {
          background: linear-gradient(135deg, #D62828 0%, #E63946 50%, #D62828 100%);
          color: white;
          text-align: center;
          padding: 40px 30px;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="30" fill="rgba(255,255,255,0.05)">🌮🌵🌶️🥑</text></svg>') repeat;
          animation: float 20s infinite linear;
        }
        
        @keyframes float {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100px); }
        }
        
        .logo-container {
          position: relative;
          z-index: 2;
          margin-bottom: 15px;
        }
        
        .logo-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 4px solid #F8B612;
          background-color: white;
          padding: 10px;
          margin-bottom: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        
        .restaurant-name {
          font-size: 32px;
          font-weight: 700;
          margin: 15px 0 5px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          letter-spacing: 1px;
        }
        
        .tagline {
          font-size: 16px;
          opacity: 0.95;
          font-weight: 400;
          font-style: italic;
          margin: 0;
        }
        
        .content {
          padding: 40px 35px;
          background-color: #ffffff;
        }
        
        .mexican-border {
          height: 8px;
          background: linear-gradient(90deg, 
            #D62828 0%, #F8B612 25%, #28A745 50%, #F8B612 75%, #D62828 100%);
          margin: 0;
        }
        
        .highlight {
          background: linear-gradient(135deg, #FFF8DC 0%, #FFFACD 100%);
          border: 2px solid #F8B612;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          position: relative;
          overflow: hidden;
        }
        
        .highlight::before {
          content: '🌮';
          position: absolute;
          top: 15px;
          right: 15px;
          font-size: 24px;
          opacity: 0.3;
        }
        
        .details {
          background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
          border-left: 6px solid #D62828;
          border-radius: 8px;
          padding: 25px;
          margin: 25px 0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        
        .details h3 {
          color: #D62828;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 600;
        }
        
        .footer {
          background: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);
          color: white;
          padding: 35px 30px;
          text-align: center;
        }
        
        .mexican-decoration {
          font-size: 24px;
          margin: 20px 0;
          letter-spacing: 8px;
        }
        
        .contact-info {
          margin: 25px 0;
          line-height: 1.8;
        }
        
        .contact-info strong {
          color: #F8B612;
          font-size: 18px;
          display: block;
          margin-bottom: 10px;
        }
        
        .contact-item {
          margin: 8px 0;
          font-size: 14px;
          opacity: 0.9;
        }
        
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #D62828 0%, #E63946 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 50px;
          margin: 15px 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(214, 40, 40, 0.3);
        }
        
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(214, 40, 40, 0.4);
        }
        
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-confirmed {
          background: linear-gradient(135deg, #28A745 0%, #34CE57 100%);
          color: white;
        }
        
        .status-cancelled {
          background: linear-gradient(135deg, #DC3545 0%, #E74C3C 100%);
          color: white;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        
        .info-item {
          background: rgba(248, 182, 18, 0.1);
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #F8B612;
        }
        
        .info-label {
          font-weight: 600;
          color: #D62828;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-size: 16px;
          color: #333333;
        }
        
        .divider {
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #F8B612 50%, transparent 100%);
          margin: 30px 0;
          border: none;
        }
        
        @media (max-width: 600px) {
          .email-wrapper {
            margin: 10px;
            border-radius: 15px;
          }
          
          .content {
            padding: 25px 20px;
          }
          
          .restaurant-name {
            font-size: 24px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="logo-container">
            <img src="https://i.imgur.com/placeholder-logo.png" alt="El Nopal Logo" class="logo-img" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display:none; font-size: 48px;">🌵</div>
          </div>
          <h1 class="restaurant-name">🌮 EL NOPAL 🌮</h1>
          <p class="tagline">Auténticos Sabores de México en Granada</p>
        </div>
        
        <div class="mexican-border"></div>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="footer">
          <div class="mexican-decoration">🌶️ 🌵 🥑 🌮 🌯 🇲🇽</div>
          <div class="contact-info">
            <strong>🌮 EL NOPAL RESTAURANT</strong>
            <div class="contact-item">📍 Calle de la Tradición, 123 - Granada, España</div>
            <div class="contact-item">📞 +34 958 123 456</div>
            <div class="contact-item">🌐 www.elnopal.es</div>
            <div class="contact-item">📧 reservas@elnopal.es</div>
            <div class="contact-item">🕒 Abierto: Lun-Dom 12:00-00:00</div>
          </div>
          <hr class="divider">
          <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.7;">
            Este correo electrónico fue generado automáticamente por el sistema de El Nopal Restaurant.<br>
            Para consultas, responda a reservas@elnopal.es | ¡Gracias por elegir El Nopal! 🇲🇽
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Plantillas específicas para cada tipo de correo

// 1. RESERVAS - Confirmación al cliente (versión mejorada)
const getReservationConfirmationTemplate = (reservationData) => {
  const fechaFormateada = new Date(reservationData.date + 'T00:00:00').toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #D62828; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
        ¡RESERVA CONFIRMADA! 🎉
      </h2>
      <p style="color: #F8B612; font-size: 16px; font-weight: 600; margin: 10px 0 0 0;">
        ¡Te esperamos para una experiencia gastronómica inolvidable!
      </p>
    </div>

    <p style="font-size: 18px; color: #333333; margin-bottom: 25px;">
      Estimado/a <strong style="color: #D62828;">${reservationData.name}</strong>,
    </p>
    
    <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
      ¡Qué emoción! 🇲🇽 Hemos confirmado tu reserva en <strong>El Nopal Restaurant</strong>. 
      Nuestro equipo está preparando todo para ofrecerte una auténtica experiencia culinaria mexicana 
      que despertará todos tus sentidos.
    </p>
    
    <div class="details">
      <h3>📋 Detalles de tu Reserva Confirmada</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">👤 Nombre del Reservante</div>
          <div class="info-value">${reservationData.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">📧 Correo Electrónico</div>
          <div class="info-value">${reservationData.email}</div>
        </div>
        <div class="info-item">
          <div class="info-label">📞 Teléfono de Contacto</div>
          <div class="info-value">${reservationData.phone}</div>
        </div>
        <div class="info-item">
          <div class="info-label">📅 Fecha de la Visita</div>
          <div class="info-value">${fechaFormateada}</div>
        </div>
        <div class="info-item">
          <div class="info-label">🕐 Hora de Llegada</div>
          <div class="info-value">${reservationData.time} horas</div>
        </div>
        <div class="info-item">
          <div class="info-label">👥 Número de Comensales</div>
          <div class="info-value">${reservationData.partySize} ${reservationData.partySize === '1' ? 'persona' : 'personas'}</div>
        </div>
      </div>
      
      ${reservationData.specialRequests ? `
        <div style="background: rgba(40, 167, 69, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28A745;">
          <div class="info-label">📝 Peticiones Especiales</div>
          <div class="info-value" style="font-style: italic;">"${reservationData.specialRequests}"</div>
        </div>
      ` : ''}
      
      ${(reservationData.needsBabyCart || reservationData.needsWheelchair) ? `
        <div style="background: rgba(248, 182, 18, 0.15); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F8B612;">
          <div class="info-label">♿ Servicios de Accesibilidad Solicitados</div>
          <div style="margin-top: 10px;">
            ${reservationData.needsBabyCart ? '<div style="margin: 5px 0;"><span style="margin-right: 8px;">👶</span> Trona para bebé disponible</div>' : ''}
            ${reservationData.needsWheelchair ? '<div style="margin: 5px 0;"><span style="margin-right: 8px;">♿</span> Mesa accesible para silla de ruedas</div>' : ''}
          </div>
        </div>
      ` : ''}
    </div>

    <div class="highlight">
      <h3 style="margin-top: 0; color: #D62828; font-size: 20px;">⏰ Información Importante para tu Visita</h3>
      <ul style="margin: 15px 0; padding-left: 20px; line-height: 1.8;">
        <li><strong>Puntualidad:</strong> Te pedimos llegar 10 minutos antes de tu hora reservada para una mejor experiencia</li>
        <li><strong>Cambios/Cancelaciones:</strong> Si necesitas modificar tu reserva, contáctanos con al menos 2 horas de anticipación</li>
        <li><strong>Tiempo de espera:</strong> Mantenemos tu mesa reservada por 15 minutos después de la hora acordada</li>
        <li><strong>Código de vestimenta:</strong> Casual elegante (sin requisitos especiales)</li>
        <li><strong>Menú especial:</strong> Pregunta por nuestras especialidades del chef del día</li>
      </ul>
    </div>

    <div style="background: linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
      <h3 style="color: #28A745; margin: 0 0 15px 0; font-size: 22px;">🌶️ ¿Qué te espera en El Nopal?</h3>
      <p style="margin: 0; line-height: 1.6; font-size: 16px;">
        Platillos auténticos preparados con ingredientes frescos importados directamente de México, 
        un ambiente acogedor que te transportará a las cantinas tradicionales, y un servicio excepcional 
        que hará de tu velada una experiencia memorable. <strong>¡Prepárate para un viaje culinario único!</strong>
      </p>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <p style="font-size: 18px; color: #D62828; font-weight: 600; margin-bottom: 15px;">
        ¡Nos emociona recibirte en nuestra familia mexicana! 🇲🇽
      </p>
      <a href="tel:+34958123456" class="button">
        📞 ¿Dudas? Llámanos
      </a>
    </div>

    <hr class="divider">
    
    <p style="text-align: center; font-size: 16px; color: #666; margin: 20px 0 0 0;">
      <strong>¡Gracias por elegir El Nopal Restaurant!</strong><br>
      <em>Donde cada plato cuenta una historia de México</em> 🌮✨
    </p>
  `;
  
  return getBaseTemplate(content, '¡Reserva Confirmada! - El Nopal Restaurant');
};

// 2. RESERVAS - Notificación al restaurante (versión mejorada)
const getReservationNotificationTemplate = (reservationData) => {
  const fechaFormateada = new Date(reservationData.date + 'T00:00:00').toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const fechaRecepcion = new Date().toLocaleString('es-ES');
  const urgencia = new Date(reservationData.date + 'T00:00:00') <= new Date(Date.now() + 24*60*60*1000);
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #D62828; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
        🔔 NUEVA RESERVA RECIBIDA
      </h2>
      ${urgencia ? `
        <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%); color: white; padding: 10px; border-radius: 25px; margin: 15px 0; font-weight: 600;">
          ⚠️ RESERVA URGENTE - Menos de 24 horas
        </div>
      ` : `
        <p style="color: #F8B612; font-size: 16px; font-weight: 600; margin: 10px 0 0 0;">
          Nueva confirmación para procesar
        </p>
      `}
    </div>

    <div class="details">
      <h3>👤 Información del Cliente</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">👤 Nombre Completo</div>
          <div class="info-value" style="font-size: 18px; font-weight: 600;">${reservationData.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">📧 Correo Electrónico</div>
          <div class="info-value">
            <a href="mailto:${reservationData.email}" style="color: #D62828; text-decoration: none;">
              ${reservationData.email}
            </a>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">📞 Teléfono de Contacto</div>
          <div class="info-value">
            <a href="tel:${reservationData.phone}" style="color: #D62828; text-decoration: none;">
              ${reservationData.phone}
            </a>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">🆔 ID de Reserva</div>
          <div class="info-value" style="font-family: monospace; background: #f1f3f4; padding: 5px; border-radius: 4px;">
            ${reservationData.id || 'Generando...'}
          </div>
        </div>
      </div>
    </div>

    <div class="highlight">
      <h3 style="margin-top: 0; color: #D62828; font-size: 20px;">📅 Detalles de la Reserva</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">📅 Fecha de la Visita</div>
          <div class="info-value" style="font-size: 18px; font-weight: 600; color: #D62828;">
            ${fechaFormateada}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">🕐 Hora de Llegada</div>
          <div class="info-value" style="font-size: 18px; font-weight: 600; color: #D62828;">
            ${reservationData.time} horas
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">👥 Número de Comensales</div>
          <div class="info-value" style="font-size: 18px; font-weight: 600;">
            ${reservationData.partySize} ${reservationData.partySize === '1' ? 'persona' : 'personas'}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">🏠 Mesa Asignada</div>
          <div class="info-value">
            ${reservationData.tableName || 'Asignación automática'}
          </div>
        </div>
      </div>
    </div>

    ${reservationData.specialRequests ? `
      <div style="background: rgba(255, 152, 0, 0.1); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 6px solid #FF9800;">
        <h4 style="color: #FF9800; margin: 0 0 10px 0; font-size: 18px;">📝 Peticiones Especiales del Cliente</h4>
        <p style="margin: 0; font-size: 16px; font-style: italic; background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #FF9800;">
          "${reservationData.specialRequests}"
        </p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          <strong>⚠️ Importante:</strong> Asegúrate de que el equipo esté informado sobre estas peticiones especiales.
        </p>
      </div>
    ` : ''}

    ${(reservationData.needsBabyCart || reservationData.needsWheelchair) ? `
      <div style="background: rgba(156, 39, 176, 0.1); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 6px solid #9C27B0;">
        <h4 style="color: #9C27B0; margin: 0 0 15px 0; font-size: 18px;">♿ Servicios de Accesibilidad Requeridos</h4>
        <div style="background: white; padding: 15px; border-radius: 8px;">
          ${reservationData.needsBabyCart ? `
            <div style="margin: 10px 0; padding: 10px; background: rgba(76, 175, 80, 0.1); border-radius: 6px;">
              <span style="font-size: 20px; margin-right: 10px;">👶</span>
              <strong>Trona para bebé requerida</strong>
              <p style="margin: 5px 0 0 30px; font-size: 14px; color: #666;">Preparar trona limpia y disponible en la mesa</p>
            </div>
          ` : ''}
          ${reservationData.needsWheelchair ? `
            <div style="margin: 10px 0; padding: 10px; background: rgba(33, 150, 243, 0.1); border-radius: 6px;">
              <span style="font-size: 20px; margin-right: 10px;">♿</span>
              <strong>Mesa accesible para silla de ruedas</strong>
              <p style="margin: 5px 0 0 30px; font-size: 14px; color: #666;">Asignar mesa con acceso amplio y sin obstáculos</p>
            </div>
          ` : ''}
        </div>
      </div>
    ` : ''}

    <div style="background: linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%); padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h4 style="color: #1976D2; margin: 0 0 15px 0; font-size: 18px;">📊 Información del Sistema</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <div class="info-label">⏰ Recibida el</div>
          <div class="info-value">${fechaRecepcion}</div>
        </div>
        <div>
          <div class="info-label">🌐 Canal de Reserva</div>
          <div class="info-value">${reservationData.channel || 'Web Online'}</div>
        </div>
        <div>
          <div class="info-label">👨‍💼 Procesada por</div>
          <div class="info-value">${reservationData.createdBy || 'Sistema Automático'}</div>
        </div>
        <div>
          <div class="info-label">📱 Estado Actual</div>
          <div class="info-value">
            <span class="status-badge status-confirmed">✅ Confirmada</span>
          </div>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #FFF3E0 0%, #FFECB3 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
      <h4 style="color: #F57C00; margin: 0 0 15px 0; font-size: 20px;">⚡ Acciones Recomendadas</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
        <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">🏠 Preparación de Mesa</h5>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Verificar disponibilidad y limpieza</li>
            <li>Preparar servicios especiales</li>
            <li>Confirmar capacidad adecuada</li>
          </ul>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">👨‍🍳 Comunicación Interna</h5>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Informar al equipo de sala</li>
            <li>Notificar peticiones especiales</li>
            <li>Preparar servicios de accesibilidad</li>
          </ul>
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <a href="mailto:${reservationData.email}?subject=Confirmación%20de%20Reserva%20-%20El%20Nopal&body=Estimado/a%20${reservationData.name},%0D%0A%0D%0AGracias%20por%20su%20reserva..." 
           class="button" style="margin: 5px;">
          📧 Contactar Cliente
        </a>
        <a href="tel:${reservationData.phone}" class="button" style="margin: 5px;">
          📞 Llamar Cliente
        </a>
      </div>
    </div>

    <hr class="divider">
    
    <p style="text-align: center; font-size: 14px; color: #666; margin: 20px 0 0 0;">
      <strong>Notificación automática del Sistema de Reservas El Nopal</strong><br>
      <em>Gestiona esta reserva desde el panel de administración</em>
    </p>
  `;
  
  return getBaseTemplate(content, `🔔 Nueva Reserva: ${reservationData.name} - ${fechaFormateada}`);
};

// 3. OPINIONES - Agradecimiento al cliente (versión mejorada)
const getReviewThankYouTemplate = (reviewData) => {
  const stars = '⭐'.repeat(Math.max(1, Math.min(5, reviewData.rating || 5)));
  const ratingEmoji = reviewData.rating >= 4 ? '😍' : reviewData.rating >= 3 ? '😊' : '🙂';
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #D62828; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
        ${reviewData.adminResponse ? '¡RESPUESTA A TU OPINIÓN! 📧' : '¡GRACIAS POR TU OPINIÓN! ' + ratingEmoji}
      </h2>
      <p style="color: #F8B612; font-size: 16px; font-weight: 600; margin: 10px 0 0 0;">
        ${reviewData.adminResponse ? 'Hemos leído tu comentario y queremos responderte personalmente' : 'Tu experiencia es muy valiosa para nosotros'}
      </p>
    </div>

    <p style="font-size: 18px; color: #333333; margin-bottom: 25px;">
      Estimado/a <strong style="color: #D62828;">${reviewData.name}</strong>,
    </p>
    
    ${reviewData.adminResponse ? `
      <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
        ¡Queremos agradecerte personalmente por tomarte el tiempo de compartir tu experiencia en <strong>El Nopal Restaurant</strong>! 🇲🇽 
        Tu opinión es muy importante para nosotros y queremos responderte directamente.
      </p>
    ` : `
      <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
        ¡Muchísimas gracias por tomarte el tiempo de compartir tu experiencia en <strong>El Nopal Restaurant</strong>! 🇲🇽 
        Tu opinión es como un tesoro para nosotros y nos motiva a seguir ofreciendo la mejor cocina mexicana auténtica.
      </p>
    `}

    <div class="highlight">
      <h3 style="margin-top: 0; color: #D62828; font-size: 20px;">⭐ Tu Valoración</h3>
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 32px; margin-bottom: 15px;">${stars}</div>
        <div style="font-size: 24px; font-weight: 600; color: #D62828; margin-bottom: 10px;">
          ${reviewData.rating}/5 Estrellas
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #F8B612; text-align: left; margin: 20px 0;">
          <h4 style="color: #F8B612; margin: 0 0 10px 0;">💬 Tu Comentario:</h4>
          <p style="margin: 0; font-size: 16px; font-style: italic; line-height: 1.6;">
            "${reviewData.comment}"
          </p>
        </div>
      </div>
    </div>

    ${reviewData.adminResponse ? `
      <div style="background: linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 100%); padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 6px solid #28A745;">
        <h3 style="color: #28A745; margin: 0 0 15px 0; font-size: 22px; display: flex; align-items: center;">
          <span style="margin-right: 10px;">👨‍🍳</span> Respuesta Personal del Equipo El Nopal
        </h3>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #28A745;">
          <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #333; font-style: italic;">
            "${reviewData.adminResponse}"
          </p>
        </div>
        <p style="margin: 15px 0 0 0; font-size: 14px; color: #666; text-align: right;">
          <em>- El equipo de El Nopal Restaurant 🌮</em>
        </p>
      </div>
    ` : `
      <div style="background: linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
        <h3 style="color: #28A745; margin: 0 0 15px 0; font-size: 22px;">🌶️ ¿Sabías que...?</h3>
        <p style="margin: 0; line-height: 1.6; font-size: 16px;">
          Cada opinión como la tuya nos ayuda a mejorar nuestros platillos, nuestro servicio y la experiencia completa. 
          <strong>¡Eres parte esencial de la familia El Nopal!</strong> Tus comentarios se comparten con todo nuestro equipo, 
          desde nuestros chefs mexicanos hasta nuestro personal de sala.
        </p>
      </div>
    `}

    ${reviewData.rating >= 4 ? `
      <div style="background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
        <h3 style="color: #F57C00; margin: 0 0 15px 0; font-size: 20px;">🎉 ¡Nos has hecho muy felices!</h3>
        <p style="margin: 0 0 15px 0; line-height: 1.6; font-size: 16px;">
          ¡Una valoración tan alta nos llena de orgullo! Si te gustó tu experiencia, 
          ¿te animarías a recomendarnos a tus amigos y familiares?
        </p>
        <div style="margin: 20px 0;">
          <a href="https://www.google.com/search?q=El+Nopal+Restaurant+Granada" class="button" style="margin: 5px;">
            🌟 Déjanos una reseña en Google
          </a>
          <a href="https://www.facebook.com/elnopalrestaurant" class="button" style="margin: 5px;">
            👍 Síguenos en Facebook
          </a>
        </div>
      </div>
    ` : `
      <div style="background: linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
        <h3 style="color: #0277BD; margin: 0 0 15px 0; font-size: 20px;">💙 Valoramos tu honestidad</h3>
        <p style="margin: 0 0 15px 0; line-height: 1.6; font-size: 16px;">
          Agradecemos mucho tu sinceridad. ${reviewData.adminResponse ? 'Esperamos que nuestra respuesta haya aclarado tus dudas.' : 'Si hay algo específico en lo que podemos mejorar, no dudes en contactarnos directamente. ¡Estamos aquí para escucharte!'}
        </p>
        ${!reviewData.adminResponse ? `
          <a href="mailto:reservas@elnopal.es?subject=Sugerencias%20de%20mejora" class="button">
            📧 Cuéntanos cómo mejorar
          </a>
        ` : ''}
      </div>
    `}

    <div style="background: linear-gradient(135deg, #FCE4EC 0%, #F8BBD9 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
      <h3 style="color: #C2185B; margin: 0 0 15px 0; font-size: 22px;">🎁 ¡Te esperamos de vuelta!</h3>
      <p style="margin: 0 0 15px 0; line-height: 1.6; font-size: 16px;">
        Nuestro menú está siempre evolucionando con nuevas especialidades mexicanas. 
        <strong>¡La próxima vez que vengas, prueba nuestros tacos de cochinita pibil!</strong> 
        Son la especialidad de la casa y te aseguramos que te transportarán directamente a Yucatán.
      </p>
      <p style="margin: 15px 0 0 0; font-size: 14px; font-style: italic; color: #666;">
        💡 <strong>Tip del Chef:</strong> Los miércoles tenemos descuento especial en nuestros cócteles de mezcal artesanal
      </p>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <p style="font-size: 18px; color: #D62828; font-weight: 600; margin-bottom: 15px;">
        ¡Esperamos verte pronto en nuestra mesa mexicana! 🇲🇽
      </p>
      <a href="https://elnopal.es/reservas" class="button">
        🍴 Hacer Nueva Reserva
      </a>
    </div>

    <hr class="divider">
    
    <p style="text-align: center; font-size: 16px; color: #666; margin: 20px 0 0 0;">
      <strong>¡Gracias por ser parte de la familia El Nopal!</strong><br>
      <em>Donde cada platillo cuenta una historia de México</em> 🌮✨
    </p>
  `;
  
  return getBaseTemplate(content, `${reviewData.adminResponse ? 'Respuesta Personal' : '¡Gracias'} ${reviewData.name}! - El Nopal Restaurant`);
};

// 4. OPINIONES - Notificación al restaurante (versión mejorada)
const getReviewNotificationTemplate = (reviewData) => {
  const stars = '⭐'.repeat(Math.max(1, Math.min(5, reviewData.rating || 5)));
  const ratingColor = reviewData.rating >= 4 ? '#4CAF50' : reviewData.rating >= 3 ? '#FF9800' : '#F44336';
  const ratingEmoji = reviewData.rating >= 4 ? '😍' : reviewData.rating >= 3 ? '😊' : '😕';
  const urgencia = reviewData.rating <= 2;
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #D62828; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
        💬 NUEVA OPINIÓN RECIBIDA
      </h2>
      ${urgencia ? `
        <div style="background: linear-gradient(135deg, #FF5252 0%, #D32F2F 100%); color: white; padding: 10px; border-radius: 25px; margin: 15px 0; font-weight: 600;">
          ⚠️ ATENCIÓN: Valoración baja - Requiere seguimiento
        </div>
      ` : `
        <p style="color: #F8B612; font-size: 16px; font-weight: 600; margin: 10px 0 0 0;">
          Nueva valoración de cliente para revisar
        </p>
      `}
    </div>

    <div class="details">
      <h3>👤 Información del Cliente</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">👤 Nombre del Cliente</div>
          <div class="info-value" style="font-size: 18px; font-weight: 600;">${reviewData.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">📧 Correo Electrónico</div>
          <div class="info-value">
            <a href="mailto:${reviewData.email}" style="color: #D62828; text-decoration: none;">
              ${reviewData.email}
            </a>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">⏰ Fecha de la Opinión</div>
          <div class="info-value">${new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
        </div>
        <div class="info-item">
          <div class="info-label">🌐 Plataforma</div>
          <div class="info-value">Página Web El Nopal</div>
        </div>
      </div>
    </div>

    <div class="highlight">
      <h3 style="margin-top: 0; color: #D62828; font-size: 20px;">⭐ Valoración Recibida</h3>
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">${stars}</div>
        <div style="font-size: 32px; font-weight: 600; margin-bottom: 15px; color: ${ratingColor};">
          ${reviewData.rating}/5 Estrellas ${ratingEmoji}
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 6px solid ${ratingColor}; text-align: left; margin: 20px 0;">
          <h4 style="color: ${ratingColor}; margin: 0 0 15px 0; font-size: 18px;">💬 Comentario del Cliente:</h4>
          <blockquote style="margin: 0; font-size: 18px; font-style: italic; line-height: 1.7; color: #333; background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid ${ratingColor};">
            "${reviewData.comment}"
          </blockquote>
        </div>
      </div>
    </div>

    ${urgencia ? `
      <div style="background: rgba(244, 67, 54, 0.1); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 6px solid #F44336;">
        <h4 style="color: #F44336; margin: 0 0 15px 0; font-size: 20px;">🚨 Acción Requerida - Valoración Baja</h4>
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">📋 Plan de Acción Inmediato:</h5>
          <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>Contactar al cliente</strong> en las próximas 24 horas</li>
            <li><strong>Investigar</strong> los puntos mencionados en el comentario</li>
            <li><strong>Ofrecer compensación</strong> si es apropiado (descuento, comida gratis)</li>
            <li><strong>Documentar</strong> las medidas tomadas para evitar repetición</li>
            <li><strong>Hacer seguimiento</strong> para asegurar satisfacción del cliente</li>
          </ul>
          <div style="margin-top: 20px; text-align: center;">
            <a href="mailto:${reviewData.email}?subject=Disculpas%20por%20tu%20experiencia%20-%20El%20Nopal&body=Estimado/a%20${reviewData.name},%0D%0A%0D%0AHemos%20recibido%20tu%20opinión..." 
               class="button" style="background: #F44336;">
              📧 Contactar Cliente Urgente
            </a>
          </div>
        </div>
      </div>
    ` : `
      <div style="background: rgba(76, 175, 80, 0.1); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 6px solid #4CAF50;">
        <h4 style="color: #4CAF50; margin: 0 0 15px 0; font-size: 20px;">✅ ¡Excelente Valoración!</h4>
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 15px 0; font-size: 16px;">
            ¡Felicitaciones al equipo! Esta valoración positiva refleja el excelente trabajo que estamos haciendo.
          </p>
          <h5 style="color: #D62828; margin: 15px 0 10px 0;">💡 Sugerencias de Seguimiento:</h5>
          <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>Agradecer</strong> al cliente por la valoración positiva</li>
            <li><strong>Invitar</strong> a que recomiende el restaurante a amigos</li>
            <li><strong>Ofrecer</strong> un descuento para la próxima visita</li>
            <li><strong>Solicitar</strong> que deje una reseña en Google/TripAdvisor</li>
          </ul>
        </div>
      </div>
    `}

    <div style="background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
      <h4 style="color: #2E7D32; margin: 0 0 15px 0; font-size: 20px;">📊 Análisis y Acciones</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
        <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">👨‍🍳 Para Cocina</h5>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Revisar feedback sobre platos</li>
            <li>Evaluar tiempos de preparación</li>
            <li>Considerar ajustes en recetas</li>
          </ul>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">🏪 Para Sala</h5>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Analizar comentarios del servicio</li>
            <li>Revisar atención al cliente</li>
            <li>Mejorar tiempos de servicio</li>
          </ul>
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <a href="mailto:${reviewData.email}?subject=Gracias%20por%20tu%20opinión%20-%20El%20Nopal&body=Estimado/a%20${reviewData.name},%0D%0A%0D%0AGracias%20por%20tu%20valiosa%20opinión..." 
           class="button" style="margin: 5px;">
          📧 Agradecer al Cliente
        </a>
        <a href="#" class="button" style="margin: 5px; background: #9C27B0;">
          📋 Registrar en Sistema
        </a>
      </div>
    </div>

    <hr class="divider">
    
    <p style="text-align: center; font-size: 14px; color: #666; margin: 20px 0 0 0;">
      <strong>Notificación automática del Sistema de Opiniones El Nopal</strong><br>
      <em>Mantén siempre la excelencia en el servicio</em> 🌮⭐
    </p>
  `;
  
  return getBaseTemplate(content, `💬 Nueva Opinión ${stars} - ${reviewData.name}`);
};

// 5. CONTACTO - Confirmación al cliente (versión mejorada)
const getContactConfirmationTemplate = (contactData) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #D62828; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
        ¡MENSAJE RECIBIDO! 📧
      </h2>
      <p style="color: #F8B612; font-size: 16px; font-weight: 600; margin: 10px 0 0 0;">
        Gracias por contactarnos, responderemos pronto
      </p>
    </div>

    <p style="font-size: 18px; color: #333333; margin-bottom: 25px;">
      Estimado/a <strong style="color: #D62828;">${contactData.name}</strong>,
    </p>
    
    <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
      ¡Muchas gracias por contactar con <strong>El Nopal Restaurant</strong>! 🇲🇽 
      Hemos recibido tu mensaje y queremos asegurarte que nuestro equipo lo revisará con la atención que merece. 
      Te responderemos a la brevedad posible.
    </p>
    
    <div class="details">
      <h3>📋 Resumen de tu Consulta</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">👤 Nombre</div>
          <div class="info-value">${contactData.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">📧 Email de Contacto</div>
          <div class="info-value">${contactData.email}</div>
        </div>
        <div class="info-item">
          <div class="info-label">📞 Teléfono</div>
          <div class="info-value">${contactData.phone || 'No proporcionado'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">📝 Asunto</div>
          <div class="info-value">${contactData.subject || 'Consulta general'}</div>
        </div>
      </div>
      
      <div style="background: rgba(248, 182, 18, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F8B612;">
        <div class="info-label">💬 Tu Mensaje</div>
        <div class="info-value" style="font-style: italic; background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
          "${contactData.message}"
        </div>
      </div>
    </div>

    <div class="highlight">
      <h3 style="margin-top: 0; color: #D62828; font-size: 20px;">⏰ ¿Qué sigue ahora?</h3>
      <div style="text-align: left; margin: 15px 0;">
        <div style="display: flex; align-items: center; margin: 10px 0;">
          <span style="font-size: 20px; margin-right: 15px;">📬</span>
          <span><strong>Recibido:</strong> ${new Date().toLocaleString('es-ES')} - Tu mensaje está en nuestra bandeja de entrada</span>
        </div>
        <div style="display: flex; align-items: center; margin: 10px 0;">
          <span style="font-size: 20px; margin-right: 15px;">👀</span>
          <span><strong>Revisión:</strong> Nuestro equipo analizará tu consulta en las próximas horas</span>
        </div>
        <div style="display: flex; align-items: center; margin: 10px 0;">
          <span style="font-size: 20px; margin-right: 15px;">📞</span>
          <span><strong>Respuesta:</strong> Te contactaremos en un máximo de 24-48 horas</span>
        </div>
        <div style="display: flex; align-items: center; margin: 10px 0;">
          <span style="font-size: 20px; margin-right: 15px;">🚨</span>
          <span><strong>Urgente:</strong> Si es muy urgente, llámanos al +34 958 123 456</span>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
      <h3 style="color: #0277BD; margin: 0 0 15px 0; font-size: 22px;">🌮 Mientras tanto...</h3>
      <p style="margin: 0 0 15px 0; line-height: 1.6; font-size: 16px;">
        ¿Por qué no echas un vistazo a nuestro menú online? Tenemos nuevas especialidades mexicanas 
        que seguramente te encantarán. <strong>¡O haz una reserva para probar nuestros famosos tacos de cochinita pibil!</strong>
      </p>
      <div style="margin: 20px 0;">
        <a href="https://elnopal.es/menu" class="button" style="margin: 5px;">
          🍽️ Ver Nuestro Menú
        </a>
        <a href="https://elnopal.es/reservas" class="button" style="margin: 5px;">
          📅 Hacer Reserva
        </a>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%); padding: 25px; border-radius: 12px; margin: 30px 0;">
      <h4 style="color: #F57C00; margin: 0 0 15px 0; font-size: 20px;">📱 Otras Formas de Contacto</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
        <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">📞 Llamada Directa</h5>
          <p style="margin: 0; font-size: 14px;">+34 958 123 456<br>Lun-Dom: 12:00-00:00</p>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">🌐 Redes Sociales</h5>
          <p style="margin: 0; font-size: 14px;">Facebook: @ElNopalGranada<br>Instagram: @elnopal_restaurant</p>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <p style="font-size: 18px; color: #D62828; font-weight: 600; margin-bottom: 15px;">
        ¡Estamos aquí para ayudarte en todo lo que necesites! 🇲🇽
      </p>
    </div>

    <hr class="divider">
    
    <p style="text-align: center; font-size: 16px; color: #666; margin: 20px 0 0 0;">
      <strong>¡Gracias por contactar con El Nopal Restaurant!</strong><br>
      <em>Donde cada consulta es importante para nosotros</em> 🌮📧
    </p>
  `;
  
  return getBaseTemplate(content, `Mensaje Recibido - ${contactData.subject || 'Consulta'} - El Nopal Restaurant`);
};

// 6. CONTACTO - Notificación al restaurante (versión mejorada)
const getContactNotificationTemplate = (contactData) => {
  const fechaRecepcion = new Date().toLocaleString('es-ES');
  const tipoConsulta = contactData.subject || 'Consulta general';
  const esUrgente = contactData.message && (
    contactData.message.toLowerCase().includes('urgente') || 
    contactData.message.toLowerCase().includes('inmediato') ||
    contactData.message.toLowerCase().includes('emergencia')
  );
  
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #D62828; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
        📨 NUEVO MENSAJE DE CONTACTO
      </h2>
      ${esUrgente ? `
        <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%); color: white; padding: 10px; border-radius: 25px; margin: 15px 0; font-weight: 600;">
          ⚠️ CONSULTA MARCADA COMO URGENTE
        </div>
      ` : `
        <p style="color: #F8B612; font-size: 16px; font-weight: 600; margin: 10px 0 0 0;">
          Nueva consulta recibida para atención
        </p>
      `}
    </div>

    <div class="details">
      <h3>👤 Información del Cliente</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">👤 Nombre Completo</div>
          <div class="info-value" style="font-size: 18px; font-weight: 600;">${contactData.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">📧 Correo Electrónico</div>
          <div class="info-value">
            <a href="mailto:${contactData.email}" style="color: #D62828; text-decoration: none;">
              ${contactData.email}
            </a>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">📞 Teléfono</div>
          <div class="info-value">
            ${contactData.phone ? `
              <a href="tel:${contactData.phone}" style="color: #D62828; text-decoration: none;">
                ${contactData.phone}
              </a>
            ` : '<span style="color: #999;">No proporcionado</span>'}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">📝 Tipo de Consulta</div>
          <div class="info-value">${tipoConsulta}</div>
        </div>
      </div>
    </div>

    <div class="highlight">
      <h3 style="margin-top: 0; color: #D62828; font-size: 20px;">💬 Mensaje del Cliente</h3>
      <div style="background: white; padding: 20px; border-radius: 8px; border-left: 6px solid #F8B612; margin: 20px 0;">
        <blockquote style="margin: 0; font-size: 16px; line-height: 1.7; color: #333; font-style: italic;">
          "${contactData.message}"
        </blockquote>
      </div>
      <div style="text-align: right; font-size: 14px; color: #666; margin-top: 10px;">
        <strong>📅 Recibido:</strong> ${fechaRecepcion}
      </div>
    </div>

    ${esUrgente ? `
      <div style="background: rgba(244, 67, 54, 0.1); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 6px solid #F44336;">
        <h4 style="color: #F44336; margin: 0 0 15px 0; font-size: 20px;">🚨 Atención Prioritaria Requerida</h4>
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">📋 Acciones Inmediatas:</h5>
          <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>Contactar al cliente</strong> en las próximas 2 horas</li>
            <li><strong>Priorizar</strong> esta consulta sobre otras no urgentes</li>
            <li><strong>Documentar</strong> la resolución para seguimiento</li>
            <li><strong>Informar</strong> al supervisor si es necesario</li>
          </ul>
        </div>
      </div>
    ` : `
      <div style="background: rgba(76, 175, 80, 0.1); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 6px solid #4CAF50;">
        <h4 style="color: #4CAF50; margin: 0 0 15px 0; font-size: 20px;">📋 Plan de Atención Estándar</h4>
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">✅ Proceso de Respuesta:</h5>
          <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>Revisar</strong> el mensaje y categorizarlo apropiadamente</li>
            <li><strong>Responder</strong> en un máximo de 24-48 horas</li>
            <li><strong>Personalizar</strong> la respuesta según el tipo de consulta</li>
            <li><strong>Hacer seguimiento</strong> si no hay respuesta del cliente</li>
          </ul>
        </div>
      </div>
    `}

    <div style="background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
      <h4 style="color: #2E7D32; margin: 0 0 15px 0; font-size: 20px;">📊 Categorización Sugerida</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
        <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">🍽️ Si es sobre Menú/Precios</h5>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Enviar carta actualizada</li>
            <li>Información de alérgenos</li>
            <li>Opciones vegetarianas/veganas</li>
          </ul>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">📅 Si es sobre Reservas</h5>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Ayudar con reserva online</li>
            <li>Información de disponibilidad</li>
            <li>Políticas de cancelación</li>
          </ul>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">🎉 Si es sobre Eventos</h5>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Información de grupos grandes</li>
            <li>Menús especiales</li>
            <li>Precios corporativos</li>
          </ul>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px; text-align: left;">
          <h5 style="color: #D62828; margin: 0 0 10px 0;">❓ Si es Consulta General</h5>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Horarios de apertura</li>
            <li>Ubicación y transporte</li>
            <li>Información general</li>
          </ul>
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <a href="mailto:${contactData.email}?subject=Re:%20${encodeURIComponent(tipoConsulta)}&body=Estimado/a%20${encodeURIComponent(contactData.name)},%0D%0A%0D%0AGracias%20por%20contactarnos..." 
           class="button" style="margin: 5px;">
          📧 Responder al Cliente
        </a>
        ${contactData.phone ? `
          <a href="tel:${contactData.phone}" class="button" style="margin: 5px;">
            📞 Llamar Cliente
          </a>
        ` : ''}
      </div>
    </div>

    <hr class="divider">
    
    <p style="text-align: center; font-size: 14px; color: #666; margin: 20px 0 0 0;">
      <strong>Notificación automática del Sistema de Contacto El Nopal</strong><br>
      <em>Mantén siempre la excelencia en atención al cliente</em> 🌮📞
    </p>
  `;
  
  return getBaseTemplate(content, `📨 Nuevo Contacto: ${contactData.name} - ${tipoConsulta}`);
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