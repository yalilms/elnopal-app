import React, { useEffect, useRef } from 'react';

const ViewportObserver = ({ children, className = '', pauseAnimationsOutside = true }) => {
  const ref = useRef();

  useEffect(() => {
    if (!pauseAnimationsOutside || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const element = entry.target;
        
        if (entry.isIntersecting) {
          // Elemento visible - activar animaciones
          element.classList.add('in-viewport');
          element.classList.remove('out-of-viewport');
          
          // Reanudar animaciones CSS
          const animatedElements = element.querySelectorAll('[style*="animation-play-state"]');
          animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
          });
        } else {
          // Elemento fuera de vista - pausar animaciones
          element.classList.remove('in-viewport');
          element.classList.add('out-of-viewport');
          
          // Pausar animaciones CSS para ahorrar recursos
          const animatedElements = element.querySelectorAll('*');
          animatedElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            if (styles.animation !== 'none') {
              el.style.animationPlayState = 'paused';
            }
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(ref.current);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [pauseAnimationsOutside]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ViewportObserver; 