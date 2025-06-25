import { useState, useEffect, useCallback } from 'react';

export const useImageOptimization = () => {
  const [supportedFormats, setSupportedFormats] = useState({
    webp: false,
    avif: false
  });

  // Detectar soporte de formatos modernos
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    const checkAVIFSupport = async () => {
      try {
        const avif = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        const img = new Image();
        img.src = avif;
        return new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        });
      } catch {
        return false;
      }
    };

    const detectFormats = async () => {
      const [webp, avif] = await Promise.all([
        checkWebPSupport(),
        checkAVIFSupport()
      ]);
      
      setSupportedFormats({ webp, avif });
    };

    detectFormats();
  }, []);

  // Generar la mejor URL de imagen según el soporte del navegador
  const getOptimizedImageUrl = useCallback((originalSrc, options = {}) => {
    const { 
      width, 
      height, 
      quality = 85,
      format = 'auto'
    } = options;

    // Extraer nombre del archivo sin extensión
    const baseName = originalSrc.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '');
    const fileName = baseName.split('/').pop();

    // Decidir el mejor formato
    let bestFormat = 'jpg';
    if (format === 'auto') {
      if (supportedFormats.avif) {
        bestFormat = 'avif';
      } else if (supportedFormats.webp) {
        bestFormat = 'webp';
      }
    } else {
      bestFormat = format;
    }

    // Construir URL optimizada
    const optimizedPath = `/static/media/optimized/${fileName}`;
    const webpPath = `/static/media/webp/${fileName}.webp`;
    const avifPath = `/static/media/avif/${fileName}.avif`;

    switch (bestFormat) {
      case 'avif':
        return avifPath;
      case 'webp':
        return webpPath;
      default:
        return optimizedPath + '.' + originalSrc.split('.').pop().toLowerCase();
    }
  }, [supportedFormats]);

  // Precargar imágenes críticas
  const preloadImage = useCallback((src, options = {}) => {
    const optimizedSrc = getOptimizedImageUrl(src, options);
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedSrc;
    
    // Agregar al head si no existe ya
    const existing = document.querySelector(`link[href="${optimizedSrc}"]`);
    if (!existing) {
      document.head.appendChild(link);
    }

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [getOptimizedImageUrl]);

  // Lazy loading con Intersection Observer
  const useLazyLoading = useCallback((threshold = 0.1) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [ref, setRef] = useState(null);

    useEffect(() => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        },
        { threshold }
      );

      observer.observe(ref);

      return () => observer.disconnect();
    }, [ref, threshold]);

    return [setRef, isIntersecting];
  }, []);

  return {
    supportedFormats,
    getOptimizedImageUrl,
    preloadImage,
    useLazyLoading
  };
}; 