// ===== OPTIMIZACIONES DE RENDIMIENTO =====
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Throttle function para eventos de scroll
export const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// Debounce function para optimizar re-renders
export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Hook optimizado para scroll con throttling
export const useOptimizedScroll = (callback, delay = 16) => {
  const throttledCallback = throttle(callback, delay);
  
  useEffect(() => {
    window.addEventListener('scroll', throttledCallback, { passive: true });
    return () => window.removeEventListener('scroll', throttledCallback);
  }, [throttledCallback]);
};

// Cleanup de animaciones cuando el componente se desmonta
export const cleanupAnimations = (element) => {
  if (element) {
    const animations = element.getAnimations();
    animations.forEach(animation => {
      animation.cancel();
    });
  }
};

// Optimizador de Intersection Observer
export const createOptimizedObserver = (callback, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  };
  
  return new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);
};

// Reducir la frecuencia de re-renders en formularios
export const useFormOptimization = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [debouncedFormData, setDebouncedFormData] = useState(initialState);
  
  const debouncedUpdate = debounce((data) => {
    setDebouncedFormData(data);
  }, 300);
  
  const updateFormData = useCallback((updates) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      debouncedUpdate(newData);
      return newData;
    });
  }, [debouncedUpdate]);
  
  return [formData, debouncedFormData, updateFormData];
};

// Optimización de imágenes lazy loading
export const useOptimizedLazyLoading = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState(null);
  
  useEffect(() => {
    if (!ref) return;
    
    const observer = createOptimizedObserver(() => {
      setIsVisible(true);
    }, { threshold });
    
    observer.observe(ref);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, threshold]);
  
  return [setRef, isVisible];
};

// Prevenir memory leaks en timers
export const useSafeTimer = (callback, delay, dependencies = []) => {
  const savedCallback = useRef();
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    
    return () => clearInterval(id);
  }, [delay, ...dependencies]);
};

// Optimización de animaciones CSS mediante will-change
export const optimizeElementForAnimation = (element, properties = ['transform', 'opacity']) => {
  if (element) {
    element.style.willChange = properties.join(', ');
    
    // Cleanup después de la animación
    const cleanup = () => {
      element.style.willChange = 'auto';
    };
    
    // Auto-cleanup después de 5 segundos
    setTimeout(cleanup, 5000);
    
    return cleanup;
  }
};

// Detectar si el usuario prefiere animaciones reducidas
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
};

// Optimización de context updates
export const useContextOptimization = (contextValue) => {
  return useMemo(() => contextValue, [JSON.stringify(contextValue)]);
};

// Cleanup de event listeners al desmontar
export const useEventListenerCleanup = () => {
  const listenersRef = useRef([]);
  
  const addListener = useCallback((element, event, handler, options) => {
    element.addEventListener(event, handler, options);
    listenersRef.current.push({ element, event, handler });
  }, []);
  
  useEffect(() => {
    return () => {
      listenersRef.current.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      listenersRef.current = [];
    };
  }, []);
  
  return addListener;
};

// Hook personalizado para intersection observer optimizado
export const useOptimizedIntersection = (callback, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(callback, defaultOptions);
    return () => observer.disconnect();
  }, [callback]);
}; 