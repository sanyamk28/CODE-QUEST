const CACHE_NAME = 'codequest-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Install: Pre-cache static shells
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Bypass chrome-extension or non-HTTP requests
  if (!request.url.startsWith('http')) return;

  // Bypass local development and hot module replacement
  if (
    request.url.includes('localhost:5173') ||
    request.url.includes('127.0.0.1:5173') ||
    request.url.includes('/@vite/') ||
    request.url.includes('/@id/') ||
    request.url.includes('/src/') ||
    request.url.includes('?v=')
  ) {
    return;
  }

  // Let API requests pass straight through to network
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'You are currently offline.' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Network-First for HTML and application assets so changes appear instantly
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return new Response('Network error occurred', { status: 408 });
        });
      })
  );
});
