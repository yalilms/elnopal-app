import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { navigateAndScroll } from '../../utils/scrollUtils';
import OptimizedImage from '../common/OptimizedImage';
import logo from '../../images/logo_elnopal_blanco.png';

// CSS eliminado - ahora se maneja en archivos CSS separados

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Cerrar menú móvil cuando cambia la ruta
    setMobileMenuOpen(false);
    
    // Añadir evento de scroll para cambiar estilo de navbar
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    // Throttle para mejor rendimiento
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
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigationClick = (e, path, sectionId = null) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    navigateAndScroll(navigate, path, sectionId);
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <OptimizedImage 
              src={logo} 
              alt="El Nopal Logo"
              className="logo-image"
              width={160}
              height={60}
              priority={true}
              loading="eager"
            />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="navbar-links navbar-desktop">
          <ul>
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link 
                to="/blog" 
                className={location.pathname.includes('/blog') ? 'active' : ''}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link 
                to="/nosotros" 
                className={location.pathname === '/nosotros' ? 'active' : ''}
              >
                Sobre Nosotros
              </Link>
            </li>
            <li>
              <a 
                href="/contacto#contact-form"
                onClick={(e) => handleNavigationClick(e, '/contacto', 'contact-form')}
                className={location.pathname === '/contacto' ? 'active' : ''}
              >
                Contacto
              </a>
            </li>
          </ul>
        </nav>

        {/* Desktop Reserve Button */}
        <a 
          href="/reservaciones#reservation-form"
          onClick={(e) => handleNavigationClick(e, '/reservaciones', 'reservation-form')}
          className="reserva-btn reserva-btn-desktop"
        >
          Reservar Mesa
        </a>
        
        <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
          <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
        </div>
        
        {/* Mobile Navigation */}
        <nav className={`navbar-links navbar-mobile ${mobileMenuOpen ? 'active' : ''}`}>
          <ul>
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link 
                to="/blog" 
                className={location.pathname.includes('/blog') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link 
                to="/nosotros" 
                className={location.pathname === '/nosotros' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre Nosotros
              </Link>
            </li>
            <li>
              <a 
                href="/contacto#contact-form"
                onClick={(e) => handleNavigationClick(e, '/contacto', 'contact-form')}
                className={location.pathname === '/contacto' ? 'active' : ''}
              >
                Contacto
              </a>
            </li>
          </ul>
          
          <a 
            href="/reservaciones#reservation-form"
            onClick={(e) => handleNavigationClick(e, '/reservaciones', 'reservation-form')}
            className="reserva-btn reserva-btn-mobile"
          >
            Reservar Mesa
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar; 