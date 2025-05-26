import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import Forbidden from './Forbidden';

const AdminRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <Route
      {...rest}
      render={props => {
        if (!isAuthenticated) {
          // Redirigir al login si no está autenticado
          return <Redirect to="/admin/login" />;
        }
        
        if (isAuthenticated && !isAdmin()) {
          // Mostrar página de prohibido si está autenticado pero no es admin
          return <Forbidden />;
        }
        
        // Si está autenticado y es admin, mostrar el componente
        return <Component {...props} />;
      }}
    />
  );
};

export default AdminRoute; 