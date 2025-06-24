import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaHome } from 'react-icons/fa';

const Forbidden = () => {
  return (
    <div className="forbidden-page">
      <div className="forbidden-container">
        <FaLock className="forbidden-icon" />
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
        <div className="forbidden-actions">
          <Link to="/" className="btn-primary">
            <FaHome className="mr-2" /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden; 