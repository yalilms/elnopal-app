import React, { useEffect } from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-policy-page">
      <div className="privacy-container">
        <header className="privacy-header">
          <h1 className="privacy-title">Política de Privacidad</h1>
          <p className="privacy-subtitle">El Nopal - Restaurante Mexicano</p>
          <div className="privacy-date">Última actualización: {new Date().toLocaleDateString('es-ES')}</div>
        </header>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Información que Recopilamos</h2>
            <p>
              En El Nopal, recopilamos información cuando realiza una reserva, deja una opinión, 
              o se pone en contacto con nosotros. La información que podemos recopilar incluye:
            </p>
            <ul>
              <li>Nombre completo</li>
              <li>Número de teléfono</li>
              <li>Dirección de correo electrónico</li>
              <li>Preferencias alimentarias o alergias</li>
              <li>Comentarios y opiniones sobre nuestro servicio</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>2. Cómo Utilizamos su Información</h2>
            <p>
              Utilizamos la información recopilada para los siguientes propósitos:
            </p>
            <ul>
              <li>Gestionar y confirmar sus reservas</li>
              <li>Mejorar nuestro servicio y experiencia gastronómica</li>
              <li>Responder a sus consultas y comentarios</li>
              <li>Comunicarle promociones especiales (solo si ha dado su consentimiento)</li>
              <li>Cumplir con requisitos legales y normativos</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. Protección de Datos</h2>
            <p>
              Nos comprometemos a proteger su información personal mediante medidas de seguridad 
              apropiadas. Sus datos están protegidos contra acceso no autorizado, alteración, 
              divulgación o destrucción.
            </p>
          </section>

          <section className="privacy-section">
            <h2>4. Compartir Información</h2>
            <p>
              No vendemos, intercambiamos ni transferimos su información personal a terceros 
              sin su consentimiento, excepto en los siguientes casos:
            </p>
            <ul>
              <li>Cuando sea requerido por ley</li>
              <li>Para proteger nuestros derechos o propiedad</li>
              <li>Con proveedores de servicios que nos ayudan a operar nuestro restaurante</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>5. Conservación de Datos</h2>
            <p>
              Conservamos su información personal solo durante el tiempo necesario para 
              cumplir con los propósitos para los cuales fue recopilada, o según lo 
              requiera la ley aplicable.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Sus Derechos</h2>
            <p>
              Usted tiene derecho a:
            </p>
            <ul>
              <li>Acceder a su información personal</li>
              <li>Corregir datos inexactos</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Retirar su consentimiento en cualquier momento</li>
              <li>Presentar una queja ante la autoridad de protección de datos</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>7. Cookies</h2>
            <p>
              Nuestro sitio web puede utilizar cookies para mejorar su experiencia de navegación. 
              Las cookies son pequeños archivos que se almacenan en su dispositivo y nos ayudan 
              a recordar sus preferencias.
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. Cambios en esta Política</h2>
            <p>
              Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos 
              sobre cambios significativos publicando la nueva política en nuestro sitio web 
              con una fecha de actualización revisada.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Contacto</h2>
            <p>
              Si tiene preguntas sobre esta política de privacidad o sobre cómo manejamos 
              su información personal, puede contactarnos:
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Restaurante El Nopal</strong>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>info@elnopal.es</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>+34 123 456 789</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>Calle Principal, 123, Ciudad, España</span>
              </div>
            </div>
          </section>
        </div>

        <footer className="privacy-footer">
          <p>
            Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta 
            política de privacidad.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 