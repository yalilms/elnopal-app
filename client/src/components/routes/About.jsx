import React, { useEffect } from 'react';
import logoElNopal from '../../images/logo_elnopal.png';
import ViewportObserver from '../common/ViewportObserver';
import { useReducedMotion } from '../../utils/performanceOptimizations';

const About = () => {
  const prefersReducedMotion = useReducedMotion();
  
  // Intersection Observer nativo optimizado
  useEffect(() => {
    if (prefersReducedMotion) return; // Respetar preferencias de accesibilidad
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '50px'
    };
    
    let observer;
    const animateElements = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target); // Stop observing once animated
          }
        });
      }, observerOptions);
      
      elements.forEach(el => observer.observe(el));
    };
    
    // Delay to ensure DOM is ready
    const timeoutId = setTimeout(animateElements, 100);
    
    return () => {
      if (observer) observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="page about-page">
      {/* Hero similar al de la Home Page */}
      <ViewportObserver className="about-hero hero-parallax" pauseAnimationsOutside={true}>
        <div className="parallax-bg">
          <div className="parallax-overlay"></div>
        </div>
        <div className="hero-content fade-in animate-on-scroll">
          <div className="hero-text-animation">
            <h1 className="hero-title">Sobre El Nopal</h1>
            <div className="animated-subtitle">
              <h3>Conoce nuestra esencia y tradición</h3>
            </div>
            <p className="hero-subtitle">Más que un restaurante, somos una familia apasionada por México</p>
          </div>
        </div>
      </ViewportObserver>
      
      {/* Sección de Historia con estilo mexicano */}
      <ViewportObserver className="about-section-animated about-mexican-style animate-on-scroll" pauseAnimationsOutside={true}>
        <div className="about-mexican-container">
          <div className="sombrero-row animate-on-scroll">
            <div className="sombrero"></div> <div className="sombrero"></div> <div className="sombrero"></div> <div className="sombrero"></div> <div className="sombrero"></div>
              </div>
          <div className="mexican-title animate-on-scroll">
            <img src={logoElNopal} alt="El Nopal" />
            </div>
          <div className="mexican-text">
            <p className="text-black-paragraph animate-on-scroll">En el corazón de la ciudad, El Nopal nació como un sueño familiar: compartir la riqueza y autenticidad de la gastronomía mexicana. Desde 2010, hemos crecido de un modesto local a ser un referente culinario, siempre fieles a las recetas tradicionales que son el alma de nuestra cocina.</p>
            <p className="text-black-paragraph animate-on-scroll">Creemos que cada platillo cuenta una historia, y cada sabor evoca la calidez de México. Nuestra misión va más allá de servir comida; buscamos crear experiencias memorables, donde cada visita te haga sentir como en casa, rodeado de la hospitalidad que nos caracteriza.</p>
              </div>
          <div className="mexican-stamps animate-on-scroll">
            <div className="stamp teal"><div className="stamp-snowflake"></div></div>
            <div className="stamp red"><div className="stamp-star"></div></div>
            <div className="stamp yellow"><div className="stamp-snowflake"></div></div>
            <div className="stamp green"><div className="stamp-star"></div></div>
            <div className="stamp teal"><div className="stamp-snowflake"></div></div>
          </div>
        </div>
      </ViewportObserver>
      

      
      {/* Sección de Valores con iconos y estilo renovado */}
      <ViewportObserver className="about-values-section animate-on-scroll" pauseAnimationsOutside={true}>
        <h2 className="section-title floating-title animate-on-scroll">Nuestros Pilares</h2>
        <div className="values-grid-cards">
          {[
            { icon: "fas fa-heart", title: "Tradición", text: "Preservamos la autenticidad de cada receta, honrando nuestras raíces." },
            { icon: "fas fa-star", title: "Calidad", text: "Ingredientes frescos y seleccionados para ofrecerte lo mejor." },
            { icon: "fas fa-handshake", title: "Hospitalidad", text: "Te recibimos con los brazos abiertos, como parte de nuestra familia." },
            { icon: "fas fa-lightbulb", title: "Pasión", text: "Cocinamos con amor y dedicación, buscando siempre sorprenderte." }
          ].map(value => (
            <div className="value-card-item animate-on-scroll" key={value.title}>
              <div className="value-card-icon-wrapper">
                <i className={value.icon}></i>
              </div>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </div>
          ))}
              </div>
      </ViewportObserver>

      {/* Sección de Experiencia Adicional (Opcional, estilo similar a texto de Home) */}
      <ViewportObserver className="about-experience-extra animate-on-scroll" pauseAnimationsOutside={true}>
         <div className="promo-text animate-on-scroll">
          <h2 className="text-black-title animate-on-scroll">Más que Comida, una Experiencia</h2>
          <p className="text-black-paragraph animate-on-scroll">
            En El Nopal, cada detalle está pensado para transportarte a México. Desde la música que ambienta nuestro espacio hasta la decoración inspirada en la rica cultura mexicana, queremos que tu visita sea una inmersión completa en nuestras tradiciones.
          </p>
          <p className="text-black-paragraph animate-on-scroll">
            Nuestro equipo, liderado por chefs con una profunda pasión por la cocina mexicana, se dedica a crear platillos que no solo deleitan el paladar, sino que también cuentan la historia de nuestra herencia culinaria. ¡Te esperamos para compartir nuestra mesa!
          </p>
        </div>
      </ViewportObserver>
    </div>
  );
};

export default About; 