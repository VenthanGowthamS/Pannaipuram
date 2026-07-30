// ── Community Bulletin — ADMIN routes (JWT-protected) ─────────────
// Moderation queue + poster management. Public routes: routes/bulletin.js
const express = require('express');
const router  = express.Router();
const { query } = require('../../db/pool');
const adminAuth = require('../../middleware/auth');
const { requireRole, validateIdParam } = require('../../middleware/auth');

router.use(adminAuth);

const canWrite = requireRole('admin', 'super_admin');

// ── GET /admin/bulletin — every post, newest first ────────────────
// ?status=pending filters; omit for all. Pending sorts first so the
// moderation queue is the first thing the admin sees.
router.get('/', async (req, res) => {
  const status = req.query.status;
  const allowed = ['pending', 'approved', 'rejected', 'archived'];
  try {
    const filtered = allowed.includes(status);
    const result = await query(
      `SELECT
         p.id, p.title_tamil, p.title_english,
         p.content_tamil, p.content_english, p.image_url,
         p.status, p.created_at, p.updated_at, p.expires_at,
         poster.id AS poster_id,
         poster.name_tamil, poster.name_english, poster.phone,
         poster.is_trusted, poster.is_blocked,
         (SELECT COUNT(*)::int FROM community_post_likes l WHERE l.post_id = p.id) AS like_count
       FROM community_posts p
       JOIN community_posters poster ON p.poster_id = poster.id
       ${filtered ? 'WHERE p.status = $1' : ''}
       ORDER BY (p.status = 'pending') DESC, p.created_at DESC
       LIMIT 500`,
      filtered ? [status] : []
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('admin bulletin GET error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

// ── PATCH /admin/bulletin/:id/status — approve / reject / archive ─
router.patch('/:id/status', canWrite, validateIdParam, async (req, res) => {
  const { status } = req.body || {};
  if (!['approved', 'rejected', 'archived'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  try {
    const result = await query(
      `UPDATE community_posts
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, status, updated_at`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('admin bulletin status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// ── DELETE /admin/bulletin/:id ────────────────────────────────────
router.delete('/:id', canWrite, validateIdParam, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM community_posts WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, data: { id: result.rows[0].id } });
  } catch (err) {
    console.error('admin bulletin DELETE error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
});

// ── GET /admin/bulletin/posters/list — registered villagers ───────
// Path is /posters/list (not /posters) so it can't be shadowed by /:id.
router.get('/posters/list', async (req, res) => {
  try {
    const result = await query(
      `SELECT
         po.id, po.phone, po.name_tamil, po.name_english,
         po.is_trusted, po.is_blocked, po.registered_at,
         (SELECT COUNT(*)::int FROM community_posts p WHERE p.poster_id = po.id) AS post_count
       FROM community_posters po
       ORDER BY po.registered_at DESC
       LIMIT 500`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('admin bulletin posters error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch posters' });
  }
});

// ── PATCH /admin/bulletin/posters/:id — trusted / blocked flags ───
router.patch('/posters/:id', canWrite, validateIdParam, async (req, res) => {
  const { is_trusted, is_blocked } = req.body || {};
  if (typeof is_trusted !== 'boolean' && typeof is_blocked !== 'boolean') {
    return res.status(400).json({ success: false, error: 'is_trusted or is_blocked (boolean) required' });
  }
  try {
    const result = await query(
      `UPDATE community_posters
       SET is_trusted = COALESCE($1, is_trusted),
           is_blocked = COALESCE($2, is_blocked)
       WHERE id = $3
       RETURNING id, phone, name_tamil, is_trusted, is_blocked`,
      [
        typeof is_trusted === 'boolean' ? is_trusted : null,
        typeof is_blocked === 'boolean' ? is_blocked : null,
        req.params.id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Poster not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('admin bulletin poster update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update poster' });
  }
});

// ── DELETE /admin/bulletin/posters/:id ────────────────────────────
// Removes the villager and (via ON DELETE CASCADE) all their posts,
// likes and daily counters. Use for spam accounts; prefer is_blocked
// when you want to keep the history.
router.delete('/posters/:id', canWrite, validateIdParam, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM community_posters WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Poster not found' });
    }
    res.json({ success: true, data: { id: result.rows[0].id } });
  } catch (err) {
    console.error('admin bulletin poster DELETE error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete poster' });
  }
});

module.exports = router;
