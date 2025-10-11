
// Version dynamique du cache basée sur l'URL du service worker
const getVersionFromUrl = () => {
  const urlParams = new URLSearchParams(self.location.search);
  return urlParams.get('v') || 'default';
};

const CACHE_VERSION = getVersionFromUrl();
const CACHE_NAME = `orydia-v${CACHE_VERSION}`;

const STATIC_CACHE_URLS = [
  '/favicon.ico'
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
  
  // Only cache GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Ne pas intercepter les navigations
  if (request.mode === 'navigate') {
    return;
  }
  
  // PRIORITÉ ABSOLUE: Bypass EPUB files, Supabase storage & blob URLs AVANT tout autre traitement
  const isEpubFile = url.pathname.endsWith('.epub') || url.pathname.includes('/epubs/');
  const isSupabaseStorage = url.hostname.includes('supabase') && url.pathname.includes('/storage/');
  const isBlobUrl = url.protocol === 'blob:';
  
  if (isEpubFile || isSupabaseStorage || isBlobUrl) {
    // Log en mode debug
    if (url.searchParams.has('sw') && url.searchParams.get('sw') === 'debug') {
      console.log('[SW] BYPASS (EPUB/Storage/Blob):', url.href);
    }
    return; // Laisser passer sans cache ni interception
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
    return;
  }
  
  // Cache First pour les images
  if (request.destination === 'image') {
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
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }
  
  // Network First pour les API et requêtes Supabase dynamiques (SAUF storage déjà bypassé)
  if (url.pathname.includes('/api/') || 
      (url.hostname.includes('supabase') && !url.pathname.includes('/storage/')) || 
      url.pathname.includes('functions/')) {
    
    if (url.searchParams.has('sw') && url.searchParams.get('sw') === 'debug') {
      console.log('[SW] Network First (API):', url.href);
    }
    
    event.respondWith(
      fetch(request).then((response) => {
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
    return;
  }
});
