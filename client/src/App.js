import React, { useState, useEffect, useRef, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// ===== ESTILOS =====
import 'react-toastify/dist/ReactToastify.css';

// ===== COMPONENTES CRÍTICOS (CARGA INMEDIATA) =====
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import { AuthProvider } from './context/AuthContext';
import { ReservationProvider } from './context/ReservationContext';
import OptimizedImage from './components/common/OptimizedImage';
import ViewportObserver from './components/common/ViewportObserver';
import { navigateAndScroll, handleHashScroll } from './utils/scrollUtils';

// ===== LAZY LOADING PARA COMPONENTES NO CRÍTICOS =====
const Blog = React.lazy(() => import('./components/routes/Blog'));
const BlogPost = React.lazy(() => import('./components/routes/BlogPost'));
const About = React.lazy(() => import('./components/routes/About'));
const ReservationForm = React.lazy(() => import('./components/reservation/ReservationForm'));
const AdminLogin = React.lazy(() => import('./components/admin/AdminLogin'));
const Forbidden = React.lazy(() => import('./components/admin/Forbidden'));
const PrivateRoute = React.lazy(() => import('./components/routes/PrivateRoute'));
const LeaveReviewPage = React.lazy(() => import('./components/reviews/LeaveReviewPage'));
const AdminReviewsPanel = React.lazy(() => import('./components/admin/AdminReviewsPanel'));
const AdminReservationsPanel = React.lazy(() => import('./components/admin/AdminReservationsPanel'));
const ContactInfo = React.lazy(() => import('./components/contact/ContactInfo'));
const ContactForm = React.lazy(() => import('./components/ContactForm'));

// ===== RECURSOS MULTIMEDIA =====
import videoEjemplo from './images/ejemplo_video.mp4';

// Importar nuevas imágenes para el héroe
import heroImage1 from './images/NOPAL_UNITY-50.JPG';
import heroImage2 from './images/NOPAL_UNITY-39.JPG';

// ===== COMPONENTE DE LOADING =====
const LoadingFallback = ({ message = "Cargando..." }) => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="mexican-spinner">
        <span className="spinner-emoji">🌮</span>
      </div>
    </div>
    <p className="loading-text">{message}</p>
  </div>
);

// Componentes de página
const Home = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlato, setSelectedPlato] = useState(null);
  const sectionRefs = {
    hero: useRef(null),
    about: useRef(null),
    video: useRef(null),
    promociones: useRef(null)
  };

  const parallaxRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const offset = window.pageYOffset;
        // Usar requestAnimationFrame para mejor rendimiento
        requestAnimationFrame(() => {
          if (parallaxRef.current) {
            parallaxRef.current.style.transform = `translateY(${offset * 0.4}px)`;
          }
        });
      }
    };

    // Throttle a 60fps
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  const handleReservaClick = () => {
    navigateAndScroll(navigate, '/reservaciones', 'reservation-form');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlato(null);
  };

  return (
    <div className="home-page">
      {/* HERO SECTION - OPTIMIZADO PARA LCP */}
      <section ref={sectionRefs.hero} className="hero-section above-the-fold">
        <div className="hero-background" ref={parallaxRef}>
          <OptimizedImage 
            src={heroImage1} 
            alt="Auténtica comida mexicana servida en la mesa de El Nopal"
            priority={true}
            loading="eager"
            className="critical hero-image"
            sizes="100vw"
            width={1920}
            height={1080}
            fetchPriority="high"
            style={{
              aspectRatio: '16/9',
              objectFit: 'cover',
              width: '100%',
              height: '100vh'
            }}
          />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-animated-emojis">
            <span className="emoji taco">🌮</span>
            <span className="emoji pepper">🌶️</span>
            <span className="emoji cactus">🌵</span>
            <span className="emoji avocado">🥑</span>
          </div>
          <h1 className="hero-title">Sabor que une, tradición que enamora</h1>
          <p className="hero-subtitle">
            Vive una experiencia culinaria inolvidable con los auténticos sabores de México. Cada plato, una historia. Cada bocado, un recuerdo.
          </p>
          <div className="hero-buttons">
            <button onClick={handleReservaClick} className="btn btn-primary btn-lg">
              Reservar Mesa
            </button>
          </div>
        </div>
      </section>

       {/* ABOUT US SECTION RENOVADA - DISEÑO MODERNO */}
      <ViewportObserver ref={sectionRefs.about} className="home-section about-section-animated" id="about" pauseAnimationsOutside={true}>
        <div className="about-mexican-container">
          
          {/* Header con título impactante */}
          <div className="about-hero-header">
            <h2 className="about-hero-title">Nuestra Historia</h2>
            <p className="about-hero-subtitle">
              Un viaje gastronómico que conecta tradiciones milenarias con sabores contemporáneos
            </p>
          </div>

          {/* Layout en grid con diseño moderno */}
          <div className="mexican-story-grid">
            
            {/* Panel izquierdo visual */}
            <div className="mexican-visual-panel">
              
              {/* Tarjeta de patrimonio */}
              <div className="mexican-heritage-card">
                <span className="heritage-icon">🏛️</span>
                <h3 className="heritage-title">Patrimonio UNESCO</h3>
                <p className="heritage-subtitle">
                  La gastronomía mexicana es reconocida como Patrimonio Cultural Inmaterial de la Humanidad
                </p>
                
                {/* Stats mexicanas */}
                <div className="mexican-stats">
                  <div className="stat-item">
                    <span className="stat-number">+2000</span>
                    <span className="stat-label">Años</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">32</span>
                    <span className="stat-label">Estados</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">68</span>
                    <span className="stat-label">Lenguas</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">∞</span>
                    <span className="stat-label">Sabores</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta del nopal */}
              <div className="mexican-heritage-card">
                <span className="heritage-icon">🌵</span>
                <h3 className="heritage-title">El Nopal</h3>
                <p className="heritage-subtitle">
                  Símbolo nacional presente en nuestra bandera y uno de los súper alimentos del futuro
                </p>
              </div>
            </div>

            {/* Panel derecho con contenido narrativo */}
            <div className="mexican-content-panel">
              
              {/* Bienvenida */}
              <div className="mexican-story-section">
                <span className="story-section-icon">🏠</span>
                <h3 className="story-title">
                  <span>🚪</span> Bienvenidos a Nuestra Casa
                </h3>
                <p className="story-content">
                  Estás a punto de abrir la puerta a un mundo infinito... como infinitas son las 
                  <span className="story-highlight">historias alrededor de nuestra mesa</span>. 
                  Cada visitante se convierte en parte de nuestra familia, compartiendo no solo comida, 
                  sino experiencias que perduran en el tiempo.
                </p>
              </div>

              {/* Historia del maíz */}
              <div className="mexican-story-section">
                <span className="story-section-icon">🌽</span>
                <h3 className="story-title">
                  <span>🌽</span> La Base Sagrada: El Maíz
                </h3>
                <p className="story-content">
                  Como en casi toda América, <span className="story-highlight">la base de la comida mexicana es el maíz</span>. 
                  Cuando disfrutas palomitas en el cine, chocolate o vainilla, estás probando 
                  <span className="story-highlight">regalos milenarios de México al mundo</span>.
                </p>
              </div>

              {/* UNESCO */}
              <div className="mexican-story-section">
                <span className="story-section-icon">🏆</span>
                <h3 className="story-title">
                  <span>🏆</span> Reconocimiento Mundial
                </h3>
                <p className="story-content">
                  La UNESCO destacó las <span className="story-highlight">raíces milenarias</span>, 
                  la manera de cultivar y preparar los alimentos, el sentido comunitario y, sobre todo, 
                  <span className="story-highlight">la innovación y creatividad</span> de nuestro arte culinario.
                </p>
              </div>

              {/* Especialidades */}
              <div className="mexican-story-section">
                <span className="story-section-icon">🌮</span>
                <h3 className="story-title">
                  <span>🌮</span> Viaje Culinario por México
                </h3>
                <p className="story-content">
                  Te proponemos una ruta de <span className="story-highlight">sur a norte y de la costa a la montaña</span>. 
                  Desde el exquisito <span className="story-highlight">mole poblano</span> hasta los tacos de 
                  <span className="story-highlight">cochinita pibil yucateca</span>, pasando por la 
                  <span className="story-highlight">birria jaliciense</span> y los tacos al pastor de herencia libanesa.
                </p>
              </div>
            </div>
          </div>

          {/* Invitación final con sabores destacados */}
          <div className="mexican-invitation">
            <p className="invitation-text">
              "Podríamos seguir hablándote del pastel azteca, de los huaraches o de los ancestrales tamales, 
              pero preferimos que te atrevas y experimentes por ti mismo esta comida tan nuestra que desde ahora también es tuya."
            </p>
            
            <div className="mexican-flavors">
              <span className="flavor-badge">🫔 Mole</span>
              <span className="flavor-badge">🌮 Tacos</span>
              <span className="flavor-badge">🫘 Birria</span>
              <span className="flavor-badge">🥙 Pastor</span>
              <span className="flavor-badge">🦐 Langostinos</span>
              <span className="flavor-badge">🐙 Pulpo</span>
              <span className="flavor-badge">🔥 Tamales</span>
              <span className="flavor-badge">🌵 Nopalitos</span>
            </div>
          </div>

        </div>
      </ViewportObserver>
      
      {/* Video promocional con reproducción automática */}
      
      <ViewportObserver id="video" ref={sectionRefs.video} className={`video-section-simple`} pauseAnimationsOutside={true}>
        <div className={`promo-text`}>
          <h2 className="text-black-title">Vive la experiencia El Nopal</h2>
          <p className="text-appear">
            En El Nopal nos esforzamos por ofrecerte la auténtica gastronomía mexicana, 
            en un ambiente único y acogedor. Nuestros chefs expertos preparan cada platos 
            con ingredientes frescos y las recetas tradicionales que han pasado de generación 
            en generación.
          </p>
        </div>
        
        <div className="video-container-simple">
          <video 
            className="video-player-auto"
            controls 
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={videoEjemplo} type="video/mp4" />
            Tu navegador no soporta videos HTML5.
          </video>
        </div>
      </ViewportObserver>

      {/* Sección de Horario y Opiniones Combinada */}
      <ViewportObserver className="home-combined-section" pauseAnimationsOutside={true}>
        <div className="combined-section-container">
          <div className="schedule-container">
            <h2 className="section-title">Nuestro Horario</h2>
            <div className="schedule-content-container">
              <ul className="schedule-list">
                <li><strong>Martes:</strong> 13:00 - 15:30 y 20:00 - 23:30</li>
                <li><strong>Miércoles:</strong> 13:00 - 16:00 y 20:00 - 23:30</li>
                <li><strong>Jueves:</strong> 13:00 - 16:00 y 20:00 - 23:30</li>
                <li><strong>Viernes:</strong> 13:00 - 16:30 y 20:00 - 23:45</li>
                <li><strong>Sábado:</strong> 13:00 - 16:30 y 20:00 - 23:30</li>
                <li><strong>Domingo:</strong> 13:00 - 16:30</li>
                <li className="closed"><strong>Lunes:</strong> Cerrado</li>
              </ul>
            </div>
          </div>
          
          <div className="review-container">
            <h2 className="section-title">¿Ya nos visitaste?</h2>
            <div className="review-content">
              <p className="review-description">Nos encantaría conocer tu opinión sobre tu experiencia en El Nopal. Tu retroalimentación nos ayuda a mejorar constantemente.</p>
              
              <div className="review-decoration">
                <div className="stars-decoration">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
                <div className="mexican-icons">
                  <span className="icon">🌮</span>
                  <span className="icon">🌶️</span>
                  <span className="icon">🥑</span>
                </div>
              </div>
              
              <div className="review-benefits">
                <p className="benefit-item"><strong>✓</strong> Compartir tu experiencia en nuestro restaurante</p>
                <p className="benefit-item"><strong>✓</strong> Darnos tu perspectiva para seguir innovando</p>
                <p className="benefit-item"><strong>✓</strong> Contribuir a mejorar nuestro servicio</p>
              </div>
              
              <div className="review-quote">
                <blockquote>"La opinión de nuestros clientes es nuestra mayor motivación"</blockquote>
              </div>
              
              <button onClick={() => navigateAndScroll(navigate, '/dejar-opinion', 'review-form')} className="leave-review-btn">
                Dejar una opinión
              </button>
            </div>
          </div>
        </div>
      </ViewportObserver>

      {/* Modal de Detalles del Plato */}
      {showModal && selectedPlato && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-header">
              <OptimizedImage 
                src={selectedPlato.image} 
                alt={selectedPlato.title}
                className="modal-image"
                loading="eager"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="modal-title-section">
                <span className="modal-categoria">{selectedPlato.categoria}</span>
                <h2 className="modal-title">{selectedPlato.title}</h2>
                <div className="modal-precio">{selectedPlato.precio}</div>
              </div>
            </div>
            <div className="modal-body">
              <p className="modal-description">{selectedPlato.description}</p>
              <div className="modal-ingredientes">
                <h3>Ingredientes:</h3>
                <ul>
                  {selectedPlato.ingredientes.map((ingrediente, index) => (
                    <li key={index}>{ingrediente}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// const Menu = () => { // Comentado porque no se usa actualmente
//   const [categoria, setCategoria] = useState('Entradas');
//   
//   return (
//     <div className="page menu-page">
//       // ... contenido del componente Menu
//     </div>
//   );
// };

const Contact = () => {
  // Manejar scroll automático al cargar la página con hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      handleHashScroll(hash);
    }
  }, []);

  return (
    <div className="page contact-page">
      <section id="contact-form">
        <ContactForm />
      </section>
      <section id="contact-info">
        <ContactInfo />
      </section>
    </div>
  );
};

// Componente Not Found
const NotFound = () => {
  return (
    <div className="page not-found">
      <h2>404 - Página no encontrada</h2>
      <p>La página que estás buscando no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ReservationProvider>
        <Router>
          <div className="App">
            {/* Skip Links para accesibilidad */}
            <a href="#main-content" className="skip-link">
              Saltar al contenido principal
            </a>
            <a href="#navigation" className="skip-link">
              Ir a navegación
            </a>
            
            <Navbar id="navigation" />
            
            <main id="main-content" className="main-content" role="main">
              <Suspense fallback={<LoadingFallback message="Cargando página..." />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/reservaciones" element={
                    <Suspense fallback={<LoadingFallback message="Cargando formulario de reservación..." />}>
                      <ReservationForm />
                    </Suspense>
                  } />
                  <Route path="/contacto" element={<Contact />} />
                  <Route path="/admin/login" element={
                    <Suspense fallback={<LoadingFallback message="Cargando panel de administración..." />}>
                      <AdminLogin />
                    </Suspense>
                  } />
                  <Route path="/blog" element={
                    <Suspense fallback={<LoadingFallback message="Cargando blog..." />}>
                      <Blog />
                    </Suspense>
                  } />
                  <Route path="/blog/:id" element={
                    <Suspense fallback={<LoadingFallback message="Cargando artículo..." />}>
                      <BlogPost />
                    </Suspense>
                  } />
                  <Route path="/nosotros" element={
                    <Suspense fallback={<LoadingFallback message="Cargando información..." />}>
                      <About />
                    </Suspense>
                  } />
                  
                  {/* Mantener ruta para dejar reseñas pero eliminar la de ver opiniones */}
                  <Route path="/dejar-opinion" element={
                    <Suspense fallback={<LoadingFallback message="Cargando formulario de opinión..." />}>
                      <LeaveReviewPage />
                    </Suspense>
                  } />
                  
                  {/* Rutas protegidas */}
                  <Route path="/admin/reservaciones" element={
                    <Suspense fallback={<LoadingFallback message="Cargando panel de administración..." />}>
                      <PrivateRoute
                        component={AdminReservationsPanel}
                        requireAdmin={true}
                      />
                    </Suspense>
                  } />
                  
                  {/* Ruta para administrar reseñas */}
                  <Route path="/admin/reviews" element={
                    <Suspense fallback={<LoadingFallback message="Cargando panel de opiniones..." />}>
                      <PrivateRoute
                        component={AdminReviewsPanel}
                        requireAdmin={true}
                      />
                    </Suspense>
                  } />
                  
                  {/* Redirección para rutas /admin que no estén especificadas */}
                  <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                  
                  <Route path="/forbidden" element={
                    <Suspense fallback={<LoadingFallback message="Cargando..." />}>
                      <Forbidden />
                    </Suspense>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            
            <Footer />

            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </ReservationProvider>
    </AuthProvider>
  );
}

export default App; 