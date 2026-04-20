// ── Pannaipuram PWA — API Module ─────────────────────────────
// Three-tier cache: in-memory → localStorage → network.
// localStorage survives reloads, making the app usable offline after first load.
var _mem = {};
var CACHE_VERSION = 'pannai-v22';

function lsGet(key) {
  try { var v = localStorage.getItem(CACHE_VERSION + ':' + key); return v ? JSON.parse(v) : null; }
  catch (_) { return null; }
}

function lsSet(key, val) {
  try { localStorage.setItem(CACHE_VERSION + ':' + key, JSON.stringify(val)); } catch (_) { /* quota / private mode */ }
}

async function apiFetch(path, opts) {
  opts = opts || {};
  var key = 'pannai:' + path;
  // Force-refresh: cache-bust URL (bypasses SW cache match) + browser cache: reload
  var url = opts.force
    ? path + (path.indexOf('?') >= 0 ? '&' : '?') + '_t=' + Date.now()
    : path;
  try {
    var resp = await fetch(url, opts.force ? { cache: 'reload' } : undefined);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    var json = await resp.json();
    if (!json.success) throw new Error(json.error || 'API error');
    _mem[path] = json.data;
    lsSet(key, json.data);
    return json.data;
  } catch (err) {
    if (_mem[path]) return _mem[path];
    var cached = lsGet(key);
    if (cached) { _mem[path] = cached; return cached; }
    throw err;
  }
}

var PannaiAPI = {
  getBusCorridors: function(force) { return apiFetch('/api/bus/corridors', { force: force }); },
  getBusTimings:   function(id, force) { return apiFetch('/api/bus/timings/' + id, { force: force }); },
  getBusNext:      function() { return apiFetch('/api/bus/next'); },
  getAutoDrivers:  function(force) { return apiFetch('/api/auto/drivers', { force: force }); },
  getAutoContact:  function() { return apiFetch('/api/auto/contact'); },
};
