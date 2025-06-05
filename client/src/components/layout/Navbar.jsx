import React, { useState, useEffect } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { navigateAndScroll } from '../../utils/scrollUtils';
import logo from '../../images/logo_elnopal.png';


const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    // Cerrar menú móvil cuando cambia la ruta
    setMobileMenuOpen(false);
    
    // Añadir evento de scroll para cambiar estilo de navbar
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigationClick = (e, path, sectionId = null) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    navigateAndScroll(history, path, sectionId);
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="El Nopal Logo" />
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