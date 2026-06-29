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
    return { auto: '🛺', van: '🚐', car: '🚗', taxi: '🚖', any: '🚙' }[(t || '').toLowerCase()] || '🚗';
  }

  // ── Acting (substitute) drivers — profile rows w/ avatar ──
  var VEH_TA = { auto: 'ஆட்டோ', van: 'வேன்', car: 'கார்', taxi: 'டாக்ஸி', any: 'எல்லா வண்டியும்' };
  function actingRow(d) {
    var verified = d.phone_verified !== false;
    var call = (hasPhone(d.phone) && verified)
      ? '<a class="more-call" href="' + telHref(d.phone) + '">📞 அழைக்க</a>'
      : '<span class="more-call more-call-pending">விரைவில்</span>';
    var cover = d.coverage_tamil || '';
    var sched = d.schedule_tamil || '';
    var vehTa = VEH_TA[(d.vehicle_type || '').toLowerCase()] || '';
    return '<div class="acting-row">' +
      '<div class="acting-avatar">' + vehIcon(d.vehicle_type) + '</div>' +
      '<div class="acting-info">' +
        '<span class="acting-ta">' + esc(d.name_tamil) +
          (vehTa ? ' <span class="acting-veh-chip">' + vehTa + '</span>' : '') + '</span>' +
        (d.name_english ? '<span class="acting-en">' + esc(d.name_english) + '</span>' : '') +
        (cover ? '<span class="acting-meta">📍 ' + esc(cover) + '</span>' : '') +
        (sched ? '<span class="acting-meta">🕐 ' + esc(sched) + '</span>' : '') +
      '</div>' + call + '</div>';
  }

  // ── Acting driver registration form ───────────────────────
  function initRegForm() {
    var form = document.getElementById('acting-reg-form');
    if (!form) return;
    var btn = document.getElementById('arf-btn');
    var btnTxt = document.getElementById('arf-btn-text');
    var result = document.getElementById('arf-result');
    var phoneErr = document.getElementById('arf-phone-err');
    var phoneInput = document.getElementById('arf-phone');

    function showResult(msg, ok) {
      result.textContent = msg;
      result.className = 'auto-form-result ' + (ok ? 'result-ok' : 'result-err');
      result.hidden = false;
    }
    if (phoneInput) phoneInput.addEventListener('input', function() {
      var d = phoneInput.value.replace(/\D/g, '').slice(0, 10);
      if (phoneInput.value !== d) phoneInput.value = d;
      if (phoneErr) { phoneErr.hidden = true; phoneErr.textContent = ''; }
    });

    form.addEventListener('submit', async function(ev) {
      ev.preventDefault();
      var name = (document.getElementById('arf-name').value || '').trim();
      var phone = (phoneInput.value || '').trim();
      var vehicle = (document.getElementById('arf-vehicle').value || '').trim();
      var area = (document.getElementById('arf-area').value || '').trim();
      var extra = (document.getElementById('arf-msg').value || '').trim();

      if (!(phone.length === 10 && /^[6-9]/.test(phone))) {
        if (phoneErr) { phoneErr.textContent = '10 இலக்க மொபைல் எண்ணை சரியாக உள்ளிடுங்கள் (6/7/8/9-ல் தொடங்கணும்).'; phoneErr.hidden = false; }
        phoneInput.focus();
        return;
      }
      if (!name) { showResult('பெயரை கொடுங்கள்', false); return; }

      var message =
        '[மாற்று ஓட்டுநர் பதிவு]\n' +
        'பெயர்: ' + name + '\n' +
        'தொலைபேசி: ' + phone + '\n' +
        'வண்டி: ' + vehicle + '\n' +
        (area ? 'பகுதி: ' + area + '\n' : '') +
        (extra ? 'குறிப்பு: ' + extra : '');

      btn.disabled = true;
      btnTxt.textContent = '⏳ அனுப்புகிறோம்...';
      result.hidden = true;
      try {
        var base = (location.hostname === 'app.pannaipuram.com')
          ? 'https://api.pannaipuram.com'
          : (location.hostname.endsWith('.github.io') || location.hostname.endsWith('.pages.dev') || location.hostname.endsWith('.netlify.app'))
            ? 'https://pannaipuram-api.onrender.com' : '';
        var resp = await fetch(base + '/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message, name_or_contact: name + ' · ' + phone }),
        });
        var json = await resp.json();
        if (json.success) {
          showResult('✅ பதிவு கிடைச்சது! விரைவில் தொடர்பு கொள்வோம்.', true);
          form.reset();
        } else {
          showResult('அனுப்ப முடியலை — மீண்டும் முயற்சிக்கவும்', false);
        }
      } catch (e) {
        showResult('இணைப்பு இல்லை — கொஞ்சம் கழிச்சு try பண்ணுங்க', false);
      } finally {
        btn.disabled = false;
        btnTxt.textContent = '📩 பதிவு அனுப்புங்க';
      }
    });
  }

  // ── Local services (grouped by category) ──────────────────
  var SVC_CATS = {
    milk:        { emoji: '🥛', ta: 'பால்',          tint: '#EAF4FE' },
    post:        { emoji: '📮', ta: 'தபால்',         tint: '#FDECEC' },
    flower:      { emoji: '🌺', ta: 'பூ',            tint: '#FCEAF3' },
    plumber:     { emoji: '🔧', ta: 'பிளம்பர்',      tint: '#EAF1F8' },
    electrician: { emoji: '⚡', ta: 'எலக்ட்ரீஷியன்', tint: '#FFF8E1' },
    grocery:     { emoji: '🛒', ta: 'மளிகை',        tint: '#EAF7EC' },
    carpenter:   { emoji: '🪚', ta: 'தச்சர்',        tint: '#F6EFE7' },
    other:       { emoji: '🛍', ta: 'மற்றவை',       tint: '#F3E8F9' },
  };
  function svcRow(s) {
    var call = hasPhone(s.phone)
      ? '<a class="more-call" href="' + telHref(s.phone) + '">📞 அழைக்க</a>'
      : '<span class="more-call more-call-pending">விரைவில்</span>';
    var area = s.area_tamil || s.area_english || '';
    return '<div class="svc-row">' +
      '<div class="svc-row-info">' +
        '<span class="svc-row-ta">' + esc(s.name_tamil || s.name_english) + '</span>' +
        (s.name_english && s.name_tamil ? '<span class="svc-row-en">' + esc(s.name_english) + '</span>' : '') +
        (area ? '<span class="svc-row-meta">📍 ' + esc(area) + '</span>' : '') +
      '</div>' + call + '</div>';
  }
  // One category = one compact white panel with a tinted header + rows
  function svcGroup(cat, list) {
    if (!list || !list.length) return '';
    var meta = SVC_CATS[cat] || { emoji: '🛍', ta: cat, tint: '#F3E8F9' };
    return '<div class="svc-panel">' +
      '<div class="svc-panel-head" style="background:' + meta.tint + '">' +
        '<span class="svc-panel-ic">' + meta.emoji + '</span>' +
        '<span class="svc-panel-ta">' + esc(meta.ta) + '</span>' +
        '<span class="svc-panel-count">' + list.length + '</span>' +
      '</div>' +
      '<div class="svc-rows">' + list.map(svcRow).join('') + '</div>' +
      '</div>';
  }

  function renderActing(drivers) {
    var host = document.getElementById('more-acting');
    if (!host) return;
    var active = (drivers || []).filter(function(d) { return d.is_active !== false; });
    host.innerHTML = active.length
      ? active.map(actingRow).join('')
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

  async function load(force, silent) {
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
    if (force && !silent && window.showToast) window.showToast('✅ புதுப்பிக்கப்பட்டது · Updated');
    if (refreshBtn) setTimeout(function() { refreshBtn.classList.remove('spinning'); refreshBtn.disabled = false; }, 500);
  }

  var inited = false;
  function init() {
    if (inited) { load(true, true); return; }   // re-open → refresh in place
    inited = true;
    load(false);                                  // first open → skeleton + fetch
    initRegForm();
    var refreshBtn = document.getElementById('more-refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', function() {
      if (window.PannaiRefreshAll) window.PannaiRefreshAll(); else load(true);
    });
  }

  // Silent reload for the global "refresh everything" sweep
  function refresh() { return load(true, true); }

  return { init: init, refresh: refresh };
})();
