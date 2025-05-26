import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSlash, faTrash, faSearch, faExclamationTriangle, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { getBlacklist, removeFromBlacklist } from '../../services/reservationService';
import AuthContext from '../../context/AuthContext';

const BlacklistManagement = () => {
  const [blacklistedCustomers, setBlacklistedCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBlacklist();
      setBlacklistedCustomers(data);
      toast.success('Lista negra cargada correctamente');
    } catch (error) {
      const errorMessage = error.message || 'Error al cargar la lista negra';
      toast.error(errorMessage);
      console.error('Error al cargar la lista negra:', error);
      setError(errorMessage);
      setBlacklistedCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromBlacklist = async (id, customerName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${customerName} de la lista negra?`)) {
      try {
        await removeFromBlacklist(id);
        toast.success(`${customerName} ha sido eliminado de la lista negra`);
        fetchBlacklist();
      } catch (error) {
        toast.error(error.message || 'Error al eliminar de la lista negra');
        console.error('Error al eliminar de la lista negra:', error);
      }
    }
  };

  const filteredCustomers = blacklistedCustomers.filter(customer => 
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerPhone.includes(searchTerm)
  );

  if (loading) {
    return <div className="loading">Cargando lista negra...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
        <h3>Error al cargar la lista negra</h3>
        <p>{error}</p>
        <div className="debug-info">
          <p><strong>Usuario actual:</strong> {user ? `${user.username} (Roles: ${JSON.stringify(user.roles)})` : 'No autenticado'}</p>
          <p><strong>Token:</strong> {user?.token ? `${user.token.substring(0, 20)}...` : 'No disponible'}</p>
        </div>
        <button className="retry-button" onClick={fetchBlacklist}>
          <FontAwesomeIcon icon={faRefresh} /> Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="blacklist-management">
      <div className="blacklist-header">
        <h2>
          <FontAwesomeIcon icon={faUserSlash} /> Gestión de Lista Negra
        </h2>
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {blacklistedCustomers.length === 0 ? (
        <p className="no-data">No hay clientes en la lista negra.</p>
      ) : (
        <div className="blacklist-table-container">
          {/* Tabla para desktop */}
          <table className="blacklist-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Motivo</th>
                <th>Fecha de inclusión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer._id}>
                  <td>{customer.customerName}</td>
                  <td>{customer.customerEmail}</td>
                  <td>{customer.customerPhone}</td>
                  <td>{customer.reason}</td>
                  <td>{new Date(customer.addedAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveFromBlacklist(customer._id, customer.customerName)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Cards para móvil */}
          <div className="mobile-cards">
            {filteredCustomers.map(customer => (
              <div key={customer._id} className="blacklist-card">
                <div className="blacklist-card-header">
                  <h3 className="blacklist-customer-name">{customer.customerName}</h3>
                  <div className="blacklist-date">
                    {new Date(customer.addedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="blacklist-card-body">
                  <div className="blacklist-info-item">
                    <div className="blacklist-info-label">Email</div>
                    <div className="blacklist-info-value">{customer.customerEmail}</div>
                  </div>
                  
                  <div className="blacklist-info-item">
                    <div className="blacklist-info-label">Teléfono</div>
                    <div className="blacklist-info-value">{customer.customerPhone}</div>
                  </div>
                  
                  <div className="blacklist-info-item blacklist-reason">
                    <div className="blacklist-info-label">Motivo</div>
                    <div className="blacklist-info-value">{customer.reason}</div>
                  </div>
                </div>
                
                <div className="blacklist-card-actions">
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveFromBlacklist(customer._id, customer.customerName)}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Eliminar de Lista Negra
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlacklistManagement; 