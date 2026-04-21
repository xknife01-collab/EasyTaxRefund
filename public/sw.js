const CACHE_NAME = 'easytax-pwa-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // PWA offline support basic fallback
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If we find it in cache, return it
      if (response) {
        return response;
      }
      
      // Otherwise fetch from network
      return fetch(event.request).catch(() => {
        // Just return nothing if offline, this is basic PWA to pass installation requirements
      });
    })
  );
});
