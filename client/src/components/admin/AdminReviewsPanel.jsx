import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignOutAlt, faCalendarAlt, faCheck, faSearch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
// import './AdminReviewsPanel.css'; // Archivo eliminado - estilos ahora en sistema modular

// Datos de prueba en caso de que la API no funcione
const testReviews = [
  {
    _id: '1',
    nombre: 'Ana García',
    email: 'ana@ejemplo.com',
    calificacion: 5,
    comentario: 'La comida estaba deliciosa y el servicio excelente. Definitivamente regresaré pronto.',
    fecha: '15/08/2023',
    status: 'pending'
  },
  {
    _id: '2',
    nombre: 'Carlos López',
    email: 'carlos@ejemplo.com',
    calificacion: 4,
    comentario: 'Muy buena experiencia en general. El ambiente es acogedor pero el tiempo de espera fue un poco largo.',
    fecha: '10/08/2023',
    status: 'reviewed'
  },
  {
    _id: '3',
    nombre: 'María Rodríguez',
    email: 'maria@ejemplo.com',
    calificacion: 2,
    comentario: 'La comida estaba fría y el servicio fue pésimo. Esperamos más de 40 minutos para ser atendidos.',
    fecha: '05/08/2023',
    status: 'pending'
  }
];

// Componente para filtrado de contenido inapropiado
const ContentWarning = ({ content }) => {
  // Si no hay contenido, no mostrar warning
  if (!content || typeof content !== 'string') return null;
  
  // Lista de palabras o frases prohibidas (puedes ampliarla)
  const badWords = [
    'maldito', 'horrible', 'pésimo', 'asco', 'asqueroso', 
    'mierda', 'basura', 'puta', 'joder', 'coño', 'verga', 
    'pendejo', 'estafa', 'fraude', 'denuncia', 'demanda'
  ];
  
  // Verificar si el contenido contiene palabras prohibidas
  const hasBadWords = badWords.some(word => 
    content.toLowerCase().includes(word.toLowerCase())
  );
  
  if (!hasBadWords) return null;
  
  return (
    <div className="content-warning">
      <span className="warning-icon">⚠️</span>
      <span>Posible comentario negativo a atender</span>
    </div>
  );
};

// Función para normalizar datos de review para compatibilidad con ambos formatos de API
const normalizeReview = (review) => {
  if (!review) return null;
  
  return {
    _id: review._id,
    // Nombre - puede venir como 'name' o 'nombre'
    nombre: review.nombre || review.name || 'Sin nombre',
    // Email
    email: review.email || 'No disponible',
    // Calificación - puede venir como 'rating' o 'calificacion'
    calificacion: review.calificacion || review.rating || 0,
    // Comentario - puede venir como 'comment' o 'comentario'
    comentario: review.comentario || review.comment || 'Sin comentario',
    // Fecha
    fecha: review.fecha || review.createdAt || 'No disponible',
    // Estado
    status: review.status || 'pending',
    // Respuesta del admin
    adminResponse: review.adminResponse,
    adminResponseDate: review.adminResponseDate,
    adminResponseBy: review.adminResponseBy
  };
};

const AdminReviewsPanel = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, flagged, pending
  const [selectedReview, setSelectedReview] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const { currentUser, logout } = useAuth();
  const history = useHistory();
  
  useEffect(() => {
    fetchReviews();
  }, []);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Obtenemos el token directamente del usuario actual
      const token = currentUser ? currentUser.token : null;
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch('/api/reviews/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('No se pudieron cargar las reseñas');
      }
      
      const data = await response.json();
      // Normalizar las reviews para compatibilidad
      const normalizedReviews = (data.reviews || []).map(review => normalizeReview(review)).filter(review => review !== null);
      setReviews(normalizedReviews);
      
    } catch (error) {
      toast.error('Error al cargar las reseñas: ' + (error.message || 'Error desconocido'));
      console.error('Error al cargar reseñas:', error);
      
      // Usar datos de prueba si hay un error
      console.log('Usando datos de prueba');
      setReviews(testReviews);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteReview = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta opinión? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      // Obtenemos el token directamente del usuario actual
      const token = currentUser ? currentUser.token : null;
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('No se pudo eliminar la opinión');
      }
      
      // Actualizar la lista de reseñas
      setReviews(reviews.filter(review => review._id !== reviewId));
      
      if (selectedReview && selectedReview._id === reviewId) {
        setSelectedReview(null);
      }
      
      toast.success('Opinión eliminada con éxito');
      
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const approveReview = async (reviewId) => {
    try {
      // Obtenemos el token directamente del usuario actual
      const token = currentUser ? currentUser.token : null;
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(`/api/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'reviewed'
        })
      });
      
      if (!response.ok) {
        throw new Error('No se pudo actualizar el estado de la opinión');
      }
      
      // Actualizar el estado de la reseña en la lista
      setReviews(reviews.map(review => 
        review._id === reviewId 
          ? { ...review, status: 'reviewed' } 
          : review
      ));
      
      if (selectedReview && selectedReview._id === reviewId) {
        setSelectedReview({ ...selectedReview, status: 'reviewed' });
      }
      
      toast.success('Opinión marcada como atendida');
      
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  // Función para enviar respuesta al cliente
  const sendResponseToClient = async () => {
    if (!responseText.trim()) {
      toast.error('Por favor, escriba una respuesta');
      return;
    }

    setSendingResponse(true);
    
    try {
      const token = currentUser ? currentUser.token : null;
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`/api/reviews/admin/${selectedReview._id}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          response: responseText.trim(),
          restaurantName: 'El Nopal Restaurant'
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo enviar la respuesta');
      }

      const data = await response.json();
      
      // Actualizar el estado de la reseña
      setReviews(reviews.map(review => 
        review._id === selectedReview._id 
          ? { ...review, status: 'reviewed', restaurantResponse: responseText.trim() } 
          : review
      ));
      
      if (selectedReview) {
        setSelectedReview({ 
          ...selectedReview, 
          status: 'reviewed', 
          restaurantResponse: responseText.trim() 
        });
      }

      // Cerrar modal y limpiar
      setShowResponseModal(false);
      setResponseText('');
      
      toast.success('Respuesta enviada al cliente correctamente');
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSendingResponse(false);
    }
  };

  // Función para abrir modal de respuesta
  const handleRespondToReview = (review) => {
    setSelectedReview(review);
    setResponseText('');
    setShowResponseModal(true);
  };
  
  const getFilteredReviews = () => {
    if (!Array.isArray(reviews)) return [];
    
    switch (filter) {
      case 'flagged':
        return reviews.filter(review => {
          const badWords = [
            'maldito', 'horrible', 'pésimo', 'asco', 'asqueroso', 
            'mierda', 'basura', 'puta', 'joder', 'coño', 'verga', 
            'pendejo', 'estafa', 'fraude', 'denuncia', 'demanda'
          ];
          const comment = review.comentario || '';
          return badWords.some(word => 
            comment.toLowerCase().includes(word.toLowerCase())
          );
        });
      case 'pending':
        return reviews.filter(review => review.status === 'pending');
      default:
        return reviews;
    }
  };
  
  // Determinar si una reseña puede ser problemática
  const isPotentiallyBad = (review) => {
    if (!review) return false;
    
    // Si la calificación es baja (1 o 2)
    if (review.calificacion && review.calificacion <= 2) return true;
    
    // Si contiene palabras prohibidas
    const badWords = [
      'maldito', 'horrible', 'pésimo', 'asco', 'asqueroso', 
      'mierda', 'basura', 'puta', 'joder', 'coño', 'verga', 
      'pendejo', 'estafa', 'fraude', 'denuncia', 'demanda'
    ];
    
    const comment = review.comentario || '';
    
    return badWords.some(word => 
      comment.toLowerCase().includes(word.toLowerCase())
    );
  };
  
  const handleNavigateToReservaciones = () => {
    history.push('/admin/reservaciones');
  };
  
  const handleBackToHome = () => {
    history.push('/');
  };
  
  const handleLogout = () => {
    logout();
    history.push('/');
  };
  
  return (
    <div className="admin-reviews-panel">
      <div className="panel-header">
        <h2>Panel de Administración de Opiniones</h2>
        <div className="panel-actions">
          <div className="button-group">
            <button className="btn btn-secondary" onClick={handleNavigateToReservaciones}>
              <FontAwesomeIcon icon={faCalendarAlt} /> 
              <span>RESERVAS</span>
            </button>
            <button className="btn btn-secondary" onClick={handleBackToHome}>
              <FontAwesomeIcon icon={faHome} /> 
              <span>VOLVER</span>
            </button>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} /> 
              <span>SALIR</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="filter-controls">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <FontAwesomeIcon icon={faSearch} /> Todas
        </button>
        <button 
          className={`filter-btn ${filter === 'flagged' ? 'active' : ''}`}
          onClick={() => setFilter('flagged')}
        >
          <FontAwesomeIcon icon={faExclamationTriangle} /> Requieren Atención
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <FontAwesomeIcon icon={faCheck} /> Pendientes
        </button>
      </div>
      
      <div className="panel-content">
        <div className="reviews-list">
          {loading ? (
            <div className="loading-message">Cargando opiniones...</div>
          ) : getFilteredReviews().length === 0 ? (
            <div className="empty-message">No hay opiniones que mostrar</div>
          ) : (
            getFilteredReviews().map(review => {
              // Asegurar que review esté normalizado
              const normalizedReview = normalizeReview(review);
              if (!normalizedReview) return null;
              
              return (
                <div 
                  key={normalizedReview._id} 
                  className={`review-item ${selectedReview && selectedReview._id === normalizedReview._id ? 'selected' : ''} ${isPotentiallyBad(normalizedReview) ? 'potentially-bad' : ''}`}
                  onClick={() => setSelectedReview(normalizedReview)}
                >
                  <div className="review-item-header">
                    <h4>{normalizedReview.nombre}</h4>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < normalizedReview.calificacion ? 'star filled' : 'star'}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="review-preview">
                    {normalizedReview.comentario.length > 60 ? normalizedReview.comentario.substring(0, 60) + '...' : normalizedReview.comentario}
                  </p>
                  <div className="review-item-footer">
                    <span className="review-date">{normalizedReview.fecha}</span>
                    <span className={`review-status ${normalizedReview.status}`}>
                      {normalizedReview.status === 'reviewed' ? 'Atendida' : 'Pendiente'}
                    </span>
                  </div>
                  {isPotentiallyBad(normalizedReview) && (
                    <div className="review-warning">⚠️</div>
                  )}
                </div>
              );
            }).filter(item => item !== null)
          )}
        </div>
        
        <div className="review-detail">
          {selectedReview ? (
            <>
              <div className="review-detail-header">
                <h3>{selectedReview.nombre}</h3>
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < selectedReview.calificacion ? 'star filled' : 'star'}>★</span>
                  ))}
                </div>
              </div>
              
              <div className="review-contact">
                <p><strong>Email:</strong> {selectedReview.email}</p>
                <p><strong>Fecha:</strong> {selectedReview.fecha}</p>
                <p><strong>Estado:</strong> <span className={`status ${selectedReview.status}`}>
                  {selectedReview.status === 'reviewed' ? 'Atendida' : 'Pendiente'}
                </span></p>
              </div>
              
              <div className="review-comment">
                <h4>Comentario:</h4>
                <p>{selectedReview.comentario}</p>
                
                <ContentWarning content={selectedReview.comentario} />
              </div>
              
              <div className="review-actions">
                {selectedReview.status === 'pending' && (
                  <>
                    <button 
                      className="action-btn respond-btn"
                      onClick={() => handleRespondToReview(selectedReview)}
                      style={{
                        backgroundColor: '#6f42c1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginRight: '0.5rem'
                      }}
                    >
                      📧 Responder al Cliente
                    </button>
                    
                    <button 
                      className="action-btn approve-btn"
                      onClick={() => approveReview(selectedReview._id)}
                    >
                      Marcar como Atendida
                    </button>
                  </>
                )}
                
                <button 
                  className="action-btn delete-btn"
                  onClick={() => deleteReview(selectedReview._id)}
                >
                  Eliminar Opinión
                </button>
              </div>
            </>
          ) : (
            <div className="no-review-selected">
              <p>Selecciona una opinión para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal para responder a opiniones */}
      {showResponseModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            color: '#333333',
            border: '2px solid #6f42c1'
          }}>
            {/* Crucecita para cerrar */}
            <button 
              onClick={() => setShowResponseModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: '#666',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: 10001
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f5f5f5';
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#666';
              }}
              title="Cerrar"
            >
              ×
            </button>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e5e5e5'
            }}>
              <h3 style={{
                margin: 0,
                color: '#6f42c1',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '1.6rem',
                fontWeight: 'bold'
              }}>
                <div style={{
                  backgroundColor: '#6f42c1',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  📧
                </div>
                Responder al Cliente
              </h3>
            </div>

            {selectedReview && (
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>
                  Opinión de {selectedReview.nombre}:
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ 
                        color: i < selectedReview.calificacion ? '#ffc107' : '#ddd',
                        fontSize: '1.1rem'
                      }}>★</span>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                    ({selectedReview.calificacion}/5)
                  </span>
                </div>
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontStyle: 'italic', 
                  color: '#6c757d',
                  lineHeight: '1.4'
                }}>
                  "{selectedReview.comentario}"
                </p>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.8rem',
                color: '#495057',
                fontWeight: '600',
                fontSize: '1rem'
              }}>
                Su respuesta para {selectedReview?.nombre}:
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Escriba aquí su respuesta profesional al cliente. Este mensaje se enviará por email..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '1rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.5'
                }}
                maxLength={500}
              />
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.8rem',
                color: '#6c757d',
                textAlign: 'right'
              }}>
                {responseText.length}/500 caracteres
              </p>
            </div>

            <div style={{
              backgroundColor: '#fff3cd',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #ffeaa7'
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.9rem',
                color: '#856404'
              }}>
                💡 <strong>Consejos para una buena respuesta:</strong>
              </p>
              <ul style={{
                margin: '0.5rem 0 0 0',
                paddingLeft: '1.2rem',
                fontSize: '0.85rem',
                color: '#856404'
              }}>
                <li>Sea profesional y cortés</li>
                <li>Agradezca el feedback del cliente</li>
                <li>Si es una queja, ofrezca una solución</li>
                <li>Invite al cliente a volver</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e5e5'
            }}>
              <button
                onClick={() => setShowResponseModal(false)}
                disabled={sendingResponse}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: sendingResponse ? 'not-allowed' : 'pointer',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  color: '#495057',
                  opacity: sendingResponse ? 0.7 : 1
                }}
              >
                Cancelar
              </button>
              <button
                onClick={sendResponseToClient}
                disabled={!responseText.trim() || sendingResponse}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: (!responseText.trim() || sendingResponse) ? 'not-allowed' : 'pointer',
                  backgroundColor: '#6f42c1',
                  border: 'none',
                  color: 'white',
                  opacity: (!responseText.trim() || sendingResponse) ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {sendingResponse ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    📧 Enviar Respuesta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminReviewsPanel; 