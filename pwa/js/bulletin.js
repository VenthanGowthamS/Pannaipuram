// ── Community Bulletin (சங்கமம்) ─────────────────────────────────
// Village news feed. Anyone can read + like; posting needs a one-time
// phone+name registration. New posters' posts wait for admin approval,
// trusted posters go live instantly. Posts expire after 7 days.
var Bulletin = (function() {

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Reuses the analytics visitor id so likes survive reloads without asking
  // the user for anything. Same key app.js already writes.
  var VID_KEY = 'pannai:visitor-id';
  function deviceId() {
    try {
      var v = localStorage.getItem(VID_KEY);
      if (!v) {
        v = 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(VID_KEY, v);
      }
      return v;
    } catch (_) { return ''; }
  }

  var POSTER_KEY = 'pannai:bulletin-poster';
  function getPoster() {
    try { return JSON.parse(localStorage.getItem(POSTER_KEY) || 'null'); }
    catch (_) { return null; }
  }
  function setPoster(p) {
    try { localStorage.setItem(POSTER_KEY, JSON.stringify(p)); } catch (_) {}
  }

  function timeAgo(iso) {
    var then = new Date(iso).getTime();
    if (!then) return '';
    var s = Math.floor((Date.now() - then) / 1000);
    if (s < 60)    return 'இப்பதான்';
    if (s < 3600)  return Math.floor(s / 60) + ' நிமிஷம் முன்ன';
    if (s < 86400) return Math.floor(s / 3600) + ' மணி நேரம் முன்ன';
    var d = Math.floor(s / 86400);
    return d === 1 ? 'நேத்து' : d + ' நாள் முன்ன';
  }

  // ── Feed ────────────────────────────────────────────────────────
  var _posts = [];

  function postCard(p) {
    var likeCount = Number(p.like_count || 0);
    var liked = p.liked_by_me === true;
    var official = p.is_official === true;
    // Official posts must be unmistakable — a villager acting on a fake
    // "water is off tomorrow" is a real cost, so the official account gets
    // its own badge and card styling, not the generic trusted tick.
    // The official badge sits on its OWN line: .bl-name is nowrap+ellipsis, so
    // an inline badge after a long name ("பண்ணைப்புரம் நிர்வாகம்") gets clipped away.
    var badge = official
      ? '<span class="bl-official">📢 அதிகாரப்பூர்வம்</span>'
      : (p.is_trusted ? '<span class="bl-trust" title="நம்பகமான பதிவாளர்">✅ நம்பகமானவர்</span>' : '');
    return '<article class="bl-card' + (official ? ' is-official' : '') + '" data-post="' + p.id + '">' +
      '<header class="bl-card-head">' +
        '<div class="bl-avatar' + (official ? ' is-official' : '') + '" aria-hidden="true">' +
          (official ? '📢' : esc((p.name_tamil || '?').trim().charAt(0))) + '</div>' +
        '<div class="bl-who">' +
          '<span class="bl-name">' + esc(p.name_tamil) + '</span>' +
          badge +
          '<span class="bl-time">' + timeAgo(p.created_at) + '</span>' +
        '</div>' +
      '</header>' +
      '<h3 class="bl-title">' + esc(p.title_tamil) + '</h3>' +
      (p.title_english ? '<p class="bl-title-en">' + esc(p.title_english) + '</p>' : '') +
      '<p class="bl-body">' + esc(p.content_tamil) + '</p>' +
      (p.content_english ? '<p class="bl-body-en">' + esc(p.content_english) + '</p>' : '') +
      (p.image_url ? '<img class="bl-img" src="' + esc(p.image_url) + '" alt="" loading="lazy">' : '') +
      '<footer class="bl-card-foot">' +
        '<button class="bl-like' + (liked ? ' liked' : '') + '" type="button" data-like="' + p.id + '"' +
          ' aria-pressed="' + (liked ? 'true' : 'false') + '" aria-label="இது நல்லா இருக்கு">' +
          '<span class="bl-like-ic">' + (liked ? '❤️' : '🤍') + '</span>' +
          '<span class="bl-like-n">' + likeCount + '</span>' +
        '</button>' +
      '</footer>' +
    '</article>';
  }

  function renderFeed() {
    var host = document.getElementById('bulletin-posts');
    if (!host) return;
    if (!_posts.length) {
      host.innerHTML = '<div class="bl-empty">' +
        '<span class="bl-empty-ic">📰</span>' +
        '<p class="bl-empty-ta">இன்னும் செய்தி எதுவும் இல்ல</p>' +
        '<p class="bl-empty-en">Be the first to share village news</p>' +
      '</div>';
      return;
    }
    host.innerHTML = _posts.map(postCard).join('');
  }

  async function loadFeed(force) {
    var host = document.getElementById('bulletin-posts');
    if (host && !_posts.length) {
      host.innerHTML = '<div class="bl-loading">செய்திகளை ஏத்துறோம்…</div>';
    }
    try {
      _posts = (await PannaiAPI.getBulletin(deviceId(), force)) || [];
      renderFeed();
    } catch (err) {
      if (!_posts.length && host) {
        host.innerHTML = '<div class="bl-empty"><p class="bl-empty-ta">செய்தி ஏத்த முடியல — நெட் இருக்கானு பாருங்க</p></div>';
      }
    }
  }

  // Optimistic toggle: flip the heart immediately, reconcile with the
  // server's authoritative count, roll back if the request fails.
  async function toggleLike(id, btn) {
    var ic = btn.querySelector('.bl-like-ic');
    var n  = btn.querySelector('.bl-like-n');
    var wasLiked = btn.classList.contains('liked');
    var prev = Number(n.textContent || 0);

    btn.classList.toggle('liked', !wasLiked);
    btn.setAttribute('aria-pressed', String(!wasLiked));
    ic.textContent = !wasLiked ? '❤️' : '🤍';
    n.textContent = String(Math.max(0, prev + (wasLiked ? -1 : 1)));

    try {
      var res = await PannaiAPI.likePost(id, deviceId());
      btn.classList.toggle('liked', res.liked);
      btn.setAttribute('aria-pressed', String(res.liked));
      ic.textContent = res.liked ? '❤️' : '🤍';
      n.textContent = String(res.like_count);
      var rec = _posts.find(function(p) { return String(p.id) === String(id); });
      if (rec) { rec.liked_by_me = res.liked; rec.like_count = res.like_count; }
    } catch (_) {
      btn.classList.toggle('liked', wasLiked);
      btn.setAttribute('aria-pressed', String(wasLiked));
      ic.textContent = wasLiked ? '❤️' : '🤍';
      n.textContent = String(prev);
    }
  }

  // ── Image → compressed JPEG data-URL ────────────────────────────
  // Villagers post straight from a phone camera (3-5MB). Resize to 1024px
  // and step quality down until it fits ~80KB, so 7 days of posts stay well
  // inside the Supabase free tier.
  var MAX_DIM = 1024;
  var TARGET_BYTES = 80 * 1024;

  function compressImage(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function() { reject(new Error('படத்தை படிக்க முடியல')); };
      reader.onload = function(e) {
        var img = new Image();
        img.onerror = function() { reject(new Error('படம் சரியில்ல')); };
        img.onload = function() {
          var w = img.width, h = img.height;
          if (w > h && w > MAX_DIM)      { h = Math.round(h * MAX_DIM / w); w = MAX_DIM; }
          else if (h >= w && h > MAX_DIM) { w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }

          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);

          var q = 0.7;
          var out = canvas.toDataURL('image/jpeg', q);
          while (out.length > TARGET_BYTES && q > 0.3) {
            q -= 0.1;
            out = canvas.toDataURL('image/jpeg', q);
          }
          resolve(out);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ── Form helpers ────────────────────────────────────────────────
  function say(el, msg, ok) {
    if (!el) return;
    el.textContent = msg;
    el.className = 'bl-result ' + (ok ? 'is-ok' : 'is-err');
    el.hidden = false;
  }

  // Registered → hide the signup card, reveal the composer.
  function applyPosterState() {
    var p = getPoster();
    var regWrap  = document.getElementById('bulletin-reg');
    var postWrap = document.getElementById('bulletin-compose');
    var whoami   = document.getElementById('bulletin-whoami');
    var avatar   = document.getElementById('bulletin-compose-avatar');
    if (regWrap)  regWrap.hidden  = !!p;
    if (postWrap) postWrap.hidden = !p;
    // The prompt box carries the poster's initial, like a social composer
    if (avatar && p) avatar.textContent = (p.name_tamil || '🙂').trim().charAt(0);
    if (whoami && p) {
      whoami.innerHTML = '<span class="bl-whoami-ta">' + esc(p.name_tamil) + ' ஆக பதிவிடுறீங்க</span>' +
        '<button type="button" id="bulletin-signout" class="bl-signout">மாத்து</button>';
      var out = document.getElementById('bulletin-signout');
      if (out) out.addEventListener('click', function() {
        try { localStorage.removeItem(POSTER_KEY); } catch (_) {}
        applyPosterState();
      });
    }
  }

  function wireRegister() {
    var form = document.getElementById('bulletin-reg-form');
    if (!form || form.dataset.wired) return;
    form.dataset.wired = '1';

    var phone  = document.getElementById('bulletin-phone');
    var errEl  = document.getElementById('bulletin-phone-err');
    var result = document.getElementById('bulletin-reg-result');
    var btn    = document.getElementById('bulletin-reg-btn');

    phone.addEventListener('input', function() {
      var d = this.value.replace(/\D/g, '').slice(0, 10);
      if (this.value !== d) this.value = d;
      if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
    });

    form.addEventListener('submit', async function(ev) {
      ev.preventDefault();
      var ph = (phone.value || '').trim();
      var nameTa = (document.getElementById('bulletin-name-ta').value || '').trim();
      var nameEn = (document.getElementById('bulletin-name-en').value || '').trim();

      if (!/^[6-9]\d{9}$/.test(ph)) {
        if (errEl) {
          errEl.textContent = '10 இலக்க மொபைல் எண் கொடுங்க (6/7/8/9-ல் தொடங்கணும்)';
          errEl.hidden = false;
        }
        phone.focus();
        return;
      }
      if (nameTa.length < 2) { say(result, 'உங்க பெயரை கொடுங்க', false); return; }

      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = 'பதிவு பண்றோம்…';
      if (result) result.hidden = true;

      try {
        var data = await PannaiAPI.registerPoster({
          phone: ph, name_tamil: nameTa, name_english: nameEn,
        });
        setPoster({ poster_id: data.poster_id, name_tamil: data.name_tamil, is_trusted: data.is_trusted });
        applyPosterState();
        say(document.getElementById('bulletin-post-result'), '✅ பதிவு ஆயிடுச்சு — இப்ப செய்தி பகிரலாம்', true);
      } catch (err) {
        say(result, '❌ ' + (err.message || 'பதிவு தோல்வி'), false);
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }

  function wireCompose() {
    var form = document.getElementById('bulletin-post-form');
    if (!form || form.dataset.wired) return;
    form.dataset.wired = '1';

    var btn     = document.getElementById('bulletin-post-btn');
    var result  = document.getElementById('bulletin-post-result');
    var imgIn   = document.getElementById('bulletin-image');
    var preview = document.getElementById('bulletin-image-preview');
    var pending = null;   // compressed data-URL

    imgIn.addEventListener('change', async function() {
      pending = null;
      preview.innerHTML = '';
      if (!this.files || !this.files.length) return;
      preview.innerHTML = '<span class="bl-img-wait">படத்தை சின்னதாக்குறோம்…</span>';
      try {
        pending = await compressImage(this.files[0]);
        var kb = Math.round(pending.length / 1024);
        preview.innerHTML = '<img src="' + pending + '" alt=""><span class="bl-img-kb">' + kb + ' KB</span>';
      } catch (err) {
        preview.innerHTML = '';
        this.value = '';
        say(result, '❌ ' + (err.message || 'படம் சேர்க்க முடியல'), false);
      }
    });

    form.addEventListener('submit', async function(ev) {
      ev.preventDefault();
      var poster = getPoster();
      if (!poster) { say(result, 'முதலில் பதிவு பண்ணுங்க', false); return; }

      var titleTa = (document.getElementById('bulletin-title-ta').value || '').trim();
      var titleEn = (document.getElementById('bulletin-title-en').value || '').trim();
      var bodyTa  = (document.getElementById('bulletin-content-ta').value || '').trim();
      var bodyEn  = (document.getElementById('bulletin-content-en').value || '').trim();

      if (titleTa.length < 5)  { say(result, 'தலைப்பு கொஞ்சம் பெரிசா எழுதுங்க', false); return; }
      if (bodyTa.length < 10)  { say(result, 'விபரம் கொஞ்சம் விளக்கமா எழுதுங்க', false); return; }

      // UX gate — keeps the feed about the village, not forwards/spam.
      if (!confirm('இது பண்ணைப்புரம் சம்பந்தமான முக்கியமான தகவலா?\n\nசரி = ஆமா, பகிருங்க\nCancel = இல்ல')) {
        return;
      }

      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = 'அனுப்புறோம்…';
      if (result) result.hidden = true;

      try {
        var data = await PannaiAPI.submitPost({
          poster_id: poster.poster_id,
          title_tamil: titleTa,
          title_english: titleEn,
          content_tamil: bodyTa,
          content_english: bodyEn,
          image_url: pending,
        });

        form.reset();
        preview.innerHTML = '';
        pending = null;

        if (data.status === 'approved') {
          say(result, '✅ செய்தி வெளியாகிடுச்சு!', true);
          loadFeed(true);
        } else {
          say(result, '✅ அனுப்பியாச்சு — நிர்வாகி பாத்து சரின்னு சொன்னதும் எல்லாருக்கும் தெரியும்', true);
        }
      } catch (err) {
        say(result, '❌ ' + (err.message || 'அனுப்ப முடியல'), false);
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }

  function wireFeedDelegation() {
    var host = document.getElementById('bulletin-posts');
    if (!host || host.dataset.wired) return;
    host.dataset.wired = '1';
    host.addEventListener('click', function(ev) {
      var btn = ev.target.closest('[data-like]');
      if (btn) toggleLike(btn.getAttribute('data-like'), btn);
    });
  }

  function wireRefresh() {
    var btn = document.getElementById('bulletin-refresh-btn');
    if (!btn || btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', async function() {
      btn.disabled = true;
      btn.style.transform = 'rotate(360deg)';
      try { await loadFeed(true); }
      finally {
        btn.disabled = false;
        setTimeout(function() { btn.style.transform = ''; }, 350);
      }
    });
  }

  var _timer = null;

  return {
    init: function() {
      wireRegister();
      wireCompose();
      wireFeedDelegation();
      wireRefresh();
      applyPosterState();
      loadFeed(false);
      if (!_timer) _timer = setInterval(function() { loadFeed(true); }, 10 * 60 * 1000);
    },
    refresh: function() { return loadFeed(true); },
  };
})();

window.Bulletin = Bulletin;
