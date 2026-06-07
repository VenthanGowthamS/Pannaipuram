// ── Hospital & Doctors Section Controller ────────────────────
// Fetches /api/hospital/list + /api/hospital/doctors and renders
// doctors grouped by hospital, with weekly schedule + "available today".
var Hospital = (function() {

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // day_of_week: 0=Sun … 6=Sat (matches JS Date.getDay())
  var DAY_TA = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  var DAY_SHORT = ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'];

  function fmtTime(t) {
    if (!t) return '';
    var p = String(t).split(':');
    var h = parseInt(p[0], 10), m = p[1] || '00';
    var ap = h >= 12 ? 'PM' : 'AM';
    var h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
    return h12 + ':' + m + ' ' + ap;
  }

  function telHref(phone) { return 'tel:' + String(phone || '').replace(/[^0-9+]/g, ''); }

  function scheduleLine(s) {
    var day = DAY_TA[s.day_of_week] != null ? DAY_TA[s.day_of_week] : '';
    var time = (s.start_time || s.end_time)
      ? fmtTime(s.start_time) + ' – ' + fmtTime(s.end_time) : '';
    var note = s.notes_tamil ? ' · ' + esc(s.notes_tamil) : '';
    return '<div class="hd-sched-row"><span class="hd-sched-day">' + esc(day) + '</span>' +
           '<span class="hd-sched-time">' + esc(time) + '</span>' + note + '</div>';
  }

  function renderDoctor(doc, todayDow) {
    var scheds = doc.schedules || [];
    var availToday = scheds.some(function(s) { return s.day_of_week === todayDow; });
    var todayBadge = availToday
      ? '<span class="hd-today-badge">✅ இன்று கிடைக்கும்</span>'
      : '<span class="hd-today-badge hd-today-no">இன்று இல்லை</span>';

    // Day chips row (which days the doctor sits)
    var daySet = {};
    scheds.forEach(function(s) { daySet[s.day_of_week] = true; });
    var chips = DAY_SHORT.map(function(lbl, i) {
      var on = !!daySet[i];
      var cls = 'hd-day-chip' + (on ? ' on' : '') + (i === todayDow ? ' today' : '');
      return '<span class="' + cls + '">' + lbl + '</span>';
    }).join('');

    var schedHtml = scheds.length
      ? scheds.map(scheduleLine).join('')
      : '<div class="hd-sched-row hd-sched-empty">நேரம் விரைவில் சேர்க்கப்படும்</div>';

    return '' +
      '<div class="hd-card">' +
        '<div class="hd-card-top">' +
          '<div class="hd-avatar">🩺</div>' +
          '<div class="hd-card-name">' +
            '<span class="hd-name-ta">' + esc(doc.name_tamil) + '</span>' +
            (doc.name_english ? '<span class="hd-name-en">' + esc(doc.name_english) + '</span>' : '') +
            (doc.specialisation ? '<span class="hd-spec">' + esc(doc.specialisation) + '</span>' : '') +
          '</div>' +
          todayBadge +
        '</div>' +
        '<div class="hd-days">' + chips + '</div>' +
        '<div class="hd-scheds">' + schedHtml + '</div>' +
      '</div>';
  }

  function renderHospital(hosp, doctors, todayDow) {
    var docs = doctors.filter(function(d) {
      return d.hospital_id === hosp.id && d.is_active !== false;
    });
    var callBtn = hosp.phone_casualty
      ? '<a class="hd-hosp-call" href="' + telHref(hosp.phone_casualty) + '">📞 அவசர சிகிச்சை</a>' : '';
    var docsHtml = docs.length
      ? docs.map(function(d) { return renderDoctor(d, todayDow); }).join('')
      : '<div class="hd-empty-small">டாக்டர் தகவல் விரைவில் சேர்க்கப்படும்</div>';

    return '' +
      '<section class="hd-hospital">' +
        '<div class="hd-hosp-head">' +
          '<div class="hd-hosp-titles">' +
            '<span class="hd-hosp-ta">🏥 ' + esc(hosp.name_tamil) + '</span>' +
            (hosp.name_english ? '<span class="hd-hosp-en">' + esc(hosp.name_english) + '</span>' : '') +
            (hosp.address_tamil ? '<span class="hd-hosp-addr">📍 ' + esc(hosp.address_tamil) + '</span>' : '') +
          '</div>' +
          callBtn +
        '</div>' +
        docsHtml +
      '</section>';
  }

  function render(hospitals, doctors) {
    var host = document.getElementById('hd-list');
    if (!host) return;
    var todayDow = new Date().getDay();

    if (!hospitals || !hospitals.length) {
      host.innerHTML =
        '<div class="em-empty"><div class="em-empty-icon">🏥</div>' +
        '<p class="em-empty-ta">மருத்துவமனை தகவல் விரைவில் சேர்க்கப்படும்</p>' +
        '<p class="em-empty-en">Hospital info coming soon</p></div>';
      return;
    }
    host.innerHTML = hospitals.map(function(h) {
      return renderHospital(h, doctors || [], todayDow);
    }).join('');
  }

  async function load(force) {
    var host = document.getElementById('hd-list');
    var refreshBtn = document.getElementById('hd-refresh-btn');
    if (!force && host) {
      host.innerHTML = '<div class="skeleton-list"><div class="skeleton"></div><div class="skeleton"></div></div>';
    }
    if (refreshBtn) { refreshBtn.classList.add('spinning'); refreshBtn.disabled = true; }

    try {
      var results = await Promise.all([
        PannaiAPI.getHospitals(!!force),
        PannaiAPI.getDoctors(!!force),
      ]);
      render(results[0], results[1]);
    } catch (e) {
      if (host) {
        host.innerHTML =
          '<div class="load-error"><div class="load-error-icon">📡</div>' +
          '<p class="load-error-ta">தகவல் கிடைக்கவில்லை</p>' +
          '<p class="load-error-en">Could not load. Check your connection.</p>' +
          '<button class="retry-btn" id="hd-retry-btn">மீண்டும் முயற்சிக்க</button></div>';
        var btn = document.getElementById('hd-retry-btn');
        if (btn) btn.addEventListener('click', function() { load(false); });
      }
    } finally {
      if (refreshBtn) {
        setTimeout(function() { refreshBtn.classList.remove('spinning'); refreshBtn.disabled = false; }, 500);
      }
    }
  }

  var inited = false;
  function init() {
    if (inited) return;
    inited = true;
    load(false);
    var refreshBtn = document.getElementById('hd-refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', function() { load(true); });
  }

  return { init: init };
})();
