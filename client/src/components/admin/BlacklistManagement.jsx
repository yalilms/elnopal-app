import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserSlash, faTrashAlt, faEye, faEdit, faPlus, faSearch,
  faCalendarAlt, faPhone, faEnvelope, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const BlacklistManagement = ({ 
  getBlacklist, 
  removeFromBlacklist, 
  onClose 
}) => {
  const [blacklistEntries, setBlacklistEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadBlacklistData();
  }, []);

  const loadBlacklistData = async () => {
    try {
      setLoading(true);
      const data = await getBlacklist();
      setBlacklistEntries(data || []);
    } catch (error) {
      console.error('Error loading blacklist:', error);
      toast.error('Error al cargar la lista negra');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEntry = async (entryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada de la lista negra?')) {
      try {
        await removeFromBlacklist(entryId);
        toast.success('Entrada eliminada de la lista negra');
        await loadBlacklistData();
      } catch (error) {
        console.error('Error removing from blacklist:', error);
        toast.error('Error al eliminar de la lista negra');
      }
    }
  };

  const filteredEntries = blacklistEntries.filter(entry =>
    entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.phone?.includes(searchTerm) ||
    entry.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '3rem',
        color: '#666'
      }}>
        <div>Cargando lista negra...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <h2 style={{
          color: '#D62828',
          fontSize: '1.8rem',
          fontWeight: '700',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FontAwesomeIcon icon={faUserSlash} />
          Lista Negra
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: '#666',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          ×
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <FontAwesomeIcon 
            icon={faSearch} 
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666'
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem 0.8rem 3rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.95rem',
              transition: 'border-color 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{
        background: 'linear-gradient(135deg, #fee2e2, #fef2f2)',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        <span style={{ color: '#D62828', fontWeight: '600' }}>
          Total en lista negra: {filteredEntries.length}
        </span>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#666'
        }}>
          {searchTerm ? 'No se encontraron resultados' : 'No hay entradas en la lista negra'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredEntries.map(entry => (
            <div
              key={entry.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #fff, #f9f9f9)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedEntry(entry);
                setShowDetails(true);
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div>
                  <h3 style={{
                    color: '#333',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {entry.name}
                  </h3>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <FontAwesomeIcon icon={faPhone} />
                      {entry.phone}
                    </div>
                    {entry.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        {entry.email}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(entry.date)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveEntry(entry.id);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #dc3545, #c82333)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FontAwesomeIcon icon={faTrashAlt} style={{ marginRight: '0.3rem' }} />
                  Eliminar
                </button>
              </div>
              
              <div style={{
                background: 'rgba(214, 40, 40, 0.1)',
                padding: '0.8rem',
                borderRadius: '6px',
                borderLeft: '4px solid #D62828'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginBottom: '0.5rem',
                  color: '#D62828',
                  fontWeight: '600'
                }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  Motivo:
                </div>
                <div style={{ color: '#333', fontSize: '0.9rem' }}>
                  {entry.reason}
                </div>
                {entry.notes && (
                  <div style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Notas: {entry.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedEntry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#D62828', margin: 0 }}>Detalles de la Entrada</h3>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ color: '#333' }}>
              <p><strong>Nombre:</strong> {selectedEntry.name}</p>
              <p><strong>Teléfono:</strong> {selectedEntry.phone}</p>
              {selectedEntry.email && <p><strong>Email:</strong> {selectedEntry.email}</p>}
              <p><strong>Fecha de adición:</strong> {formatDate(selectedEntry.date)}</p>
              <p><strong>Motivo:</strong> {selectedEntry.reason}</p>
              {selectedEntry.notes && <p><strong>Notas:</strong> {selectedEntry.notes}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlacklistManagement; 