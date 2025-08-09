import React from 'react';
import ReactDOM from 'react-dom';

// ===== CSS CRÍTICO PRIMERO =====
import './styles/fonts.css';
import './styles/critical.css';

// ===== APP PRINCIPAL =====
import App from './App';

// ===== CSS NO CRÍTICO (LAZY) =====
const loadNonCriticalCSS = () => {
  // Cargar estilos después del primer renderizado
  requestIdleCallback(() => {
    import('./styles/base.css');
    import('./styles/variables.css');
    import('./styles/components.css');
    import('./styles/layout.css');
    import('./styles/navbar.css');
    import('./styles/footer.css');
    import('./styles/pages.css');
    import('./styles/mexican-theme.css');
    import('./styles/menu-reservation.css');
    import('./styles/performance-optimizations.css');
    import('./styles/blog.css');
    import('./styles/contact-form.css');
    import('./styles/reviews.css');
    import('./styles/admin.css');
    import('./index.css');
  }, { timeout: 2000 });
};

// ===== PERFORMANCE MONITORING =====
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// ===== RENDERIZADO OPTIMIZADO =====
const renderApp = () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root'),
    () => {
      // Callback después del primer renderizado
      loadNonCriticalCSS();
      
      // Precargar rutas críticas
      import('./components/reservation/ReservationForm');
      import('./components/contact/ContactInfo');
    }
  );
};

// ===== INICIALIZAR APP =====
renderApp();

// ===== MÉTRICAS DE RENDIMIENTO =====
reportWebVitals();

// ===== SERVICE WORKER (OPCIONAL) =====
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} 