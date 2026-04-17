// ── Auto/Van Section Controller ──────────────────────────────
var Auto = (function() {

  var FALLBACK_PHONE = '9944129218';

  var WA_MESSAGE = encodeURIComponent(
    'சார் 🙏\n\n' +
    'பண்ணைப்புரம் App-ல என்னை Driver-ஆக சேர்க்கணும்.\n\n' +
    'என் பெயர்: \n' +
    'தொலைபேசி: \n' +
    'வண்டி வகை: (ஆட்டோ / வேன் / கார்)\n' +
    'செல்லும் பகுதி: \n\n' +
    'நன்றி!'
  );

  function vehicleIcon(type) {
    var map = { auto: '🛺', van: '🚐', car: '🚕', taxi: '🚕' };
    return map[type] || '🚗';
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

  function setContactLink(phone) {
    var contactLink = document.getElementById('contact-link');
    if (!contactLink) return;
    var cleaned = (phone || FALLBACK_PHONE).replace(/\D/g, '').slice(-10);
    contactLink.href = 'https://wa.me/91' + cleaned + '?text=' + WA_MESSAGE;
  }

  async function loadDrivers() {
    var list = document.getElementById('driver-list');
    list.innerHTML = '<div class="skeleton-list"><div class="skeleton"></div><div class="skeleton"></div></div>';

    try {
      var drivers = await PannaiAPI.getAutoDrivers();
      var active = drivers.filter(function(d) { return d.is_active !== false; });
      if (active.length) {
        list.innerHTML = active.map(renderCard).join('');
      } else {
        list.innerHTML =
          '<div class="auto-empty">' +
          '<div class="auto-empty-icon">🚗</div>' +
          '<p class="auto-empty-ta">ஆட்டோ தகவல் விரைவில் சேர்க்கப்படும்</p>' +
          '<p class="auto-empty-en">Driver info coming soon</p>' +
          '</div>';
      }
    } catch(e) {
      list.innerHTML =
        '<div class="load-error">' +
        '<div class="load-error-icon">📡</div>' +
        '<p class="load-error-ta">தகவல் கிடைக்கவில்லை</p>' +
        '<p class="load-error-en">Could not load drivers. Please check your connection.</p>' +
        '<button class="retry-btn" id="auto-retry-btn">மீண்டும் முயற்சிக்க</button>' +
        '</div>';
      var btn = document.getElementById('auto-retry-btn');
      if (btn) btn.addEventListener('click', loadDrivers);
    }
  }

  async function init() {
    setContactLink(FALLBACK_PHONE);
    await loadDrivers();

    try {
      var contact = await PannaiAPI.getAutoContact();
      if (contact && contact.phone) setContactLink(contact.phone);
    } catch(e) { /* fallback already set */ }
  }

  return { init: init };
})();
