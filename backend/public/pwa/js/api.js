// ── Pannaipuram PWA — API Module ─────────────────────────────
// Same origin — no CORS needed since PWA is served from the backend

const _cache = {};

async function apiFetch(path) {
  try {
    const resp = await fetch(path);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const json = await resp.json();
    if (!json.success) throw new Error(json.error || 'API error');
    _cache[path] = json.data;
    return json.data;
  } catch (err) {
    if (_cache[path]) return _cache[path]; // serve stale on error
    throw err;
  }
}

var PannaiAPI = {
  getBusCorridors: function() { return apiFetch('/api/bus/corridors'); },
  getBusTimings:   function(id) { return apiFetch('/api/bus/timings/' + id); },
  getNextBus:      function() { return apiFetch('/api/bus/next'); },
  getAutoDrivers:  function() { return apiFetch('/api/auto/drivers'); },
  getAutoContact:  function() { return apiFetch('/api/auto/contact'); },
};
