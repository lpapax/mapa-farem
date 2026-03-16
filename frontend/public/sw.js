// sw.js — MapaFarem.cz service worker v2
const CACHE_NAME = 'mapafarem-v2';
const SHELL_CACHE = 'mapafarem-shell-v2';
const IMG_CACHE = 'mapafarem-images-v2';

const SHELL_ASSETS = ['/', '/mapa'];

// Install: cache shell
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(SHELL_CACHE).then(c => c.addAll(SHELL_ASSETS).catch(() => {}))
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => ![CACHE_NAME, SHELL_CACHE, IMG_CACHE].includes(k))
            .map(k => caches.delete(k))
      )
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Skip: Mapbox, Supabase, external APIs
  if (url.hostname.includes('mapbox.com') ||
      url.hostname.includes('supabase') ||
      url.hostname.includes('googleapis.com') ||
      url.pathname.startsWith('/api/')) return;

  // Images (Unsplash, etc): stale-while-revalidate
  if (request.destination === 'image' || url.hostname.includes('unsplash.com')) {
    e.respondWith(
      caches.open(IMG_CACHE).then(cache =>
        cache.match(request).then(cached => {
          const fetchPromise = fetch(request).then(res => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Navigation (HTML pages): network first, fallback to shell
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() =>
        caches.match('/').then(r => r || new Response('Offline', { status: 503 }))
      )
    );
    return;
  }

  // JS/CSS/fonts: cache first
  if (['script','style','font'].includes(request.destination)) {
    e.respondWith(
      caches.match(request).then(cached => cached ||
        fetch(request).then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // Default: network first
  e.respondWith(fetch(request).catch(() => caches.match(request)));
});
