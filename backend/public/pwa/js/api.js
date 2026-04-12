// ── Pannaipuram PWA — API Module ─────────────────────────────
var _cache = {};

async function apiFetch(path) {
  try {
    var resp = await fetch(path);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    var json = await resp.json();
    if (!json.success) throw new Error(json.error || 'API error');
    _cache[path] = json.data;
    return json.data;
  } catch (err) {
    if (_cache[path]) return _cache[path];
    throw err;
  }
}

var PannaiAPI = {
  getBusCorridors: function() { return apiFetch('/api/bus/corridors'); },
  getBusTimings:   function(id) { return apiFetch('/api/bus/timings/' + id); },
  getBusNext:      function() { return apiFetch('/api/bus/next'); },
  getAutoDrivers:  function() { return apiFetch('/api/auto/drivers'); },
  getAutoContact:  function() { return apiFetch('/api/auto/contact'); },
};
