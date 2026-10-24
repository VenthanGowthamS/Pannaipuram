// ── Pannaipuram PWA — Service Worker ─────────────────────
var CACHE = 'pannai-pwa-v108';

var SHELL = [
  '/pwa/',
  '/pwa/index.html',
  '/pwa/css/tokens.css',
  '/pwa/css/base.css',
  '/pwa/css/nav.css',
  '/pwa/css/bus.css',
  '/pwa/css/auto.css',
  '/pwa/css/emergency.css',
  '/pwa/css/hospital.css',
  '/pwa/css/more.css',
  '/pwa/css/bulletin.css',
  '/pwa/css/responsive.css',
  '/pwa/js/api.js',
  '/pwa/js/bus.js',
  '/pwa/js/auto.js',
  '/pwa/js/emergency.js',
  '/pwa/js/hospital.js',
  '/pwa/js/more.js',
  '/pwa/js/bulletin.js',
  '/pwa/js/app.js',
  '/pwa/manifest.json',
  '/pwa/icons/icon-192.png',
  '/pwa/icons/icon-512.png',
];

// Install: pre-cache app shell
self.addEventListener('install', function(e) {
  // Fetch each shell file past the browser cache AND the CDN edge (unique
  // ?cb= query) — plain URLs can be up to 4h stale (max-age=14400), which would
  // pre-cache the PREVIOUS release's files under this release's cache name.
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return Promise.all(SHELL.map(function(p) {
        var u = new URL(p, self.location.href);
        u.searchParams.set('cb', Date.now());
        return fetch(u.href, { cache: 'reload' }).then(function(r) {
          if (!r.ok) throw new Error('precache ' + p + ' ' + r.status);
          return c.put(new Request(new URL(p, self.location.href).href), r);
        });
      }));
    })
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
  // Users always get the latest HTML/CSS/JS when online, cached fallback
  // only when offline. IMPORTANT: do NOT match on a '/pwa/' prefix string —
  // the GitHub Pages deploy sed-rewrites '/pwa/' literals to './', which
  // silently turned this branch off on app.pannaipuram.com (shell became
  // cache-first there → stale UI until the SW version bumped).
  if (url.origin === self.location.origin &&
      !url.pathname.startsWith('/api/') &&
      (url.pathname.endsWith('.html') ||
       url.pathname.endsWith('.css') ||
       url.pathname.endsWith('.js') ||
       url.pathname.endsWith('/'))) {
    // The page itself (html or '/') has a plain URL, so it can be served up to
    // 4h stale by the browser cache or a CDN edge → fetch it with a unique
    // ?cb= query + cache:'reload'. css/js carry a per-release ?v= (deploy step).
    var isDoc = url.pathname.endsWith('.html') || url.pathname.endsWith('/');
    var netReq = e.request;
    if (isDoc) {
      var bust = new URL(e.request.url);
      bust.searchParams.set('cb', Date.now());
      netReq = new Request(bust.href, { cache: 'reload' });
    }
    e.respondWith(
      fetch(netReq).then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return resp;
      }).catch(function() {
        return caches.match(e.request, { ignoreSearch: true });
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
