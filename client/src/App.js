import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect, useHistory } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Blog from './components/routes/Blog';
import BlogPost from './components/routes/BlogPost';
import About from './components/routes/About';
// Importar componentes
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
// Importar AuthProvider
import { AuthProvider } from './context/AuthContext';
// Importar ReservationProvider
import { ReservationProvider } from './context/ReservationContext';
// Importar componentes de reserva
import ReservationForm from './components/reservation/ReservationForm';
// import AdminReservationPanel from './components/admin/AdminReservationPanel'; // Archivo eliminado
import AdminLogin from './components/admin/AdminLogin';
import Forbidden from './components/admin/Forbidden';
// Importar PrivateRoute
import PrivateRoute from './components/routes/PrivateRoute';
// Importar los nuevos componentes de reseñas
import LeaveReviewPage from './components/reviews/LeaveReviewPage';
import AdminReviewsPanel from './components/admin/AdminReviewsPanel';

// Importar componentes de contacto
import ContactInfo from './components/contact/ContactInfo';
import ContactForm from './components/ContactForm';

// Importar utilidades de scroll
import { navigateAndScroll, handleHashScroll } from './utils/scrollUtils';

// Datos
import { menuData } from './data/menuData';
import { reviewsData } from './data/reviewsData';

// Importar el video
import videoEjemplo from './images/ejemplo_video.mp4';
// Importar el logo
import logoElNopal from './images/logo_elnopal.png';

// Importar nuevas imágenes para el héroe
import heroImage1 from './images/NOPAL_UNITY-50.JPG';
import heroImage2 from './images/NOPAL_UNITY-39.JPG';
import heroImage3 from './images/NOPAL_UNITY-19.JPG';
import heroImage4 from './images/NOPAL_UNITY-6.JPG';

// Importar imágenes de platos de la semana
import platoImage1 from './images/p.s.1.JPG';
import platoImage2 from './images/p_s_2.JPG';
import platoImage3 from './images/p_s_3.JPG';

// Componentes de página
const Home = () => {
  const history = useHistory();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showHeroContent, setShowHeroContent] = useState(false);
  const [animationTriggered, setAnimationTriggered] = useState({});
  const [showVideo, setShowVideo] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlato, setSelectedPlato] = useState(null);
  const sectionRefs = {
    hero: useRef(null),
    about: useRef(null),
    video: useRef(null),
    promociones: useRef(null)
  };
  
  // Imágenes para el efecto parallax
  const heroImages = [
    heroImage1,
    heroImage2,
    heroImage3,
    heroImage4
  ];
  
  // Platos de la semana para el carrusel 3D
  const platosDelaSemana = [
    {
      id: 1,
      title: "Nachos con Guacamole y Salsa",
      description: "Totopos crujientes acompañados de guacamole fresco y salsa roja picante",
      image: platoImage1,
      color: "#e63946",
      ingredientes: [
        "Totopos de maíz crujientes",
        "Guacamole fresco con aguacate",
        "Salsa roja de tomate y chile",
        "Cilantro y cebolla picada",
        "Limón y sal de mar"
      ],
      precio: "9€",
      categoria: "Botanas y Entradas"
    },
    {
      id: 2,
      title: "Enchiladas Rojas con Pollo",
      description: "Tortillas bañadas en salsa roja de chiles guajillo con pollo deshebrado",
      image: platoImage2,
      color: "#457b9d",
      ingredientes: [
        "Tortillas de maíz suaves",
        "Pollo deshebrado casero",
        "Salsa roja de chile guajillo",
        "Queso fresco desmoronado",
        "Crema mexicana y cebolla"
      ],
      precio: "13€",
      categoria: "Plato Principal"
    },
    {
      id: 3,
      title: "Tacos de Birria",
      description: "Tacos dorados rellenos de carne de res guisada en consomé de chiles especiales",
      image: platoImage3,
      color: "#2a9d8f",
      ingredientes: [
        "Carne de res en birria tradicional",
        "Tortillas de maíz doradas",
        "Consomé de chiles guajillo y ancho",
        "Queso Oaxaca derretido",
        "Cebolla blanca y cilantro",
        "Salsa verde y limones"
      ],
      precio: "15€",
      categoria: "Especialidad Jaliciense"
    }
  ];
  
  // Efectos de scroll y parallax
  useEffect(() => {
    // Cambio de imágenes automático
    const imageInterval = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % heroImages.length);
    }, 5000);

    // Mostrar contenido del hero después de cargarse la imagen
    setTimeout(() => setShowHeroContent(true), 500);
    
    // Observador de intersección para animaciones al hacer scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          
          if (entry.isIntersecting && !animationTriggered[id]) {
            setAnimationTriggered(prev => ({ ...prev, [id]: true }));
            
            // Iniciar la reproducción del video cuando la sección es visible
            if (id === 'video' && !showVideo) {
              setShowVideo(true);
            }
            
            // Iniciar la animación de contadores cuando la sección de video sea visible
            if (id === 'video') {
              setTimeout(() => {
                const counters = document.querySelectorAll('.counter');
                counters.forEach(counter => {
                  const target = +counter.getAttribute('data-target');
                  const duration = 1500; // duración en ms
                  const step = Math.ceil(target / (duration / 15)); // incremento cada 15ms
                  
                  let count = 0;
                  const updateCount = () => {
                    if (count < target) {
                      count += step;
                      if (count > target) count = target;
                      counter.innerText = count < 10 ? count : count + "+";
                      requestAnimationFrame(updateCount);
                    }
                  };
                  
                  updateCount();
                });
              }, 1200); // retraso después de la revelación
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    
    // Observar elementos para animar
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });
    
    // Efecto de parallax en scroll
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      if (sectionRefs.hero.current) {
        const heroHeight = sectionRefs.hero.current.offsetHeight;
        const heroSection = sectionRefs.hero.current;
        const parallaxBg = heroSection.querySelector('.parallax-bg');
        if (parallaxBg && scrollPos <= heroHeight) {
          parallaxBg.style.transform = `translateY(${scrollPos * 0.5}px)`;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(imageInterval);
      window.removeEventListener('scroll', handleScroll);
      Object.values(sectionRefs).forEach(ref => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, [animationTriggered]);

  // Efecto para manejar la tecla Escape en el modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);
  
  const handleReservaClick = () => {
    history.push('/reservaciones');
  };
  
  const openModal = (plato) => {
    setSelectedPlato(plato);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlato(null);
  };
  
  return (
    <div className="page home-page">
      {/* Hero Dinámico con Parallax */}
      <section id="hero" ref={sectionRefs.hero} className="hero-parallax">
        <div className="parallax-bg" style={{ backgroundImage: `url(${heroImages[activeImageIndex]})` }}>
          <div className="parallax-overlay"></div>
        </div>
        <div className={`hero-content ${showHeroContent ? 'fade-in' : ''}`}>
          <div className="hero-text-animation">
            <h1 className="hero-title">El Nopal</h1>
            <div className="animated-subtitle">
              <h3>Cocina Mexicana Auténtica</h3>
              <div className="animated-icons">
                <span className="icon-pepper">🌶️</span>
                <span className="icon-cactus">🌵</span>
                <span className="icon-taco">🌮</span>
                <span className="icon-avocado">🥑</span>
              </div>
            </div>
            <p className="hero-subtitle" style={{color: 'white'}}>Sabores tradicionales de México en el corazón de la ciudad</p>
            <button onClick={handleReservaClick} className="cta-button pulse-animation">
              <span style={{color: 'white'}}>¡Reserva Ahora!</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>
      
      {/* Platos de la Semana con efecto 3D */}
      <section id="promociones" ref={sectionRefs.promociones} className={`promociones-3d ${animationTriggered.promociones ? 'animate-in' : ''}`}>
        <h2 className="section-title floating-title">Platos de la Semana</h2>
        <div className="cards-3d-container">
          {platosDelaSemana.map((plato, index) => (
            <div 
              key={plato.id} 
              className={`card-3d ${index === 1 ? 'card-center' : ''}`}
              style={{ 
                backgroundColor: `${plato.color}10`,
                borderColor: plato.color
              }}
            >
              <div className="card-3d-inner">
                <div className="card-3d-front">
                  <div className="card-3d-image">
                    <img src={plato.image} alt={plato.title} />
                    <div className="card-overlay" style={{ backgroundColor: `${plato.color}80` }}></div>
                  </div>
                  <h3 style={{ color: 'white' }}>{plato.title}</h3>
                  
                  {/* Contenido móvil visible solo en pantallas pequeñas */}
                  <div className="card-mobile-content">
                    <p>{plato.description}</p>
                    <div className="precio">{plato.precio}</div>
                    <button className="card-mobile-button" onClick={() => openModal(plato)}>
                      Ver detalles
                    </button>
                  </div>
                </div>
                <div className="card-3d-back" style={{ backgroundColor: plato.color }}>
                  <div className="card-3d-content">
                    <h3 style={{ color: 'white' }}>{plato.title}</h3>
                    <p style={{ color: 'white' }}>{plato.description}</p>
                    <div style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {plato.precio}
                    </div>
                    <button className="card-3d-button" onClick={() => openModal(plato)}>Ver detalles</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Acerca de El Nopal con estilo mexicano */}
      <section id="about" ref={sectionRefs.about} className={`about-section-animated ${animationTriggered.about ? 'animate-in' : ''} about-mexican-style`}>
        <div className="about-mexican-container">
          {/* Sombreros mexicanos decorativos */}
          <div className="sombrero-row">
            <div className="sombrero"></div>
            <div className="sombrero"></div>
            <div className="sombrero"></div>
            <div className="sombrero"></div>
            <div className="sombrero"></div>
          </div>
          
          {/* Título del restaurante */}
          <div className="mexican-title">
            <img src={logoElNopal} alt="El Nopal" />
          </div>
          
          {/* Texto de la imagen */}
          <div className="mexican-text">
            <p>Bienvenidos y muchas gracias por visitar nuestra casa. Estás a punto de abrir la puerta a un mundo infinito... como infinitas son las historias alrededor de nuestra mesa.</p>
            
            <p>Podemos contarte que nuestro restaurante lleva el nombre de la verdura más icónica de México. El nopal, al que en Andalucía se llama chumbera, aparece en nuestra bandera y es uno de los "súper alimentos" del futuro.</p>
            
            <p>Quizá no sepas que la comida mexicana es patrimonio cultural inmaterial de la humanidad. Al darle este reconocimiento, la UNESCO destacó las raíces milenarias, la manera de cultivar y preparar los alimentos, el sentido comunitario y, sobre todo, la innovación y creatividad de nuestro arte culinario y la forma de incorporar ingredientes y técnicas que han llegado de otras cocinas del mundo.</p>
            
            <p>Como en casi toda América, la base de la comida mexicana es el maíz. Cuando disfrutas de una buena película, seguramente tomas palomitas y otras delicias que vienen de México: vainilla, chocolate, chile...</p>
            
            <p>Pero vayamos al grano y hablemos de lo que puedes probar en nuestra casa. En El Nopal te ofrecemos un abanico de platillos de distintas regiones del país. Te proponemos una ruta nueva de sur a norte y de la costa a la montaña. Comienza por alguna de nuestras ensaladas, como la de Nopalitos, que te puede recordar a una pipirrana, pero elaborada con la hoja del nopal; o por la clásica César, inventada en Tijuana y reinterpretada por nuestra chef Rina.</p>
            
            <p>Te invitamos a descubrir el mole, esa exquisita salsa hecha a base de cacao, chile y almendras que nació en un convento de la ciudad de Puebla. Puedes continuar con nuestra gran variedad de tacos: los de cochinita pibil, típicos de la península de Yucatán; los de "birria" para remojar en su adictivo caldo; los de "pastor" de herencia libanesa, que combinan lo dulce y lo salado; los ricos tacos de langostinos o pulpo, tan de Cancún o los Cabos; o los sabrosos "taquitos dorados de pollo", que nos transportan a la cocina de nuestras abuelas.</p>
            
            <p>Podríamos seguir hablándote del pastel azteca, de los huaraches o de los ancestrales tamales, pero preferimos que te atrevas y experimentes por ti mismo esta comida tan nuestra que desde ahora también es tuya.</p>
          </div>
          
          {/* Estampas mexicanas */}
          <div className="mexican-stamps">
            <div className="stamp teal">
              <div className="stamp-snowflake"></div>
            </div>
            <div className="stamp red">
              <div className="stamp-star"></div>
            </div>
            <div className="stamp yellow">
              <div className="stamp-snowflake"></div>
            </div>
            <div className="stamp green">
              <div className="stamp-star"></div>
            </div>
            <div className="stamp teal">
              <div className="stamp-snowflake"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Video promocional con efecto de revelación */}
      <section id="video" ref={sectionRefs.video} className={`video-section-reveal ${animationTriggered.video ? 'reveal-active' : ''}`}>
        <div className={`promo-text ${animationTriggered.video ? 'fade-in-up' : ''}`}>
          <h2 className="text-gradient">Vive la experiencia El Nopal</h2>
          <p className="text-appear">
            En El Nopal nos esforzamos por ofrecerte la auténtica gastronomía mexicana, 
            en un ambiente único y acogedor. Nuestros chefs expertos preparan cada platos 
            con ingredientes frescos y las recetas tradicionales que han pasado de generación 
            en generación.
          </p>
        </div>
        
        <div className="video-curtain">
          <div className="curtain-left"></div>
          <div className="curtain-right"></div>
          <div className={`video-container-animated ${animationTriggered.video ? 'glow-effect' : ''}`}>
            {!showVideo ? (
              <div 
                className="video-placeholder"
                onClick={() => setShowVideo(true)}
                style={{
                  backgroundImage: `url(${heroImages[2]})` // Mantenemos solo este estilo inline porque es dinámico
                }}
              >
                <div className="video-overlay"></div>
                
                <div className="video-content">
                  <i className="fas fa-play-circle pulse-icon"></i>
                  <span>Descubre El Nopal</span>
                </div>
              </div>
            ) : (
              <video 
                className="video-player"
                controls 
                autoPlay
                muted
                loop
              >
                <source src={videoEjemplo} type="video/mp4" />
                Tu navegador no soporta videos HTML5.
              </video>
            )}
          </div>
        </div>
      </section>

      {/* Sección de Horario y Opiniones Combinada */}
      <section className="home-combined-section">
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
              
              <button onClick={() => navigateAndScroll(history, '/dejar-opinion', 'review-form')} className="leave-review-btn">
                Dejar una opinión
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Detalles del Plato */}
      {showModal && selectedPlato && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-header">
              <img src={selectedPlato.image} alt={selectedPlato.title} className="modal-image" />
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

const Menu = () => {
  const [categoria, setCategoria] = useState('Entradas');
  
  return (
    <div className="page menu-page">
      <div className="container">
        <div className="menu-header">
          <h1 className="text-gradient text-mexican">Nuestro Menú</h1>
          <p>Descubre la auténtica cocina mexicana con ingredientes frescos y recetas tradicionales</p>
        </div>
        
        <div className="menu-categories">
          {Object.keys(menuData).map(cat => (
            <button 
              key={cat} 
              className={`category-btn ${categoria === cat ? 'active' : ''}`}
              onClick={() => setCategoria(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="menu-items">
          {menuData[categoria].map((item) => (
            <div className="menu-item hover-lift" key={item.id}>
              <div className="menu-item-image">
                <img src={item.imagen} alt={item.nombre} loading="lazy" />
              </div>
              <div className="menu-item-content">
                <h3 className="menu-item-title">{item.nombre}</h3>
                <p className="menu-item-description">{item.descripcion}</p>
                <div className="menu-item-footer">
                  <span className="menu-item-price">{item.precio}</span>
                  <span className="menu-item-category">{categoria}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
            <Navbar />
            
            <main className="main-content">
              <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/reservaciones" component={ReservationForm} />
                <Route path="/contacto" component={Contact} />
                <Route path="/admin/login" component={AdminLogin} />
                <Route exact path="/blog" component={Blog} />
                <Route path="/blog/:id" component={BlogPost} />
                <Route path="/nosotros" component={About} />
                
                {/* Mantener ruta para dejar reseñas pero eliminar la de ver opiniones */}
                <Route path="/dejar-opinion" component={LeaveReviewPage} />
                
                {/* Rutas protegidas */}
                {/* 
                <PrivateRoute
                  path="/admin/reservaciones"
                  component={AdminReservationPanel}
                  requireAdmin={true}
                />
                */}
                
                {/* Ruta para administrar reseñas */}
                <PrivateRoute
                  path="/admin/opiniones"
                  component={AdminReviewsPanel}
                  requireAdmin={true}
                />
                
                {/* Redirección para rutas /admin que no estén especificadas */}
                <Route exact path="/admin">
                  <Redirect to="/admin/login" />
                </Route>
                
                <Route path="/forbidden" component={Forbidden} />
                
                <Route path="*">
                  <NotFound />
                </Route>
              </Switch>
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