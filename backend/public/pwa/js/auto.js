// ── Auto/Van Section Controller ──────────────────────────────
var Auto = (function() {

  var FALLBACK_PHONE = '9944129218';

  var WA_MESSAGE = encodeURIComponent(
    'வணக்கம் சார் 🙏\n\n' +
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

  async function init() {
    var list = document.getElementById('driver-list');

    // Skeleton while loading
    list.innerHTML = '<div class="skeleton-list"><div class="skeleton"></div><div class="skeleton"></div></div>';

    // Set fallback WhatsApp link immediately
    setContactLink(FALLBACK_PHONE);

    try {
      var drivers = await PannaiAPI.getAutoDrivers();
      var active = drivers.filter(function(d) { return d.is_active !== false; });
      list.innerHTML = active.length
        ? active.map(renderCard).join('')
        : '<p style="padding:16px 0;color:var(--color-muted);font-family:var(--font-tamil)">ஆட்டோ தகவல் விரைவில் சேர்க்கப்படும்</p>';
    } catch(e) {
      list.innerHTML = '<p style="padding:16px 0;color:var(--color-muted);font-family:var(--font-tamil)">தகவல் கிடைக்கவில்லை</p>';
    }

    try {
      var contact = await PannaiAPI.getAutoContact();
      if (contact && contact.phone) {
        setContactLink(contact.phone);
      }
    } catch(e) {
      // fallback link already set
    }
  }

  return { init: init };
})();
