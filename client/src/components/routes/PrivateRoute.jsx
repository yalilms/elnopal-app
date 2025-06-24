import React from 'react';
import { Route, Redirect, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
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

  return (
    <Route
      {...rest}
      render={props => 
        currentUser ? (
          // Si el componente requiere permisos de admin
          rest.requireAdmin && !isAdmin() ? (
            <Redirect to="/forbidden" />
          ) : (
            <Component {...props} />
          )
        ) : (
          <Redirect 
            to={{
              pathname: "/admin/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute; 