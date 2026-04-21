// ── Pannaipuram PWA — API Module ─────────────────────────────
// Three-tier cache: in-memory → localStorage → network.
// localStorage survives reloads, making the app usable offline after first load.
var _mem = {};
var CACHE_VERSION = 'pannai-v35';

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
  var url = force
    ? path + (path.indexOf('?') >= 0 ? '&' : '?') + '_t=' + Date.now()
    : path;
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

var PannaiAPI = {
  getBusCorridors: function(force) { return apiFetch('/api/bus/corridors', { force: force }); },
  getBusTimings:   function(id, force) { return apiFetch('/api/bus/timings/' + id, { force: force }); },
  getBusNext:      function() { return apiFetch('/api/bus/next'); },
  getAutoDrivers:  function(force) { return apiFetch('/api/auto/drivers', { force: force }); },
  getAutoContact:  function() { return apiFetch('/api/auto/contact'); },
};
