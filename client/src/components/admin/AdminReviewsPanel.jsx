import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignOutAlt, faCalendarAlt, faCheck, faSearch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './AdminReviewsPanel.css';

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

const AdminReviewsPanel = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, flagged, pending
  const [selectedReview, setSelectedReview] = useState(null);
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
      setReviews(data.reviews);
      
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
      
      const response = await fetch(`/api/reviews/admin/${reviewId}`, {
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
      
      const response = await fetch(`/api/reviews/admin/${reviewId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
  
  const getFilteredReviews = () => {
    switch (filter) {
      case 'flagged':
        return reviews.filter(review => {
          const badWords = [
            'maldito', 'horrible', 'pésimo', 'asco', 'asqueroso', 
            'mierda', 'basura', 'puta', 'joder', 'coño', 'verga', 
            'pendejo', 'estafa', 'fraude', 'denuncia', 'demanda'
          ];
          return badWords.some(word => 
            review.comentario.toLowerCase().includes(word.toLowerCase())
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
    // Si la calificación es baja (1 o 2)
    if (review.calificacion <= 2) return true;
    
    // Si contiene palabras prohibidas
    const badWords = [
      'maldito', 'horrible', 'pésimo', 'asco', 'asqueroso', 
      'mierda', 'basura', 'puta', 'joder', 'coño', 'verga', 
      'pendejo', 'estafa', 'fraude', 'denuncia', 'demanda'
    ];
    
    return badWords.some(word => 
      review.comentario.toLowerCase().includes(word.toLowerCase())
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
            getFilteredReviews().map(review => (
              <div 
                key={review._id} 
                className={`review-item ${selectedReview && selectedReview._id === review._id ? 'selected' : ''} ${isPotentiallyBad(review) ? 'potentially-bad' : ''}`}
                onClick={() => setSelectedReview(review)}
              >
                <div className="review-item-header">
                  <h4>{review.nombre}</h4>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.calificacion ? 'star filled' : 'star'}>★</span>
                    ))}
                  </div>
                </div>
                <p className="review-preview">{review.comentario.substring(0, 60)}...</p>
                <div className="review-item-footer">
                  <span className="review-date">{review.fecha}</span>
                  <span className={`review-status ${review.status}`}>{review.status === 'reviewed' ? 'Atendida' : 'Pendiente'}</span>
                </div>
                {isPotentiallyBad(review) && (
                  <div className="review-warning">⚠️</div>
                )}
              </div>
            ))
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
                <p><strong>Estado:</strong> <span className={`status ${selectedReview.status}`}>{selectedReview.status === 'reviewed' ? 'Atendida' : 'Pendiente'}</span></p>
              </div>
              
              <div className="review-comment">
                <h4>Comentario:</h4>
                <p>{selectedReview.comentario}</p>
                
                <ContentWarning content={selectedReview.comentario} />
              </div>
              
              <div className="review-actions">
                {selectedReview.status === 'pending' && (
                  <button 
                    className="action-btn approve-btn"
                    onClick={() => approveReview(selectedReview._id)}
                  >
                    Marcar como Atendida
                  </button>
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
    </div>
  );
};

export default AdminReviewsPanel; 