// ── App Shell ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {

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

  // ── Init sections ──────────────────────────────────────
  Bus.init();
  Auto.init();
  switchSection(startSection);

});
