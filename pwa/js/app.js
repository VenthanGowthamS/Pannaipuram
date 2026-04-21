// ── Install wall: show full-screen install UI on ?install=1 ─
// This is used for the WhatsApp share link. The page loads showing
// ONLY a giant "Install" button — one tap fires the native prompt.
// Chrome still needs one user gesture before calling .prompt(), but
// the wall IS that gesture — user taps the wall button → installed.
(function() {
  var params = new URLSearchParams(window.location.search);
  if (params.get('install') !== '1') return;
  // Show wall immediately (before DOMContentLoaded) by inlining a style.
  // Actual element interaction handled after DOMContentLoaded below.
  window._installWallRequested = true;
})();

// ── Capture beforeinstallprompt BEFORE DOMContentLoaded ────
// Chrome fires this early — if we wait for DOMContentLoaded we miss it.
// Store on window._dip so the install logic inside DOMContentLoaded can use it.
window._dip = null; // deferred install prompt
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();          // stop Chrome's own mini-infobar
  window._dip = e;
  // Chrome only fires this when the app is NOT installed.
  // Clear stale flags — user may have uninstalled the PWA
  // (localStorage survives uninstall, but Chrome re-fires this event
  //  to signal "installable again").
  try {
    localStorage.removeItem('pannai:app-installed');
    localStorage.removeItem('pannai:install-dismissed'); // show banner fresh
  } catch(_) {}
  // If DOM is already ready, show banner immediately
  if (document.readyState !== 'loading') {
    window._showInstallBanner && window._showInstallBanner();
    window._updateInstallSheet && window._updateInstallSheet();
  }
});

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

  // ── Service Worker (auto-update on installed PWAs) ─────
  // Critical: installed iPhone/Android PWAs don't reload on their own.
  // This flow forces updates without requiring user to reinstall/reopen:
  //   1. On app load, check for a new SW version
  //   2. When new SW is installed (waiting), tell it to skipWaiting
  //   3. When the active worker changes (controllerchange), reload the page
  //   4. Re-check for updates whenever tab becomes visible (user returns to app)
  if ('serviceWorker' in navigator) {
    var _didReloadForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      if (_didReloadForUpdate) return;   // prevent double-reload loop
      _didReloadForUpdate = true;
      window.location.reload();
    });

    navigator.serviceWorker.register('/pwa/sw.js', { scope: '/pwa/' })
      .then(function(reg) {
        // If a new SW is already waiting when this page loaded, activate it now
        if (reg.waiting) { reg.waiting.postMessage({ type: 'SKIP_WAITING' }); }

        // Fires whenever a new SW version is found (downloading)
        reg.addEventListener('updatefound', function() {
          var newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener('statechange', function() {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              // New version ready — tell it to take over, controllerchange -> reload
              newSW.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        // Re-check for updates each time the app becomes visible
        // (handles case where user keeps PWA open for days)
        document.addEventListener('visibilitychange', function() {
          if (document.visibilityState === 'visible') {
            reg.update().catch(function() {});
          }
        });
      })
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

  // ── Install helpers (use window._dip set above DOMContentLoaded) ──
  var INSTALLED_KEY = 'pannai:app-installed';
  var DISMISS_KEY   = 'pannai:install-dismissed';

  function _isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           localStorage.getItem(INSTALLED_KEY) === 'true';
  }
  function _isDismissedRecently() {
    var d = localStorage.getItem(DISMISS_KEY);
    return d && (Date.now() - parseInt(d, 10)) < 3 * 24 * 60 * 60 * 1000;
  }

  var _bannerClickBound = false;

  function _showInstallBanner() {
    var banner = document.getElementById('install-banner');
    var steps  = document.getElementById('install-steps');
    if (!banner || !steps) return;
    if (_isInstalled() || _isDismissedRecently()) return;
    if (!banner.hidden) return; // already visible

    var ua = navigator.userAgent || '';
    var isIOS     = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    var isAndroid = /Android/.test(ua);
    var instructions;

    if (isIOS) {
      instructions = [
        'கீழ உள்ள <b>Share ⬆️</b> button-ஐ அழுத்துங்க',
        '<b>"Add to Home Screen"</b> தேர்ந்தெடுங்க',
        'வலதுபக்க <b>"Add"</b> button-ஐ அழுத்துங்க'
      ];
    } else if (isAndroid && window._dip) {
      // One-click native install — prominent button, no manual steps needed
      instructions = [
        '<button id="install-native-btn" class="install-native-btn">📲 Install App · Home-க்கு சேர்க்க</button>',
        '<span class="install-native-hint">ஒரே click-ல install ஆகும் — browser-ல திறக்க வேண்டாம்</span>'
      ];
    } else {
      // Android without native prompt OR desktop — show manual steps
      instructions = [
        'மேல வலதுபக்க <b>⋮ Menu</b>-வ அழுத்துங்க',
        '<b>"Install app"</b> அல்லது <b>"Add to Home screen"</b> தேர்ந்தெடுங்க',
        '<b>"Install"</b> button-ஐ அழுத்துங்க'
      ];
    }

    steps.innerHTML = instructions.map(function(s) { return '<li>' + s + '</li>'; }).join('');
    banner.hidden = false;

    // Tap-to-install on Android when native prompt available
    if (isAndroid && window._dip) {
      var nativeBtn = document.getElementById('install-native-btn');
      if (nativeBtn) {
        nativeBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          _triggerNativeInstall();
        });
      }
      if (!_bannerClickBound) {
        _bannerClickBound = true;
        banner.style.cursor = 'pointer';
        banner.addEventListener('click', function(e) {
          if (e.target.id === 'install-close' || e.target.closest('#install-close')) return;
          _triggerNativeInstall();
        });
      }
    }
  }
  // Expose for the top-level beforeinstallprompt handler
  window._showInstallBanner = _showInstallBanner;

  function _triggerNativeInstall() {
    if (!window._dip) return;
    window._dip.prompt();
    window._dip.userChoice.then(function(r) {
      window._dip = null;
      if (r.outcome === 'accepted') _markInstalled();
    }).catch(function() {});
  }

  function _markInstalled() {
    var banner = document.getElementById('install-banner');
    if (banner) banner.hidden = true;
    try { localStorage.setItem(INSTALLED_KEY, 'true'); localStorage.removeItem(DISMISS_KEY); } catch(_) {}
    _updateInstallSheet();
    var m = document.getElementById('menu-install-btn');
    if (m) m.hidden = true;
  }

  function _updateInstallSheet() {
    var ua = navigator.userAgent || '';
    var isIOS     = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    var isAndroid = /Android/.test(ua);
    var elDone = document.getElementById('install-sheet-done');
    var elNative = document.getElementById('install-sheet-android');
    var elManual = document.getElementById('install-sheet-android-manual');
    var elIOS  = document.getElementById('install-sheet-ios');
    if (!elDone) return;
    [elDone, elNative, elManual, elIOS].forEach(function(el) { if (el) el.hidden = true; });
    if (_isInstalled()) {
      elDone.hidden = false;
      var m = document.getElementById('menu-install-btn'); if (m) m.hidden = true;
    } else if (isAndroid && window._dip) {
      elNative.hidden = false;
    } else if (isAndroid) {
      elManual.hidden = false;
    } else if (isIOS) {
      elIOS.hidden = false;
    } else {
      elManual.hidden = false;
    }
  }
  window._updateInstallSheet = _updateInstallSheet;

  // ── Install banner init ─────────────────────────────────
  (function initInstallBanner() {
    var banner   = document.getElementById('install-banner');
    var closeBtn = document.getElementById('install-close');
    if (!banner || !closeBtn) return;

    if (_isInstalled()) { banner.hidden = true; return; }

    var ua    = navigator.userAgent || '';
    var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    var isAndroid = /Android/.test(ua);

    // iOS: show immediately (no beforeinstallprompt on iOS)
    if (isIOS) { _showInstallBanner(); }

    // Android: show immediately if prompt already captured (Chrome fired early),
    // OR fall back to manual steps after 2 seconds if prompt never fires.
    if (isAndroid) {
      if (window._dip) {
        _showInstallBanner();
      } else {
        // Fallback: show manual-steps banner after 2s if beforeinstallprompt still hasn't fired.
        // This covers Samsung Browser, Firefox, and Chrome before engagement threshold.
        setTimeout(function() {
          if (!banner.hidden) return;           // already shown (prompt fired)
          if (_isInstalled() || _isDismissedRecently()) return;
          _showInstallBanner();                 // shows manual ⋮ steps
        }, 2000);
      }
    }

    closeBtn.addEventListener('click', function() {
      banner.hidden = true;
      try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch(_) {}
    });
    window.addEventListener('appinstalled', _markInstalled);
  })();

  // ── Install sheet in hamburger ──────────────────────────
  (function initInstallSheet() {
    var nativeBtn = document.getElementById('install-sheet-native-btn');
    if (nativeBtn) nativeBtn.addEventListener('click', _triggerNativeInstall);

    var installMenuItem = document.getElementById('menu-install-btn');
    if (installMenuItem) {
      installMenuItem.addEventListener('click', _updateInstallSheet);
      if (_isInstalled()) installMenuItem.hidden = true;
    }
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

  // ── Install wall (Android one-tap install via ?install=1 link) ──
  (function initInstallWall() {
    var wall = document.getElementById('install-wall');
    if (!wall) return;
    var ua = navigator.userAgent || '';
    var isAndroid = /Android/.test(ua);

    // Only show on Android + not already installed
    if (!window._installWallRequested || !isAndroid || _isInstalled()) return;

    wall.hidden = false;

    var installBtn = document.getElementById('iw-install-btn');
    var skipBtn    = document.getElementById('iw-skip-btn');

    function closeWall() {
      wall.hidden = true;
      // Clean URL so sharing from inside the app doesn't re-trigger
      try { history.replaceState(null, '', '/pwa/'); } catch(_) {}
    }

    // If prompt already captured (Chrome fired early), wire it immediately
    function bindInstall() {
      if (!window._dip) return;
      installBtn.addEventListener('click', function() {
        window._dip.prompt();
        window._dip.userChoice.then(function(r) {
          window._dip = null;
          if (r.outcome === 'accepted') _markInstalled();
          closeWall();
        }).catch(closeWall);
      });
    }
    bindInstall();

    // If prompt hasn't fired yet, wait for it (Chrome engagement threshold)
    var _origDip = null;
    var _dipWatcher = setInterval(function() {
      if (window._dip && window._dip !== _origDip) {
        _origDip = window._dip;
        clearInterval(_dipWatcher);
        bindInstall();
      }
    }, 200);

    // Fallback: if no prompt after 4s (Samsung Browser, Firefox, etc.)
    // show "tap ⋮ then Install" instructions instead of the button
    setTimeout(function() {
      if (!window._dip) {
        clearInterval(_dipWatcher);
        if (installBtn) {
          installBtn.textContent = '⋮ Menu → "Install app"-ஐ அழுத்துங்க';
          installBtn.style.fontSize = '1rem';
        }
      }
    }, 4000);

    if (skipBtn) skipBtn.addEventListener('click', closeWall);
  })();

  // ── Init sections ──────────────────────────────────────
  Bus.init();
  Auto.init();
  switchSection(startSection);

});
