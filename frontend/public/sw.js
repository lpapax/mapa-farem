// sw.js — MapaFarem.cz service worker
const CACHE = 'mapafarem-v1';
const STATIC = ['/'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // For navigation requests: network first, fallback to cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/'))
    );
    return;
  }
  // For other requests: network first, no caching of API/map tiles
  if (e.request.url.includes('api.mapbox') || e.request.url.includes('supabase')) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
