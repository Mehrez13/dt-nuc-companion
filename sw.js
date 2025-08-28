  // DT NUC Companion - Service Worker Intelligent (Version Corrigée)
  const CACHE_VERSION = 'v1.0.0';
  const CACHE_NAME = `dt-nuc-companion-${CACHE_VERSION}`;
  const DATA_CACHE_NAME = `dt-nuc-data-${CACHE_VERSION}`;

  // Ressources critiques à mettre en cache immédiatement
  const STATIC_CACHE_URLS = [
      '/',
      '/index.html',
      '/app.js',
      '/js/database.js',
      '/style.css',
      '/manifest.json'
  ];

  // Installation du Service Worker
  self.addEventListener('install', event => {
      console.log('🔧 Service Worker: Installation en cours...');

      event.waitUntil(
          caches.open(CACHE_NAME)
              .then(cache => {
                  console.log('📦 Mise en cache des ressources statiques');
                  return cache.addAll(STATIC_CACHE_URLS);
              })
              .then(() => {
                  console.log('✅ Installation Service Worker terminée');
                  return self.skipWaiting();
              })
              .catch(error => {
                  console.error('❌ Erreur installation SW:', error);
              })
      );
  });

  // Activation du Service Worker
  self.addEventListener('activate', event => {
      console.log('✅ Service Worker: Activation en cours...');

      event.waitUntil(
          caches.keys()
              .then(cacheNames => {
                  return Promise.all(
                      cacheNames.map(cacheName => {
                          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                              console.log('🗑️ Suppression ancien cache:', cacheName);
                              return caches.delete(cacheName);
                          }
                      })
                  );
              })
              .then(() => {
                  console.log('✅ Activation Service Worker terminée');
                  return self.clients.claim();
              })
              .catch(error => {
                  console.error('❌ Erreur activation SW:', error);
              })
      );
  });

  // Interception simplifiée des requêtes
  self.addEventListener('fetch', event => {
      // Cache First strategy pour toutes les ressources
      event.respondWith(
          caches.match(event.request)
              .then(cachedResponse => {
                  if (cachedResponse) {
                      console.log('📦 Cache HIT:', event.request.url);
                      return cachedResponse;
                  }

                  console.log('🌐 Cache MISS:', event.request.url);
                  return fetch(event.request)
                      .then(response => {
                          if (response.status === 200) {
                              const responseClone = response.clone();
                              caches.open(CACHE_NAME)
                                  .then(cache => {
                                      cache.put(event.request, responseClone);
                                  });
                          }
                          return response;
                      })
                      .catch(() => {
                          // Fallback hors ligne
                          return new Response('Contenu indisponible hors ligne', {
                              status: 503,
                              statusText: 'Service Unavailable'
                          });
                      });
              })
      );
  });

  console.log('🚀 Service Worker DT NUC Companion (Version Simplifiée) initialisé');
