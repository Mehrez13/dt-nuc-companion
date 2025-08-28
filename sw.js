  // DT NUC Companion - Service Worker Intelligent
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

  // URLs des API et données dynamiques
  const API_CACHE_URLS = [
      // Patterns pour les futures APIs
      /\/api\/procedures/,
      /\/api\/media/,
      /\/api\/sync/
  ];

  // Installation du Service Worker
  self.addEventListener('install', event => {
      console.log('🔧 Service Worker: Installation en cours...');

      event.waitUntil(
          Promise.all([
              // Cache des ressources statiques
              caches.open(CACHE_NAME)
                  .then(cache => {
                      console.log('📦 Mise en cache des ressources statiques');
                      return cache.addAll(STATIC_CACHE_URLS);
                  }),

              // Forcer l'activation immédiate
              self.skipWaiting()
          ])
      );
  });

  // Activation du Service Worker
  self.addEventListener('activate', event => {
      console.log('✅ Service Worker: Activation en cours...');

      event.waitUntil(
          Promise.all([
              // Nettoyer les anciens caches
              caches.keys().then(cacheNames => {
                  return Promise.all(
                      cacheNames.map(cacheName => {
                          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                              console.log('🗑️ Suppression ancien cache:', cacheName);
                              return caches.delete(cacheName);
                          }
                      })
                  );
              }),

              // Prendre le contrôle immédiatement
              self.clients.claim()
          ])
      );
  });

  // Interception des requêtes réseau
  self.addEventListener('fetch', event => {
      const { request } = event;
      const url = new URL(request.url);

      // Stratégie selon le type de ressource
      if (isStaticResource(request)) {
          // CACHE FIRST pour les ressources statiques
          event.respondWith(handleStaticResource(request));
      } else if (isApiRequest(request)) {
          // NETWORK FIRST pour les données API
          event.respondWith(handleApiRequest(request));
      } else if (isMediaRequest(request)) {
          // CACHE FIRST pour les médias
          event.respondWith(handleMediaRequest(request));
      } else {
          // Stratégie par défaut
          event.respondWith(handleDefaultRequest(request));
      }
  });

  // Vérification si c'est une ressource statique
  function isStaticResource(request) {
      const url = new URL(request.url);
      return STATIC_CACHE_URLS.some(pattern =>
          typeof pattern === 'string' ? url.pathname === pattern : pattern.test(url.pathname)
      );
  }

  // Vérification si c'est une requête API
  function isApiRequest(request) {
      const url = new URL(request.url);
      return API_CACHE_URLS.some(pattern => pattern.test(url.pathname));
  }

  // Vérification si c'est un média
  function isMediaRequest(request) {
      const url = new URL(request.url);
      return /\.(jpg|jpeg|png|gif|webp|pdf|mp4)$/i.test(url.pathname);
  }

  // Stratégie CACHE FIRST pour ressources statiques
  async function handleStaticResource(request) {
      try {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
              console.log('📦 Cache HIT:', request.url);
              return cachedResponse;
          }

          console.log('🌐 Cache MISS, récupération réseau:', request.url);
          const networkResponse = await fetch(request);

          if (networkResponse.status === 200) {
              const cache = await caches.open(CACHE_NAME);
              cache.put(request, networkResponse.clone());
          }

          return networkResponse;
      } catch (error) {
          console.error('❌ Erreur ressource statique:', error);

          // Fallback vers page hors ligne si disponible
          if (request.destination === 'document') {
              return caches.match('/index.html');
          }

          return new Response('Ressource indisponible hors ligne', {
              status: 503,
              statusText: 'Service Unavailable'
          });
      }
  }

  // Stratégie NETWORK FIRST pour données API
  async function handleApiRequest(request) {
      try {
          console.log('🌐 API Request:', request.url);
          const networkResponse = await fetch(request);

          if (networkResponse.status === 200) {
              const cache = await caches.open(DATA_CACHE_NAME);
              cache.put(request, networkResponse.clone());
              console.log('💾 API Response mise en cache');
          }

          return networkResponse;
      } catch (error) {
          console.log('📦 API Request - Fallback vers cache');
          const cachedResponse = await caches.match(request);

          if (cachedResponse) {
              // Ajouter un header pour indiquer que c'est du cache
              const response = cachedResponse.clone();
              response.headers.append('X-Cache-Status', 'HIT');
              return response;
          }

          return new Response(JSON.stringify({
              error: 'Données indisponibles hors ligne',
              cached: false
          }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
          });
      }
  }

  // Stratégie CACHE FIRST pour médias
  async function handleMediaRequest(request) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
          return cachedResponse;
      }

      try {
          const networkResponse = await fetch(request);
          if (networkResponse.status === 200) {
              const cache = await caches.open(DATA_CACHE_NAME);
              cache.put(request, networkResponse.clone());
          }
          return networkResponse;
      } catch (error) {
          return new Response('Média indisponible hors ligne', { status: 503 });
      }
  }

  // Stratégie par défaut
  async function handleDefaultRequest(request) {
      try {
          return await fetch(request);
      } catch (error) {
          const cachedResponse = await caches.match(request);
          return cachedResponse || new Response('Contenu indisponible', { status: 503 });
      }
  }

  // Synchronisation en arrière-plan
  self.addEventListener('sync', event => {
      console.log('🔄 Background Sync:', event.tag);

      if (event.tag === 'sync-data') {
          event.waitUntil(syncPendingData());
      } else if (event.tag === 'sync-media') {
          event.waitUntil(syncPendingMedia());
      }
  });

  // Synchroniser les données en attente
  async function syncPendingData() {
      try {
          console.log('🔄 Synchronisation des données en cours...');

          // Communiquer avec l'application principale pour obtenir les données à synchroniser
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
              client.postMessage({
                  type: 'SYNC_REQUEST',
                  action: 'sync-pending-data'
              });
          });

          console.log('✅ Synchronisation des données terminée');
      } catch (error) {
          console.error('❌ Erreur synchronisation données:', error);
          throw error; // Permet de retry automatiquement
      }
  }

  // Synchroniser les médias en attente
  async function syncPendingMedia() {
      try {
          console.log('📸 Synchronisation des médias en cours...');

          const clients = await self.clients.matchAll();
          clients.forEach(client => {
              client.postMessage({
                  type: 'SYNC_REQUEST',
                  action: 'sync-pending-media'
              });
          });

          console.log('✅ Synchronisation des médias terminée');
      } catch (error) {
          console.error('❌ Erreur synchronisation médias:', error);
          throw error;
      }
  }

  // Gestion des messages depuis l'application
  self.addEventListener('message', event => {
      const { type, action, data } = event.data;

      if (type === 'CACHE_UPDATE') {
          handleCacheUpdate(action, data);
      } else if (type === 'SYNC_RESPONSE') {
          handleSyncResponse(action, data);
      } else if (type === 'CACHE_CLEAR') {
          handleCacheClear();
      }
  });

  // Mettre à jour le cache
  async function handleCacheUpdate(action, data) {
      try {
          if (action === 'add-procedure') {
              const cache = await caches.open(DATA_CACHE_NAME);
              // Simuler la mise en cache d'une procédure
              console.log('📋 Procédure ajoutée au cache:', data);
          } else if (action === 'add-media') {
              const cache = await caches.open(DATA_CACHE_NAME);
              console.log('📸 Média ajouté au cache:', data);
          }
      } catch (error) {
          console.error('❌ Erreur mise à jour cache:', error);
      }
  }

  // Réponse de synchronisation
  function handleSyncResponse(action, data) {
      console.log('📡 Sync Response:', action, data);
  }

  // Nettoyer le cache
  async function handleCacheClear() {
      try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log('🗑️ Cache complètement nettoyé');
      } catch (error) {
          console.error('❌ Erreur nettoyage cache:', error);
      }
  }

  // Notifications push (pour plus tard)
  self.addEventListener('push', event => {
      if (event.data) {
          const data = event.data.json();
          console.log('📱 Push notification reçue:', data);

          event.waitUntil(
              self.registration.showNotification(data.title, {
                  body: data.body,
                  icon: '/icons/icon-192x192.png',
                  badge: '/icons/badge-72x72.png',
                  tag: data.tag,
                  data: data.data
              })
          );
      }
  });

  // Gestion des clics sur notifications
  self.addEventListener('notificationclick', event => {
      console.log('🔔 Clic sur notification:', event.notification);

      event.notification.close();

      event.waitUntil(
          clients.openWindow('/')
      );
  });

  console.log('🚀 Service Worker DT NUC Companion initialisé');
