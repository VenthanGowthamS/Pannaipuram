// ── Community Bulletin (சங்கமம்) — PUBLIC routes ──────────────────
// Model: registration required to post · admin approves · trusted posters
//        skip the queue · anyone can view + like · 7-day expiry.
// Admin/moderation routes live in routes/admin/bulletin.js (JWT-protected).
const express = require('express');
const router  = express.Router();
const { query, getClient } = require('../db/pool');

// Indian mobile: exactly 10 digits starting 6/7/8/9
function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(String(phone == null ? '' : phone).trim());
}

// Client compresses to ~80KB; allow headroom but reject anything that would
// bloat the 500MB Supabase tier. Matches express.json({ limit: '1mb' }).
const MAX_IMAGE_BYTES = 150 * 1024;

function isValidImage(url) {
  return typeof url === 'string' && /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(url);
}

const MIN_TITLE   = 5;
const MIN_CONTENT = 10;

function hasImage(image_url) {
  return image_url != null && image_url !== '';
}

// Shared by submit + edit. A photo is content on its own — a villager
// sharing "water pipe burst on my street" with a picture shouldn't be
// blocked for not also typing a paragraph. Text-only posts still need real
// substance so the feed doesn't fill with one-word "posts".
function validatePostContent({ title_tamil, content_tamil, image_url }) {
  if (hasImage(image_url)) {
    if (!isValidImage(image_url)) return 'படம் சரியில்லை (JPEG/PNG/WebP மட்டும்)';
    if (image_url.length > MAX_IMAGE_BYTES) return 'படம் ரொம்ப பெரிசு (அதிகபட்சம் 150KB)';
    return null;
  }
  if (!title_tamil || String(title_tamil).trim().length < MIN_TITLE) {
    return `தலைப்பு குறைந்தது ${MIN_TITLE} எழுத்து வேணும் (அல்லது ஒரு படம் சேருங்க)`;
  }
  if (!content_tamil || String(content_tamil).trim().length < MIN_CONTENT) {
    return `விபரம் குறைந்தது ${MIN_CONTENT} எழுத்து வேணும் (அல்லது ஒரு படம் சேருங்க)`;
  }
  return null;
}

// ── Optional link on a post ───────────────────────────────────────
// A URL typed into the body is dead text: the villager it was meant for has
// to select it, copy it and paste it into a browser, and most simply don't —
// so the video or the TNEB notice the post was ABOUT never gets opened. This
// column is rendered as a real tappable button instead, which is exactly why
// the scheme has to be locked down HERE: the value ends up inside an href in
// the PWA, and a 'javascript:' URL there is an XSS hole. http/https only.
const MAX_LINK_LENGTH = 500;
const LINK_ERROR = 'இணைப்பு சரியில்லை — http அல்லது https link கொடுங்க';

function normalizeLink(raw) {
  if (raw == null) return { value: null };
  const s = String(raw).trim();
  if (!s) return { value: null };
  if (s.length > MAX_LINK_LENGTH) return { error: 'இணைப்பு ரொம்ப நீளம்' };

  // People type "youtube.com/watch?v=..." with no scheme — assume https
  // rather than rejecting them. Anything that already carries a scheme is
  // taken as-is, so a bad one is caught below instead of being disguised.
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : 'https://' + s;

  let url;
  try { url = new URL(withScheme); }
  catch (_) { return { error: LINK_ERROR }; }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { error: LINK_ERROR };
  // A hostname with no dot ("https://foo") resolves for nobody. Catching it
  // here beats a villager tapping a button that goes nowhere.
  if (!url.hostname || url.hostname.indexOf('.') === -1) return { error: LINK_ERROR };
  if (url.href.length > MAX_LINK_LENGTH) return { error: 'இணைப்பு ரொம்ப நீளம்' };
  return { value: url.href };
}

// ── link_url column presence ──────────────────────────────────────
// Migrations are applied by hand in the Supabase SQL Editor, so this code can
// reach production before the column does. Selecting a column that isn't
// there would 500 the WHOLE feed for the whole village, so every query is
// built around this check. A negative answer is re-checked after a minute,
// which is how the feature switches itself on the moment the migration is
// run — no redeploy needed.
let _linkColumn = false;
let _linkColumnCheckedAt = 0;
const LINK_RECHECK_MS = 60 * 1000;

async function hasLinkColumn() {
  if (_linkColumn) return true;
  if (Date.now() - _linkColumnCheckedAt < LINK_RECHECK_MS) return false;
  _linkColumnCheckedAt = Date.now();
  try {
    const r = await query(
      `SELECT 1 FROM information_schema.columns
        WHERE table_name = 'community_posts' AND column_name = 'link_url'`
    );
    _linkColumn = r.rows.length > 0;
  } catch (_) {
    _linkColumn = false;
  }
  return _linkColumn;
}

// ── GET /api/bulletin — live feed (approved + unexpired) ──────────
// ?device_id=<id>  marks which posts this device already liked.
// ?poster_id=<id>  additionally returns THAT poster's own pending posts, so
//                  after an edit re-queues a post its author still sees it
//                  (labelled "awaiting approval") instead of it vanishing.
//                  Only ever exposes the caller's own pending rows.
router.get('/', async (req, res) => {
  const deviceId = req.query.device_id ? String(req.query.device_id).slice(0, 64) : null;
  const ownRaw = Number(req.query.poster_id);
  const ownPosterId = Number.isInteger(ownRaw) && ownRaw > 0 ? ownRaw : null;
  try {
    // NULL stand-in keeps the response shape identical pre-migration, so the
    // PWA never has to special-case a missing field.
    const linkSel = (await hasLinkColumn()) ? 'p.link_url' : 'NULL::text AS link_url';
    const result = await query(
      `SELECT
         p.id,
         p.poster_id,
         p.status,
         p.title_tamil,
         p.title_english,
         p.content_tamil,
         p.content_english,
         p.image_url,
         ${linkSel},
         p.created_at,
         poster.name_tamil,
         poster.name_english,
         poster.is_trusted,
         poster.is_official,
         COUNT(l.id)::int AS like_count,
         COALESCE(BOOL_OR(l.device_id = $1), FALSE) AS liked_by_me
       FROM community_posts p
       JOIN community_posters poster ON p.poster_id = poster.id
       LEFT JOIN community_post_likes l ON l.post_id = p.id
       WHERE p.expires_at > NOW()
         AND (
           p.status = 'approved'
           OR ($2::int IS NOT NULL AND p.poster_id = $2::int AND p.status = 'pending')
         )
       GROUP BY p.id, poster.id
       ORDER BY p.created_at DESC
       LIMIT 100`,
      [deviceId, ownPosterId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('bulletin GET error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

// ── Ownership check for villager edit/delete ──────────────────────
// There is no login, so the phone given at registration is the shared
// secret: poster_id alone is a small sequential integer and trivially
// guessable, phone+id together is not. This is proportionate to the data
// (village notices, already public once approved) — it is NOT authentication,
// and the official account is excluded from these routes entirely.
async function loadOwnedPost(postId, posterIdRaw, phoneRaw) {
  const pid = Number(posterIdRaw);
  const phone = String(phoneRaw == null ? '' : phoneRaw).trim();
  if (!Number.isInteger(pid) || pid <= 0 || !phone) return { err: 'bad_request' };

  const r = await query(
    `SELECT p.id, p.poster_id, p.status,
            po.phone, po.is_trusted, po.is_blocked, po.is_official
     FROM community_posts p
     JOIN community_posters po ON po.id = p.poster_id
     WHERE p.id = $1`,
    [postId]
  );
  if (r.rows.length === 0) return { err: 'not_found' };

  const row = r.rows[0];
  // Same 403 for "not yours" and "wrong phone" so this can't be used to
  // enumerate which post ids belong to which villager.
  if (row.poster_id !== pid || row.phone !== phone) return { err: 'forbidden' };
  if (row.is_blocked) return { err: 'blocked' };
  if (row.is_official) return { err: 'forbidden' };   // admin panel only
  return { post: row };
}

function ownershipError(res, err) {
  if (err === 'bad_request') return res.status(400).json({ success: false, error: 'முதலில் பதிவு செய்யுங்க' });
  if (err === 'not_found')   return res.status(404).json({ success: false, error: 'செய்தி கிடைக்கல' });
  if (err === 'blocked')     return res.status(403).json({ success: false, error: 'உங்களுக்கு அனுமதி இல்லை' });
  return res.status(403).json({ success: false, error: 'இது உங்க செய்தி இல்ல' });
}

// ── PATCH /api/bulletin/:id — villager edits their OWN post ───────
// An untrusted poster's edit sends the post back to 'pending' for review.
// Without that, someone could get a harmless post approved and then rewrite
// it into spam that is already live under the village's feed.
router.patch('/:id', async (req, res) => {
  const postId = Number(req.params.id);
  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid post id' });
  }

  const {
    poster_id, phone, title_tamil, title_english,
    content_tamil, content_english, image_url, link_url,
  } = req.body || {};

  const contentErr = validatePostContent({ title_tamil, content_tamil, image_url });
  if (contentErr) return res.status(400).json({ success: false, error: contentErr });

  const link = normalizeLink(link_url);
  if (link.error) return res.status(400).json({ success: false, error: link.error });

  try {
    const { err, post } = await loadOwnedPost(postId, poster_id, phone);
    if (err) return ownershipError(res, err);

    const newStatus = post.is_trusted === true ? 'approved' : 'pending';

    const params = [
      String(title_tamil || '').trim(),
      title_english ? String(title_english).trim() : null,
      String(content_tamil || '').trim(),
      content_english ? String(content_english).trim() : null,
      image_url || null,
      newStatus,
    ];
    // Pre-migration the link is silently dropped rather than failing the whole
    // edit — losing an optional button beats losing the villager's text.
    let linkSet = '';
    const linkCol = await hasLinkColumn();
    if (linkCol) {
      params.push(link.value);
      linkSet = `, link_url = $${params.length}`;
    }
    params.push(postId);

    const upd = await query(
      `UPDATE community_posts
          SET title_tamil = $1, title_english = $2,
              content_tamil = $3, content_english = $4,
              image_url = $5, status = $6${linkSet}
        WHERE id = $${params.length}
      RETURNING id, status`,
      params
    );

    res.json({
      success: true,
      data: {
        id: upd.rows[0].id,
        status: upd.rows[0].status,
        // Lets the PWA say "your edit is waiting for approval" rather than
        // leaving the villager wondering where their post went.
        requeued: newStatus === 'pending',
        ...(link.value && !linkCol ? { link_saved: false } : {}),
      },
    });
  } catch (e) {
    console.error('bulletin edit error:', e);
    res.status(500).json({ success: false, error: 'திருத்த முடியல' });
  }
});

// ── DELETE /api/bulletin/:id — villager deletes their OWN post ────
// Likes cascade. Does NOT refund the daily allowance: otherwise post →
// delete → post becomes an unlimited loop around the one-per-day limit.
router.delete('/:id', async (req, res) => {
  const postId = Number(req.params.id);
  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid post id' });
  }

  const body = req.body || {};
  try {
    const { err } = await loadOwnedPost(postId, body.poster_id, body.phone);
    if (err) return ownershipError(res, err);

    await query('DELETE FROM community_posts WHERE id = $1', [postId]);
    res.json({ success: true, data: { id: postId, deleted: true } });
  } catch (e) {
    console.error('bulletin delete error:', e);
    res.status(500).json({ success: false, error: 'நீக்க முடியல' });
  }
});

// ── POST /api/bulletin/register — one-time phone + name ───────────
// Idempotent: re-registering the same phone returns the same poster_id,
// so a villager switching devices just registers again.
router.post('/register', async (req, res) => {
  const { phone, name_tamil, name_english } = req.body || {};

  if (!isValidPhone(phone)) {
    return res.status(400).json({
      success: false,
      error: '10 இலக்க மொபைல் எண் வேணும் (6/7/8/9-ல் தொடங்கணும்)',
    });
  }
  if (!name_tamil || String(name_tamil).trim().length < 2) {
    return res.status(400).json({ success: false, error: 'பெயர் வேணும்' });
  }

  try {
    // Blocked posters must not be silently re-enabled by re-registering.
    // The official village account must never be claimable from this public
    // endpoint — otherwise anyone could publish under the admin's name.
    const existing = await query(
      'SELECT id, is_blocked, is_official FROM community_posters WHERE phone = $1',
      [String(phone).trim()]
    );
    if (existing.rows.length > 0 && (existing.rows[0].is_blocked || existing.rows[0].is_official)) {
      return res.status(403).json({
        success: false,
        error: 'இந்த எண்ணுக்கு பதிவு அனுமதி இல்லை',
      });
    }

    const result = await query(
      `INSERT INTO community_posters (phone, name_tamil, name_english)
       VALUES ($1, $2, $3)
       ON CONFLICT (phone) DO UPDATE
         SET name_tamil = EXCLUDED.name_tamil,
             name_english = EXCLUDED.name_english
       RETURNING id, phone, name_tamil, name_english, is_trusted`,
      [
        String(phone).trim(),
        String(name_tamil).trim(),
        name_english ? String(name_english).trim() : null,
      ]
    );
    const p = result.rows[0];
    res.json({
      success: true,
      data: {
        poster_id: p.id,
        phone: p.phone,
        name_tamil: p.name_tamil,
        is_trusted: p.is_trusted === true,
      },
    });
  } catch (err) {
    console.error('bulletin register error:', err);
    res.status(500).json({ success: false, error: 'பதிவு தோல்வி' });
  }
});

// ── POST /api/bulletin/submit — create a post ─────────────────────
// Trusted posters → 'approved' (instant). Everyone else → 'pending'.
router.post('/submit', async (req, res) => {
  const {
    poster_id, title_tamil, title_english,
    content_tamil, content_english, image_url, link_url,
  } = req.body || {};

  const pid = Number(poster_id);
  if (!Number.isInteger(pid) || pid <= 0) {
    return res.status(400).json({ success: false, error: 'முதலில் பதிவு செய்யுங்க' });
  }
  const contentErr = validatePostContent({ title_tamil, content_tamil, image_url });
  if (contentErr) return res.status(400).json({ success: false, error: contentErr });

  const link = normalizeLink(link_url);
  if (link.error) return res.status(400).json({ success: false, error: link.error });
  // Resolved BEFORE the transaction opens: an information_schema round trip
  // inside the poster row lock would hold it longer for no reason.
  const linkCol = await hasLinkColumn();

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const posterRes = await client.query(
      'SELECT id, is_trusted, is_blocked, is_official FROM community_posters WHERE id = $1 FOR UPDATE',
      [pid]
    );
    if (posterRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'முதலில் பதிவு செய்யுங்க' });
    }
    if (posterRes.rows[0].is_blocked) {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, error: 'உங்களுக்கு பதிவிட அனுமதி இல்லை' });
    }
    // poster_id is a small sequential integer, so it is trivially guessable.
    // The official account is is_trusted, meaning a guessed id would publish
    // instantly under the admin's name — posting as it requires an admin JWT
    // (POST /admin/bulletin/post), never this public route.
    if (posterRes.rows[0].is_official) {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, error: 'இந்த கணக்கில் பதிவிட அனுமதி இல்லை' });
    }

    // One post per poster per day. The row lock above serialises concurrent
    // submits from the same poster, so a double-tap can't slip two through.
    const today = new Date().toISOString().slice(0, 10);
    const daily = await client.query(
      'SELECT count FROM community_posts_daily WHERE poster_id = $1 AND post_date = $2',
      [pid, today]
    );
    if (daily.rows.length > 0 && daily.rows[0].count >= 1) {
      await client.query('ROLLBACK');
      return res.status(429).json({
        success: false,
        error: 'ஒரு நாளைக்கு ஒரு செய்தி மட்டுமே — நாளைக்கு முயற்சி பண்ணுங்க',
      });
    }

    const status = posterRes.rows[0].is_trusted === true ? 'approved' : 'pending';

    const cols = ['poster_id', 'title_tamil', 'title_english', 'content_tamil',
                  'content_english', 'image_url', 'status'];
    const vals = [
      pid,
      String(title_tamil || '').trim(),
      title_english ? String(title_english).trim() : null,
      String(content_tamil || '').trim(),
      content_english ? String(content_english).trim() : null,
      image_url || null,
      status,
    ];
    if (linkCol) { cols.push('link_url'); vals.push(link.value); }

    const postRes = await client.query(
      `INSERT INTO community_posts (${cols.join(', ')})
       VALUES (${vals.map((_, i) => '$' + (i + 1)).join(', ')})
       RETURNING id, status, created_at`,
      vals
    );

    await client.query(
      `INSERT INTO community_posts_daily (poster_id, post_date, count)
       VALUES ($1, $2, 1)
       ON CONFLICT (poster_id, post_date) DO UPDATE SET count = community_posts_daily.count + 1`,
      [pid, today]
    );

    await client.query('COMMIT');
    res.json({
      success: true,
      data: {
        id: postRes.rows[0].id,
        status: postRes.rows[0].status,
        created_at: postRes.rows[0].created_at,
        // false = a link was given but the column isn't there yet, so it was
        // dropped. Silence here is what made a missing migration look like a
        // broken feature: the post saved, said so, and lost the link.
        ...(link.value && !linkCol ? { link_saved: false } : {}),
      },
    });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (_) { /* connection already gone */ }
    console.error('bulletin submit error:', err);
    res.status(500).json({ success: false, error: 'செய்தி அனுப்ப முடியல' });
  } finally {
    client.release();
  }
});

// ── POST /api/bulletin/:id/like — toggle like (no registration) ───
router.post('/:id/like', async (req, res) => {
  const postId = Number(req.params.id);
  const deviceId = req.body && req.body.device_id
    ? String(req.body.device_id).trim().slice(0, 64) : '';

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid post id' });
  }
  if (!deviceId) {
    return res.status(400).json({ success: false, error: 'device_id required' });
  }

  try {
    // Only likeable while the post is actually live.
    const live = await query(
      `SELECT 1 FROM community_posts
       WHERE id = $1 AND status = 'approved' AND expires_at > NOW()`,
      [postId]
    );
    if (live.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Toggle: DELETE returns the row if a like existed, otherwise INSERT.
    const removed = await query(
      'DELETE FROM community_post_likes WHERE post_id = $1 AND device_id = $2 RETURNING id',
      [postId, deviceId]
    );
    if (removed.rows.length === 0) {
      await query(
        `INSERT INTO community_post_likes (post_id, device_id)
         VALUES ($1, $2) ON CONFLICT (post_id, device_id) DO NOTHING`,
        [postId, deviceId]
      );
    }

    const countRes = await query(
      'SELECT COUNT(*)::int AS c FROM community_post_likes WHERE post_id = $1',
      [postId]
    );
    res.json({
      success: true,
      data: { liked: removed.rows.length === 0, like_count: countRes.rows[0].c },
    });
  } catch (err) {
    console.error('bulletin like error:', err);
    res.status(500).json({ success: false, error: 'Failed to update like' });
  }
});

module.exports = router;
// Shared with routes/admin/bulletin.js so the official-post and admin-edit
// routes can never drift from the rules the villager routes enforce.
module.exports.validatePostContent = validatePostContent;
module.exports.normalizeLink = normalizeLink;
module.exports.hasLinkColumn = hasLinkColumn;
