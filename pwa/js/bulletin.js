// ── Community Bulletin (சங்கமம்) ─────────────────────────────────
// Village news feed. Anyone can read, like AND post (v110) — no registration.
// A post is tied to this app's id (pannai:visitor-id, shown in ☰ → About) so
// the admin can see which app posted it; the name is optional. Villagers who
// registered a phone before v110 keep editing their old posts that way.
// Posts expire after 60 days, but the newest 10 are always kept.
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

  // Optional name, remembered on this phone so it doesn't have to be retyped
  var NAME_KEY = 'pannai:bulletin-name';
  function savedName() { try { return localStorage.getItem(NAME_KEY) || ''; } catch (_) { return ''; } }
  function saveName(n) {
    try { if (n) localStorage.setItem(NAME_KEY, n); else localStorage.removeItem(NAME_KEY); } catch (_) {}
  }
  var ANON = 'ஊர்க்காரர்';   // shown when a post was shared without a name

  // Legacy (before v110): a phone registration — still proves ownership of
  // the posts made with it.
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

  // ── Link chip ───────────────────────────────────────────────────
  // The server only ever stores http/https, but this value goes straight into
  // an href — re-checking it here means a poisoned localStorage cache or a row
  // written before the rule existed can never become a javascript: URL.
  function safeLink(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s || !/^https?:\/\//i.test(s)) return null;
    return s;
  }

  function linkHost(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); }
    catch (_) { return ''; }
  }

  // A generic "open link" button tells the villager nothing about what is on
  // the other side. Naming the KIND of thing is what makes it worth tapping.
  function linkLabel(host) {
    if (/(^|\.)(youtube\.com|youtu\.be)$/i.test(host)) return { ic: '▶️', ta: 'வீடியோவைப் பார்க்க' };
    if (/(^|\.)(wa\.me|whatsapp\.com)$/i.test(host))    return { ic: '💬', ta: 'WhatsApp-ல் திறக்க' };
    if (/(^|\.)(maps\.app\.goo\.gl|google\.com|goo\.gl)$/i.test(host) && /map/i.test(host))
      return { ic: '📍', ta: 'இடத்தைப் பார்க்க' };
    if (/\.(gov|nic)\.in$/i.test(host)) return { ic: '🏛️', ta: 'அரசு இணையதளத்தைத் திறக்க' };
    // News sites — the usual thing villagers share (Dailyhunt short links, Tamil papers…)
    if (/(^|\.)(dhunt\.in|dailyhunt\.in|hindutamil\.in|thehindu\.com|dinamalar\.com|dinamani\.com|dailythanthi\.com|maalaimalar\.com|dinakaran\.com|vikatan\.com|bbc\.com|bbc\.co\.uk|timesofindia\.indiatimes\.com|indianexpress\.com|ndtv\.com)$/i.test(host))
      return { ic: '📰', ta: 'முழு செய்தியைப் படிக்க' };
    return { ic: '🔗', ta: 'இணைப்பைத் திறக்க' };
  }

  function linkChip(raw) {
    var url = safeLink(raw);
    if (!url) return '';
    var host = linkHost(url);
    var lbl = linkLabel(host);
    // noopener/noreferrer: the target page must never get a handle on our
    // window. nofollow because this is villager-submitted content.
    return '<a class="bl-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer nofollow">' +
      '<span class="bl-link-ic" aria-hidden="true">' + lbl.ic + '</span>' +
      '<span class="bl-link-txt">' +
        '<span class="bl-link-ta">' + lbl.ta + '</span>' +
        (host ? '<span class="bl-link-host">' + esc(host) + '</span>' : '') +
      '</span>' +
      '<span class="bl-link-go" aria-hidden="true">↗</span>' +
    '</a>';
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
    // Own-post controls: the server marks this app's own posts (is_mine,
    // matched on the app id). Posts made with an older phone registration
    // are still matched on poster_id + the stored phone.
    var me = getPoster();
    var mine = p.is_mine === true ||
      !!(me && me.phone && String(me.poster_id) === String(p.poster_id));
    var who = (p.name_tamil && String(p.name_tamil).trim()) || '';
    var isPending = p.status === 'pending';
    var ownBar = mine
      ? '<div class="bl-own">' +
          (isPending ? '<span class="bl-pending">⏳ நிர்வாகி பாக்கணும்</span>' : '') +
          '<button class="bl-own-btn" type="button" data-edit="' + p.id + '">✏️ திருத்து</button>' +
          '<button class="bl-own-btn is-del" type="button" data-del="' + p.id + '">🗑️ நீக்கு</button>' +
        '</div>'
      // The admin's own phone (PWA Stats → "Can delete posts") can remove any post
      : (p.can_delete === true
        ? '<div class="bl-own"><button class="bl-own-btn is-del" type="button" data-del="' + p.id + '">🛡️ நீக்கு</button></div>'
        : '');

    return '<article class="bl-card' + (official ? ' is-official' : '') +
      (isPending ? ' is-pending' : '') + '" data-post="' + p.id + '">' +
      '<header class="bl-card-head">' +
        '<div class="bl-avatar' + (official ? ' is-official' : '') + '" aria-hidden="true">' +
          (official ? '📢' : (who ? esc(who.charAt(0)) : '🙂')) + '</div>' +
        '<div class="bl-who">' +
          '<span class="bl-name' + (who ? '' : ' is-anon') + '">' + esc(who || ANON) + '</span>' +
          badge +
          '<span class="bl-time">' + timeAgo(p.created_at) + '</span>' +
        '</div>' +
      '</header>' +
      (String(p.title_tamil || '').trim() ? '<h3 class="bl-title">' + esc(p.title_tamil) + '</h3>' : '') +
      (p.title_english ? '<p class="bl-title-en">' + esc(p.title_english) + '</p>' : '') +
      '<p class="bl-body">' + esc(p.content_tamil) + '</p>' +
      (p.content_english ? '<p class="bl-body-en">' + esc(p.content_english) + '</p>' : '') +
      (p.image_url ? '<img class="bl-img" src="' + esc(p.image_url) + '" alt="" loading="lazy">' : '') +
      linkChip(p.link_url) +
      '<footer class="bl-card-foot">' +
        '<button class="bl-like' + (liked ? ' liked' : '') + '" type="button" data-like="' + p.id + '"' +
          ' aria-pressed="' + (liked ? 'true' : 'false') + '" aria-label="இது நல்லா இருக்கு">' +
          '<span class="bl-like-ic">' + (liked ? '❤️' : '🤍') + '</span>' +
          '<span class="bl-like-n">' + likeCount + '</span>' +
        '</button>' +
      '</footer>' +
      ownBar +
    '</article>';
  }

  function renderFeed() {
    var host = document.getElementById('bulletin-posts');
    if (!host) return;
    if (!_posts.length) {
      host.innerHTML = '<div class="bl-empty">' +
        '<span class="bl-empty-ic">📰</span>' +
        '<p class="bl-empty-ta">இன்னும் செய்திகள் எதுவும் இல்லை</p>' +
        '<p class="bl-empty-en">Be the first to share village news</p>' +
        '<button type="button" class="bl-btn bl-empty-cta">✍️ முதல் செய்தியை பகிருங்க</button>' +
      '</div>';
      // Same path as tapping the composer — unregistered villagers get the
      // one-time sign-up first (handled by the composer's own click handler).
      var cta = host.querySelector('.bl-empty-cta');
      if (cta) cta.addEventListener('click', function() {
        var sum = document.querySelector('#bulletin-compose .bl-compose-cta');
        if (!sum) return;
        sum.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // The composer is a <details>: clicking its <summary> TOGGLES it, so an
        // already-open composer would collapse. Only open it when it is closed.
        var det = sum.closest && sum.closest('details');
        if (!(det && det.open)) sum.click();
      });
      return;
    }
    host.innerHTML = _posts.map(postCard).join('');
  }

  async function loadFeed(force) {
    var host = document.getElementById('bulletin-posts');
    var refreshBtn = document.getElementById('bulletin-refresh-btn');
    if (host && !_posts.length) {
      host.innerHTML = '<div class="bl-loading">செய்திகளை ஏத்துறோம்…</div>';
    }
    // Same visible spin as the other tabs (.spinning), for every load.
    if (refreshBtn) refreshBtn.classList.add('spinning');
    try {
      // Passing our poster_id also returns OUR OWN pending posts, so a post
      // awaiting approval (or one an edit just re-queued) stays visible to
      // its author instead of appearing to have been lost.
      var me = getPoster();
      _posts = (await PannaiAPI.getBulletin(deviceId(), force, me && me.poster_id)) || [];
      renderFeed();
      return true;
    } catch (err) {
      if (!_posts.length && host) {
        host.innerHTML = '<div class="bl-empty"><p class="bl-empty-ta">செய்தி ஏத்த முடியல — நெட் இருக்கானு பாருங்க</p></div>';
      }
      return false;
    } finally {
      // Keep the spin up for at least 500ms so a fast reply is still visible.
      if (refreshBtn) setTimeout(function() { refreshBtn.classList.remove('spinning'); }, 500);
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
  // and step quality down until it fits ~80KB, so two months of posts fit
  // inside the Supabase free tier at village-scale posting rates.
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

  // Mirrors normalizeLink() on the server so a typo is caught before a round
  // trip. The server still has the final say — this is only for speed.
  // Returns { value } or { error }.
  function checkLink(raw) {
    var v = String(raw == null ? '' : raw).trim();
    if (!v) return { value: '' };
    if (/^[a-z][a-z0-9+.-]*:/i.test(v) && !/^https?:\/\//i.test(v)) {
      return { error: 'இணைப்பு சரியில்லை — http அல்லது https link கொடுங்க' };
    }
    var host = v.replace(/^https?:\/\//i, '').split(/[\/?#]/)[0];
    if (host.indexOf('.') === -1) {
      return { error: 'இணைப்பு சரியில்லை — http அல்லது https link கொடுங்க' };
    }
    return { value: v };
  }

  // ── Form helpers ────────────────────────────────────────────────
  function say(el, msg, ok) {
    if (!el) return;
    el.textContent = msg;
    el.className = 'bl-result ' + (ok ? 'is-ok' : 'is-err');
    el.hidden = false;
  }

  // v110: no sign-up. The composer is open to everyone; the prompt's avatar
  // shows the initial of the name this phone last posted with.
  function applyPosterState() {
    var postWrap = document.getElementById('bulletin-compose');
    var whoami   = document.getElementById('bulletin-whoami');
    var avatar   = document.getElementById('bulletin-compose-avatar');
    var nameIn   = document.getElementById('bulletin-name');
    if (postWrap) postWrap.hidden = false;
    if (whoami) { whoami.hidden = true; whoami.innerHTML = ''; }
    var n = savedName();
    if (avatar) avatar.textContent = n ? n.charAt(0) : '🙂';
    if (nameIn && !nameIn.value && !_editing) nameIn.value = n;
  }

  // Module-scope (not local to wireCompose) so startEdit() can preload an
  // existing photo into it. Title/content are only mandatory when this is
  // empty — a photo is content on its own.
  var _pendingImage = null;

  function toggleTextRequirement() {
    var has = !!_pendingImage;
    var contentReq  = document.getElementById('bulletin-content-req');
    var contentHint = document.getElementById('bulletin-content-hint');
    if (contentReq)  contentReq.hidden  = has;
    if (contentHint) contentHint.hidden = !has;
  }

  // First http(s) link inside pasted text — WhatsApp forwards carry their
  // link in the message, where it would render as untappable plain text.
  function firstUrl(text) {
    var m = /https?:\/\/[^\s<>"']+/i.exec(String(text || ''));
    return m ? m[0].replace(/[).,!?]+$/, '') : '';
  }

  // 📋 Paste — one tap for a forwarded WhatsApp / Facebook message. Only shown
  // where the browser can read the clipboard; elsewhere a hint says how.
  function wirePaste() {
    var btn = document.getElementById('bulletin-paste');
    var box = document.getElementById('bulletin-content-ta');
    var hint = document.getElementById('bulletin-paste-hint');
    if (!btn || !box || btn.dataset.wired) return;
    btn.dataset.wired = '1';
    var can = !!(navigator.clipboard && navigator.clipboard.readText);
    btn.hidden = false;
    btn.addEventListener('click', async function() {
      if (!can) { if (hint) hint.hidden = false; box.focus(); return; }
      try {
        var t = await navigator.clipboard.readText();
        if (t && t.trim()) {
          box.value = box.value.trim() ? box.value.replace(/\s+$/, '') + '\n\n' + t.trim() : t.trim();
          box.dispatchEvent(new Event('input', { bubbles: true }));
        }
        box.focus();
      } catch (_) {
        if (hint) hint.hidden = false;   // permission refused — paste by hand
        box.focus();
      }
    });
  }

  function wireCompose() {
    var form = document.getElementById('bulletin-post-form');
    if (!form || form.dataset.wired) return;
    form.dataset.wired = '1';

    var cancelBtn = document.getElementById('bulletin-cancel-edit');
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);

    var btn     = document.getElementById('bulletin-post-btn');
    var result  = document.getElementById('bulletin-post-result');
    var imgIn   = document.getElementById('bulletin-image');
    var preview = document.getElementById('bulletin-image-preview');

    function renderPreview(url, kb, removable) {
      preview.innerHTML = '<img src="' + url + '" alt="">' +
        (kb != null ? '<span class="bl-img-kb">' + kb + ' KB</span>' : '') +
        (removable ? '<button type="button" class="bl-img-remove" id="bulletin-image-remove">✕ படம் நீக்கு</button>' : '');
      var rm = document.getElementById('bulletin-image-remove');
      if (rm) rm.addEventListener('click', function() {
        _pendingImage = null;
        imgIn.value = '';
        preview.innerHTML = '';
        toggleTextRequirement();
      });
    }

    imgIn.addEventListener('change', async function() {
      _pendingImage = null;
      preview.innerHTML = '';
      toggleTextRequirement();
      if (!this.files || !this.files.length) return;
      preview.innerHTML = '<span class="bl-img-wait">படத்தை சின்னதாக்குறோம்…</span>';
      try {
        _pendingImage = await compressImage(this.files[0]);
        renderPreview(_pendingImage, Math.round(_pendingImage.length / 1024), false);
        toggleTextRequirement();
      } catch (err) {
        preview.innerHTML = '';
        this.value = '';
        say(result, '❌ ' + (err.message || 'படம் சேர்க்க முடியல'), false);
      }
    });

    form.addEventListener('submit', async function(ev) {
      ev.preventDefault();
      var nameIn = document.getElementById('bulletin-name');
      var name = nameIn ? nameIn.value.replace(/\s+/g, ' ').trim().slice(0, 60) : '';

      var titleTa = (document.getElementById('bulletin-title-ta').value || '').trim();
      var titleEn = (document.getElementById('bulletin-title-en').value || '').trim();
      var bodyTa  = (document.getElementById('bulletin-content-ta').value || '').trim();
      var bodyEn  = (document.getElementById('bulletin-content-en').value || '').trim();
      var linkIn  = document.getElementById('bulletin-link');
      var linkErr = document.getElementById('bulletin-link-err');

      var link = checkLink(linkIn ? linkIn.value : '');
      if (linkErr) { linkErr.hidden = true; linkErr.textContent = ''; }
      if (link.error) {
        if (linkErr) { linkErr.textContent = link.error; linkErr.hidden = false; }
        if (linkIn) linkIn.focus();
        return;
      }

      // A photo is content on its own — text is only required without one.
      // Kept in sync with the server (validatePostContent in bulletin.js);
      // this is just the fast client-side check, the server has the final say.
      // v110: the title is optional, and the text can be in any language.
      if (!_pendingImage && bodyTa.length < 10) {
        say(result, 'செய்தியை கொஞ்சம் விளக்கமா எழுதுங்க (அல்லது ஒரு படம் சேருங்க)', false);
        return;
      }
      // A link inside the pasted text becomes the tappable link button
      if (!link.value) {
        var found = firstUrl(bodyTa);
        if (found && !checkLink(found).error) {
          link = { value: found };
          if (linkIn) linkIn.value = found;
        }
      }

      // UX gate — keeps the feed about the village, not forwards/spam.
      // Skipped when editing: they already agreed when they first posted.
      if (!_editing &&
          !confirm('இது பண்ணைப்புரம் சம்பந்தமான முக்கியமான தகவலா?\n\nசரி = ஆமா, பகிருங்க\nCancel = இல்ல')) {
        return;
      }

      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = _editing ? 'திருத்துறோம்…' : 'அனுப்புறோம்…';
      if (result) result.hidden = true;

      try {
        var payload = {
          title_tamil: titleTa,
          title_english: titleEn,
          content_tamil: bodyTa,
          content_english: bodyEn,
          image_url: _pendingImage,
          link_url: link.value,
        };

        if (_editing) {
          // An app post is proved by the app id; an older phone-registered
          // post by poster_id + phone (see startEdit, which records which).
          if (_editingLegacy) {
            var poster = getPoster() || {};
            payload.poster_id = poster.poster_id;
            payload.phone = poster.phone;
          } else {
            payload.device_id = deviceId();
            payload.name = name;
            saveName(name);
          }
          var upd = await PannaiAPI.editPost(_editing, payload);
          cancelEdit();
          preview.innerHTML = '';
          _pendingImage = null;
          await loadFeed(true);
          say(result, upd.requeued
            ? '✅ திருத்தியாச்சு — நிர்வாகி பாத்து சரின்னு சொன்னதும் எல்லாருக்கும் தெரியும்'
            : '✅ திருத்தியாச்சு!', true);
          return;
        }

        payload.device_id = deviceId();
        payload.name = name;
        var data = await PannaiAPI.openPost(payload);
        saveName(name);

        form.reset();
        preview.innerHTML = '';
        _pendingImage = null;
        toggleTextRequirement();
        applyPosterState();                       // refill the remembered name
        var wrap = document.querySelector('.bl-compose');
        if (wrap) wrap.open = false;              // back to the feed, where the post now is

        if (data.status === 'approved') {
          say(result, '✅ செய்தி வெளியாகிடுச்சு!', true);
        } else {
          say(result, '✅ அனுப்பியாச்சு — நிர்வாகி பாத்து சரின்னு சொன்னதும் எல்லாருக்கும் தெரியும்', true);
        }
        // Reload either way: a pending post still comes back for its own
        // author (?poster_id=), so they can see it waiting instead of
        // wondering whether it sent.
        loadFeed(true);
      } catch (err) {
        say(result, '❌ ' + (err.message || 'அனுப்ப முடியல'), false);
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });

    // Expose so startEdit() (defined below, outside this closure) can show
    // an existing post's photo without duplicating the preview markup.
    wireCompose._renderPreview = renderPreview;
  }

  // ── Edit / delete own post ──────────────────────────────────────
  // _editing holds the id being edited; null means the composer creates a
  // new post. Kept in one place so submit() can branch on it.
  var _editing = null;
  var _editingLegacy = false;   // true = post made with an old phone registration

  function startEdit(id) {
    var p = _posts.find(function(x) { return String(x.id) === String(id); });
    if (!p) return;
    _editing = p.id;
    _editingLegacy = p.is_mine !== true;
    var nameIn = document.getElementById('bulletin-name');
    if (nameIn) nameIn.value = _editingLegacy ? '' : (p.name_tamil || '');

    document.getElementById('bulletin-title-ta').value   = p.title_tamil || '';
    document.getElementById('bulletin-title-en').value   = p.title_english || '';
    document.getElementById('bulletin-content-ta').value = p.content_tamil || '';
    document.getElementById('bulletin-content-en').value = p.content_english || '';
    var linkIn = document.getElementById('bulletin-link');
    // Same trap the photo had before v80: an edit that doesn't repopulate the
    // field submits an empty one and silently strips the link off the post.
    if (linkIn) linkIn.value = p.link_url || '';
    var linkErr = document.getElementById('bulletin-link-err');
    if (linkErr) { linkErr.hidden = true; linkErr.textContent = ''; }

    // Preload the EXISTING photo so submitting without touching the file
    // input keeps it. Without this, editing a photo post silently deleted
    // the photo — the file input has nothing in it until the user re-picks
    // a file, so the old code sent image_url:null and wiped it on save.
    _pendingImage = p.image_url || null;
    if (_pendingImage && wireCompose._renderPreview) {
      wireCompose._renderPreview(_pendingImage, null, true);   // removable: shows ✕
    } else {
      var prev = document.getElementById('bulletin-image-preview');
      if (prev) prev.innerHTML = '';
    }
    toggleTextRequirement();

    var wrap = document.querySelector('.bl-compose');
    if (wrap) wrap.open = true;                     // expand the collapsed composer
    var btn = document.getElementById('bulletin-post-btn');
    if (btn) btn.textContent = 'திருத்தி அனுப்பு';
    var cancel = document.getElementById('bulletin-cancel-edit');
    if (cancel) cancel.hidden = false;

    var compose = document.getElementById('bulletin-compose');
    if (compose && compose.scrollIntoView) compose.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function cancelEdit() {
    _editing = null;
    _editingLegacy = false;
    _pendingImage = null;
    var form = document.getElementById('bulletin-post-form');
    if (form) form.reset();
    var prev = document.getElementById('bulletin-image-preview');
    if (prev) prev.innerHTML = '';
    var btn = document.getElementById('bulletin-post-btn');
    if (btn) btn.textContent = 'செய்தியை அனுப்பு';
    var cancel = document.getElementById('bulletin-cancel-edit');
    if (cancel) cancel.hidden = true;
    var wrap = document.querySelector('.bl-compose');
    if (wrap) wrap.open = false;
    toggleTextRequirement();
    applyPosterState();
  }

  async function removePost(id) {
    var p = _posts.find(function(x) { return String(x.id) === String(id); });
    var poster = getPoster();
    // Own app post, or the admin's own phone removing any post → the app id
    var proof = (p && (p.is_mine === true || p.can_delete === true))
      ? { device_id: deviceId() }
      : (poster && poster.phone ? { poster_id: poster.poster_id, phone: poster.phone } : null);
    if (!proof) return;
    if (!confirm('இந்த செய்தியை நீக்கிடலாமா?\n\nசரி = ஆமா, நீக்கு\nCancel = வேணாம்')) return;
    try {
      await PannaiAPI.deletePost(id, proof);
      _posts = _posts.filter(function(p) { return String(p.id) !== String(id); });
      renderFeed();
      if (String(_editing) === String(id)) cancelEdit();
      say(document.getElementById('bulletin-post-result'), '✅ செய்தி நீக்கிடுச்சு', true);
    } catch (err) {
      say(document.getElementById('bulletin-post-result'), '❌ ' + (err.message || 'நீக்க முடியல'), false);
    }
  }

  function wireFeedDelegation() {
    var host = document.getElementById('bulletin-posts');
    if (!host || host.dataset.wired) return;
    host.dataset.wired = '1';
    host.addEventListener('click', function(ev) {
      var like = ev.target.closest('[data-like]');
      if (like) { toggleLike(like.getAttribute('data-like'), like); return; }
      var ed = ev.target.closest('[data-edit]');
      if (ed) { startEdit(ed.getAttribute('data-edit')); return; }
      var del = ev.target.closest('[data-del]');
      if (del) { removePost(del.getAttribute('data-del')); }
    });
  }

  function wireRefresh() {
    var btn = document.getElementById('bulletin-refresh-btn');
    if (!btn || btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', async function() {
      btn.disabled = true;
      var ok = false;
      try { ok = await loadFeed(true); }
      finally {
        setTimeout(function() { btn.disabled = false; }, 500);
        if (window.showToast) window.showToast(ok ? '✅ புதுப்பிக்கப்பட்டது · Updated' : '❌ இணைப்பு இல்லை · Try again');
      }
    });
  }

  var _timer = null;
  var _inited = false;

  return {
    init: function() {
      wireCompose();
      wirePaste();
      wireFeedDelegation();
      wireRefresh();
      applyPosterState();
      // Every open (first or re-open) hits the network, like the other tabs —
      // otherwise a new post never shows up without pressing ↻. First open
      // paints the cached feed instantly, then the forced fetch re-renders it
      // (a plain cached fetch never re-renders once its 2.5s race is lost).
      if (_inited) loadFeed(true);
      else loadFeed(false).then(function() { return loadFeed(true); });
      _inited = true;
      if (!_timer) _timer = setInterval(function() { loadFeed(true); }, 10 * 60 * 1000);
    },
    refresh: function() { return loadFeed(true); },
  };
})();

window.Bulletin = Bulletin;
