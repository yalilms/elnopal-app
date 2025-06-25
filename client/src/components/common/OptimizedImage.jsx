import React, { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  priority = false, 
  sizes = '100vw',
  loading = 'lazy',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef();

  // Generar rutas para diferentes formatos
  const getImageSources = (originalSrc) => {
    const basePath = originalSrc.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '');
    const extension = originalSrc.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i)?.[1]?.toLowerCase();
    
    return {
      webp: `/static/media/webp/${basePath.split('/').pop()}.webp`,
      optimized: `/static/media/optimized/${basePath.split('/').pop()}.${extension}`,
      original: originalSrc
    };
  };

  const sources = getImageSources(src);

  // Lazy loading observer
  useEffect(() => {
    if (priority || loading !== 'lazy') {
      setImageSrc(sources.original);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(sources.original);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [sources.original, priority, loading]);

  // Preload para imágenes críticas
  useEffect(() => {
    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = sources.webp || sources.optimized || sources.original;
      document.head.appendChild(link);

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [priority, sources]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    // Fallback a imagen original si WebP falla
    if (imageSrc === sources.webp) {
      setImageSrc(sources.optimized || sources.original);
    } else if (imageSrc === sources.optimized) {
      setImageSrc(sources.original);
    }
  };

  return (
    <div className={`image-container ${className}`} ref={imgRef}>
      <picture>
        {/* WebP para navegadores compatibles */}
        <source 
          srcSet={sources.webp} 
          type="image/webp"
          sizes={sizes}
        />
        
        {/* Imagen optimizada */}
        <source 
          srcSet={sources.optimized || sources.original} 
          type={`image/${sources.original.split('.').pop()?.toLowerCase()}`}
          sizes={sizes}
        />
        
        {/* Fallback */}
        <img
          src={imageSrc || (priority ? sources.original : '')}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
          decoding={priority ? 'sync' : 'async'}
          {...props}
        />
      </picture>
      
      {/* Placeholder mientras carga */}
      {!isLoaded && (
        <div className="image-placeholder">
          <div className="placeholder-shimmer"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage; 