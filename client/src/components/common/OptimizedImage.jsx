import React, { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  priority = false, 
  sizes = '100vw',
  loading = 'lazy',
  width,
  height,
  style = {},
  fetchPriority = 'auto',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  // Dimensiones por defecto para diferentes tipos de imagen
  const getImageDimensions = () => {
    if (width && height) return { width, height };
    
    if (className?.includes('hero-image')) {
      return { width: 1920, height: 1080 };
    }
    if (className?.includes('logo')) {
      return { width: 200, height: 100 };
    }
    return {};
  };

  const dimensions = getImageDimensions();

  // Preload inmediato para imágenes críticas
  useEffect(() => {
    if (priority) {
      // Preload explícito para LCP
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = src;
      preloadLink.fetchPriority = 'high';
      document.head.appendChild(preloadLink);

      return () => {
        if (document.head.contains(preloadLink)) {
          document.head.removeChild(preloadLink);
        }
      };
    }
  }, [priority, src]);

  // Intersection Observer optimizado para lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Solo cargar si no se ha cargado ya
          if (!img.src) {
            img.src = src;
            img.onload = () => {
              setIsLoaded(true);
              img.classList.add('loaded');
            };
            img.onerror = () => setHasError(true);
          }
          
          observer.unobserve(img);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, priority]);

  // Estilos optimizados para evitar CLS
  const imageStyle = {
    aspectRatio: dimensions.width && dimensions.height 
      ? `${dimensions.width}/${dimensions.height}` 
      : undefined,
    objectFit: 'cover',
    width: '100%',
    height: 'auto',
    transition: 'opacity 0.3s ease',
    opacity: isLoaded || priority ? 1 : 0,
    ...style
  };

  // Placeholder para evitar CLS
  const placeholderStyle = {
    backgroundColor: '#f0f0f0',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: !isLoaded && !hasError ? 'shimmer 1.5s infinite' : 'none',
    aspectRatio: dimensions.width && dimensions.height 
      ? `${dimensions.width}/${dimensions.height}` 
      : '16/9',
    width: '100%',
    height: style.height || 'auto',
    display: isLoaded ? 'none' : 'block'
  };

  if (hasError) {
    return (
      <div 
        className={`image-error ${className}`}
        style={{
          ...placeholderStyle,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '14px'
        }}
      >
        Error al cargar imagen
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className}`} style={{ position: 'relative' }}>
      {/* Placeholder para evitar CLS */}
      <div style={placeholderStyle} />
      
      {/* Imagen real */}
      <img
        ref={imgRef}
        src={priority ? src : undefined} // Solo cargar inmediatamente si es prioritaria
        alt={alt}
        className={`optimized-image ${className} ${isLoaded ? 'loaded' : ''}`}
        loading={priority ? 'eager' : loading}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={fetchPriority}
        sizes={sizes}
        style={{
          ...imageStyle,
          position: isLoaded ? 'static' : 'absolute',
          top: 0,
          left: 0
        }}
        {...dimensions}
        {...props}
        onLoad={() => {
          setIsLoaded(true);
          imgRef.current?.classList.add('loaded');
        }}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default OptimizedImage; 