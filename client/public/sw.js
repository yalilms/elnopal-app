// Service Worker básico para El Nopal
const CACHE_NAME = 'elnopal-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('SW: Instalando service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Cache abierto');
        // Solo cachear las URLs básicas que sabemos que existen
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('SW: Error al cachear:', err);
      })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  // No interceptar peticiones a la API para evitar problemas
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devolver desde cache si existe, sino hacer petición de red
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Si la petición falla, devolver una respuesta por defecto para navegación
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activando service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 