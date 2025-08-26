import React, { Component, Suspense, memo, useCallback } from 'react';

// Error Boundary para capturar errores y mostrar fallbacks elegantes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error para debugging
    console.error('Error capturado por Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-feedback">
            <h2>¡Ups! Algo salió mal</h2>
            <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
                <summary>Detalles del error (solo en desarrollo)</summary>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Fallback optimizado con skeleton
const OptimizedLoadingFallback = memo(({ message = "Cargando...", showSkeleton = false }) => (
  <div className="loading-container">
    {showSkeleton ? (
      <div className="skeleton-container">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-image"></div>
      </div>
    ) : (
      <>
        <div className="loading-spinner">
          <div className="mexican-spinner">
            <span className="spinner-emoji">🌮</span>
          </div>
        </div>
        <p className="loading-text" role="status" aria-live="polite">
          {message}
        </p>
      </>
    )}
  </div>
));

// Wrapper para lazy loading con mejor UX
const LazyComponentWrapper = memo(({ 
  children, 
  fallbackMessage = "Cargando...",
  showSkeleton = false,
  errorFallback = null 
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={
        <OptimizedLoadingFallback 
          message={fallbackMessage} 
          showSkeleton={showSkeleton}
        />
      }>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
});

// Hook para optimizar re-renders
export const useStableCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

// HOC para memorizar componentes pesados
export const withPerformanceOptimization = (WrappedComponent) => {
  const MemoizedComponent = memo(WrappedComponent, (prevProps, nextProps) => {
    // Comparación superficial personalizada
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    
    for (let key of prevKeys) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    
    return true;
  });
  
  MemoizedComponent.displayName = `withPerformanceOptimization(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;
  
  return MemoizedComponent;
};

// Componente para observar viewport y lazy loading
export const ViewportOptimizer = memo(({ children, threshold = 0.1, rootMargin = '50px' }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : <div style={{ minHeight: '200px' }} />}
    </div>
  );
});

export { ErrorBoundary, OptimizedLoadingFallback, LazyComponentWrapper };
export default LazyComponentWrapper;