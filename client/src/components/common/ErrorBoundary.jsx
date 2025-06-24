import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el state para mostrar la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log del error (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary atrapó un error:', error, errorInfo);
    }

    // Guardar detalles del error
    this.setState({
      error,
      errorInfo,
      eventId: this.generateEventId()
    });

    // En producción, enviar error a servicio de monitoreo
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  generateEventId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  logErrorToService = (error, errorInfo) => {
    // Aquí se puede integrar con servicios como Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      eventId: this.state.eventId
    };

    // Ejemplo de envío a un endpoint de logging
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      }).catch(() => {
        // Fallar silenciosamente si no se puede enviar el error
      });
    } catch (e) {
      // No hacer nada si falla el logging
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Renderizar UI de error personalizada
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#D62828" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#D62828" strokeWidth="2"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="#D62828" strokeWidth="2"/>
              </svg>
            </div>
            
            <h2 className="error-title">¡Ups! Algo salió mal</h2>
            
            <p className="error-message">
              Se ha producido un error inesperado. Nuestro equipo ha sido notificado 
              y trabajará para solucionarlo lo antes posible.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Detalles del error (solo en desarrollo)</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{this.state.error.toString()}</pre>
                  
                  <h4>Stack trace:</h4>
                  <pre>{this.state.error.stack}</pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h4>Component stack:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="error-actions">
              <button 
                onClick={this.handleReset}
                className="btn btn-primary error-btn"
              >
                Intentar de nuevo
              </button>
              
              <button 
                onClick={this.handleReload}
                className="btn btn-secondary error-btn"
              >
                Recargar página
              </button>
              
              <a 
                href="/"
                className="btn btn-outline error-btn"
              >
                Ir al inicio
              </a>
            </div>

            {this.state.eventId && (
              <p className="error-id">
                ID del error: <code>{this.state.eventId}</code>
              </p>
            )}
          </div>

          <style jsx>{`
            .error-boundary-container {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .error-boundary-content {
              max-width: 600px;
              text-align: center;
              background: white;
              padding: 3rem;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              border: 1px solid rgba(214, 40, 40, 0.1);
            }

            .error-icon {
              margin-bottom: 2rem;
            }

            .error-title {
              color: #D62828;
              font-size: 2rem;
              font-weight: 700;
              margin-bottom: 1rem;
              line-height: 1.2;
            }

            .error-message {
              color: #6c757d;
              font-size: 1.1rem;
              line-height: 1.6;
              margin-bottom: 2rem;
            }

            .error-details {
              text-align: left;
              margin: 2rem 0;
              padding: 1rem;
              background: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #dee2e6;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #495057;
              margin-bottom: 1rem;
            }

            .error-stack {
              margin-top: 1rem;
            }

            .error-stack h4 {
              color: #495057;
              margin: 1rem 0 0.5rem 0;
              font-size: 0.9rem;
            }

            .error-stack pre {
              background: #f1f3f4;
              padding: 1rem;
              border-radius: 4px;
              overflow-x: auto;
              font-size: 0.8rem;
              color: #d73527;
              white-space: pre-wrap;
              word-break: break-word;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
              margin-bottom: 2rem;
            }

            .error-btn {
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 600;
              text-decoration: none;
              display: inline-block;
              transition: all 0.3s ease;
              cursor: pointer;
              border: none;
              font-size: 1rem;
            }

            .btn-primary {
              background: #D62828;
              color: white;
            }

            .btn-primary:hover {
              background: #b92222;
              transform: translateY(-2px);
            }

            .btn-secondary {
              background: #6c757d;
              color: white;
            }

            .btn-secondary:hover {
              background: #545b62;
              transform: translateY(-2px);
            }

            .btn-outline {
              background: transparent;
              color: #D62828;
              border: 2px solid #D62828;
            }

            .btn-outline:hover {
              background: #D62828;
              color: white;
              transform: translateY(-2px);
            }

            .error-id {
              font-size: 0.875rem;
              color: #6c757d;
              margin-top: 1rem;
            }

            .error-id code {
              background: #f8f9fa;
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }

            @media (max-width: 768px) {
              .error-boundary-container {
                padding: 1rem;
              }

              .error-boundary-content {
                padding: 2rem 1.5rem;
              }

              .error-title {
                font-size: 1.5rem;
              }

              .error-actions {
                flex-direction: column;
                align-items: stretch;
              }

              .error-btn {
                width: 100%;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar en componentes funcionales
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};

// Componente para errores específicos
export const ErrorDisplay = ({ 
  error, 
  onRetry, 
  showDetails = false,
  title = "Error",
  message = "Ha ocurrido un error inesperado"
}) => {
  return (
    <div className="error-display">
      <div className="error-content">
        <h3>{title}</h3>
        <p>{message}</p>
        
        {showDetails && error && (
          <details>
            <summary>Ver detalles</summary>
            <pre>{error.toString()}</pre>
          </details>
        )}
        
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary">
            Intentar de nuevo
          </button>
        )}
      </div>
      
      <style jsx>{`
        .error-display {
          padding: 2rem;
          text-align: center;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #dee2e6;
          margin: 1rem 0;
        }
        
        .error-content h3 {
          color: #D62828;
          margin-bottom: 1rem;
        }
        
        .error-content p {
          color: #6c757d;
          margin-bottom: 1.5rem;
        }
        
        .error-content details {
          text-align: left;
          margin: 1rem 0;
        }
        
        .error-content pre {
          background: white;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.875rem;
        }
        
        .btn {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        
        .btn-primary {
          background: #D62828;
          color: white;
        }
        
        .btn-primary:hover {
          background: #b92222;
        }
      `}</style>
    </div>
  );
};

export default ErrorBoundary; 