import React from 'react';

/**
 * Utilidades para navegación con scroll suave
 */

/**
 * Hace scroll suave a una sección específica por su ID
 * @param {string} sectionId - El ID de la sección a la que hacer scroll
 * @param {number} offset - Offset adicional desde la parte superior (por defecto 80px para el navbar)
 */
export const scrollToSection = (sectionId, offset = 80) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

/**
 * Hace scroll suave a la parte superior de la página
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * Navega a una página y luego hace scroll a una sección específica
 * @param {function} navigate - La función navigate de React Router v6
 * @param {string} path - La ruta a la que navegar
 * @param {string} sectionId - El ID de la sección a la que hacer scroll (opcional)
 * @param {number} delay - Retraso antes de hacer scroll (por defecto 100ms)
 */
export const navigateAndScroll = (navigate, path, sectionId = null, delay = 100) => {
  // Si ya estamos en la página correcta, solo hacer scroll
  if (window.location.pathname === path && sectionId) {
    scrollToSection(sectionId);
    return;
  }

  // Navegar a la página
  navigate(path);

  // Si hay una sección específica, hacer scroll después de un pequeño retraso
  if (sectionId) {
    setTimeout(() => {
      scrollToSection(sectionId);
    }, delay);
  }
};

/**
 * Maneja enlaces con hash para scroll automático
 * @param {string} hash - El hash del enlace (ej: "#contact-form")
 */
export const handleHashScroll = (hash) => {
  if (hash && hash.startsWith('#')) {
    const sectionId = hash.substring(1);
    setTimeout(() => {
      scrollToSection(sectionId);
    }, 100);
  }
};

/**
 * Hook personalizado para manejar scroll automático al cargar la página
 */
export const useScrollOnMount = () => {
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      handleHashScroll(hash);
    }
  }, []);
}; 