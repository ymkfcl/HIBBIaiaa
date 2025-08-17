const CACHE_NAME = 'hibbi-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  // Note: We don't cache '/index.tsx' directly as it's processed by the browser/build tool.
  // The browser will cache the resulting JS module based on import maps.
  '/favicon.svg',
  '/manifest.json'
];

// Install event: open cache and add core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If we have a cached response, return it.
        if (response) {
          return response;
        }

        // If not, fetch from the network.
        return fetch(event.request).then((networkResponse) => {
          // We don't cache external resources like Google Fonts or esm.sh scripts in this simple SW.
          // The browser's own cache will handle them.
          return networkResponse;
        });
      })
      .catch((error) => {
        console.error('Service Worker fetch error:', error);
        // You could return a fallback offline page here if you had one.
      })
  );
});
