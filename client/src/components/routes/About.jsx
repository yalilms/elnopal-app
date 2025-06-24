import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './About.css';
import logoElNopal from '../../images/logo_elnopal.png'; // Asegúrate que la ruta al logo sea correcta

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200, // Duración global de las animaciones
      once: true, // Si la animación debe ocurrir solo una vez
      offset: 50, // Offset (en px) desde el borde original del elemento
    });
  }, []);

  return (
    <div className="page about-page">
      {/* Hero similar al de la Home Page */}
      <section className="about-hero hero-parallax">
        <div className="parallax-bg" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop)` }}>
          <div className="parallax-overlay"></div>
        </div>
        <div className="hero-content fade-in" data-aos="fade-down" data-aos-delay="300">
          <div className="hero-text-animation">
            <h1 className="hero-title">Sobre El Nopal</h1>
            <div className="animated-subtitle">
              <h3>Conoce nuestra esencia y tradición</h3>
            </div>
            <p className="hero-subtitle" style={{color: 'white'}}>Más que un restaurante, somos una familia apasionada por México</p>
          </div>
        </div>
      </section>
      
      {/* Sección de Historia con estilo mexicano */}
      <section className="about-section-animated about-mexican-style" data-aos="fade-up">
        <div className="about-mexican-container">
          <div className="sombrero-row" data-aos="fade-up" data-aos-delay="200">
            <div className="sombrero"></div> <div className="sombrero"></div> <div className="sombrero"></div> <div className="sombrero"></div> <div className="sombrero"></div>
              </div>
          <div className="mexican-title" data-aos="zoom-in" data-aos-delay="400">
            <img src={logoElNopal} alt="El Nopal" />
            </div>
          <div className="mexican-text">
            <p data-aos="fade-up" data-aos-delay="500">En el corazón de la ciudad, El Nopal nació como un sueño familiar: compartir la riqueza y autenticidad de la gastronomía mexicana. Desde 2010, hemos crecido de un modesto local a ser un referente culinario, siempre fieles a las recetas tradicionales que son el alma de nuestra cocina.</p>
            <p data-aos="fade-up" data-aos-delay="600">Creemos que cada platillo cuenta una historia, y cada sabor evoca la calidez de México. Nuestra misión va más allá de servir comida; buscamos crear experiencias memorables, donde cada visita te haga sentir como en casa, rodeado de la hospitalidad que nos caracteriza.</p>
              </div>
          <div className="mexican-stamps" data-aos="fade-up" data-aos-delay="700">
            <div className="stamp teal"><div className="stamp-snowflake"></div></div>
            <div className="stamp red"><div className="stamp-star"></div></div>
            <div className="stamp yellow"><div className="stamp-snowflake"></div></div>
            <div className="stamp green"><div className="stamp-star"></div></div>
            <div className="stamp teal"><div className="stamp-snowflake"></div></div>
          </div>
        </div>
      </section>
      

      
      {/* Sección de Valores con iconos y estilo renovado */}
      <section className="about-values-section" data-aos="fade-up">
        <h2 className="section-title floating-title" data-aos="fade-up">Nuestros Pilares</h2>
        <div className="values-grid-cards">
          {[
            { icon: "fas fa-heart", title: "Tradición", text: "Preservamos la autenticidad de cada receta, honrando nuestras raíces.", delay: "100" },
            { icon: "fas fa-star", title: "Calidad", text: "Ingredientes frescos y seleccionados para ofrecerte lo mejor.", delay: "200" },
            { icon: "fas fa-handshake", title: "Hospitalidad", text: "Te recibimos con los brazos abiertos, como parte de nuestra familia.", delay: "300" },
            { icon: "fas fa-lightbulb", title: "Pasión", text: "Cocinamos con amor y dedicación, buscando siempre sorprenderte.", delay: "400" }
          ].map(value => (
            <div className="value-card-item" key={value.title} data-aos="zoom-in-up" data-aos-delay={value.delay}>
              <div className="value-card-icon-wrapper">
                <i className={value.icon}></i>
              </div>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </div>
          ))}
              </div>
      </section>

      {/* Sección de Experiencia Adicional (Opcional, estilo similar a texto de Home) */}
      <section className="about-experience-extra" data-aos="fade-up">
         <div className="promo-text" data-aos="fade-up" data-aos-delay="200">
          <h2 className="text-gradient" data-aos="fade-up">Más que Comida, una Experiencia</h2>
          <p className="text-appear" data-aos="fade-up" data-aos-delay="300">
            En El Nopal, cada detalle está pensado para transportarte a México. Desde la música que ambienta nuestro espacio hasta la decoración inspirada en la rica cultura mexicana, queremos que tu visita sea una inmersión completa en nuestras tradiciones.
          </p>
          <p className="text-appear" data-aos="fade-up" data-aos-delay="400">
            Nuestro equipo, liderado por chefs con una profunda pasión por la cocina mexicana, se dedica a crear platillos que no solo deleitan el paladar, sino que también cuentan la historia de nuestra herencia culinaria. ¡Te esperamos para compartir nuestra mesa!
          </p>
        </div>
      </section>
    </div>
  );
};

export default About; 