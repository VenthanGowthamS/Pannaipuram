// ── Pannaipuram PWA — Service Worker ─────────────────────
var CACHE = 'pannai-pwa-v7';

var SHELL = [
  '/pwa/',
  '/pwa/index.html',
  '/pwa/css/tokens.css',
  '/pwa/css/base.css',
  '/pwa/css/nav.css',
  '/pwa/css/bus.css',
  '/pwa/css/auto.css',
  '/pwa/js/api.js',
  '/pwa/js/bus.js',
  '/pwa/js/auto.js',
  '/pwa/js/app.js',
  '/pwa/manifest.json',
  '/pwa/icons/icon-192.png',
  '/pwa/icons/icon-512.png',
  '/pwa/icons/splash_bg.png',
];

// Install: pre-cache app shell
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(SHELL); })
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: route-based strategies
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // /api/bus/next — network only (time-critical, stale = useless)
  if (url.pathname === '/api/bus/next') {
    e.respondWith(fetch(e.request));
    return;
  }

  // /api/* — stale-while-revalidate (show cached, update in background)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      caches.open(CACHE).then(function(cache) {
        return cache.match(e.request).then(function(cached) {
          var networkFetch = fetch(e.request).then(function(resp) {
            cache.put(e.request, resp.clone());
            return resp;
          }).catch(function() { return null; });
          return cached || networkFetch;
        });
      })
    );
    return;
  }

  // Google Fonts + all other static — cache-first
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return resp;
      });
    })
  );
});
