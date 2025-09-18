
// Version dynamique du cache basée sur l'URL du service worker
const getVersionFromUrl = () => {
  const urlParams = new URLSearchParams(self.location.search);
  return urlParams.get('v') || 'default';
};

const CACHE_VERSION = getVersionFromUrl();
const CACHE_NAME = `orydia-v${CACHE_VERSION}`;

const STATIC_CACHE_URLS = [
  '/favicon.ico'
  // Plus de cache pour les routes principales pour éviter les conflits
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégies de cache optimisées
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas intercepter les navigations pour éviter les conflits de cache
  if (request.mode === 'navigate') {
    return; // Laisse le navigateur gérer les navigations
  }

  // Cache First pour les assets avec hash (versionnés)
  if ((request.destination === 'script' || request.destination === 'style') && 
      url.pathname.includes('-') && /\.[a-f0-9]{8,}\.(js|css)/.test(url.pathname)) {
    
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
  }
  
  // Cache First pour les images
  else if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // Fallback silencieux pour les images
          return new Response('', { status: 404 });
        });
      })
    );
  }
  
  // Network First pour les API et requêtes dynamiques
  else if (url.pathname.includes('/api/') || url.hostname.includes('supabase') || 
           url.pathname.includes('functions/')) {
    event.respondWith(
      fetch(request).then((response) => {
        // Ne pas cacher les erreurs API
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(request);
      })
    );
  }
  
  // Network-first strict pour les fichiers EPUB (ne jamais cacher)
  else if (request.url.includes('.epub') || url.pathname.includes('epubs/') || 
           request.url.startsWith('blob:')) {
    console.log('[SW] EPUB request intercepted:', request.url);
    event.respondWith(
      fetch(request).then(response => {
        console.log('[SW] EPUB fetch success:', request.url, response.status);
        return response;
      }).catch(error => {
        console.error('[SW] EPUB fetch failed:', request.url, error);
        // Pas de fallback cache pour les EPUBs
        return new Response('EPUB file not available', { status: 404 });
      })
    );
  }
});
