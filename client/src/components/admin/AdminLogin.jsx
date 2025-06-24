import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faChevronLeft, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

import logo from '../../images/logo_elnopal.png';

// Estilos inline directos para garantizar visibilidad
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f7f7f7',
  padding: '20px'
};

const formStyle = {
  width: '100%',
  maxWidth: '400px',
  padding: '2rem',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e6e6e6'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '2rem'
};

const logoStyle = {
  maxWidth: '250px',
  width: '100%',
  height: 'auto',
  marginBottom: '1.5rem',
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto'
};

const subtitleStyle = {
  fontSize: '1.25rem',
  color: '#333333',
  fontWeight: '500'
};

const formGroupStyle = {
  marginBottom: '1.5rem'
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: '600',
  color: '#333333'
};

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  paddingLeft: '2.8rem',
  border: '1px solid #aaaaaa',
  borderRadius: '6px',
  fontSize: '1rem',
  color: '#333333',
  backgroundColor: '#ffffff'
};

const passwordInputStyle = {
  ...inputStyle,
  paddingRight: '3.2rem'
};

const iconStyle = {
  position: 'absolute',
  left: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#666666',
  pointerEvents: 'none',
  zIndex: '2'
};

const toggleButtonStyle = {
  position: 'absolute',
  right: '0.5rem',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'transparent',
  border: 'none',
  padding: '0.6rem',
  margin: '0',
  cursor: 'pointer',
  color: '#666666',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: '2'
};

const loginButtonStyle = {
  width: '100%',
  padding: '1rem',
  backgroundColor: '#009B9B',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer'
};

const errorStyle = {
  backgroundColor: 'rgba(230, 57, 70, 0.1)',
  color: '#e63946',
  padding: '1rem',
  borderRadius: '8px',
  marginBottom: '1.5rem',
  textAlign: 'center',
  border: '1px solid rgba(230, 57, 70, 0.3)'
};

const backButtonStyle = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  padding: '0.5rem 1rem',
  background: 'none',
  border: 'none',
  color: '#333333',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.9rem'
};

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
    <div style={containerStyle}>
      <button style={backButtonStyle} onClick={handleBackToSite}>
        <FontAwesomeIcon icon={faChevronLeft} /> Volver al sitio
      </button>
      
      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={headerStyle}>
          <img src={logo} alt="El Nopal Logo" style={logoStyle} />
          <h2 style={subtitleStyle}>Panel de Administración</h2>
        </div>
        
        {error && <div style={errorStyle}>{error}</div>}
        
        <div style={formGroupStyle}>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <div style={inputContainerStyle}>
            <FontAwesomeIcon icon={faEnvelope} style={iconStyle} />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu email"
              autoComplete="email"
              style={inputStyle}
            />
          </div>
        </div>
        
        <div style={formGroupStyle}>
          <label htmlFor="password" style={labelStyle}>Contraseña</label>
          <div style={inputContainerStyle}>
            <FontAwesomeIcon icon={faLock} style={iconStyle} />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              style={passwordInputStyle}
            />
            <button 
              type="button" 
              onClick={togglePasswordVisibility} 
              style={toggleButtonStyle}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          style={{
            ...loginButtonStyle,
            opacity: loading ? 0.7 : 1
          }}
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Acceder al Panel'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 