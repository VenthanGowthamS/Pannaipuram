// ── Community Bulletin Controller ────────────────────────────────
// Village news sharing: users register (phone+name), post news/images,
// anyone can view active posts. Auto-purge after 7 days.
var Bulletin = (function() {

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function telHref(p) {
    return 'tel:' + String(p || '').replace(/[^0-9+]/g, '');
  }

  var API = (typeof window !== 'undefined' && window.API) || {};

  // ───────────────────────────────────────────────────────────
  // PUBLIC: Load & Display Active Posts
  // ───────────────────────────────────────────────────────────

  async function loadPosts() {
    try {
      const res = await API.fetch('/api/bulletin');
      if (!res || !res.data) return [];
      return res.data;
    } catch (err) {
      console.error('[Bulletin] load posts error:', err);
      return [];
    }
  }

  function postCard(post) {
    var thumb = post.image_url
      ? '<img class="bulletin-thumb" src="' + esc(post.image_url) + '" alt="post-image" loading="lazy">'
      : '';
    var timeago = formatTimeAgo(new Date(post.created_at));
    return '<div class="bulletin-card">' +
      '<div class="bulletin-header">' +
        '<div class="bulletin-poster">' +
          '<strong>' + esc(post.name_tamil || post.name_english || 'Anonymous') + '</strong>' +
          '<span class="bulletin-phone">📞 ' + esc(post.phone || '...') + '</span>' +
        '</div>' +
        '<span class="bulletin-time">' + timeago + '</span>' +
      '</div>' +
      '<div class="bulletin-title">' + esc(post.title_tamil) + '</div>' +
      (post.title_english ? '<div class="bulletin-subtitle">' + esc(post.title_english) + '</div>' : '') +
      '<div class="bulletin-content">' + esc(post.content_tamil) + '</div>' +
      (post.content_english ? '<div class="bulletin-content-en">' + esc(post.content_english) + '</div>' : '') +
      thumb +
      '</div>';
  }

  function formatTimeAgo(date) {
    if (!date) return '';
    var now = new Date();
    var secs = Math.floor((now - date) / 1000);
    if (secs < 60) return 'சரியே இப்போ';
    if (secs < 3600) return Math.floor(secs / 60) + ' நிமிஷத்திக்கு முன்';
    if (secs < 86400) return Math.floor(secs / 3600) + ' மணி நேரத்திக்கு முன்';
    return Math.floor(secs / 86400) + ' நாளுக்கு முன்';
  }

  async function renderPosts() {
    var host = document.getElementById('bulletin-posts');
    if (!host) return;
    host.innerHTML = '<div class="bulletin-loading">📰 செய்திகளை ஏற்றுகிறோம்...</div>';

    var posts = await loadPosts();
    if (posts.length === 0) {
      host.innerHTML = '<div class="bulletin-empty">தற்போது செய்திகள் இல்லை. முதலாவதாக பகிரலாம்!</div>';
      return;
    }
    host.innerHTML = posts.map(postCard).join('');
  }

  // ───────────────────────────────────────────────────────────
  // REGISTRATION: Phone + Name
  // ───────────────────────────────────────────────────────────

  function wireRegistration() {
    var regForm = document.getElementById('bulletin-reg-form');
    var regBtn = document.getElementById('bulletin-reg-btn');
    var regResult = document.getElementById('bulletin-reg-result');
    var phoneInput = document.getElementById('bulletin-phone');
    var phoneErr = document.getElementById('bulletin-phone-err');
    var postForm = document.getElementById('bulletin-post-form');
    var postSection = document.getElementById('bulletin-post-section');

    if (!regForm) return;

    // Auto-format phone input
    if (phoneInput) {
      phoneInput.addEventListener('input', function() {
        var d = this.value.replace(/\D/g, '').slice(0, 10);
        if (this.value !== d) this.value = d;
        if (phoneErr) { phoneErr.hidden = true; phoneErr.textContent = ''; }
      });
    }

    regForm.addEventListener('submit', async function(ev) {
      ev.preventDefault();
      var phone = (phoneInput.value || '').trim();
      var nameTamil = (document.getElementById('bulletin-name-ta').value || '').trim();
      var nameEn = (document.getElementById('bulletin-name-en').value || '').trim();

      // Validate phone
      if (!(phone.length === 10 && /^[6-9]/.test(phone))) {
        if (phoneErr) {
          phoneErr.textContent = '10 இலக்க மொபைல் எண்ணை சரியாக உள்ளிடுங்கள் (6/7/8/9-ல் தொடங்கணும்).';
          phoneErr.hidden = false;
        }
        phoneInput.focus();
        return;
      }

      if (!nameTamil) {
        regResult.textContent = 'பெயரை தமிழில் கொடுங்கள்';
        regResult.className = 'bulletin-result result-err';
        regResult.hidden = false;
        return;
      }

      regBtn.disabled = true;
      regBtn.textContent = '⏳ பதிவு செய்கிறோம்...';
      regResult.hidden = true;

      try {
        var res = await API.fetch('/api/bulletin/register', {
          method: 'POST',
          body: {
            phone: phone,
            name_tamil: nameTamil,
            name_english: nameEn
          }
        });

        if (!res || !res.success) {
          throw new Error(res?.error || 'Registration failed');
        }

        // Store poster_id in localStorage for this session
        localStorage.setItem('bulletin-poster-id', res.data.poster_id);
        localStorage.setItem('bulletin-poster-name', res.data.name_tamil);

        regForm.style.display = 'none';
        if (postSection) postSection.style.display = 'block';

        regResult.textContent = '✅ பதிவு முடிந்தது! செய்தி பகிரலாம்.';
        regResult.className = 'bulletin-result result-ok';
        regResult.hidden = false;

        // Auto-show post form after brief delay
        setTimeout(() => {
          if (postForm) postForm.scrollIntoView({ behavior: 'smooth' });
        }, 800);
      } catch (err) {
        console.error('[Bulletin] register error:', err);
        regResult.textContent = '❌ பதிவு தோல்வி: ' + (err.message || 'Try again');
        regResult.className = 'bulletin-result result-err';
        regResult.hidden = false;
      } finally {
        regBtn.disabled = false;
        regBtn.textContent = 'பதிவு செய்க';
      }
    });

    // Check if already registered
    var posterId = localStorage.getItem('bulletin-poster-id');
    if (posterId) {
      regForm.style.display = 'none';
      if (postSection) postSection.style.display = 'block';
    }
  }

  // ───────────────────────────────────────────────────────────
  // POST SUBMISSION: Title, Content, Optional Image
  // ───────────────────────────────────────────────────────────

  function wirePostForm() {
    var form = document.getElementById('bulletin-post-form');
    var btn = document.getElementById('bulletin-post-btn');
    var result = document.getElementById('bulletin-post-result');
    var imageInput = document.getElementById('bulletin-image');
    var imagePreview = document.getElementById('bulletin-image-preview');

    if (!form) return;

    // Image preview on select
    if (imageInput) {
      imageInput.addEventListener('change', function() {
        if (this.files.length === 0) {
          if (imagePreview) imagePreview.innerHTML = '';
          return;
        }
        var file = this.files[0];
        if (file.size > 256 * 1024) {
          alert('छवि बहुत बड़ी है (अधिकतम 256KB)');
          this.value = '';
          if (imagePreview) imagePreview.innerHTML = '';
          return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
          if (imagePreview) {
            imagePreview.innerHTML = '<img src="' + e.target.result + '" style="max-width:100%; border-radius:4px;">';
          }
        };
        reader.readAsDataURL(file);
      });
    }

    form.addEventListener('submit', async function(ev) {
      ev.preventDefault();

      var posterId = localStorage.getItem('bulletin-poster-id');
      if (!posterId) {
        result.textContent = '❌ முதலில் பதிவு செய்யவும்';
        result.className = 'bulletin-result result-err';
        result.hidden = false;
        return;
      }

      var titleTa = (document.getElementById('bulletin-title-ta').value || '').trim();
      var titleEn = (document.getElementById('bulletin-title-en').value || '').trim();
      var contentTa = (document.getElementById('bulletin-content-ta').value || '').trim();
      var contentEn = (document.getElementById('bulletin-content-en').value || '').trim();

      // Validate
      if (!titleTa || titleTa.length < 5) {
        result.textContent = '❌ தமிழ் நினைப்பு குறைந்தது 5 எழுத்து வேண்டும்';
        result.className = 'bulletin-result result-err';
        result.hidden = false;
        return;
      }

      if (!contentTa || contentTa.length < 10) {
        result.textContent = '❌ விபரம் குறைந்தது 10 எழுத்து வேண்டும்';
        result.className = 'bulletin-result result-err';
        result.hidden = false;
        return;
      }

      // Ask if it's important Pannaipuram-related
      if (!confirm('🔔 இது பண்ணைப்புரம் சம்பந்தமான முக்கியமான தகவலா?\n\nOK = ஆம் (post it)\nCancel = இல்லை (abort)')) {
        result.textContent = '❌ செய்தி வெளிபடுத்தப்படவில்லை';
        result.className = 'bulletin-result result-err';
        result.hidden = false;
        return;
      }

      btn.disabled = true;
      btn.textContent = '⏳ அனுப்புகிறோம்...';
      result.hidden = true;

      try {
        var imageUrl = null;
        if (imageInput && imageInput.files.length > 0) {
          imageUrl = await new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = function(e) { resolve(e.target.result); };
            reader.onerror = reject;
            reader.readAsDataURL(imageInput.files[0]);
          });
        }

        var res = await API.fetch('/api/bulletin/submit', {
          method: 'POST',
          body: {
            poster_id: parseInt(posterId),
            title_tamil: titleTa,
            title_english: titleEn,
            content_tamil: contentTa,
            content_english: contentEn,
            image_url: imageUrl
          }
        });

        if (!res || !res.success) {
          throw new Error(res?.error || 'Submit failed');
        }

        // Clear form
        form.reset();
        if (imagePreview) imagePreview.innerHTML = '';

        result.textContent = '✅ செய்தி வெளிபடுத்தப்பட்டது! 📰';
        result.className = 'bulletin-result result-ok';
        result.hidden = false;

        // Reload posts after brief delay
        setTimeout(() => {
          renderPosts();
        }, 1000);
      } catch (err) {
        console.error('[Bulletin] submit error:', err);
        result.textContent = '❌ பிழை: ' + (err.message || 'Try again');
        result.className = 'bulletin-result result-err';
        result.hidden = false;
      } finally {
        btn.disabled = false;
        btn.textContent = 'பகிரவும்';
      }
    });
  }

  // ───────────────────────────────────────────────────────────
  // Public API
  // ───────────────────────────────────────────────────────────

  return {
    init: function() {
      wireRegistration();
      wirePostForm();
      renderPosts();
      // Auto-refresh posts every 10 minutes
      setInterval(renderPosts, 10 * 60 * 1000);
    },
    render: renderPosts,
    load: loadPosts
  };
})();

// Auto-init if DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof Bulletin !== 'undefined') Bulletin.init();
  });
} else {
  Bulletin.init();
}
