// ── Bus Section Controller ─────────────────────────────────
var Bus = (function() {

  // Per-corridor metadata — colours + emoji match the Flutter APK exactly
  var CORRIDOR_META = {
    'theni':              { emoji: '🏙️', color: '#1565C0', isLocal: true,  isFrequent: true,  routeDesc: 'பண்ணைப்புரம் → சங்கராபுரம் → தேவாரம் → தேனி' },
    'bodi':               { emoji: '🌄', color: '#0288D1', isLocal: true,  isFrequent: true,  routeDesc: 'பண்ணைப்புரம் → சங்கராபுரம் → தேவாரம் → போடி' },
    'cumbum':             { emoji: '🍇', color: '#388E3C', isLocal: true,  isFrequent: true,  routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கம்பம்' },
    'chinnamanur':        { emoji: '🛕', color: '#FF6F00', isLocal: true,  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → பல்லவராயன்பட்டி → சின்னமனூர்' },
    'gudalur (koodalur)': { emoji: '🌲', color: '#33691E', isLocal: true,  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → கம்பம் → கூடலூர்' },
    'mettupalayam':       { emoji: '🏘️', color: '#F57C00', isLocal: true,  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → மேட்டுப்பாளையம்' },
    'suruli theertham':   { emoji: '💧', color: '#0277BD', isLocal: true,  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → சுருளி தீர்த்தம்' },
    'thevaram':           { emoji: '🛤️', color: '#546E7A', isLocal: true,  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம்' },
    'madurai':            { emoji: '🏛️', color: '#6A1B9A', isLocal: false, isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → மதுரை' },
    'coimbatore':         { emoji: '🏭', color: '#00695C', isLocal: false, isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கோயம்புத்தூர்' },
    'trichy':             { emoji: '🗼', color: '#C62828', isLocal: false, isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல் → திருச்சி' },
    'palani':             { emoji: '🙏', color: '#E65100', isLocal: false, isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → பழனி' },
    'kumily':             { emoji: '🌿', color: '#2E7D32', isLocal: false, isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → போடி → குமுளி' },
    'dindigul':           { emoji: '🏰', color: '#4E342E', isLocal: false, isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல்' },
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

  // 24h "18:05" → 12h "6:05" with leading-zero minutes
  function fmt12(t) {
    var p = t.split(':').map(Number);
    var h = p[0], m = p[1];
    var h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return h12 + ':' + (m < 10 ? '0' + m : m);
  }

  // "6:05 மாலை" (12h + Tamil period)
  function fmtPeriod(t) {
    var h = parseInt(t.split(':')[0]);
    var period;
    if (h < 5)       period = 'இரவு';
    else if (h < 12) period = 'காலை';
    else if (h < 17) period = 'பகல்';
    else if (h < 20) period = 'மாலை';
    else             period = 'இரவு';
    return fmt12(t) + ' ' + period;
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
  function pillColor(mins) {
    return mins <= 10 ? '#D32F2F' : mins <= 40 ? '#2E7D32' : '#757575';
  }

  function minsLabel(mins) {
    if (mins < 60) return mins + ' நிமிடம்';
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    return m === 0 ? h + ' மணி' : h + 'மணி ' + m + 'நிமி';
  }

  function renderBadge(meta, timings, corridorId) {
    if (meta.isFrequent) {
      return '<div class="route-badge badge-frequent" style="color:' + meta.color + '">' +
        '<span class="badge-freq-icon">↻</span>' +
        '<span class="badge-freq-mins">20–30</span>' +
        '<span class="badge-freq-unit">நிமிடம்</span>' +
      '</div>';
    }
    if (!timings) {
      return '<div class="route-badge badge-loading" data-badge-id="' + corridorId + '">…</div>';
    }
    if (!timings.length) {
      return '<div class="route-badge badge-nodata">🕐<span>விரைவில்</span></div>';
    }
    var next = computeNextBus(timings);
    if (!next) {
      return '<div class="route-badge badge-done">🌙<span>இன்று</span><span>முடிந்தது</span></div>';
    }
    var mins = next.totalMins - nowMins();
    return '<div class="route-badge badge-next" style="color:' + meta.color + '" data-badge-id="' + corridorId + '">' +
      '<span class="badge-next-time">' + fmtPeriod(next.departs_at) + '</span>' +
      '<span class="badge-next-pill" style="background:' + pillColor(mins) + '">' + minsLabel(mins) + '</span>' +
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
        (meta.routeDesc ? '<span class="route-desc">' + meta.routeDesc + '</span>' : '') +
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

  // Scroll the expanded card into comfortable view
  function scrollCardIntoView(id) {
    var card = document.querySelector('.route-card[data-id="' + id + '"]');
    if (!card) return;
    var rect = card.getBoundingClientRect();
    var desired = 100; // px from top
    if (rect.top < desired || rect.top > window.innerHeight * 0.5) {
      window.scrollBy({ top: rect.top - desired, behavior: 'smooth' });
    }
  }

  // ── Timetable expand ──────────────────────────────────────────
  async function handleCardTap(id) {
    if (expandedId === id) {
      expandedId = null;
      var el = document.getElementById('tt-' + id);
      if (el) el.hidden = true;
      var prevCard = document.querySelector('.route-card[data-id="' + id + '"]');
      if (prevCard) prevCard.classList.remove('expanded');
      return;
    }
    // Close previous
    if (expandedId !== null) {
      var prev = document.getElementById('tt-' + expandedId);
      if (prev) prev.hidden = true;
      var oldCard = document.querySelector('.route-card[data-id="' + expandedId + '"]');
      if (oldCard) oldCard.classList.remove('expanded');
    }
    expandedId = id;

    var ttEl = document.getElementById('tt-' + id);
    if (!ttEl) return;
    ttEl.hidden = false;
    var card = document.querySelector('.route-card[data-id="' + id + '"]');
    if (card) card.classList.add('expanded');

    if (timingsCache[id] === undefined) {
      ttEl.innerHTML = '<div class="tt-loading"><div class="skeleton" style="height:48px;margin:8px 16px;border-radius:8px"></div></div>';
      try {
        timingsCache[id] = await PannaiAPI.getBusTimings(id);
      } catch(e) {
        timingsCache[id] = [];
      }
      renderList();
      var reCard = document.querySelector('.route-card[data-id="' + id + '"]');
      if (reCard) reCard.classList.add('expanded');
    } else {
      renderTimetable(id);
    }
    setTimeout(function() { scrollCardIntoView(id); }, 60);
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
        el.outerHTML = '<div class="route-badge badge-done">🌙<span>இன்று</span><span>முடிந்தது</span></div>';
        return;
      }
      var mins = next.totalMins - nowMins();
      var timeEl = el.querySelector('.badge-next-time');
      var pillEl = el.querySelector('.badge-next-pill');
      if (timeEl) timeEl.textContent = fmtPeriod(next.departs_at);
      if (pillEl) { pillEl.textContent = minsLabel(mins); pillEl.style.background = pillColor(mins); }
    });
  }

  // ── Init ───────────────────────────────────────────────────────
  var loadFailed = false;

  async function loadCorridors() {
    var container = document.getElementById('bus-route-list');
    container.innerHTML =
      '<div class="skeleton-list">' +
      '<div class="skeleton" style="height:92px;border-radius:16px;margin:0 16px 10px"></div>' +
      '<div class="skeleton" style="height:92px;border-radius:16px;margin:0 16px 10px"></div>' +
      '<div class="skeleton" style="height:92px;border-radius:16px;margin:0 16px 10px"></div>' +
      '</div>';
    try {
      corridors = await PannaiAPI.getBusCorridors();
      loadFailed = false;
    } catch(e) {
      corridors = [];
      loadFailed = true;
    }
    if (loadFailed && !corridors.length) {
      container.innerHTML =
        '<div class="load-error">' +
        '<div class="load-error-icon">📡</div>' +
        '<p class="load-error-ta">தகவல் கிடைக்கவில்லை</p>' +
        '<p class="load-error-en">Could not load bus routes. Please check your connection.</p>' +
        '<button class="retry-btn" id="bus-retry-btn">மீண்டும் முயற்சிக்க</button>' +
        '</div>';
      var btn = document.getElementById('bus-retry-btn');
      if (btn) btn.addEventListener('click', loadCorridors);
      return;
    }
    renderList();
  }

  async function init() {
    await loadCorridors();
    clearInterval(badgeTimer);
    badgeTimer = setInterval(updateBadges, 60000);
  }

  return { init: init };
})();
