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

  // ── Init sections ──────────────────────────────────────
  Bus.init();
  Auto.init();
  switchSection(startSection);

});
