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
    content_tamil, content_english, image_url,
  } = req.body || {};

  if (!title_tamil || String(title_tamil).trim().length < MIN_TITLE) {
    return res.status(400).json({ success: false, error: `தலைப்பு குறைந்தது ${MIN_TITLE} எழுத்து வேணும்` });
  }
  if (!content_tamil || String(content_tamil).trim().length < MIN_CONTENT) {
    return res.status(400).json({ success: false, error: `விபரம் குறைந்தது ${MIN_CONTENT} எழுத்து வேணும்` });
  }
  if (image_url != null && image_url !== '') {
    if (!isValidImage(image_url)) {
      return res.status(400).json({ success: false, error: 'படம் சரியில்லை (JPEG/PNG/WebP மட்டும்)' });
    }
    if (image_url.length > MAX_IMAGE_BYTES) {
      return res.status(400).json({ success: false, error: 'படம் ரொம்ப பெரிசு (அதிகபட்சம் 150KB)' });
    }
  }

  try {
    const { err, post } = await loadOwnedPost(postId, poster_id, phone);
    if (err) return ownershipError(res, err);

    const newStatus = post.is_trusted === true ? 'approved' : 'pending';

    const upd = await query(
      `UPDATE community_posts
          SET title_tamil = $1, title_english = $2,
              content_tamil = $3, content_english = $4,
              image_url = $5, status = $6
        WHERE id = $7
      RETURNING id, status`,
      [
        String(title_tamil).trim(),
        title_english ? String(title_english).trim() : null,
        String(content_tamil).trim(),
        content_english ? String(content_english).trim() : null,
        image_url || null,
        newStatus,
        postId,
      ]
    );

    res.json({
      success: true,
      data: {
        id: upd.rows[0].id,
        status: upd.rows[0].status,
        // Lets the PWA say "your edit is waiting for approval" rather than
        // leaving the villager wondering where their post went.
        requeued: newStatus === 'pending',
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
    content_tamil, content_english, image_url,
  } = req.body || {};

  const pid = Number(poster_id);
  if (!Number.isInteger(pid) || pid <= 0) {
    return res.status(400).json({ success: false, error: 'முதலில் பதிவு செய்யுங்க' });
  }
  if (!title_tamil || String(title_tamil).trim().length < MIN_TITLE) {
    return res.status(400).json({ success: false, error: `தலைப்பு குறைந்தது ${MIN_TITLE} எழுத்து வேணும்` });
  }
  if (!content_tamil || String(content_tamil).trim().length < MIN_CONTENT) {
    return res.status(400).json({ success: false, error: `விபரம் குறைந்தது ${MIN_CONTENT} எழுத்து வேணும்` });
  }
  if (image_url != null && image_url !== '') {
    if (!isValidImage(image_url)) {
      return res.status(400).json({ success: false, error: 'படம் சரியில்லை (JPEG/PNG/WebP மட்டும்)' });
    }
    if (image_url.length > MAX_IMAGE_BYTES) {
      return res.status(400).json({ success: false, error: 'படம் ரொம்ப பெரிசு (அதிகபட்சம் 150KB)' });
    }
  }

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

    const postRes = await client.query(
      `INSERT INTO community_posts
         (poster_id, title_tamil, title_english, content_tamil, content_english, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, status, created_at`,
      [
        pid,
        String(title_tamil).trim(),
        title_english ? String(title_english).trim() : null,
        String(content_tamil).trim(),
        content_english ? String(content_english).trim() : null,
        image_url || null,
        status,
      ]
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
