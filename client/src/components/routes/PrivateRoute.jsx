import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ component: Component, requireAdmin = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Si todavía está cargando, mostrar un spinner o mensaje
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Si requiere admin y el usuario no es admin, redirigir a forbidden
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/forbidden" replace />;
  }

  // Si todo está bien, renderizar el componente
  return <Component />;
};

export default PrivateRoute; 