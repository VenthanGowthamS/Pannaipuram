// ── Pannaipuram PWA — Service Worker ─────────────────────
var CACHE = 'pannai-pwa-v35';

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
  // Don't force skipWaiting here — wait for client's SKIP_WAITING message
  // so the client can coordinate the reload flow
});

// Message from page: skipWaiting so new SW activates immediately
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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

  // PWA app shell (HTML / CSS / JS) — NETWORK-FIRST
  // This is the PERMANENT cache fix: users always get the latest HTML/CSS/JS when online,
  // with cached fallback only when offline. No more "hard refresh to see changes".
  if (url.pathname.startsWith('/pwa/') &&
      (url.pathname.endsWith('.html') ||
       url.pathname.endsWith('.css') ||
       url.pathname.endsWith('.js') ||
       url.pathname === '/pwa/' ||
       url.pathname === '/pwa')) {
    e.respondWith(
      fetch(e.request).then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return resp;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // Google Fonts + icons + images — cache-first (rarely change, big files)
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
