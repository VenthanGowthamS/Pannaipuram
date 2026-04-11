// ── Bus Section Controller ─────────────────────────────────
var Bus = (function() {

  var corridors = [];
  var currentCorridorId = null;
  var currentTimings = [];
  var countdownTimer = null;
  var timetableOpen = false;

  function fmt(t) {
    var parts = t.split(':');
    return parseInt(parts[0]) + ':' + parts[1];
  }

  function fmtPeriod(t) {
    var h = parseInt(t.split(':')[0]);
    if (h < 5)  return fmt(t) + ' இரவு';
    if (h < 12) return fmt(t) + ' காலை';
    if (h < 17) return fmt(t) + ' பகல்';
    if (h < 20) return fmt(t) + ' மாலை';
    return fmt(t) + ' இரவு';
  }

  function nowMins() {
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function computeNextBus(timings) {
    var cur = nowMins();
    var upcoming = timings
      .map(function(t) {
        var p = t.departs_at.split(':').map(Number);
        return Object.assign({}, t, { totalMins: p[0] * 60 + p[1] });
      })
      .filter(function(t) { return t.totalMins > cur; })
      .sort(function(a, b) { return a.totalMins - b.totalMins; });
    return upcoming[0] || null;
  }

  function renderCorridors() {
    var wrap = document.getElementById('corridor-scroll');
    if (!corridors.length) {
      wrap.innerHTML = '<p style="color:var(--color-muted);font-size:0.9rem;padding:4px 0">பேருந்து வழிகள் விரைவில்...</p>';
      return;
    }
    wrap.innerHTML = corridors.map(function(c) {
      var active = c.id === currentCorridorId ? ' active' : '';
      return '<button class="corridor-pill' + active + '" data-id="' + c.id + '">' + c.name_tamil + '</button>';
    }).join('');
    wrap.querySelectorAll('.corridor-pill').forEach(function(btn) {
      btn.addEventListener('click', function() {
        selectCorridor(parseInt(btn.dataset.id));
      });
    });
  }

  function renderHero() {
    var next = computeNextBus(currentTimings);
    var hero = document.getElementById('next-bus-hero');

    if (!next) {
      hero.innerHTML =
        '<p class="hero-no-bus">இன்று இந்த வழியில் பேருந்து இல்லை' +
        '<span class="hero-no-bus-en">No more buses today</span></p>';
      clearInterval(countdownTimer);
      return;
    }

    var cur = nowMins();
    var mins = next.totalMins - cur;
    var operatorLine = next.operator_name
      ? '<span class="hero-operator">' + next.operator_name + '</span>'
      : '';
    var destText = next.dest_tamil ? ' → ' + next.dest_tamil : '';

    hero.innerHTML =
      '<p class="hero-label-ta">அடுத்த பேருந்து</p>' +
      '<p class="hero-label-en">Next Bus</p>' +
      '<span class="hero-countdown" id="hero-mins">' + mins + '</span>' +
      '<span class="hero-countdown-unit"> நிமிடம்</span>' +
      '<p class="hero-meta"><span class="hero-time">' + fmtPeriod(next.departs_at) + '</span>' +
      destText + operatorLine + '</p>';

    clearInterval(countdownTimer);
    countdownTimer = setInterval(function() {
      var m2 = next.totalMins - nowMins();
      var el = document.getElementById('hero-mins');
      if (!el) { clearInterval(countdownTimer); return; }
      if (m2 <= 0) { clearInterval(countdownTimer); renderHero(); }
      else { el.textContent = m2; }
    }, 30000);
  }

  function renderTimetable() {
    var list = document.getElementById('timetable-list');
    if (!currentTimings.length) {
      list.innerHTML = '<p style="padding:16px 0;color:var(--color-muted);font-family:var(--font-tamil)">இந்த வழியில் தகவல் விரைவில் சேர்க்கப்படும்</p>';
      return;
    }
    var cur = nowMins();
    var next = computeNextBus(currentTimings);
    var sorted = currentTimings.slice().sort(function(a, b) {
      return a.departs_at.localeCompare(b.departs_at);
    });

    list.innerHTML = sorted.map(function(t) {
      var p = t.departs_at.split(':').map(Number);
      var totalMins = p[0] * 60 + p[1];
      var isPassed = totalMins <= cur;
      var isNext = next && t.id === next.id;
      var classes = 'timing-row' + (isPassed ? ' passed' : '') + (isNext ? ' is-next' : '');

      var badge = '';
      if (t.is_last_bus) {
        badge = '<span class="timing-badge badge-last">கடைசி பஸ்</span>';
      } else if (t.operator_name) {
        badge = '<span class="timing-badge badge-private">' + t.operator_name + '</span>';
      } else if (t.bus_type && t.bus_type !== 'ordinary') {
        badge = '<span class="timing-badge badge-' + t.bus_type + '">' + t.bus_type.toUpperCase() + '</span>';
      }

      return '<div class="' + classes + '">' +
        '<span class="timing-time">' + fmt(t.departs_at) + '</span>' +
        badge +
        '<span class="timing-dest">' + (t.dest_tamil || '') + '</span>' +
        '</div>';
    }).join('');
  }

  async function selectCorridor(id) {
    currentCorridorId = id;
    renderCorridors();
    document.getElementById('next-bus-hero').innerHTML =
      '<div class="skeleton" style="width:180px;height:60px;border-radius:8px"></div>';
    document.getElementById('timetable-list').innerHTML = '';
    try {
      currentTimings = await PannaiAPI.getBusTimings(id);
    } catch(e) {
      currentTimings = [];
    }
    renderHero();
    if (timetableOpen) renderTimetable();
  }

  function toggleTimetable() {
    var list = document.getElementById('timetable-list');
    var btn  = document.getElementById('timetable-toggle');
    timetableOpen = !timetableOpen;
    list.hidden = !timetableOpen;
    btn.classList.toggle('open', timetableOpen);
    if (timetableOpen) renderTimetable();
  }

  async function init() {
    try {
      corridors = await PannaiAPI.getBusCorridors();
    } catch(e) {
      corridors = [];
    }

    if (corridors.length) {
      currentCorridorId = corridors[0].id;
      renderCorridors();
      await selectCorridor(corridors[0].id);
    } else {
      renderCorridors();
      document.getElementById('next-bus-hero').innerHTML =
        '<p class="hero-no-bus">பேருந்து தகவல் விரைவில்...' +
        '<span class="hero-no-bus-en">Bus data coming soon</span></p>';
    }

    document.getElementById('timetable-toggle')
      .addEventListener('click', toggleTimetable);
  }

  return { init: init };
})();
