// ── Bus Section Controller ─────────────────────────────────
var Bus = (function() {

  // Per-corridor metadata — colours + emoji match the Flutter APK exactly.
  // group: 'local' | 'long' | 'night'
  var CORRIDOR_META = {
    'theni':              { emoji: '🏙️', color: '#1565C0', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → சங்கராபுரம் → தேவாரம் → தேனி' },
    'bodi':               { emoji: '🌄', color: '#0288D1', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → சங்கராபுரம் → தேவாரம் → போடி' },
    'cumbum':             { emoji: '🍇', color: '#388E3C', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கம்பம்' },
    'chinnamanur':        { emoji: '🛕', color: '#FF6F00', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → பல்லவராயன்பட்டி → சின்னமனூர்' },
    'gudalur (koodalur)': { emoji: '🌲', color: '#33691E', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → கம்பம் → கூடலூர்' },
    'mettupalayam':       { emoji: '🏘️', color: '#F57C00', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → மேட்டுப்பாளையம்' },
    'suruli theertham':   { emoji: '💧', color: '#0277BD', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → சுருளி தீர்த்தம்' },
    'thevaram':           { emoji: '🛤️', color: '#546E7A', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம்' },
    'periyakulam':        { emoji: '🌾', color: '#558B2F', group: 'local', isFrequent: false, nameTamil: 'பெரியகுளம்', routeDesc: 'பண்ணைப்புரம் → தேனி → பெரியகுளம்' },
    'uthamapalayam':      { emoji: '🏪', color: '#AD1457', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம்' },
    'madurai':            { emoji: '🏛️', color: '#6A1B9A', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → மதுரை' },
    'coimbatore':         { emoji: '🏭', color: '#00695C', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கோயம்புத்தூர்' },
    'trichy':             { emoji: '🗼', color: '#C62828', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல் → திருச்சி' },
    'palani':             { emoji: '🙏', color: '#E65100', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → பழனி' },
    'kumily':             { emoji: '🌿', color: '#2E7D32', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → போடி → குமுளி' },
    'dindigul':           { emoji: '🏰', color: '#4E342E', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல்' },
    'chennai':            { emoji: '🌃', color: '#E64A19', group: 'night', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → மதுரை → சென்னை' },
  };

  var GROUPS = [
    { key: 'local', emoji: '🏠', ta: 'உள்ளூர் பயணம்',  en: 'Local Routes',         hint: 'தேனி, போடி, கம்பம், உத்தமபாளையம், தேவாரம், சின்னமனூர், பெரியகுளம், சுருளி, குமுளி, கூடலூர்' },
    { key: 'long',  emoji: '🗺️', ta: 'தூர பயணம்',     en: 'Long Distance',        hint: 'மதுரை, கோயம்புத்தூர், திருச்சி, பழனி, திண்டுக்கல், மேட்டுப்பாளையம்' },
    { key: 'night', emoji: '🌃', ta: 'சென்னை இரவு சேவை', en: 'Chennai Overnight',   hint: 'இரவு பஸ் சேவை — Subam, Geetham, KPN' },
  ];

  var corridors = [];
  var timingsCache = {};    // id → BusTiming[]
  var expandedId = null;
  var expandedFull = {};    // id → true when "View all" clicked
  var openGroups = { local: false, long: false, night: false };
  var badgeTimer = null;

  function getMeta(nameEnglish) {
    return CORRIDOR_META[(nameEnglish || '').toLowerCase()] ||
      { emoji: '🚌', color: '#E65100', group: 'long', isFrequent: false };
  }

  function nowMins() {
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function fmt12(t) {
    var p = t.split(':').map(Number);
    var h = p[0], m = p[1];
    var h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return h12 + ':' + (m < 10 ? '0' + m : m);
  }

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
    var nameClass = noMore ? 'route-name-ta dimmed' : 'route-name-ta';

    var busCount = meta.isFrequent ? 'Frequent service'
      : timings && timings.length ? timings.length + ' buses/day'
      : '';

    var displayNameTamil = meta.nameTamil || c.name_tamil;
    return '<div class="route-card" data-id="' + c.id + '" role="button">' +
      '<div class="route-rail" style="background:' + railColor + '"></div>' +
      '<div class="route-emoji-circle" style="background:' + meta.color + '1A">' + meta.emoji + '</div>' +
      '<div class="route-info">' +
        '<span class="' + nameClass + '">' + displayNameTamil + '</span>' +
        '<span class="route-name-en">' + c.name_english + '</span>' +
        (meta.routeDesc ? '<span class="route-desc">' + meta.routeDesc + '</span>' : '') +
        (busCount ? '<span class="route-buses">🚌 ' + busCount + '</span>' : '') +
      '</div>' +
      renderBadge(meta, timings, c.id) +
    '</div>' +
    '<div class="route-timetable" id="tt-' + c.id + '"' + (expandedId === c.id ? '' : ' hidden') + '></div>';
  }

  // ── Collapsible group header + contents ────────────────────────
  function renderGroupHtml(group, items) {
    var count = items.length;
    var frequent = items.filter(function(c){ return getMeta(c.name_english).isFrequent; }).length;
    var isOpen = !!openGroups[group.key];
    var countLabel = count + ' routes';

    var html = '<div class="group-card" data-group="' + group.key + '">' +
      '<div class="group-header" data-toggle-group="' + group.key + '" role="button">' +
        '<div class="group-icon">' + group.emoji + '</div>' +
        '<div class="group-text">' +
          '<div class="group-title"><span class="group-ta">' + group.ta + '</span><span class="group-en">' + group.en + '</span></div>' +
          '<div class="group-hint">' + group.hint + '</div>' +
          '<div class="group-count">📍 ' + countLabel + '</div>' +
        '</div>' +
        '<div class="group-caret ' + (isOpen ? 'open' : '') + '">▸</div>' +
      '</div>' +
      '<div class="group-body" ' + (isOpen ? '' : 'hidden') + '>' +
        items.map(renderCardHtml).join('') +
      '</div>' +
    '</div>';
    return html;
  }

  // ── Full list render ───────────────────────────────────────────
  function renderList() {
    var container = document.getElementById('bus-route-list');
    if (!corridors.length) {
      container.innerHTML = '<p class="bus-empty">பேருந்து தகவல் விரைவில்...<span>Bus data coming soon</span></p>';
      return;
    }

    var html = GROUPS.map(function(g) {
      var items = corridors.filter(function(c) { return getMeta(c.name_english).group === g.key; });
      if (!items.length) return '';
      return renderGroupHtml(g, items);
    }).join('');

    container.innerHTML = html;

    // Re-open expanded card timetable
    if (expandedId !== null && timingsCache[expandedId] !== undefined) {
      renderTimetable(expandedId);
    }

    // Group toggle
    container.querySelectorAll('[data-toggle-group]').forEach(function(h) {
      h.addEventListener('click', function() {
        var key = h.dataset.toggleGroup;
        openGroups[key] = !openGroups[key];
        renderList();
        // Prefetch timings when first opened so badges populate
        if (openGroups[key]) prefetchGroupTimings(key);
      });
    });

    // Card click
    container.querySelectorAll('.route-card').forEach(function(card) {
      card.addEventListener('click', function() {
        handleCardTap(parseInt(card.dataset.id));
      });
    });
  }

  // Prefetch timings for all corridors in a group (for badges)
  async function prefetchGroupTimings(groupKey) {
    var items = corridors.filter(function(c) { return getMeta(c.name_english).group === groupKey; });
    await Promise.all(items.map(function(c) {
      if (timingsCache[c.id] !== undefined) return Promise.resolve();
      return PannaiAPI.getBusTimings(c.id)
        .then(function(t) { timingsCache[c.id] = t; })
        .catch(function() { timingsCache[c.id] = []; });
    }));
    // Re-render to refresh badges
    renderList();
  }

  function scrollCardIntoView(id) {
    var card = document.querySelector('.route-card[data-id="' + id + '"]');
    if (!card) return;
    var rect = card.getBoundingClientRect();
    var desired = 100;
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

  // ── Bus type meta ─────────────────────────────────────────────
  // Returns { cls, icon, label, sub }
  // For private: show operator name only — the 🚍 icon communicates "private".
  // For Town/Mofussil: bilingual label.
  function busTypeMeta(t) {
    var op = (t.operator_name || '').trim();
    var opLower = op.toLowerCase();
    if (t.bus_type === 'private' || opLower.indexOf('private') !== -1) {
      // Clean trailing "Private Bus" or "Private" from operator name
      var cleaned = op.replace(/\s*(Private\s*Bus|Private)$/i, '').trim();
      return { cls: 'private', icon: '🚍', label: cleaned || 'தனியார்', sub: '' };
    }
    if (t.bus_type === 'express')  return { cls: 'express',  icon: '🚌', label: 'மொஃபசல்', sub: 'Mofussil' };
    if (t.bus_type === 'ordinary') return { cls: 'ordinary', icon: '🚐', label: 'டவுன் பஸ்', sub: 'Town Bus' };
    return { cls: 'ordinary', icon: '🚌', label: '', sub: '' };
  }

  // ── Route connection suggestions ───────────────────────────────
  // When user faces a long gap, suggest connecting routes.
  // Based on: Route 1 (Thevaram/Sankarapuram): Theni, Bodi, Periyakulam
  //           Route 2 (Kombai/Palayam): Kambam, Kumily, Theni-via-Palayam
  var ROUTE_ALTS = {
    'theni': [
      { key: 'cumbum',  ta: 'கம்பம் பஸ் → பாலையம்ல இறங்கி தேனி பஸ் பிடிக்கலாம்',  en: 'Take Kambam bus → alight at Palayam junction' },
      { key: 'kumily',  ta: 'குமுளி பஸ் → பாலையம்ல இறங்கி தேனி பஸ் பிடிக்கலாம்', en: 'Take Kumily bus → alight at Palayam junction' },
    ],
    'periyakulam': [
      { key: 'theni',   ta: 'தேனி பஸ் → தேனியில் இறங்கி பெரியகுளம் பஸ் பிடிக்கலாம்', en: 'Take Theni bus → connect at Theni' },
      { key: 'cumbum',  ta: 'கம்பம் பஸ் → பாலையம்ல இறங்கி தேனி திசையில் போகலாம்',   en: 'Take Kambam bus → Palayam towards Theni/Periyakulam' },
    ],
    'bodi': [
      { key: 'theni',   ta: 'தேனி பஸ் → தேவாரம்ல இறங்கி போடி பஸ் பிடிக்கலாம்', en: 'Take Theni bus → alight Thevaram, catch Bodi bus' },
      { key: 'kumily',  ta: 'குமுளி பஸ் → போடி வரை போகலாம்',                   en: 'Kumily bus passes through Bodi' },
    ],
    'kumily': [
      { key: 'cumbum',  ta: 'கம்பம் பஸ் → கம்பம்ல இறங்கி குமுளி பஸ் பிடிக்கலாம்', en: 'Take Kambam bus → connect at Kambam' },
      { key: 'bodi',    ta: 'போடி பஸ் → போடியில் இறங்கி குமுளி பஸ் பிடிக்கலாம்',   en: 'Take Bodi bus → connect at Bodi' },
    ],
    'cumbum': [
      { key: 'kumily',  ta: 'குமுளி பஸ் → கம்பம் வரை போகலாம்', en: 'Kumily bus also goes to Kambam' },
    ],
    'gudalur (koodalur)': [
      { key: 'cumbum',  ta: 'கம்பம் பஸ் → கம்பம்ல இறங்கி கூடலூர் பஸ் பிடிக்கலாம்', en: 'Take Kambam bus → connect at Kambam for Gudalur' },
    ],
  };

  // Get suggestions when there's a gap — only for alts that have a bus within the gap
  function getAltSuggestions(corridorKey, gapEndsAtMin) {
    var alts = ROUTE_ALTS[corridorKey] || [];
    return alts.filter(function(alt) {
      // Look up the alt corridor by name_english key
      var altCorridor = corridors.find(function(c) { return (c.name_english || '').toLowerCase() === alt.key; });
      if (!altCorridor) return false;
      var altTimings = timingsCache[altCorridor.id];
      if (!altTimings || !altTimings.length) return true; // show anyway if not loaded yet
      // Check if alt has a bus between now and gap end
      var cur = nowMins();
      return altTimings.some(function(t) {
        var p = t.departs_at.split(':').map(Number);
        var m = p[0] * 60 + p[1];
        return m > cur && m < gapEndsAtMin;
      });
    });
  }

  function altSuggestionHtml(alt) {
    return '<div class="tt-alt">' +
      '<div class="tt-alt-icon">🔀</div>' +
      '<div class="tt-alt-body">' +
        '<div class="tt-alt-ta">' + alt.ta + '</div>' +
        '<div class="tt-alt-en">' + alt.en + '</div>' +
      '</div>' +
    '</div>';
  }

  // Hide dest if it matches / contains the corridor name (redundant)
  function shouldShowDest(destTa, corridorNameTa) {
    if (!destTa) return false;
    if (!corridorNameTa) return true;
    return destTa.indexOf(corridorNameTa) === -1 && corridorNameTa.indexOf(destTa) === -1;
  }

  function ttRowHtml(t, cur, nextId, meta, corridorNameTa) {
    var p = t.departs_at.split(':').map(Number);
    var totalMins = p[0] * 60 + p[1];
    var isPassed = totalMins <= cur;
    var isNext = nextId && t.id === nextId;
    var bt = busTypeMeta(t);
    var cls = 'tt-row tt-' + bt.cls + (isPassed ? ' passed' : '') + (isNext ? ' is-next' : '');
    var style = isNext ? ' style="border-left-color:' + meta.color + '"' : '';

    var tags = '';
    if (bt.label) {
      var badgeTxt = bt.icon + ' ' + bt.label;
      // Only add English sub if there's one AND the label isn't already bilingual
      if (bt.sub) badgeTxt += ' <span class="tt-badge-sub">· ' + bt.sub + '</span>';
      tags += '<span class="tt-badge badge-' + bt.cls + '">' + badgeTxt + '</span>';
    }
    if (isPassed) tags += '<span class="tt-badge badge-passed">கடந்தது</span>';
    if (t.is_last_bus) tags += '<span class="tt-badge badge-last">🌙 கடைசி</span>';

    var dest = shouldShowDest(t.dest_tamil, corridorNameTa)
      ? '<span class="tt-dest">→ ' + t.dest_tamil + '</span>'
      : '';

    return '<div class="' + cls + '"' + style + '>' +
      '<div class="tt-icon"><span>' + bt.icon + '</span></div>' +
      '<div class="tt-row-main">' +
        '<div class="tt-time-line">' +
          '<span class="tt-time">' + fmtPeriod(t.departs_at) + '</span>' +
          dest +
        '</div>' +
        (tags ? '<div class="tt-tags">' + tags + '</div>' : '') +
      '</div>' +
    '</div>';
  }

  function gapBandHtml(gapMins) {
    var h = Math.floor(gapMins / 60);
    var m = gapMins % 60;
    var parts = [];
    if (h) parts.push(h + ' மணி');
    if (m) parts.push(m + ' நிமிடம்');
    var dur = parts.join(' ');
    return '<div class="tt-gap">' +
      '<span class="tt-gap-icon">⚠️</span>' +
      '<div class="tt-gap-text">' +
        '<span class="tt-gap-ta">' + dur + ' இடைவெளி — இப்போ போகாதீங்க</span>' +
        '<span class="tt-gap-en">Long wait · No buses for ' + dur + '</span>' +
      '</div>' +
    '</div>';
  }

  // APK-style "⏱ அடுத்த பேருந்து" header card
  function nextBusHeaderHtml(next, meta) {
    if (!next) {
      return '<div class="tt-next-header tt-next-done">' +
        '<div class="tt-next-icon">🌙</div>' +
        '<div class="tt-next-body">' +
          '<div class="tt-next-title">இன்று பேருந்து இல்லை</div>' +
          '<div class="tt-next-sub">No more buses today · நாளை காலை வாங்க</div>' +
        '</div>' +
      '</div>';
    }
    var cur = nowMins();
    var mins = next.totalMins - cur;
    return '<div class="tt-next-header" style="background:' + meta.color + '14;border-color:' + meta.color + '33">' +
      '<div class="tt-next-icon" style="color:' + meta.color + '">⏱</div>' +
      '<div class="tt-next-body">' +
        '<div class="tt-next-title">அடுத்த பேருந்து</div>' +
        '<div class="tt-next-sub">Next bus · Pannaipuram stop</div>' +
        '<div class="tt-next-time" style="color:' + meta.color + '">' + fmtPeriod(next.departs_at) + '</div>' +
      '</div>' +
      '<div class="tt-next-pill" style="background:' + meta.color + '">' +
        '<div class="tt-next-mins">' + minsLabel(mins) + '</div>' +
      '</div>' +
    '</div>';
  }

  var GAP_THRESHOLD = 90; // minutes

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
    var sorted = timings.slice()
      .map(function(t){ var p=t.departs_at.split(':').map(Number); return Object.assign({},t,{totalMins:p[0]*60+p[1]});})
      .sort(function(a, b) { return a.totalMins - b.totalMins; });
    var next = sorted.find(function(t){ return t.totalMins > cur; }) || null;
    var c = corridors.find(function(c) { return c.id === id; });
    var meta = c ? getMeta(c.name_english) : { color: '#E65100' };
    var corridorNameTa = c ? c.name_tamil : '';
    var showAll = expandedFull[id];
    var nextId = next ? next.id : null;

    // Focused window: 2 before + next + 2 after (5)
    var focused = sorted;
    if (!showAll && next) {
      var nextIdx = sorted.findIndex(function(t){ return t.id === next.id; });
      if (nextIdx >= 0) {
        var start = Math.max(0, nextIdx - 2);
        var end = Math.min(sorted.length, nextIdx + 3);
        focused = sorted.slice(start, end);
      }
    } else if (!showAll && !next) {
      focused = sorted.slice(-5);
    }

    // Summary stats
    var townCount = sorted.filter(function(t){ return busTypeMeta(t).cls === 'ordinary'; }).length;
    var mofCount  = sorted.filter(function(t){ return busTypeMeta(t).cls === 'express';  }).length;
    var privCount = sorted.filter(function(t){ return busTypeMeta(t).cls === 'private';  }).length;
    var stats = [];
    if (townCount) stats.push('🚐 ' + townCount + ' டவுன் பஸ்');
    if (mofCount)  stats.push('🚌 ' + mofCount  + ' மொஃபசல்');
    if (privCount) stats.push('🚍 ' + privCount + ' தனியார்');

    // Rows with gap bands + alternative suggestions
    var corridorKey = c ? (c.name_english || '').toLowerCase() : '';
    var rowsHtml = '';
    var prevMin = cur;
    focused.forEach(function(t) {
      if (t.totalMins > cur) {
        var gap = t.totalMins - prevMin;
        if (gap >= GAP_THRESHOLD) {
          rowsHtml += gapBandHtml(gap);
          // Append alt route suggestions during the gap
          var alts = getAltSuggestions(corridorKey, t.totalMins);
          alts.forEach(function(alt) { rowsHtml += altSuggestionHtml(alt); });
        }
        prevMin = t.totalMins;
      }
      rowsHtml += ttRowHtml(t, cur, nextId, meta, corridorNameTa);
    });

    var toggleLabel = showAll
      ? '🔼 சுருக்கமாய்  ·  Show less'
      : '🔽 எல்லா பஸ் பார்க்க (' + sorted.length + ')  ·  View all';

    el.innerHTML =
      nextBusHeaderHtml(next, meta) +
      '<div class="tt-stats">' + stats.join('  ·  ') + '</div>' +
      '<div class="tt-list">' + rowsHtml + '</div>' +
      '<button class="tt-toggle" data-toggle-id="' + id + '" style="color:' + meta.color + '">' + toggleLabel + '</button>';

    var toggleBtn = el.querySelector('.tt-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function(ev) {
        ev.stopPropagation();
        expandedFull[id] = !expandedFull[id];
        renderTimetable(id);
      });
    }
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
    // Also refresh next-bus header if a timetable is open
    if (expandedId !== null) renderTimetable(expandedId);
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
