import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faChevronLeft, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

import logo from '../../images/logo_elnopal.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, error: authError } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (isAuthenticated) {
      history.push('/admin/reservaciones');
    }
  }, [isAuthenticated, history]);

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
        history.push('/admin/reservaciones');
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
    history.push('/');
  };

  return (
    <div className="admin-login-container">
      <button className="admin-back-button" onClick={handleBackToSite}>
        <FontAwesomeIcon icon={faChevronLeft} />
        Volver al sitio
      </button>

      <div className="admin-login-form">
        <div className="admin-login-header">
          <img src={logo} alt="El Nopal" className="admin-login-logo" />
          <h2 className="admin-login-subtitle">Panel de Administración</h2>
        </div>

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">Email</label>
            <div className="admin-input-container">
              <FontAwesomeIcon icon={faEnvelope} className="admin-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                placeholder="admin@elnopal.es"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Contraseña</label>
            <div className="admin-input-container">
              <FontAwesomeIcon icon={faLock} className="admin-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input admin-password-input"
                placeholder="Introduce tu contraseña"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-toggle-button"
                onClick={togglePasswordVisibility}
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
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 