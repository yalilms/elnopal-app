import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { navigateAndScroll } from '../../utils/scrollUtils';
import logo from '../../images/logo_elnopal.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigationClick = (e, path, sectionId = null) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (sectionId && location.pathname === '/') {
      navigateAndScroll(sectionId);
    } else if (sectionId) {
      history.push(`/${sectionId ? `#${sectionId}` : ''}`);
      setTimeout(() => {
        navigateAndScroll(sectionId);
      }, 100);
    } else {
      history.push(path);
    }
  };

  const handleLogout = () => {
    logout();
    history.push('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} ref={navRef}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={(e) => handleNavigationClick(e, '/')}>
          <img src={logo} alt="El Nopal" />
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          <div className="navbar-links">
            <ul>
              <li>
                <a 
                  href="#hero" 
                  onClick={(e) => handleNavigationClick(e, '/', 'hero')}
                  className={location.pathname === '/' && location.hash === '' ? 'active' : ''}
                >
                  Inicio
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  onClick={(e) => handleNavigationClick(e, '/', 'about')}
                  className={location.hash === '#about' ? 'active' : ''}
                >
                  Nosotros
                </a>
              </li>
              <li>
                <Link 
                  to="/menu" 
                  className={location.pathname === '/menu' ? 'active' : ''}
                >
                  Carta
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
                  to="/contact" 
                  className={location.pathname === '/contact' ? 'active' : ''}
                >
                  Contacto
                </Link>
              </li>
              {user && user.role === 'admin' && (
                <li>
                  <Link 
                    to="/admin" 
                    className={location.pathname.includes('/admin') ? 'active' : ''}
                  >
                    Admin
                  </Link>
                </li>
              )}
              {user ? (
                <li>
                  <button 
                    className="navbar-button" 
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </button>
                </li>
              ) : (
                <li>
                  <Link 
                    to="/admin/login" 
                    className={location.pathname === '/admin/login' ? 'active' : ''}
                  >
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <Link to="/reservation" className="reserva-btn reserva-btn-desktop">
            Reservar Mesa
          </Link>
        </div>

        {/* Mobile Menu Icon */}
        <button className="mobile-menu-icon" onClick={toggleMobileMenu}>
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        {/* Mobile Navigation */}
        <div className={`navbar-mobile ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="navbar-links">
            <ul>
              <li>
                <a 
                  href="#hero" 
                  onClick={(e) => handleNavigationClick(e, '/', 'hero')}
                >
                  Inicio
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  onClick={(e) => handleNavigationClick(e, '/', 'about')}
                >
                  Nosotros
                </a>
              </li>
              <li>
                <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)}>
                  Carta
                </Link>
              </li>
              <li>
                <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)}>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                  Contacto
                </Link>
              </li>
              {user && user.role === 'admin' && (
                <li>
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    Admin
                  </Link>
                </li>
              )}
              {user ? (
                <li>
                  <button className="navbar-button" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </li>
              ) : (
                <li>
                  <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <Link 
            to="/reservation" 
            className="reserva-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Reservar Mesa
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 