// ── Pannaipuram PWA — API Module ─────────────────────────────
// Three-tier cache: in-memory → localStorage → network.
// localStorage survives reloads, making the app usable offline after first load.
var _mem = {};
var CACHE_VERSION = 'pannai-v78';

// API base — auto-detects hosting environment:
//   app.pannaipuram.com  → api.pannaipuram.com  (custom domain, future)
//   *.github.io          → pannaipuram-api.onrender.com (GitHub Pages CDN)
//   same-origin (Render) → '' (relative URLs)
var API_BASE = (function() {
  var h = (typeof location !== 'undefined') ? location.hostname : '';
  if (h === 'app.pannaipuram.com') return 'https://api.pannaipuram.com';
  if (h.endsWith('.github.io') || h.endsWith('.pages.dev') || h.endsWith('.netlify.app')) {
    return 'https://pannaipuram-api.onrender.com';
  }
  return ''; // same-origin
})();
function apiUrl(path) { return API_BASE + path; }

function lsGet(key) {
  try { var v = localStorage.getItem(CACHE_VERSION + ':' + key); return v ? JSON.parse(v) : null; }
  catch (_) { return null; }
}

function lsSet(key, val) {
  try { localStorage.setItem(CACHE_VERSION + ':' + key, JSON.stringify(val)); } catch (_) { /* quota / private mode */ }
}

// Stale-while-revalidate at the app level.
// Render free tier cold-starts take 30-60s. If we have ANY cached data
// (memory or localStorage), show it within 2.5s and let the network update
// cache silently in the background. Result: installed PWA users never see
// a blank screen while Render wakes up.
var NETWORK_TIMEOUT_MS = 2500;
// /api/bus/next is time-critical — no cached fallback for countdown
var NEVER_CACHE = { '/api/bus/next': true };

function networkFetch(path, force) {
  var url = apiUrl(force
    ? path + (path.indexOf('?') >= 0 ? '&' : '?') + '_t=' + Date.now()
    : path);
  return fetch(url, force ? { cache: 'reload' } : undefined)
    .then(function(resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(function(json) {
      if (!json.success) throw new Error(json.error || 'API error');
      _mem[path] = json.data;
      lsSet('pannai:' + path, json.data);
      return json.data;
    });
}

async function apiFetch(path, opts) {
  opts = opts || {};
  var key = 'pannai:' + path;

  // Force refresh always waits for network
  if (opts.force || NEVER_CACHE[path]) {
    try { return await networkFetch(path, opts.force); }
    catch (err) {
      if (_mem[path]) return _mem[path];
      var c = lsGet(key); if (c) { _mem[path] = c; return c; }
      throw err;
    }
  }

  var cached = _mem[path] || lsGet(key);
  if (cached && !_mem[path]) _mem[path] = cached;

  // No cache at all — must wait for network (first-ever load)
  if (!cached) return networkFetch(path, false);

  // Have cache → race network against timeout. Whichever finishes first wins.
  // Network keeps running after timeout to quietly refresh cache for next time.
  var net = networkFetch(path, false).catch(function() { return null; });
  return new Promise(function(resolve) {
    var settled = false;
    var timer = setTimeout(function() {
      if (settled) return;
      settled = true;
      resolve(cached);
    }, NETWORK_TIMEOUT_MS);
    net.then(function(data) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(data || cached);
    });
  });
}

// Expose so UI can trigger a silent background refresh after initial render
window.PannaiBackgroundRefresh = function(path) {
  networkFetch(path, false).catch(function() {});
};

// POST — never cached, never served stale, and given a longer timeout than
// reads because the user is waiting on a write (a cold Render dyno must not
// silently drop their post). Rejects with the server's Tamil error message.
var POST_TIMEOUT_MS = 20000;

// Any write verb. PATCH/DELETE (villager editing or removing their own post)
// need exactly the same timeout, no-cache and Tamil-error handling as POST.
function apiSend(method, path, body) {
  var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  var timer = setTimeout(function() { if (ctrl) ctrl.abort(); }, POST_TIMEOUT_MS);

  return fetch(apiUrl(path), {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
    signal: ctrl ? ctrl.signal : undefined,
  })
    .then(function(resp) {
      return resp.json()
        .catch(function() { throw new Error('சர்வர் பதில் சரியில்ல'); })
        .then(function(json) {
          // Surface the server's own message (Tamil) rather than "HTTP 429"
          if (!resp.ok || !json.success) {
            throw new Error(json.error || ('HTTP ' + resp.status));
          }
          return json.data;
        });
    })
    .catch(function(err) {
      if (err && err.name === 'AbortError') throw new Error('நெட்வொர்க் மெதுவா இருக்கு — again try பண்ணுங்க');
      throw err;
    })
    .finally(function() { clearTimeout(timer); });
}

function apiPost(path, body) { return apiSend('POST', path, body); }

var PannaiAPI = {
  // Batch: corridors + all timings in ONE request (replaces 18 round trips)
  getBusAll:       function(force) { return apiFetch('/api/bus/all', { force: force }); },
  getBusCorridors: function(force) { return apiFetch('/api/bus/corridors', { force: force }); },
  getBusTimings:   function(id, force) { return apiFetch('/api/bus/timings/' + id, { force: force }); },
  getBusNext:      function() { return apiFetch('/api/bus/next'); },
  getAutoDrivers:  function(force) { return apiFetch('/api/auto/drivers', { force: force }); },
  getAutoContact:  function() { return apiFetch('/api/auto/contact'); },
  getEmergency:    function(force) { return apiFetch('/api/emergency/contacts', { force: force }); },
  getHospitals:    function(force) { return apiFetch('/api/hospital/list', { force: force }); },
  getDoctors:      function(force) { return apiFetch('/api/hospital/doctors', { force: force }); },
  getActingDrivers:function(force) { return apiFetch('/api/acting/drivers', { force: force }); },
  getServices:     function(force) { return apiFetch('/api/services', { force: force }); },
  getAnnouncements:function(force) { return apiFetch('/api/announcements', { force: force }); },

  // ── Community Bulletin (சங்கமம்) ──
  // posterId is optional — sending it also returns THIS poster's own pending
  // posts, so an edit that re-queues a post doesn't look like it vanished.
  getBulletin:      function(deviceId, force, posterId) {
    var q = '/api/bulletin?device_id=' + encodeURIComponent(deviceId || '');
    if (posterId) q += '&poster_id=' + encodeURIComponent(posterId);
    return apiFetch(q, { force: force });
  },
  registerPoster:   function(payload) { return apiPost('/api/bulletin/register', payload); },
  submitPost:       function(payload) { return apiPost('/api/bulletin/submit', payload); },
  likePost:         function(id, deviceId) {
    return apiPost('/api/bulletin/' + id + '/like', { device_id: deviceId });
  },
  // Villager self-service. Ownership is proved with poster_id + the phone
  // given at registration; there is no login.
  editPost:         function(id, payload) { return apiSend('PATCH', '/api/bulletin/' + id, payload); },
  deletePost:       function(id, payload) { return apiSend('DELETE', '/api/bulletin/' + id, payload); },
};

window.PannaiAPI = PannaiAPI;
