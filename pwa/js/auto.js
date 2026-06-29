// ── Auto/Van Section Controller ──────────────────────────────
var Auto = (function() {

  // Escape DB-sourced strings before injecting into innerHTML (XSS-safe)
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function vehicleIcon(type) {
    var map = { auto: '🛺', van: '🚐', car: '🚗', taxi: '🚖' };
    return map[(type || '').toLowerCase()] || '🚗';
  }

  function renderCard(driver) {
    var icon = vehicleIcon(driver.vehicle_type);
    var digits = String(driver.phone || '').replace(/\D/g, '');
    var hasPhone = digits.length >= 10;
    var isVerified = driver.phone_verified !== false; // true by default if field absent
    var callEl = (hasPhone && isVerified)
      ? '<a href="tel:' + digits + '" class="call-btn">📞 அழைக்க</a>'
      : '<span class="call-btn call-btn-pending">விரைவில்</span>';

    var coverage = driver.coverage_tamil || driver.schedule_tamil || '';

    return '<div class="driver-card">' +
      '<div class="driver-icon">' + icon + '</div>' +
      '<div class="driver-info">' +
        '<span class="driver-name-ta">' + esc(driver.name_tamil) + '</span>' +
        (driver.name_english ? '<span class="driver-name-en">' + esc(driver.name_english) + '</span>' : '') +
        (coverage ? '<span class="driver-meta">' + esc(coverage) + '</span>' : '') +
      '</div>' +
      callEl +
    '</div>';
  }

  async function loadDrivers(force, silent) {
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
      if (force && !silent) showToast('✅ புதுப்பிக்கப்பட்டது · Updated');
    } catch(e) {
      if (force) {
        // Refresh failed — keep existing list, just toast the error
        if (!silent) showToast('❌ Connection issue — try again');
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
    var form     = document.getElementById('auto-contact-form');
    var btn      = document.getElementById('auto-form-btn');
    var btnTxt   = document.getElementById('auto-form-btn-text');
    var result   = document.getElementById('auto-form-result');
    var phoneErr = document.getElementById('acf-phone-err');
    if (!form) return;

    // Phone validation helper — Indian mobile = EXACTLY 10 digits starting 6/7/8/9
    function validatePhone(val) {
      var digits = val.replace(/\D/g, '');
      return digits.length === 10 && /^[6-9]/.test(digits);
    }

    function clearPhoneErr() {
      if (phoneErr) { phoneErr.hidden = true; phoneErr.textContent = ''; }
      var phoneInput = document.getElementById('acf-phone');
      if (phoneInput) phoneInput.classList.remove('auto-form-input-err');
    }

    function showPhoneErr(msg) {
      if (phoneErr) { phoneErr.textContent = msg; phoneErr.hidden = false; }
      var phoneInput = document.getElementById('acf-phone');
      if (phoneInput) {
        phoneInput.classList.add('auto-form-input-err');
        phoneInput.focus();
      }
    }

    // Clear inline error as user types + keep only digits, max 10
    var phoneInput = document.getElementById('acf-phone');
    if (phoneInput) phoneInput.addEventListener('input', function() {
      var d = phoneInput.value.replace(/\D/g, '').slice(0, 10);
      if (phoneInput.value !== d) phoneInput.value = d;
      clearPhoneErr();
    });

    form.addEventListener('submit', async function(ev) {
      ev.preventDefault();
      clearPhoneErr();

      var name    = (document.getElementById('acf-name').value || '').trim();
      var phone   = (document.getElementById('acf-phone').value || '').trim();
      var vehicle = (document.getElementById('acf-vehicle').value || '').trim();
      var area    = (document.getElementById('acf-area').value || '').trim();
      var extra   = (document.getElementById('acf-msg').value || '').trim();

      // Phone is required
      if (!phone) {
        showPhoneErr('தயவுசெய்து உங்கள் தொலைபேசி எண்ணை உள்ளிடுங்கள்.');
        return;
      }
      if (!validatePhone(phone)) {
        showPhoneErr('10 இலக்க மொபைல் எண்ணை சரியாக உள்ளிடுங்கள் (6/7/8/9-ல் தொடங்கணும்).');
        return;
      }
      if (!name) {
        showResult('பெயரை கொடுங்கள்', false);
        return;
      }

      var message =
        '[ஆட்டோ பதிவு]\n' +
        'பெயர்: ' + name + '\n' +
        'தொலைபேசி: ' + phone + '\n' +
        'வண்டி: ' + vehicle + '\n' +
        (area  ? 'பகுதி: ' + area + '\n'  : '') +
        (extra ? 'குறிப்பு: ' + extra     : '');

      btn.disabled = true;
      btnTxt.textContent = '⏳ அனுப்புகிறோம்...';
      result.hidden = true;

      try {
        var _fbBase = (location.hostname === 'app.pannaipuram.com')
          ? 'https://api.pannaipuram.com'
          : (location.hostname.endsWith('.github.io') || location.hostname.endsWith('.pages.dev') || location.hostname.endsWith('.netlify.app'))
            ? 'https://pannaipuram-api.onrender.com' : '';
        var resp = await fetch(_fbBase + '/api/feedback', {
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
      } catch(e) {
        showResult('இணைப்பு இல்லை — கொஞ்சம் கழிச்சு try பண்ணுங்க', false);
      } finally {
        btn.disabled = false;
        btnTxt.textContent = '📩 விவரங்களை அனுப்புங்கள்';
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

    // Refresh button → refresh ALL sections at once (one tap = everything fresh)
    var refreshBtn = document.getElementById('auto-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() {
        if (window.PannaiRefreshAll) window.PannaiRefreshAll(); else loadDrivers(true);
      });
    }
  }

  // Silent reload for the global "refresh everything" sweep
  function refresh() { return loadDrivers(true, true); }

  return { init: init, refresh: refresh };
})();
