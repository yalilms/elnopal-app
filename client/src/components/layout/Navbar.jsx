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
        {/* Logo */}
        <Link to="/" className="navbar-brand" onClick={(e) => handleNavigationClick(e, '/')}>
          <img src={logo} alt="El Nopal" />
        </Link>

        {/* Desktop Navigation */}
        <ul className="navbar-nav">
          <li className="nav-item">
            <a 
              href="#hero" 
              className={`nav-link ${location.pathname === '/' && location.hash === '' ? 'active' : ''}`}
              onClick={(e) => handleNavigationClick(e, '/', 'hero')}
            >
              Inicio
            </a>
          </li>
          <li className="nav-item">
            <Link 
              to="/nosotros" 
              className={`nav-link ${location.pathname === '/nosotros' ? 'active' : ''}`}
            >
              Sobre Nosotros
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/blog" 
              className={`nav-link ${location.pathname.includes('/blog') ? 'active' : ''}`}
            >
              Blog
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/contacto" 
              className={`nav-link ${location.pathname === '/contacto' ? 'active' : ''}`}
            >
              Contacto
            </Link>
          </li>
          {user && (
            <li className="nav-item">
              <button 
                className="nav-link logout-btn" 
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
            </li>
          )}
        </ul>

        {/* Reserva Button */}
        <Link to="/reservaciones" className="reservar-btn">
          <i className="fas fa-calendar-alt"></i>
          Reservar Mesa
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul className="mobile-nav">
            <li className="mobile-nav-item">
              <a 
                href="#hero" 
                className="mobile-nav-link"
                onClick={(e) => handleNavigationClick(e, '/', 'hero')}
              >
                <i className="fas fa-home"></i>
                Inicio
              </a>
            </li>
            <li className="mobile-nav-item">
              <Link 
                to="/nosotros" 
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-info-circle"></i>
                Sobre Nosotros
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link 
                to="/blog" 
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-blog"></i>
                Blog
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link 
                to="/contacto" 
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-envelope"></i>
                Contacto
              </Link>
            </li>
            {user && (
              <li className="mobile-nav-item">
                <button className="mobile-nav-link logout-btn" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  Cerrar Sesión
                </button>
              </li>
            )}
            <li className="mobile-nav-item">
              <Link 
                to="/reservaciones" 
                className="mobile-reservar-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-calendar-alt"></i>
                Reservar Mesa
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-overlay" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 