// ── App Shell ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {

  // ── PWA Visit Ping (analytics — fire and forget) ───────
  (function pingVisit() {
    try {
      var VID_KEY = 'pannai:visitor-id';
      var vid = localStorage.getItem(VID_KEY);
      if (!vid) {
        // Generate a random visitor ID: "v-<timestamp36>-<random8>" — no personal data
        vid = 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(VID_KEY, vid);
      }
      var standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true;
      fetch('/api/pwa/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: vid, is_standalone: standalone }),
        keepalive: true,
      }).catch(function() { /* offline — skip silently */ });
    } catch (_) { /* localStorage blocked — skip */ }
  })();

  // ── Service Worker ─────────────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/pwa/sw.js', { scope: '/pwa/' })
      .catch(function(err) { console.warn('SW registration failed:', err); });
  }

  // ── Section switching ──────────────────────────────────
  function switchSection(id, pushHash) {
    document.body.dataset.section = id;
    document.querySelectorAll('.section').forEach(function(s) {
      s.hidden = (s.id !== 'section-' + id);
    });
    document.querySelectorAll('.nav-tab').forEach(function(t) {
      var on = t.dataset.section === id;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (pushHash && window.location.hash !== '#' + id) {
      history.replaceState(null, '', '#' + id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      switchSection(tab.dataset.section, true);
    });
  });

  window.addEventListener('hashchange', function() {
    var h = window.location.hash.replace('#', '');
    if (h === 'bus' || h === 'auto') switchSection(h, false);
  });

  // Handle deep links (#bus / #auto in URL)
  var hash = window.location.hash.replace('#', '');
  var startSection = (hash === 'auto') ? 'auto' : 'bus';

  // ── Online/Offline banner ──────────────────────────────
  var banner = document.getElementById('offline-banner');
  function updateOnline() {
    banner.classList.toggle('visible', !navigator.onLine);
  }
  window.addEventListener('online', updateOnline);
  window.addEventListener('offline', updateOnline);
  updateOnline();

  // ── Install-to-home-screen banner ──────────────────────
  // Show Tamil instructions on browsers. Hide if already installed or dismissed.
  (function() {
    var banner = document.getElementById('install-banner');
    var steps = document.getElementById('install-steps');
    var closeBtn = document.getElementById('install-close');
    if (!banner || !steps || !closeBtn) return;

    // Already installed? (standalone display-mode or iOS home-screen PWA)
    var isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Permanently installed via appinstalled event in a past session?
    var INSTALLED_KEY = 'pannai:app-installed';
    if (localStorage.getItem(INSTALLED_KEY) === 'true') return;

    // User dismissed before? (remember for 14 days)
    var DISMISS_KEY = 'pannai:install-dismissed';
    var dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && (Date.now() - parseInt(dismissed, 10)) < 3 * 24 * 60 * 60 * 1000) return;

    // Detect platform for appropriate instructions
    var ua = navigator.userAgent || '';
    var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    var isAndroid = /Android/.test(ua);

    var instructions;
    if (isIOS) {
      instructions = [
        'கீழ உள்ள <b>Share ⬆️</b> button-ஐ அழுத்துங்க',
        '<b>"Add to Home Screen"</b> தேர்ந்தெடுங்க',
        'வலதுபக்க <b>"Add"</b> button-ஐ அழுத்துங்க'
      ];
    } else if (isAndroid) {
      instructions = [
        'மேல வலதுபக்க <b>⋮ Menu</b>-வ அழுத்துங்க',
        '<b>"Install app"</b> அல்லது <b>"Add to Home screen"</b> தேர்ந்தெடுங்க',
        '<b>"Install"</b> button-ஐ அழுத்துங்க'
      ];
    } else {
      // Desktop / unknown — show both
      instructions = [
        'Browser menu-வ திறங்க (⋮ அல்லது ⬆️)',
        '<b>"Install"</b> அல்லது <b>"Add to Home Screen"</b> தேர்வு செய்யுங்க',
        'உறுதிப்படுத்துங்க — App-ஆ install ஆகும்!'
      ];
    }

    steps.innerHTML = instructions.map(function(s) {
      return '<li>' + s + '</li>';
    }).join('');
    banner.hidden = false;

    closeBtn.addEventListener('click', function() {
      banner.hidden = true;
      try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch(_) {}
    });

    // If browser fires 'appinstalled' — hide permanently (no expiry)
    window.addEventListener('appinstalled', function() {
      banner.hidden = true;
      try {
        localStorage.setItem(INSTALLED_KEY, 'true'); // permanent — never show again
        localStorage.removeItem(DISMISS_KEY);         // clear any old dismiss timer
      } catch(_) {}
    });
  })();

  // ── Hamburger drawer + sheets ──────────────────────────
  (function initMenu() {
    var menuBtn   = document.getElementById('menu-btn');
    var drawer    = document.getElementById('menu-drawer');
    var backdrop  = document.getElementById('menu-backdrop');
    var closeBtn  = document.getElementById('menu-close');
    if (!menuBtn || !drawer || !backdrop) return;

    function openDrawer() {
      backdrop.hidden = false;
      requestAnimationFrame(function() {
        backdrop.classList.add('visible');
        drawer.classList.add('open');
      });
      drawer.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('visible');
      drawer.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      // Hide backdrop only after fade
      setTimeout(function() {
        if (!backdrop.classList.contains('visible')) backdrop.hidden = true;
      }, 240);
    }

    menuBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });

    // Menu items → open corresponding sheet
    drawer.querySelectorAll('.menu-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var sheetId = item.dataset.sheet;
        openSheet(sheetId);
      });
    });

    function openSheet(id) {
      var sheet = document.getElementById('sheet-' + id);
      if (!sheet) return;
      closeDrawer();
      // Wait for drawer close animation then slide sheet in
      setTimeout(function() {
        sheet.hidden = false;
        requestAnimationFrame(function() { sheet.classList.add('open'); });
      }, 120);
    }

    function closeSheet(id) {
      var sheet = document.getElementById('sheet-' + id);
      if (!sheet) return;
      sheet.classList.remove('open');
      setTimeout(function() { sheet.hidden = true; }, 280);
    }

    // Wire all back buttons
    document.querySelectorAll('[data-close-sheet]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        closeSheet(btn.dataset.closeSheet);
      });
    });

    // ESC also closes open sheet
    document.addEventListener('keydown', function(e) {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.menu-sheet.open').forEach(function(s) {
        var id = s.id.replace('sheet-', '');
        closeSheet(id);
      });
    });
  })();

  // ── Feedback form submit (APK style with success view) ──
  (function initFeedback() {
    var form       = document.getElementById('feedback-form');
    var btn        = document.getElementById('feedback-submit-btn');
    var btnTxt     = document.getElementById('feedback-submit-text');
    var result     = document.getElementById('feedback-result');
    var msgField   = document.getElementById('fb-msg');
    var counter    = document.getElementById('fb-counter-val');
    var counterEl  = counter && counter.parentElement;
    var formView   = document.getElementById('feedback-form-view');
    var successView= document.getElementById('feedback-success-view');
    var againBtn   = document.getElementById('feedback-again-btn');
    if (!form) return;

    // Live character counter
    if (msgField && counter) {
      msgField.addEventListener('input', function() {
        var n = msgField.value.length;
        counter.textContent = n;
        if (counterEl) counterEl.classList.toggle('fb-counter-ok', n >= 5);
      });
    }

    // "Send another" button resets to form view
    if (againBtn) {
      againBtn.addEventListener('click', function() {
        form.reset();
        if (counter) counter.textContent = '0';
        if (counterEl) counterEl.classList.remove('fb-counter-ok');
        if (successView) successView.hidden = true;
        if (formView) formView.hidden = false;
      });
    }

    form.addEventListener('submit', async function(ev) {
      ev.preventDefault();
      var name = (document.getElementById('fb-name').value || '').trim();
      var msg  = (msgField.value || '').trim();

      if (!msg || msg.length < 5) {
        showRes('கொஞ்சம் சொல்லுங்க — சில வார்த்தைகள் போதும் 😊', false);
        return;
      }

      btn.disabled = true;
      btnTxt.textContent = '⏳ அனுப்புகிறோம்...';
      if (result) result.hidden = true;

      try {
        var resp = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, name_or_contact: name || 'Anonymous' }),
        });
        var json = await resp.json();
        if (json.success) {
          // Show APK-style success view
          if (formView) formView.hidden = true;
          if (successView) successView.hidden = false;
        } else {
          showRes('அனுப்ப முடியலை — ' + (json.error || 'try again'), false);
        }
      } catch (e) {
        showRes('அனுப்ப முடியலை — கொஞ்சம் கழிச்சு try பண்ணுங்க', false);
      } finally {
        btn.disabled = false;
        btnTxt.innerHTML = 'அனுப்புங்க &nbsp;📨';
      }
    });

    function showRes(msg, ok) {
      if (!result) return;
      result.textContent = msg;
      result.className   = 'feedback-result ' + (ok ? 'ok' : 'err');
      result.hidden      = false;
    }
  })();

  // ── Init sections ──────────────────────────────────────
  Bus.init();
  Auto.init();
  switchSection(startSection);

});
