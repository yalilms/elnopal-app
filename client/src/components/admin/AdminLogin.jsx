import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faChevronLeft, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
// import { toast } from 'react-toastify'; // Comentado porque no se usa
import '../../styles/admin.css';

import logo from '../../images/logo_elnopal.png';

// Componente sin estilos inline - usa admin.css

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/reservaciones');
    }
  }, [isAuthenticated, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/admin/reservaciones');
      } else {
        setError(authError || 'Email o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
      console.error('Error de login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSite = () => {
    navigate('/');
  };

  return (
    <div className="admin-login-container">
      <button className="admin-back-button" onClick={handleBackToSite}>
        <FontAwesomeIcon icon={faChevronLeft} /> Volver al sitio
      </button>
      
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <div className="admin-login-header">
          <img src={logo} alt="El Nopal Logo" className="admin-login-logo" />
          <h2 className="admin-login-title">Panel de Administración</h2>
        </div>
        
        {error && <div className="admin-error-message">{error}</div>}
        
        <div className="admin-form-group">
          <label htmlFor="email" className="admin-form-label">Email</label>
          <div className="admin-input-container">
            <FontAwesomeIcon icon={faEnvelope} className="admin-input-icon" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu email"
              autoComplete="email"
              className="admin-form-input"
            />
          </div>
        </div>
        
        <div className="admin-form-group">
          <label htmlFor="password" className="admin-form-label">Contraseña</label>
          <div className="admin-input-container">
            <FontAwesomeIcon icon={faLock} className="admin-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              className="admin-form-input admin-password-input"
            />
            <button 
              type="button" 
              onClick={togglePasswordVisibility} 
              className="admin-password-toggle"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="admin-login-button"
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Acceder al Panel'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 