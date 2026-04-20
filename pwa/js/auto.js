// ── Auto/Van Section Controller ──────────────────────────────
var Auto = (function() {

  function vehicleIcon(type) {
    var map = { auto: '🛺', van: '🚐', car: '🚕', taxi: '🚕' };
    return map[(type || '').toLowerCase()] || '🚗';
  }

  function renderCard(driver) {
    var icon = vehicleIcon(driver.vehicle_type);
    var hasPhone = driver.phone && driver.phone.replace(/\D/g, '').length >= 10;
    var callEl = hasPhone
      ? '<a href="tel:' + driver.phone + '" class="call-btn">📞 அழைக்க</a>'
      : '<span class="call-btn call-btn-pending">விரைவில்</span>';

    var coverage = driver.coverage_tamil || driver.schedule_tamil || '';

    return '<div class="driver-card">' +
      '<div class="driver-icon">' + icon + '</div>' +
      '<div class="driver-info">' +
        '<span class="driver-name-ta">' + driver.name_tamil + '</span>' +
        (driver.name_english ? '<span class="driver-name-en">' + driver.name_english + '</span>' : '') +
        (coverage ? '<span class="driver-meta">' + coverage + '</span>' : '') +
      '</div>' +
      callEl +
    '</div>';
  }

  async function loadDrivers(force) {
    var list = document.getElementById('driver-list');
    var refreshBtn = document.getElementById('auto-refresh-btn');

    // On first load: show skeletons. On refresh: don't blank out — just spin the icon.
    if (!force) {
      list.innerHTML = '<div class="skeleton-list"><div class="skeleton"></div><div class="skeleton"></div></div>';
    }
    if (refreshBtn) {
      refreshBtn.classList.add('spinning');
      refreshBtn.disabled = true;
    }

    try {
      var drivers = await PannaiAPI.getAutoDrivers(!!force);
      var active = drivers.filter(function(d) { return d.is_active !== false; });
      if (active.length) {
        list.innerHTML = active.map(renderCard).join('');
      } else {
        list.innerHTML =
          '<div class="auto-empty">' +
          '<div class="auto-empty-icon">🛺</div>' +
          '<p class="auto-empty-ta">ஆட்டோ தகவல் விரைவில் சேர்க்கப்படும்</p>' +
          '<p class="auto-empty-en">Driver info coming soon</p>' +
          '</div>';
      }
      if (force) showToast('✅ புதுப்பிக்கப்பட்டது · Updated');
    } catch(e) {
      if (force) {
        // Refresh failed — keep existing list, just toast the error
        showToast('❌ Connection issue — try again');
      } else {
        list.innerHTML =
          '<div class="load-error">' +
          '<div class="load-error-icon">📡</div>' +
          '<p class="load-error-ta">தகவல் கிடைக்கவில்லை</p>' +
          '<p class="load-error-en">Could not load drivers. Please check your connection.</p>' +
          '<button class="retry-btn" id="auto-retry-btn">மீண்டும் முயற்சிக்க</button>' +
          '</div>';
        var btn = document.getElementById('auto-retry-btn');
        if (btn) btn.addEventListener('click', function(){ loadDrivers(false); });
      }
    } finally {
      if (refreshBtn) {
        // Let one full rotation complete before unlocking
        setTimeout(function() {
          refreshBtn.classList.remove('spinning');
          refreshBtn.disabled = false;
        }, 500);
      }
    }
  }

  // Small ephemeral toast pinned below the header
  function showToast(msg) {
    var existing = document.getElementById('auto-toast');
    if (existing) existing.remove();
    var el = document.createElement('div');
    el.id = 'auto-toast';
    el.className = 'auto-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    // Trigger enter animation
    requestAnimationFrame(function() { el.classList.add('visible'); });
    setTimeout(function() {
      el.classList.remove('visible');
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 220);
    }, 1800);
  }

  // ── Registration contact form ──────────────────────────────
  function initContactForm() {
    var form   = document.getElementById('auto-contact-form');
    var btn    = document.getElementById('auto-form-btn');
    var btnTxt = document.getElementById('auto-form-btn-text');
    var result = document.getElementById('auto-form-result');
    if (!form) return;

    form.addEventListener('submit', async function(ev) {
      ev.preventDefault();
      var name    = (document.getElementById('acf-name').value || '').trim();
      var vehicle = (document.getElementById('acf-vehicle').value || '').trim();
      var area    = (document.getElementById('acf-area').value || '').trim();
      var extra   = (document.getElementById('acf-msg').value || '').trim();

      if (!name) {
        showResult('❌ பெயர் கொடுங்க சார்', false);
        return;
      }

      var message =
        '[ஆட்டோ பதிவு — Auto Register]\n' +
        'பெயர்: ' + name + '\n' +
        'வண்டி: ' + vehicle + '\n' +
        (area  ? 'பகுதி: ' + area + '\n'  : '') +
        (extra ? 'குறிப்பு: ' + extra     : '');

      btn.disabled = true;
      btnTxt.textContent = '⏳ அனுப்புகிறோம்...';
      result.hidden = true;

      try {
        var resp = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message, name_or_contact: name }),
        });
        var json = await resp.json();
        if (json.success) {
          showResult('✅ Admin-கு சேர்ந்துவிட்டது! விரைவில் தொடர்பு கொள்வோம்.', true);
          form.reset();
        } else {
          showResult('❌ Error: ' + (json.error || 'Try again'), false);
        }
      } catch(e) {
        showResult('❌ Network error — check your connection and retry', false);
      } finally {
        btn.disabled = false;
        btnTxt.textContent = '📩 Admin-கு அனுப்பவும்';
      }
    });

    function showResult(msg, ok) {
      result.textContent = msg;
      result.className   = 'auto-form-result ' + (ok ? 'result-ok' : 'result-err');
      result.hidden      = false;
    }
  }

  async function init() {
    await loadDrivers(false);
    initContactForm();

    // Wire refresh button — forces cache bypass
    var refreshBtn = document.getElementById('auto-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() { loadDrivers(true); });
    }
  }

  return { init: init };
})();
