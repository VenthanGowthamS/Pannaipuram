// ── Auto/Van Section Controller ──────────────────────────────
var Auto = (function() {

  function vehicleIcon(type) {
    var map = { auto: '🛺', van: '🚐', car: '🚕', taxi: '🚕' };
    return map[type] || '🚗';
  }

  function renderCard(driver) {
    var hasPhone = driver.phone && driver.phone.replace(/\D/g,'').length >= 10;
    var callEl = hasPhone
      ? '<a href="tel:' + driver.phone + '" class="call-btn">அழைக்க</a>'
      : '<span class="call-btn call-btn-pending">விரைவில்</span>';

    var meta = vehicleIcon(driver.vehicle_type);
    if (driver.coverage_tamil) meta += ' · ' + driver.coverage_tamil;

    return '<div class="driver-card">' +
      '<div class="driver-info">' +
        '<span class="driver-name-ta">' + driver.name_tamil + '</span>' +
        (driver.name_english ? '<span class="driver-name-en">' + driver.name_english + '</span>' : '') +
        '<span class="driver-meta">' + meta + '</span>' +
        (driver.schedule_tamil ? '<span class="driver-meta">' + driver.schedule_tamil + '</span>' : '') +
      '</div>' +
      callEl +
    '</div>';
  }

  async function init() {
    var list = document.getElementById('driver-list');
    var contactLink = document.getElementById('contact-link');

    // Skeleton while loading
    list.innerHTML = '<div class="skeleton-list"><div class="skeleton"></div><div class="skeleton"></div></div>';

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
        contactLink.href = 'https://wa.me/91' + contact.phone.replace(/\D/g,'').slice(-10);
        contactLink.textContent = (contact.name_tamil || contact.name || '') + ': ' + contact.phone;
      }
    } catch(e) {
      // no-op — contact link stays hidden
    }
  }

  return { init: init };
})();
