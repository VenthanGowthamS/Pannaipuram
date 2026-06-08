// ── Emergency Contacts Section Controller ────────────────────
// Fetches /api/emergency/contacts (grouped by category) and renders
// one-tap call cards. 100% useful offline once cached.
var Emergency = (function() {

  // Escape user/DB-sourced strings before putting them in innerHTML (XSS-safe)
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Display order + Tamil/English labels + emoji per category.
  // Medical first (most time-critical), then police, fire, power, other.
  var CATS = [
    { key: 'medical', emoji: '🏥', ta: 'மருத்துவம்',  en: 'Medical & Ambulance' },
    { key: 'police',  emoji: '🚓', ta: 'போலீஸ்',      en: 'Police' },
    { key: 'fire',    emoji: '🚒', ta: 'தீயணைப்பு',   en: 'Fire & Rescue' },
    { key: 'power',   emoji: '⚡', ta: 'மின்சாரம்',    en: 'Electricity (TNEB)' },
    { key: 'other',   emoji: '📞', ta: 'பிற உதவி எண்', en: 'Other Helplines' },
  ];

  // Phone number for the tel: link — strip spaces/dashes for dialing
  function telHref(phone) {
    return 'tel:' + String(phone || '').replace(/[^0-9+]/g, '');
  }
  // Pretty display of phone (keep dashes as stored)
  function telDisplay(phone) {
    return String(phone || '').trim();
  }

  function renderContactCard(c) {
    var nat = c.is_national
      ? '<span class="em-badge em-badge-nat">இந்தியா முழுவதும்</span>' : '';
    return '' +
      '<a class="em-card" href="' + telHref(c.phone) + '">' +
        '<div class="em-card-info">' +
          '<span class="em-card-ta">' + esc(c.name_tamil) + '</span>' +
          (c.name_english ? '<span class="em-card-en">' + esc(c.name_english) + nat + '</span>' : nat) +
          '<span class="em-card-phone">' + esc(telDisplay(c.phone)) + '</span>' +
        '</div>' +
        '<span class="em-call-btn">📞 அழைக்க</span>' +
      '</a>';
  }

  function renderGroup(cat, list) {
    if (!list || !list.length) return '';
    var cards = list.map(renderContactCard).join('');
    return '' +
      '<section class="em-group">' +
        '<div class="em-group-head">' +
          '<span class="em-group-emoji">' + cat.emoji + '</span>' +
          '<div class="em-group-titles">' +
            '<span class="em-group-ta">' + cat.ta + '</span>' +
            '<span class="em-group-en">' + cat.en + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="em-group-cards">' + cards + '</div>' +
      '</section>';
  }

  function render(data) {
    var host = document.getElementById('em-list');
    if (!host) return;
    var html = CATS.map(function(cat) {
      return renderGroup(cat, data && data[cat.key]);
    }).join('');

    // Any categories returned that we didn't list above (future-proof)
    if (data) {
      Object.keys(data).forEach(function(k) {
        if (!CATS.some(function(c) { return c.key === k; })) {
          html += renderGroup({ emoji: '📞', ta: k, en: '' }, data[k]);
        }
      });
    }

    host.innerHTML = html || (
      '<div class="em-empty">' +
        '<div class="em-empty-icon">📞</div>' +
        '<p class="em-empty-ta">அவசர எண்கள் விரைவில் சேர்க்கப்படும்</p>' +
        '<p class="em-empty-en">Emergency numbers coming soon</p>' +
      '</div>'
    );
  }

  async function load(force) {
    var host = document.getElementById('em-list');
    var refreshBtn = document.getElementById('em-refresh-btn');
    if (!force && host) {
      host.innerHTML = '<div class="skeleton-list"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>';
    }
    if (refreshBtn) { refreshBtn.classList.add('spinning'); refreshBtn.disabled = true; }

    try {
      var data = await PannaiAPI.getEmergency(!!force);
      render(data);
      if (force && window.showToast) window.showToast('✅ புதுப்பிக்கப்பட்டது · Updated');
    } catch (e) {
      if (force && window.showToast) window.showToast('❌ இணைப்பு இல்லை · Try again');
      if (host) {
        host.innerHTML =
          '<div class="load-error">' +
          '<div class="load-error-icon">📡</div>' +
          '<p class="load-error-ta">தகவல் கிடைக்கவில்லை</p>' +
          '<p class="load-error-en">Could not load. Check your connection.</p>' +
          '<button class="retry-btn" id="em-retry-btn">மீண்டும் முயற்சிக்க</button>' +
          '</div>';
        var btn = document.getElementById('em-retry-btn');
        if (btn) btn.addEventListener('click', function() { load(false); });
      }
    } finally {
      if (refreshBtn) {
        setTimeout(function() {
          refreshBtn.classList.remove('spinning');
          refreshBtn.disabled = false;
        }, 500);
      }
    }
  }

  var inited = false;
  function init() {
    if (inited) return;   // only fetch once (section may switch in/out)
    inited = true;
    load(false);
    var refreshBtn = document.getElementById('em-refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', function() { load(true); });
  }

  return { init: init };
})();
