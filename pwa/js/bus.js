// ── Bus Section Controller ─────────────────────────────────
var Bus = (function() {

  // Per-corridor metadata — colours + emoji match the Flutter APK exactly.
  // group: 'local' | 'long' | 'night'
  var CORRIDOR_META = {
    'theni':              { emoji: '🏙️', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → சங்கராபுரம் → தேவாரம் → தேனி' },
    'bodi':               { emoji: '🌄', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → சங்கராபுரம் → தேவாரம் → போடி' },
    'cumbum':             { emoji: '🍇', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கம்பம்' },
    'chinnamanur':        { emoji: '🛕', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → பல்லவராயன்பட்டி → சின்னமனூர்' },
    'gudalur (koodalur)': { emoji: '🌲', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → கம்பம் → கூடலூர்' },
    'mettupalayam':       { emoji: '🏘️', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → மேட்டுப்பாளையம்' },
    'suruli theertham':   { emoji: '💧', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → சுருளி தீர்த்தம்' },
    'thevaram':           { emoji: '🛤️', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம்' },
    'periyakulam':        { emoji: '🌾', group: 'local', isFrequent: false, nameTamil: 'பெரியகுளம்', routeDesc: 'பண்ணைப்புரம் → தேனி → பெரியகுளம்' },
    'uthamapalayam':      { emoji: '🏪', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம்' },
    'madurai':            { emoji: '🏛️', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → மதுரை' },
    'coimbatore':         { emoji: '🏭', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → கோயம்புத்தூர்' },
    'trichy':             { emoji: '🗼', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல் → திருச்சி' },
    'palani':             { emoji: '🙏', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → உத்தமபாளையம் → பழனி' },
    'kumily':             { emoji: '🌿', group: 'local', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → போடி → குமுளி' },
    'dindigul':           { emoji: '🏰', group: 'long',  isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → திண்டுக்கல்' },
    'chennai':            { emoji: '🌃', group: 'night', isFrequent: false, routeDesc: 'பண்ணைப்புரம் → தேவாரம் → தேனி → திண்டுக்கல் → திருச்சி → சென்னை', boardingNote: 'தேனி பஸ் stand-ல ஏறுங்க · Board at Theni bus stand' },
  };

  var GROUPS = [
    { key: 'local', emoji: '🏠', ta: 'உள்ளூர் வழித்தடங்கள்',      en: 'Local Routes',      hint: 'தேனி, போடி, கம்பம், உத்தமபாளையம், தேவாரம், சின்னமனூர், பெரியகுளம், சுருளி, குமுளி, கூடலூர்' },
    { key: 'long',  emoji: '🗺️', ta: 'வெளியூர் வழித்தடங்கள்',    en: 'Long Distance',     hint: 'மதுரை, கோயம்புத்தூர், திருச்சி, பழனி, திண்டுக்கல், மேட்டுப்பாளையம்' },
    { key: 'night', emoji: '🌃', ta: 'சென்னை நைட் சர்வீஸ்',      en: 'Chennai Night Service', hint: 'சென்னைக்குப் போகும் நைட் பஸ்கள் — Subam, Geetham, KPN' },
  ];

  var corridors = [];
  var timingsCache = {};    // id → BusTiming[]
  var expandedId = null;
  var expandedFull = {};    // id → true when "View all" clicked
  var altsOpen = {};        // corridorKey → true when "alt routes" expanded
  var openGroups = { local: false, long: false, night: false };
  var badgeTimer = null;
  var freshnessTimer = null;
  var dataRefreshTimer = null;
  var fetchedAt = 0;        // timestamp when last corridor/timings fetch completed
  var DATA_REFRESH_MS = 10 * 60 * 1000; // re-fetch all timings every 10 minutes
  var searchQuery = '';     // current search filter (lowercased)
  var LAST_GROUP_KEY = 'pannai:last-group-v1';  // localStorage key
  var TT_OPENED_KEY  = 'pannai:tt-opened';      // set once the user opens any full timetable
  function ttEverOpened() { try { return !!localStorage.getItem(TT_OPENED_KEY); } catch (_) { return true; } }
  var initialRender = true; // only auto-open-by-time on the very first render

  function getMeta(nameEnglish) {
    return CORRIDOR_META[(nameEnglish || '').toLowerCase()] ||
      { emoji: '🚌', group: 'long', isFrequent: false };
  }

  // ── Phase 9: Group persistence + time-of-day auto-open ────────
  function saveLastGroup(key) {
    try { localStorage.setItem(LAST_GROUP_KEY, key); } catch (_) {}
  }
  function loadLastGroup() {
    try { return localStorage.getItem(LAST_GROUP_KEY); } catch (_) { return null; }
  }
  function initDefaultGroup() {
    // Priority 1: restore user's last-opened group
    var saved = loadLastGroup();
    if (saved === 'local' || saved === 'long' || saved === 'night') {
      openGroups[saved] = true;
      return;
    }
    // Priority 2: Local Routes (Theni, Bodi, Cumbum…) are what nearly every
    // villager checks, so they are open at ANY hour — it used to open only
    // 6–10 AM / 4–8 PM and showed a wall of closed headings otherwise.
    openGroups.local = true;
  }

  // ── Phase 9: Search matching ──────────────────────────────────
  function matchesSearch(c) {
    if (!searchQuery) return true;
    var ta = (c.name_tamil || '').toLowerCase();
    var en = (c.name_english || '').toLowerCase();
    var meta = getMeta(c.name_english);
    var altTa = (meta.nameTamil || '').toLowerCase();
    var desc = (meta.routeDesc || '').toLowerCase();
    return ta.indexOf(searchQuery) !== -1 ||
           en.indexOf(searchQuery) !== -1 ||
           altTa.indexOf(searchQuery) !== -1 ||
           desc.indexOf(searchQuery) !== -1;
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
    if (h < 6)       period = 'அதிகாலை';
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
  // Countdown colour = how soon, not which route. ≤10 min is amber
  // ("hurry"), not alarm red — a bus that is merely due is not an emergency.
  // CSS variables (tokens.css) so the same code works in dark mode.
  function pillColor(mins) {
    return mins <= 10 ? 'var(--soon)' : mins <= 40 ? 'var(--ok)' : 'var(--off)';
  }

  // Bus-type chip (டவுன் பஸ் / மொஃபசல் / தனியார்) — colours live in bus.css
  function busChipHtml(bm, extraCls) {
    var label = bm.label || (bm.cls === 'private' ? 'தனியார்' : bm.cls === 'express' ? 'மொஃபசல்' : 'டவுன் பஸ்');
    return '<span class="' + extraCls + ' chip-' + (bm.cls === 'private' || bm.cls === 'express' ? bm.cls : 'ordinary') + '">' + label + '</span>';
  }

  function minsLabel(mins) {
    if (mins < 60) return mins + ' நிமிடம்';
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    return m === 0 ? h + ' மணி' : h + 'மணி ' + m + 'நிமி';
  }

  function renderBadge(meta, timings, corridorId) {
    if (meta.isFrequent) {
      return '<div class="route-badge badge-frequent">' +
        '<span class="badge-freq-icon">↻</span>' +
        '<span class="badge-freq-mins">20–30</span>' +
        '<span class="badge-freq-unit">நிமிடம்</span>' +
      '</div>';
    }
    if (!timings) {
      return '<div class="route-badge badge-loading" data-badge-id="' + corridorId + '">…</div>';
    }
    if (!timings.length) {
      return '<div class="route-badge badge-nodata">🕐<span>சேர்க்கப்படும்</span></div>';
    }
    var next = computeNextBus(timings);
    if (!next) {
      return '<div class="route-badge badge-done">🌙<span>இன்று</span><span>முடிந்தது</span></div>';
    }
    var mins = next.totalMins - nowMins();
    return '<div class="route-badge badge-next" data-badge-id="' + corridorId + '">' +
      '<span class="badge-next-time">' + fmtPeriod(next.departs_at) + '</span>' +
      '<span class="badge-next-pill" style="background:' + pillColor(mins) + '">' + minsLabel(mins) + '</span>' +
    '</div>';
  }

  // ── Single route card HTML ─────────────────────────────────────
  // Primary info only: destination + next bus time + countdown.
  // Route chain (via) + bus count moved to expanded view.
  function renderCardHtml(c) {
    var meta = getMeta(c.name_english);
    var timings = timingsCache[c.id] !== undefined ? timingsCache[c.id] : null;
    var next = timings && computeNextBus(timings);
    var noMore = !meta.isFrequent && timings && timings.length > 0 && !next;
    // The left rail used to be a per-destination colour (green, maroon, blue…)
    // that meant nothing to the reader. It now repeats the countdown colour —
    // except on frequent routes, whose badge shows "20–30 min" and no countdown.
    var railColor = meta.isFrequent || noMore || !next ? 'var(--border)' : pillColor(next.totalMins - nowMins());
    var nameClass = noMore ? 'route-name-ta dimmed' : 'route-name-ta';

    // Bus type chip from next departure
    var busChip = '';
    if (next) {
      var bm = busTypeMeta(next, meta.group);
      busChip = busChipHtml(bm, 'card-bus-chip');
    }

    var displayNameTamil = meta.nameTamil || c.name_tamil;
    // Wrap card + its (sibling) timetable so the list can grid on desktop;
    // the expanded wrap spans the full row (see responsive.css).
    return '<div class="route-wrap' + (expandedId === c.id ? ' expanded' : '') + '">' +
      '<div class="route-card" data-id="' + c.id + '" role="button">' +
        '<div class="route-rail" style="background:' + railColor + '"></div>' +
        '<div class="route-emoji-circle">' + meta.emoji + '</div>' +
        '<div class="route-info">' +
          '<span class="' + nameClass + '">' + displayNameTamil + '</span>' +
          '<span class="route-name-en">' + c.name_english + (busChip ? '  ' + busChip : '') + '</span>' +
          // Tells people the card opens into the full day's timetable (CSS swaps the two
          // labels via .route-wrap.expanded, which handleCardTap already toggles)
          '<span class="route-more"><span class="more-show">▾ எல்லா நேரமும்</span><span class="more-hide">▴ மூடு</span></span>' +
        '</div>' +
        renderBadge(meta, timings, c.id) +
      '</div>' +
      '<div class="route-timetable" id="tt-' + c.id + '"' + (expandedId === c.id ? '' : ' hidden') + '></div>' +
    '</div>';
  }

  // ── Collapsible group header + contents ────────────────────────
  // Soonest remaining bus among a group's routes → { corridor, next, mins }
  function soonestInGroup(items) {
    var cur = nowMins(), best = null;
    items.forEach(function(c) {
      var timings = timingsCache[c.id];
      var next = timings && timings.length ? computeNextBus(timings) : null;
      if (!next) return;
      var mins = next.totalMins - cur;
      if (!best || mins < best.mins) best = { corridor: c, next: next, mins: mins };
    });
    return best;
  }
  function groupNextHtml(items) {
    var s = soonestInGroup(items);
    if (!s) return '';
    var meta = getMeta(s.corridor.name_english);
    return 'அடுத்தது: <b>' + (meta.nameTamil || s.corridor.name_tamil) + '</b> · ' + minsLabel(s.mins);
  }
  // Keep the collapsed-header line current (called every minute with the badges)
  function updateGroupNexts() {
    document.querySelectorAll('.group-next[data-group-next]').forEach(function(el) {
      var key = el.dataset.groupNext;
      el.innerHTML = groupNextHtml(corridors.filter(function(c) { return getMeta(c.name_english).group === key; }));
    });
  }

  // First few village names only — the full list made each header 4 lines tall
  function shortHint(hint) {
    var names = String(hint || '').split(', ');
    return names.length > 4 ? names.slice(0, 4).join(', ') + '…' : hint;
  }

  function renderGroupHtml(group, items) {
    var count = items.length;
    var frequent = items.filter(function(c){ return getMeta(c.name_english).isFrequent; }).length;
    var isOpen = !!openGroups[group.key];
    var countLabel = count + (count === 1 ? ' route' : ' routes');

    var html = '<div class="group-card" data-group="' + group.key + '">' +
      '<div class="group-header" data-toggle-group="' + group.key + '" role="button">' +
        '<div class="group-icon">' + group.emoji + '</div>' +
        '<div class="group-text">' +
          '<div class="group-title"><span class="group-ta">' + group.ta + '</span><span class="group-en">' + group.en + '</span></div>' +
          '<div class="group-hint">' + shortHint(group.hint) + '</div>' +
          '<div class="group-next" data-group-next="' + group.key + '"' + (isOpen ? ' hidden' : '') + '>' + groupNextHtml(items) + '</div>' +
          '<div class="group-count">📍 ' + countLabel + '</div>' +
        '</div>' +
        '<div class="group-caret ' + (isOpen ? 'open' : '') + '">' + (isOpen ? '▾' : '▸') + '</div>' +
      '</div>' +
      '<div class="group-body" ' + (isOpen ? '' : 'hidden') + '>' +
        items.map(renderCardHtml).join('') +
      '</div>' +
    '</div>';
    return html;
  }

  // ── Phase 9: "Now departing" smart strip ─────────────────────
  // Shows next 3 buses across ALL routes — answers "what's leaving soon?"
  // in one glance without any taps.
  function renderNowDeparting() {
    var strip = document.getElementById('bus-now-strip');
    if (!strip) return;
    if (searchQuery) { strip.hidden = true; return; }

    var cur = nowMins();
    var upcoming = [];
    corridors.forEach(function(c) {
      var timings = timingsCache[c.id];
      if (!timings || !timings.length) return;
      var next = computeNextBus(timings);
      if (!next) return;
      var mins = next.totalMins - cur;
      upcoming.push({ corridor: c, next: next, mins: mins });
    });
    upcoming.sort(function(a, b) { return a.mins - b.mins; });
    // Normally only the next 3 hours (further out is noise). If nothing leaves
    // in that window the strip used to disappear with no explanation — now it
    // says when the next bus is, or that today's are done and tomorrow's first.
    var top = upcoming.filter(function(u) { return u.mins <= 180; }).slice(0, 3);

    if (!top.length) {
      if (!corridors.some(function(c) { return (timingsCache[c.id] || []).length; })) {
        strip.hidden = true; strip.innerHTML = ''; return;
      }
      strip.hidden = false;
      strip.classList.remove('urgent');
      var msg;
      if (upcoming.length) {
        var u = upcoming[0], um = getMeta(u.corridor.name_english);
        msg = '<b>' + (um.nameTamil || u.corridor.name_tamil) + '</b> · ' + fmtPeriod(u.next.departs_at) +
              '<span class="strip-empty-sub">' + minsLabel(u.mins) + ' கழித்து · next bus in ' + minsLabel(u.mins) + '</span>';
      } else {
        var first = null;
        corridors.forEach(function(c) {
          (timingsCache[c.id] || []).forEach(function(t) {
            var p = t.departs_at.split(':').map(Number), m = p[0] * 60 + p[1];
            if (!first || m < first.m) first = { m: m, c: c, t: t };
          });
        });
        var fm = getMeta(first.c.name_english);
        msg = 'இன்று பேருந்துகள் முடிந்தது 🌙<span class="strip-empty-sub">நாளை முதல் பேருந்து: ' +
              (fm.nameTamil || first.c.name_tamil) + ' · ' + fmtPeriod(first.t.departs_at) + '</span>';
      }
      strip.innerHTML =
        '<div class="strip-title"><span class="strip-title-icon">⏱</span>' +
        '<span class="strip-title-ta">அடுத்த பேருந்து</span><span class="strip-title-en">Next bus</span></div>' +
        '<div class="strip-empty">' + msg + '</div>';
      return;
    }
    var isUrgent = top[0].mins < 5;
    strip.hidden = false;
    strip.classList.toggle('urgent', isUrgent);
    strip.innerHTML =
      '<div class="strip-title">' +
        '<span class="strip-urgency-dot"></span>' +
        '<span class="strip-title-icon">⏱</span>' +
        '<span class="strip-title-ta">அடுத்த பேருந்துகள்</span>' +
        '<span class="strip-title-en">Leaving soon</span>' +
      '</div>' +
      '<div class="strip-list">' + top.map(function(item) {
        var meta = getMeta(item.corridor.name_english);
        var displayName = meta.nameTamil || item.corridor.name_tamil;
        var bm = busTypeMeta(item.next, meta.group);
        var stripChip = busChipHtml(bm, 'strip-bus-chip');
        return '<div class="strip-card" data-corridor-id="' + item.corridor.id + '" role="button" style="border-left-color:' + pillColor(item.mins) + '">' +
          '<div class="strip-card-icon">' + meta.emoji + '</div>' +
          '<div class="strip-card-body">' +
            '<div class="strip-card-name">' + displayName + '</div>' +
            '<div class="strip-card-time">' + fmtPeriod(item.next.departs_at) + '  ' + stripChip + '</div>' +
          '</div>' +
          '<div class="strip-card-mins" style="background:' + pillColor(item.mins) + '">' + minsLabel(item.mins) + '</div>' +
        '</div>';
      }).join('') + '</div>';

    // Clicking a strip card opens its group + expands its route
    strip.querySelectorAll('.strip-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var id = parseInt(card.dataset.corridorId);
        var c = corridors.find(function(c) { return c.id === id; });
        if (!c) return;
        var groupKey = getMeta(c.name_english).group;
        Object.keys(openGroups).forEach(function(k) { openGroups[k] = false; });
        openGroups[groupKey] = true;
        saveLastGroup(groupKey);
        expandedId = id;
        renderList();
        setTimeout(function() { scrollCardIntoView(id); }, 120);
      });
    });
  }

  // ── Phase 9: Data freshness indicator ─────────────────────────
  function renderFreshness() {
    var el = document.getElementById('bus-freshness');
    if (!el) return;
    if (!fetchedAt) { el.textContent = ''; return; }
    var secs = Math.floor((Date.now() - fetchedAt) / 1000);
    var label;
    if (secs < 30)        label = 'இப்போ புதுப்பிக்கப்பட்டது';
    else if (secs < 60)   label = secs + ' விநாடி முன்பு புதுப்பிக்கப்பட்டது';
    else if (secs < 3600) label = Math.floor(secs / 60) + ' நிமிடம் முன்பு புதுப்பிக்கப்பட்டது';
    else                  label = Math.floor(secs / 3600) + ' மணி நேரம் முன்பு புதுப்பிக்கப்பட்டது';
    el.innerHTML = '<span class="freshness-icon">🔄</span>' + label;
    el.classList.toggle('stale', secs > 1800); // orange after 30 min
  }

  // ── Batch load: corridors + ALL timings in ONE request ────────
  // /api/bus/all replaces 18 round trips with 1 — much faster on 2G and
  // cold Render. Returns false if unavailable so callers can fall back.
  async function loadAllData(force) {
    try {
      var all = await PannaiAPI.getBusAll(!!force);
      if (!all || !all.corridors || !all.corridors.length) return false;
      corridors = all.corridors;
      timingsCache = {};
      corridors.forEach(function(c) {
        timingsCache[c.id] = (all.timings && all.timings[c.id]) || [];
      });
      fetchedAt = Date.now();
      return true;
    } catch (_) { return false; }
  }

  // ── Prefetch timings per corridor (FALLBACK when /api/bus/all
  //    is unavailable; no-ops for corridors already in cache) ──
  async function prefetchAllTimings() {
    await Promise.all(corridors.map(function(c) {
      if (timingsCache[c.id] !== undefined) return Promise.resolve();
      return PannaiAPI.getBusTimings(c.id)
        .then(function(t) { timingsCache[c.id] = t || []; })
        .catch(function() { timingsCache[c.id] = []; });
    }));
    fetchedAt = Date.now();
    renderNowDeparting();
    renderFreshness();
    renderList();
  }

  // ── Auto-refresh: re-fetch everything every 10 minutes ─────
  async function refreshAllData() {
    if (await loadAllData(true)) {
      renderNowDeparting();
      renderFreshness();
      renderList();
      return;
    }
    // Fallback: per-corridor refresh
    timingsCache = {};
    await prefetchAllTimings();
  }

  // ── Full list render ───────────────────────────────────────────
  function renderList() {
    var container = document.getElementById('bus-route-list');
    if (!corridors.length) {
      container.innerHTML = '<p class="bus-empty">பேருந்து தகவல் விரைவில்...<span>Bus data coming soon</span></p>';
      return;
    }

    // Hide now-departing strip whenever user is searching
    var strip = document.getElementById('bus-now-strip');
    if (strip && searchQuery) strip.hidden = true;
    else if (strip && !searchQuery && fetchedAt) renderNowDeparting();

    // Apply search filter — when searching, force all groups open so matches show
    var filterActive = !!searchQuery;
    if (filterActive) {
      openGroups.local = true;
      openGroups.long  = true;
      openGroups.night = true;
    }

    var anyMatch = false;
    var html = GROUPS.map(function(g) {
      var items = corridors
        .filter(function(c) { return getMeta(c.name_english).group === g.key; })
        .filter(matchesSearch);
      if (!items.length) return '';
      anyMatch = true;
      return renderGroupHtml(g, items);
    }).join('');

    if (filterActive && !anyMatch) {
      container.innerHTML =
        '<div class="search-empty">' +
          '<span class="search-empty-icon">🔍</span>' +
          'இந்த வழியில் எதுவும் இல்லை' +
          '<span class="search-empty-en">No routes match your search</span>' +
        '</div>';
      return;
    }

    // One-line tip until the user has opened a full timetable once
    var tip = (!filterActive && !ttEverOpened())
      ? '<p class="bus-tip">👆 எந்த ஊரைத் தொட்டாலும் முழு நேர அட்டவணை தெரியும்<span>Tap any route for the full timetable</span></p>'
      : '';
    container.innerHTML = tip + html;

    // Re-open expanded card timetable
    if (expandedId !== null && timingsCache[expandedId] !== undefined) {
      renderTimetable(expandedId);
    }

    // Group toggle — accordion: only one group open at a time
    container.querySelectorAll('[data-toggle-group]').forEach(function(h) {
      h.addEventListener('click', function() {
        var key = h.dataset.toggleGroup;
        var wasOpen = openGroups[key];
        // Close all groups
        Object.keys(openGroups).forEach(function(k) { openGroups[k] = false; });
        // Also collapse any expanded timetable in other groups
        if (!wasOpen) {
          expandedId = null;
          openGroups[key] = true;
          saveLastGroup(key);  // Phase 9: remember user's preference
        }
        renderList();
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
      if (prevCard) { prevCard.classList.remove('expanded');
        if (prevCard.closest('.route-wrap')) prevCard.closest('.route-wrap').classList.remove('expanded'); }
      return;
    }
    if (expandedId !== null) {
      var prev = document.getElementById('tt-' + expandedId);
      if (prev) prev.hidden = true;
      var oldCard = document.querySelector('.route-card[data-id="' + expandedId + '"]');
      if (oldCard) { oldCard.classList.remove('expanded');
        if (oldCard.closest('.route-wrap')) oldCard.closest('.route-wrap').classList.remove('expanded'); }
    }
    expandedId = id;
    try { localStorage.setItem(TT_OPENED_KEY, '1'); } catch (_) {}
    var tipEl = document.querySelector('.bus-tip');
    if (tipEl) tipEl.remove();

    var ttEl = document.getElementById('tt-' + id);
    if (!ttEl) return;
    ttEl.hidden = false;
    var card = document.querySelector('.route-card[data-id="' + id + '"]');
    if (card) { card.classList.add('expanded');
      if (card.closest('.route-wrap')) card.closest('.route-wrap').classList.add('expanded'); }

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
  // Clean operator name — remove trailing "Private Bus"/"Private" suffix
  function cleanOperator(op) {
    return (op || '').replace(/\s*(Private\s*Bus|Private)$/i, '').trim();
  }

  function busTypeMeta(t, group) {
    var op = cleanOperator(t.operator_name);
    var opLower = (t.operator_name || '').toLowerCase();
    if (t.bus_type === 'private' || opLower.indexOf('private') !== -1) {
      return { cls: 'private', icon: '🚍', label: op || 'தனியார்', sub: op ? 'தனியார் · Private' : 'Private' };
    }
    // Long-distance routes (Trichy, Palani, Coimbatore, Madurai, Dindigul, etc.)
    // never have "town bus" — anything non-private is mofussil/express/SETC.
    if (group === 'long' || group === 'night') {
      return { cls: 'express', icon: '🚌', label: op || 'மொஃபசல்', sub: op ? 'மொஃபசல் · Mofussil' : 'Mofussil' };
    }
    if (t.bus_type === 'express') {
      return { cls: 'express', icon: '🚌', label: op || 'மொஃபசல்', sub: op ? 'மொஃபசல் · Mofussil' : 'Mofussil' };
    }
    if (t.bus_type === 'ordinary') {
      return { cls: 'ordinary', icon: '🚐', label: op || 'டவுன் பஸ்', sub: op ? 'டவுன் பஸ் · Town Bus' : 'Town Bus' };
    }
    return { cls: 'ordinary', icon: '🚌', label: op || '', sub: '' };
  }

  // ── Route connection suggestions ───────────────────────────────
  // Geography (verified from TNSTC routes + maps):
  //   North-West axis: Pannaipuram → Sankarapuram → Thevaram → Bodi → Theni
  //   South-West axis: Pannaipuram → Uthamapalayam (Palayam) → Kambam → Gudalur → Kumily
  //   Note: Kumily reachable EITHER via Kambam (plains) OR via Bodi (ghat road) — two different buses.
  //         Bodi and Kumily-via-Kambam are OPPOSITE directions.
  //         Theni buses pass THROUGH Bodi (Thevaram→Bodi→Theni) so no bus-change needed to reach Bodi.
  var ROUTE_ALTS = {
    'theni': [
      { key: 'bodi',    ta: 'போடி பஸ் → போடியில் இறங்கி தேனி பஸ் பிடிக்கலாம்',
                        en: 'Take Bodi bus → alight at Bodi, catch Theni bus' },
      { key: 'cumbum',  ta: 'கம்பம் பஸ் → உத்தமபாளையம்ல இறங்கி தேனி பஸ் பிடிக்கலாம்',
                        en: 'Take Kambam bus → alight at Uthamapalayam, catch Theni bus' },
    ],
    'periyakulam': [
      { key: 'theni',   ta: 'தேனி பஸ் → தேனியில் இறங்கி பெரியகுளம் பஸ் பிடிக்கலாம்',
                        en: 'Take Theni bus → change at Theni for Periyakulam' },
    ],
    'bodi': [
      // Theni bus passes THROUGH Bodi (Thevaram→Bodi→Theni) — no change needed!
      { key: 'theni',   ta: 'தேனி பஸ் எடுத்து போடியில் இறங்குங்க — ஒரே பஸ், மாற வேண்டாம்',
                        en: 'Take any Theni bus — get off at Bodi (same bus, no change)' },
    ],
    'kumily': [
      // Via Kambam route — primary alternative (plains route)
      { key: 'cumbum',  ta: 'கம்பம் பஸ் → கம்பம்ல இறங்கி குமுளி பஸ் பிடிக்கலாம்',
                        en: 'Take Kambam bus → alight at Kambam, catch Kumily bus' },
    ],
    'cumbum': [
      // Kumily-via-Kambam bus route passes through Kambam
      { key: 'kumily',  ta: 'கம்பம் வழியா போற குமுளி பஸ் கம்பம் வரை போகும்',
                        en: 'Kumily bus (via Kambam route) stops at Kambam' },
    ],
    'gudalur (koodalur)': [
      { key: 'cumbum',  ta: 'கம்பம் பஸ் → கம்பம்ல இறங்கி கூடலூர் பஸ் பிடிக்கலாம்',
                        en: 'Take Kambam bus → alight at Kambam, catch Gudalur bus' },
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
    var bt = busTypeMeta(t, meta && meta.group);
    var cls = 'tt-row tt-' + bt.cls + (isPassed ? ' passed' : '') + (isNext ? ' is-next' : '');
    var style = '';   // .tt-row.is-next border colour comes from bus.css

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

    return '<div class="' + cls + '"' + style + ' data-departs="' + t.departs_at + '">' +
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
    var viaLine = meta.routeDesc
      ? '<div class="tt-next-via"><span class="tt-next-via-label">வழி:</span> ' + meta.routeDesc + '</div>'
      : '';
    if (!next) {
      return '<div class="tt-next-header tt-next-done">' +
        '<div class="tt-next-icon">🌙</div>' +
        '<div class="tt-next-body">' +
          '<div class="tt-next-title">இன்று பேருந்து இல்லை</div>' +
          '<div class="tt-next-sub">No more buses today · நாளை காலை வாங்க</div>' +
          viaLine +
        '</div>' +
      '</div>';
    }
    var cur = nowMins();
    var mins = next.totalMins - cur;
    return '<div class="tt-next-header tt-next-live">' +
      '<div class="tt-next-icon">⏱</div>' +
      '<div class="tt-next-body">' +
        '<div class="tt-next-title">அடுத்த பேருந்து</div>' +
        '<div class="tt-next-sub">' + (meta.boardingNote || 'Next bus · Pannaipuram stop') + '</div>' +
        '<div class="tt-next-time">' + fmtPeriod(next.departs_at) + '</div>' +
        viaLine +
      '</div>' +
      '<div class="tt-next-pill" style="background:' + pillColor(mins) + '">' +
        '<div class="tt-next-mins">' + minsLabel(mins) + '</div>' +
      '</div>' +
    '</div>';
  }

  // Collapsible alt-routes section — hidden by default, shown on tap
  function renderAltsSectionHtml(corridorKey) {
    var alts = ROUTE_ALTS[corridorKey] || [];
    if (!alts.length) return '';
    var isOpen = !!altsOpen[corridorKey];
    var bodyHtml = isOpen
      ? '<div class="tt-alts-body">' + alts.map(altSuggestionHtml).join('') + '</div>'
      : '';
    return '<div class="tt-alts ' + (isOpen ? 'is-open' : '') + '">' +
      '<button class="tt-alts-toggle" data-toggle-alts="' + corridorKey + '" type="button">' +
        '<span class="tt-alts-icon">🔀</span>' +
        '<span class="tt-alts-label">' +
          (isOpen ? 'மாற்று வழி மூடு' : 'வேற பஸ் வழியா போகலாமா? (' + alts.length + ')') +
        '</span>' +
        '<span class="tt-alts-caret">' + (isOpen ? '▾' : '▸') + '</span>' +
      '</button>' +
      bodyHtml +
    '</div>';
  }

  // ── Phase 9 #6: WhatsApp share a timing row ───────────────────
  function shareTimingRow(c, departs) {
    var meta = getMeta(c.name_english);
    var dest = meta.nameTamil || c.name_tamil;
    var time = fmtPeriod(departs);
    var text = '🚌 பண்ணைப்புரம் நிறுத்தம் → ' + dest + '\n🕐 ' + time + ' கிளம்பும்\n📱 App: https://pannaipuram-api.onrender.com/pwa/';
    if (navigator.share) {
      navigator.share({ text: text }).catch(function() {});
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    }
  }

  function showShareToast() {
    var existing = document.querySelector('.tt-row-share-hint');
    if (existing) existing.remove();
    var hint = document.createElement('div');
    hint.className = 'tt-row-share-hint';
    hint.textContent = '📲 WhatsApp-ல் பகிர்கிறது…';
    document.body.appendChild(hint);
    setTimeout(function() { if (hint.parentNode) hint.remove(); }, 2000);
  }

  function addLongPressShare(ttEl, c) {
    ttEl.querySelectorAll('.tt-row[data-departs]:not(.passed)').forEach(function(rowEl) {
      var departs = rowEl.dataset.departs;
      if (!departs) return;
      var pressTimer = null;
      rowEl.addEventListener('touchstart', function() {
        pressTimer = setTimeout(function() {
          pressTimer = null;
          showShareToast();
          shareTimingRow(c, departs);
        }, 600);
      }, { passive: true });
      rowEl.addEventListener('touchend',  function() { clearTimeout(pressTimer); });
      rowEl.addEventListener('touchmove', function() { clearTimeout(pressTimer); });
    });
  }

  var GAP_THRESHOLD = 90; // minutes

  function renderTimetable(id) {
    var el = document.getElementById('tt-' + id);
    if (!el) return;
    el.hidden = false;
    var timings = timingsCache[id] || [];
    if (!timings.length) {
      var waLink = 'https://wa.me/?text=' + encodeURIComponent(
        'பண்ணைப்புரம் App: ' + (c ? c.name_english : 'this route') + ' பஸ் நேரம் சேர்க்க வேண்டும்'
      );
      el.innerHTML =
        '<div class="tt-nodata">' +
          '<span class="tt-nodata-icon">🚌</span>' +
          '<p class="tt-nodata-ta">இந்த வழியில் நேரக்கோவை விரைவில் சேர்க்கப்படும்</p>' +
          '<p class="tt-nodata-en">Timings being added · Check back soon</p>' +
          '<a class="tt-nodata-contact" href="' + waLink + '" target="_blank">📲 WhatsApp-ல் தெரிவிக்க</a>' +
        '</div>';
      return;
    }
    var cur = nowMins();
    var sorted = timings.slice()
      .map(function(t){ var p=t.departs_at.split(':').map(Number); return Object.assign({},t,{totalMins:p[0]*60+p[1]});})
      .sort(function(a, b) { return a.totalMins - b.totalMins; });
    var next = sorted.find(function(t){ return t.totalMins > cur; }) || null;
    var c = corridors.find(function(c) { return c.id === id; });
    var meta = getMeta(c ? c.name_english : '');
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
    var townCount = sorted.filter(function(t){ return busTypeMeta(t, meta.group).cls === 'ordinary'; }).length;
    var mofCount  = sorted.filter(function(t){ return busTypeMeta(t, meta.group).cls === 'express';  }).length;
    var privCount = sorted.filter(function(t){ return busTypeMeta(t, meta.group).cls === 'private';  }).length;
    var stats = [];
    if (townCount) stats.push('🚐 ' + townCount + ' டவுன் பஸ்');
    if (mofCount)  stats.push('🚌 ' + mofCount  + ' மொஃபசல்');
    if (privCount) stats.push('🚍 ' + privCount + ' தனியார்');

    // Rows with gap bands only — alt suggestions moved to collapsible section at bottom
    var corridorKey = c ? (c.name_english || '').toLowerCase() : '';
    var rowsHtml = '';
    var prevMin = cur;
    var isNight = meta.group === 'night';
    focused.forEach(function(t) {
      if (t.totalMins > cur) {
        var gap = t.totalMins - prevMin;
        if (!isNight && gap >= GAP_THRESHOLD) {
          rowsHtml += gapBandHtml(gap);
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
      '<button class="tt-toggle" data-toggle-id="' + id + '">' + toggleLabel + '</button>' +
      renderAltsSectionHtml(corridorKey);

    var toggleBtn = el.querySelector('.tt-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function(ev) {
        ev.stopPropagation();
        expandedFull[id] = !expandedFull[id];
        renderTimetable(id);
      });
    }

    // Alt-routes toggle — progressive disclosure
    var altsBtn = el.querySelector('.tt-alts-toggle');
    if (altsBtn) {
      altsBtn.addEventListener('click', function(ev) {
        ev.stopPropagation();
        var key = altsBtn.dataset.toggleAlts;
        altsOpen[key] = !altsOpen[key];
        renderTimetable(id);
      });
    }

    // Phase 9 #6: long-press any upcoming row to WhatsApp-share that timing
    if (c) addLongPressShare(el, c);
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
      var card = el.closest ? el.closest('.route-card') : null;
      var rail = card && card.querySelector('.route-rail');
      if (rail) rail.style.background = pillColor(mins);
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
      // Batch endpoint first (1 request for everything); fall back to
      // corridors-only — init's prefetchAllTimings() then fills the rest.
      if (!(await loadAllData(false))) {
        corridors = await PannaiAPI.getBusCorridors();
      }
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

  // ── Phase 9: Wire up search bar ───────────────────────────────
  function initSearch() {
    var input = document.getElementById('bus-search');
    var clearBtn = document.getElementById('bus-search-clear');
    if (!input || !clearBtn) return;

    function applySearch(val) {
      searchQuery = (val || '').trim().toLowerCase();
      clearBtn.hidden = !searchQuery;
      // When clearing search, restore accordion to saved/time-of-day state
      if (!searchQuery) {
        openGroups.local = false;
        openGroups.long  = false;
        openGroups.night = false;
        initDefaultGroup();
      }
      renderList();
    }

    // Debounce lightly so typing feels snappy but doesn't thrash renderList
    var debounceTimer = null;
    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      var v = input.value;
      debounceTimer = setTimeout(function() { applySearch(v); }, 120);
    });
    clearBtn.addEventListener('click', function() {
      input.value = '';
      applySearch('');
      input.focus();
    });
  }

  async function init() {
    // Phase 9: restore last-opened group / time-of-day default BEFORE first render
    initDefaultGroup();
    initSearch();

    await loadCorridors();

    // Phase 9: prefetch ALL timings so the "now departing" strip + search can work
    if (corridors.length) prefetchAllTimings();

    clearInterval(badgeTimer);
    badgeTimer = setInterval(function() {
      updateBadges();
      updateGroupNexts();
      renderNowDeparting();  // keep strip current every minute
    }, 60000);

    // Phase 9: freshness ticker — update "X minutes ago" every 30s
    clearInterval(freshnessTimer);
    freshnessTimer = setInterval(renderFreshness, 30000);

    // Auto-refresh: re-fetch all data every 10 minutes so timings stay current
    clearInterval(dataRefreshTimer);
    dataRefreshTimer = setInterval(refreshAllData, DATA_REFRESH_MS);

    // Manual refresh button (top-right of bus header) → refresh ALL sections
    var refreshBtn = document.getElementById('bus-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() {
        if (window.PannaiRefreshAll) window.PannaiRefreshAll(); else refresh();
      });
    }
  }

  // Silent reload (no toast — the global sweep shows one) for refresh() / refresh-on-open.
  // Spins the bus ↻ button and force-bypasses cache, with per-corridor fallback.
  async function refresh() {
    var refreshBtn = document.getElementById('bus-refresh-btn');
    if (refreshBtn) {
      if (refreshBtn.classList.contains('is-spinning')) return;
      refreshBtn.classList.add('is-spinning');
    }
    try {
      if (!(await loadAllData(true))) {
        corridors = await PannaiAPI.getBusCorridors(true);
        timingsCache = {};
        await prefetchAllTimings();
      }
      renderNowDeparting();
      renderFreshness();
      renderList();
    } catch (_) { /* keep existing data on failure */ }
    finally {
      if (refreshBtn) setTimeout(function() { refreshBtn.classList.remove('is-spinning'); }, 600);
    }
  }

  return { init: init, refresh: refresh };
})();
