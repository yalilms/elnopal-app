import React, { useState, useEffect } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { navigateAndScroll } from '../../utils/scrollUtils';
import logo from '../../images/logo_elnopal.png';

// Estilos CSS completos para el navbar
const navbarStyles = `
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    padding: 0.8rem 0;
    width: 100%;
  }

  .navbar.scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    padding: 0.5rem 0;
  }

  .navbar-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .navbar-logo img {
    height: 50px;
    width: auto;
    transition: all 0.3s ease;
  }

  .navbar.scrolled .navbar-logo img {
    height: 45px;
  }

  .navbar-links {
    display: flex;
    align-items: center;
  }

  .navbar-links ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 2rem;
    align-items: center;
  }

  .navbar-links a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    font-size: 1rem;
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    position: relative;
  }

  .navbar-links a:hover {
    color: #D62828;
    background-color: rgba(214, 40, 40, 0.05);
  }

  .navbar-links a.active {
    color: #D62828;
    font-weight: 600;
    background-color: rgba(214, 40, 40, 0.1);
  }

  .reserva-btn {
    background: linear-gradient(135deg, #D62828, #ad1457);
    color: white !important;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 4px 15px rgba(214, 40, 40, 0.3);
  }

  .reserva-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(214, 40, 40, 0.4);
    background: linear-gradient(135deg, #B71C1C, #880E4F);
  }

  .mobile-menu-icon {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #333;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.3s ease;
  }

  .mobile-menu-icon:hover {
    background-color: rgba(214, 40, 40, 0.1);
    color: #D62828;
  }

  .navbar-mobile {
    display: none;
  }

  /* Responsive Styles */
  @media (max-width: 992px) {
    .navbar-container {
      padding: 0 1.5rem;
    }
    
    .navbar-links ul {
      gap: 1.5rem;
    }
    
    .navbar-links a {
      font-size: 0.9rem;
      padding: 0.4rem 0.8rem;
    }
    
    .reserva-btn {
      padding: 0.6rem 1.2rem;
      font-size: 0.9rem;
    }
  }

  @media (max-width: 768px) {
    .navbar-container {
      padding: 0 1rem;
    }
    
    .navbar-desktop {
      display: none;
    }
    
    .reserva-btn-desktop {
      display: none;
    }
    
    .mobile-menu-icon {
      display: block;
    }
    
    .navbar-mobile {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(214, 40, 40, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    
    .navbar-mobile.active {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
    }
    
    .navbar-mobile ul {
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }
    
    .navbar-mobile li {
      width: 100%;
    }
    
    .navbar-mobile a {
      display: block;
      width: 100%;
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(214, 40, 40, 0.1);
    }
    
    .navbar-mobile a:hover,
    .navbar-mobile a.active {
      background-color: rgba(214, 40, 40, 0.1);
      color: #D62828;
    }
    
    .reserva-btn-mobile {
      margin-top: 0.5rem;
      text-align: center;
      display: block;
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .navbar-container {
      padding: 0 0.75rem;
    }
    
    .navbar-logo img {
      height: 40px;
    }
    
    .navbar.scrolled .navbar-logo img {
      height: 38px;
    }
    
    .mobile-menu-icon {
      font-size: 1.3rem;
      padding: 0.4rem;
    }
    
    .navbar-mobile a {
      font-size: 0.9rem;
      padding: 0.8rem;
    }
    
    .reserva-btn-mobile {
      font-size: 0.9rem;
      padding: 0.8rem 1rem;
    }
  }

  @media (max-width: 360px) {
    .navbar-container {
      padding: 0 0.5rem;
    }
    
    .navbar-logo img {
      height: 35px;
    }
    
    .navbar.scrolled .navbar-logo img {
      height: 33px;
    }
  }
`;

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    // Inyectar estilos CSS
    if (!document.getElementById('navbar-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'navbar-styles';
      styleSheet.textContent = navbarStyles;
      document.head.appendChild(styleSheet);
    }

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