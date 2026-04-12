// ── Bus Section Controller ─────────────────────────────────
var Bus = (function() {

  // Per-corridor metadata — colours + emoji match the Flutter APK exactly
  var CORRIDOR_META = {
    'theni':              { emoji: '🏙️', color: '#1565C0', isLocal: true,  isFrequent: true  },
    'bodi':               { emoji: '🌄', color: '#0288D1', isLocal: true,  isFrequent: true  },
    'cumbum':             { emoji: '🍇', color: '#388E3C', isLocal: true,  isFrequent: true  },
    'chinnamanur':        { emoji: '🛕', color: '#FF6F00', isLocal: true,  isFrequent: false },
    'gudalur (koodalur)': { emoji: '🌲', color: '#33691E', isLocal: true,  isFrequent: false },
    'mettupalayam':       { emoji: '🏘️', color: '#F57C00', isLocal: true,  isFrequent: false },
    'suruli theertham':   { emoji: '💧', color: '#0277BD', isLocal: true,  isFrequent: false },
    'thevaram':           { emoji: '🛤️', color: '#546E7A', isLocal: true,  isFrequent: false },
    'madurai':            { emoji: '🏛️', color: '#6A1B9A', isLocal: false, isFrequent: false },
    'coimbatore':         { emoji: '🏭', color: '#00695C', isLocal: false, isFrequent: false },
    'trichy':             { emoji: '🗼', color: '#C62828', isLocal: false, isFrequent: false },
    'palani':             { emoji: '🙏', color: '#E65100', isLocal: false, isFrequent: false },
    'kumily':             { emoji: '🌿', color: '#2E7D32', isLocal: false, isFrequent: false },
    'dindigul':           { emoji: '🏰', color: '#4E342E', isLocal: false, isFrequent: false },
  };

  var corridors = [];
  var timingsCache = {};   // id → BusTiming[]
  var expandedId = null;
  var badgeTimer = null;

  function getMeta(nameEnglish) {
    return CORRIDOR_META[(nameEnglish || '').toLowerCase()] ||
      { emoji: '🚌', color: '#E65100', isLocal: false, isFrequent: false };
  }

  function nowMins() {
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function fmt(t) {
    var p = t.split(':');
    return parseInt(p[0]) + ':' + p[1];
  }

  function fmtPeriod(t) {
    var h = parseInt(t.split(':')[0]);
    if (h < 5)  return fmt(t) + ' இரவு';
    if (h < 12) return fmt(t) + ' காலை';
    if (h < 17) return fmt(t) + ' பகல்';
    if (h < 20) return fmt(t) + ' மாலை';
    return fmt(t) + ' இரவு';
  }

  function computeNextBus(timings) {
    var cur = nowMins();
    var upcoming = (timings || [])
      .map(function(t) {
        var p = t.departs_at.split(':').map(Number);
        return Object.assign({}, t, { totalMins: p[0] * 60 + p[1] });
      })
      .filter(function(t) { return t.totalMins > cur; })
      .sort(function(a, b) { return a.totalMins - b.totalMins; });
    return upcoming[0] || null;
  }

  // ── Badge (right side of each card) ───────────────────────────
  function renderBadge(meta, timings, corridorId) {
    if (meta.isFrequent) {
      return '<div class="route-badge badge-frequent" style="color:' + meta.color + '">' +
        '<span class="badge-freq-icon">↻</span>' +
        '<span class="badge-freq-mins">20–30</span>' +
        '<span class="badge-freq-unit">நிமிடம்</span>' +
      '</div>';
    }
    if (!timings) {
      // Timings not loaded yet — show loading dots
      return '<div class="route-badge badge-loading" data-badge-id="' + corridorId + '">…</div>';
    }
    if (!timings.length) {
      return '<div class="route-badge badge-nodata">—</div>';
    }
    var next = computeNextBus(timings);
    if (!next) {
      return '<div class="route-badge badge-done">✓<span>Done</span></div>';
    }
    var mins = next.totalMins - nowMins();
    return '<div class="route-badge badge-next" style="color:' + meta.color + '" data-badge-id="' + corridorId + '">' +
      '<span class="badge-next-mins">' + mins + '</span>' +
      '<span class="badge-next-unit">நிமிடம்</span>' +
    '</div>';
  }

  // ── Single route card HTML ─────────────────────────────────────
  function renderCardHtml(c) {
    var meta = getMeta(c.name_english);
    var timings = timingsCache[c.id] !== undefined ? timingsCache[c.id] : null;
    var noMore = !meta.isFrequent && timings && timings.length > 0 && !computeNextBus(timings);
    var railColor = noMore ? '#E0E0E0' : meta.color;
    var circleAlpha = noMore ? 'rgba(0,0,0,0.05)' : meta.color + '1A'; // 10% opacity
    var nameClass = noMore ? 'route-name-ta dimmed' : 'route-name-ta';

    var busCount = meta.isFrequent ? 'Frequent service'
      : timings && timings.length ? timings.length + ' buses/day'
      : '';

    return '<div class="route-card" data-id="' + c.id + '" role="button">' +
      '<div class="route-rail" style="background:' + railColor + '"></div>' +
      '<div class="route-emoji-circle" style="background:' + meta.color + '1A">' + meta.emoji + '</div>' +
      '<div class="route-info">' +
        '<span class="' + nameClass + '">' + c.name_tamil + '</span>' +
        '<span class="route-name-en">' + c.name_english + '</span>' +
        (busCount ? '<span class="route-buses">🚌 ' + busCount + '</span>' : '') +
      '</div>' +
      renderBadge(meta, timings, c.id) +
    '</div>' +
    '<div class="route-timetable" id="tt-' + c.id + '"' + (expandedId === c.id ? '' : ' hidden') + '></div>';
  }

  // ── Full list render ───────────────────────────────────────────
  function renderList() {
    var container = document.getElementById('bus-route-list');
    if (!corridors.length) {
      container.innerHTML = '<p class="bus-empty">பேருந்து தகவல் விரைவில்...<span>Bus data coming soon</span></p>';
      return;
    }

    var local = corridors.filter(function(c) { return getMeta(c.name_english).isLocal; });
    var longDist = corridors.filter(function(c) { return !getMeta(c.name_english).isLocal; });

    var html = '';
    if (local.length) {
      html += '<div class="section-chip">' +
        '<span class="chip-icon">🏠</span>' +
        '<span class="chip-ta">உள்ளூர் பயணம்</span>' +
        '<span class="chip-en">Local Routes</span>' +
      '</div>';
      html += local.map(renderCardHtml).join('');
    }
    if (longDist.length) {
      html += '<div class="section-chip">' +
        '<span class="chip-icon">🗺️</span>' +
        '<span class="chip-ta">தூர பயணம்</span>' +
        '<span class="chip-en">Long Distance</span>' +
      '</div>';
      html += longDist.map(renderCardHtml).join('');
    }

    container.innerHTML = html;

    // Re-open expanded card timetable
    if (expandedId !== null && timingsCache[expandedId] !== undefined) {
      renderTimetable(expandedId);
    }

    // Attach click listeners
    container.querySelectorAll('.route-card').forEach(function(card) {
      card.addEventListener('click', function() {
        handleCardTap(parseInt(card.dataset.id));
      });
    });
  }

  // ── Timetable expand ──────────────────────────────────────────
  async function handleCardTap(id) {
    if (expandedId === id) {
      expandedId = null;
      var el = document.getElementById('tt-' + id);
      if (el) el.hidden = true;
      return;
    }
    // Close previous
    if (expandedId !== null) {
      var prev = document.getElementById('tt-' + expandedId);
      if (prev) prev.hidden = true;
    }
    expandedId = id;

    var ttEl = document.getElementById('tt-' + id);
    if (!ttEl) return;
    ttEl.hidden = false;

    if (timingsCache[id] === undefined) {
      ttEl.innerHTML = '<div class="tt-loading"><div class="skeleton" style="height:48px;margin:8px 16px;border-radius:8px"></div></div>';
      try {
        timingsCache[id] = await PannaiAPI.getBusTimings(id);
      } catch(e) {
        timingsCache[id] = [];
      }
      renderList(); // re-render badges with loaded data
    } else {
      renderTimetable(id);
    }
  }

  function renderTimetable(id) {
    var el = document.getElementById('tt-' + id);
    if (!el) return;
    el.hidden = false;
    var timings = timingsCache[id] || [];
    if (!timings.length) {
      el.innerHTML = '<p class="tt-empty">இந்த வழியில் தகவல் விரைவில் சேர்க்கப்படும்</p>';
      return;
    }
    var cur = nowMins();
    var next = computeNextBus(timings);
    var sorted = timings.slice().sort(function(a, b) { return a.departs_at.localeCompare(b.departs_at); });
    var c = corridors.find(function(c) { return c.id === id; });
    var meta = c ? getMeta(c.name_english) : { color: '#E65100' };

    el.innerHTML = '<div class="tt-list">' + sorted.map(function(t) {
      var p = t.departs_at.split(':').map(Number);
      var totalMins = p[0] * 60 + p[1];
      var isPassed = totalMins <= cur;
      var isNext = next && t.id === next.id;
      var cls = 'tt-row' + (isPassed ? ' passed' : '') + (isNext ? ' is-next' : '');
      var style = isNext ? ' style="border-left-color:' + meta.color + '"' : '';

      var badge = '';
      if (t.is_last_bus) badge = '<span class="tt-badge badge-last">கடைசி பஸ்</span>';
      else if (t.operator_name) badge = '<span class="tt-badge badge-private">' + t.operator_name + '</span>';
      else if (t.bus_type && t.bus_type !== 'ordinary') badge = '<span class="tt-badge badge-' + t.bus_type + '">' + t.bus_type.toUpperCase() + '</span>';

      return '<div class="' + cls + '"' + style + '>' +
        '<span class="tt-time">' + fmtPeriod(t.departs_at) + '</span>' +
        badge +
        (t.dest_tamil ? '<span class="tt-dest">→ ' + t.dest_tamil + '</span>' : '') +
      '</div>';
    }).join('') + '</div>';
  }

  // ── Live badge update (every 60s) ──────────────────────────────
  function updateBadges() {
    document.querySelectorAll('.route-badge[data-badge-id]').forEach(function(el) {
      var id = parseInt(el.dataset.badgeId);
      var c = corridors.find(function(c) { return c.id === id; });
      if (!c) return;
      var meta = getMeta(c.name_english);
      var timings = timingsCache[id];
      if (!timings) return;
      var next = computeNextBus(timings);
      if (!next) {
        el.outerHTML = '<div class="route-badge badge-done">✓<span>Done</span></div>';
        return;
      }
      var mins = next.totalMins - nowMins();
      el.querySelector('.badge-next-mins').textContent = mins;
    });
  }

  // ── Init ───────────────────────────────────────────────────────
  async function init() {
    var container = document.getElementById('bus-route-list');
    container.innerHTML =
      '<div class="skeleton-list">' +
      '<div class="skeleton" style="height:74px;border-radius:16px;margin:0 16px 10px"></div>' +
      '<div class="skeleton" style="height:74px;border-radius:16px;margin:0 16px 10px"></div>' +
      '<div class="skeleton" style="height:74px;border-radius:16px;margin:0 16px 10px"></div>' +
      '</div>';
    try {
      corridors = await PannaiAPI.getBusCorridors();
    } catch(e) {
      corridors = [];
    }
    renderList();
    clearInterval(badgeTimer);
    badgeTimer = setInterval(updateBadges, 60000);
  }

  return { init: init };
})();
