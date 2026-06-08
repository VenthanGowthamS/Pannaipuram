// ── "More" Section Controller ────────────────────────────────
// Groups extra village features: Acting (substitute) drivers + Local Services.
var More = (function() {

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function telHref(p) { return 'tel:' + String(p || '').replace(/[^0-9+]/g, ''); }
  function hasPhone(p) { return p && String(p).replace(/\D/g, '').length >= 10; }

  function vehIcon(t) {
    return { auto: '🛺', van: '🚐', car: '🚕', any: '🚗' }[(t || '').toLowerCase()] || '🚗';
  }

  // ── Acting (substitute) drivers ───────────────────────────
  function actingCard(d) {
    var verified = d.phone_verified !== false;
    var call = (hasPhone(d.phone) && verified)
      ? '<a class="more-call" href="' + telHref(d.phone) + '">📞 அழைக்க</a>'
      : '<span class="more-call more-call-pending">விரைவில்</span>';
    var cover = d.coverage_tamil || d.schedule_tamil || '';
    return '<div class="more-card">' +
      '<div class="more-card-ic">' + vehIcon(d.vehicle_type) + '</div>' +
      '<div class="more-card-info">' +
        '<span class="more-card-ta">' + esc(d.name_tamil) + '</span>' +
        (d.name_english ? '<span class="more-card-en">' + esc(d.name_english) + '</span>' : '') +
        (cover ? '<span class="more-card-meta">' + esc(cover) + '</span>' : '') +
      '</div>' + call + '</div>';
  }

  // ── Local services (grouped by category) ──────────────────
  var SVC_CATS = {
    milk:        { emoji: '🥛', ta: 'பால்' },
    post:        { emoji: '📮', ta: 'தபால்' },
    flower:      { emoji: '🌺', ta: 'பூ' },
    plumber:     { emoji: '🔧', ta: 'பிளம்பர்' },
    electrician: { emoji: '⚡', ta: 'எலக்ட்ரீஷியன்' },
    grocery:     { emoji: '🛒', ta: 'மளிகை' },
    carpenter:   { emoji: '🪚', ta: 'தச்சர்' },
    other:       { emoji: '🛍', ta: 'மற்றவை' },
  };
  function svcCard(s) {
    var call = hasPhone(s.phone)
      ? '<a class="more-call" href="' + telHref(s.phone) + '">📞 அழைக்க</a>'
      : '<span class="more-call more-call-pending">விரைவில்</span>';
    var area = s.area_tamil || s.area_english || '';
    return '<div class="more-card">' +
      '<div class="more-card-info">' +
        '<span class="more-card-ta">' + esc(s.name_tamil || s.name_english) + '</span>' +
        (s.name_english && s.name_tamil ? '<span class="more-card-en">' + esc(s.name_english) + '</span>' : '') +
        (area ? '<span class="more-card-meta">📍 ' + esc(area) + '</span>' : '') +
      '</div>' + call + '</div>';
  }
  function svcGroup(cat, list) {
    if (!list || !list.length) return '';
    var meta = SVC_CATS[cat] || { emoji: '🛍', ta: cat };
    return '<div class="more-svc-group">' +
      '<div class="more-svc-head">' + meta.emoji + ' ' + esc(meta.ta) + '</div>' +
      '<div class="more-svc-cards">' + list.map(svcCard).join('') + '</div>' +
      '</div>';
  }

  function renderActing(drivers) {
    var host = document.getElementById('more-acting');
    if (!host) return;
    var active = (drivers || []).filter(function(d) { return d.is_active !== false; });
    host.innerHTML = active.length
      ? active.map(actingCard).join('')
      : '<div class="more-empty">மாற்று ஓட்டுநர் விரைவில் சேர்க்கப்படும் · Substitute drivers coming soon</div>';
  }
  function renderServices(data) {
    var host = document.getElementById('more-services');
    if (!host) return;
    if (!data || !Object.keys(data).length) {
      host.innerHTML = '<div class="more-empty">சேவை தகவல் விரைவில் · Services coming soon</div>';
      return;
    }
    // known categories first, then any extras
    var html = Object.keys(SVC_CATS).map(function(k) { return svcGroup(k, data[k]); }).join('');
    Object.keys(data).forEach(function(k) { if (!SVC_CATS[k]) html += svcGroup(k, data[k]); });
    host.innerHTML = html || '<div class="more-empty">சேவை தகவல் விரைவில் · Services coming soon</div>';
  }

  async function load(force) {
    var refreshBtn = document.getElementById('more-refresh-btn');
    if (refreshBtn) { refreshBtn.classList.add('spinning'); refreshBtn.disabled = true; }
    var aHost = document.getElementById('more-acting');
    var sHost = document.getElementById('more-services');
    if (!force) {
      if (aHost) aHost.innerHTML = '<div class="skeleton-list"><div class="skeleton"></div></div>';
      if (sHost) sHost.innerHTML = '<div class="skeleton-list"><div class="skeleton"></div></div>';
    }
    try {
      var acting = await PannaiAPI.getActingDrivers(!!force).catch(function() { return []; });
      renderActing(acting);
    } catch (_) { renderActing([]); }
    try {
      var svc = await PannaiAPI.getServices(!!force).catch(function() { return {}; });
      renderServices(svc);
    } catch (_) { renderServices({}); }
    if (refreshBtn) setTimeout(function() { refreshBtn.classList.remove('spinning'); refreshBtn.disabled = false; }, 500);
  }

  var inited = false;
  function init() {
    if (inited) return;
    inited = true;
    load(false);
    var refreshBtn = document.getElementById('more-refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', function() { load(true); });
  }

  return { init: init };
})();
