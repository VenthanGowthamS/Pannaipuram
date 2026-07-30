const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// Validate Indian phone number (exactly 10 digits, starts with 6/7/8/9)
function isValidPhone(phone) {
  const p = String(phone).trim();
  return /^[6-9]\d{9}$/.test(p);
}

// ═════════════════════════════════════════════════════════════════════
// PUBLIC API — Anyone can view posts
// ═════════════════════════════════════════════════════════════════════

// GET /api/bulletin — fetch active posts (approved + not expired)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT
        p.id,
        p.title_tamil,
        p.title_english,
        p.content_tamil,
        p.content_english,
        p.image_url,
        p.created_at,
        poster.name_tamil,
        poster.name_english,
        poster.phone
      FROM community_posts p
      JOIN community_posters poster ON p.poster_id = poster.id
      WHERE p.status = 'approved'
        AND p.expires_at > NOW()
      ORDER BY p.created_at DESC
      LIMIT 100`,
      []
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('bulletin GET error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

// ═════════════════════════════════════════════════════════════════════
// USER REGISTRATION — POST /api/bulletin/register
// ═════════════════════════════════════════════════════════════════════

router.post('/register', async (req, res) => {
  const { phone, name_tamil, name_english } = req.body || {};

  // Validate phone
  if (!isValidPhone(phone)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid phone number. Must be 10 digits starting with 6/7/8/9'
    });
  }

  // Validate name
  if (!name_tamil || String(name_tamil).trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Name required (min 2 characters)'
    });
  }

  try {
    const result = await query(
      `INSERT INTO community_posters (phone, name_tamil, name_english)
       VALUES ($1, $2, $3)
       ON CONFLICT (phone) DO UPDATE SET name_tamil = $2, name_english = $3
       RETURNING id, phone, name_tamil, name_english, registered_at`,
      [String(phone).trim(), String(name_tamil).trim(), name_english ? String(name_english).trim() : null]
    );
    const poster = result.rows[0];
    res.json({
      success: true,
      data: {
        poster_id: poster.id,
        phone: poster.phone,
        name_tamil: poster.name_tamil
      }
    });
  } catch (err) {
    console.error('bulletin register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// ═════════════════════════════════════════════════════════════════════
// POST A BULLETIN — POST /api/bulletin/submit
// ═════════════════════════════════════════════════════════════════════

router.post('/submit', async (req, res) => {
  const {
    poster_id,
    title_tamil,
    title_english,
    content_tamil,
    content_english,
    image_url
  } = req.body || {};

  // Validate poster_id
  if (!poster_id || !Number.isInteger(Number(poster_id)) || Number(poster_id) <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid poster_id' });
  }

  // Validate titles
  if (!title_tamil || String(title_tamil).trim().length < 5) {
    return res.status(400).json({ success: false, error: 'Title required (min 5 characters)' });
  }

  // Validate content
  if (!content_tamil || String(content_tamil).trim().length < 10) {
    return res.status(400).json({ success: false, error: 'Content required (min 10 characters)' });
  }

  // Validate image size if provided (max 256KB)
  if (image_url && image_url.length > 256 * 1024) {
    return res.status(400).json({ success: false, error: 'Image too large (max 256KB)' });
  }

  const client = await require('../db/pool').getClient();
  try {
    await client.query('BEGIN');

    // Check if poster exists
    const posterCheck = await client.query(
      'SELECT id FROM community_posters WHERE id = $1',
      [Number(poster_id)]
    );
    if (posterCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Poster not found. Register first.' });
    }

    // Check daily post limit (max 1 post per day)
    const today = new Date().toISOString().split('T')[0];
    const dailyCheck = await client.query(
      `SELECT count FROM community_posts_daily
       WHERE poster_id = $1 AND post_date = $2`,
      [Number(poster_id), today]
    );

    if (dailyCheck.rows.length > 0 && dailyCheck.rows[0].count >= 1) {
      await client.query('ROLLBACK');
      return res.status(429).json({
        success: false,
        error: 'Daily post limit reached. Try again tomorrow.'
      });
    }

    // Insert post (status = 'approved' by default, goes live immediately)
    const postResult = await client.query(
      `INSERT INTO community_posts
        (poster_id, title_tamil, title_english, content_tamil, content_english, image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'approved')
       RETURNING id, created_at`,
      [
        Number(poster_id),
        String(title_tamil).trim(),
        title_english ? String(title_english).trim() : null,
        String(content_tamil).trim(),
        content_english ? String(content_english).trim() : null,
        image_url || null
      ]
    );

    // Update daily counter
    if (dailyCheck.rows.length === 0) {
      await client.query(
        `INSERT INTO community_posts_daily (poster_id, post_date, count)
         VALUES ($1, $2, 1)`,
        [Number(poster_id), today]
      );
    } else {
      await client.query(
        `UPDATE community_posts_daily
         SET count = count + 1
         WHERE poster_id = $1 AND post_date = $2`,
        [Number(poster_id), today]
      );
    }

    await client.query('COMMIT');
    res.json({
      success: true,
      data: {
        id: postResult.rows[0].id,
        created_at: postResult.rows[0].created_at
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('bulletin submit error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit post' });
  } finally {
    client.release();
  }
});

// ═════════════════════════════════════════════════════════════════════
// ADMIN API — Moderation (requires auth token in production)
// ═════════════════════════════════════════════════════════════════════

// GET /api/bulletin/admin/pending — view pending posts
router.get('/admin/pending', async (req, res) => {
  // TODO: Add JWT auth middleware check
  try {
    const result = await query(
      `SELECT
        p.id,
        p.title_tamil,
        p.title_english,
        p.content_tamil,
        p.content_english,
        p.image_url,
        p.status,
        p.created_at,
        poster.name_tamil,
        poster.phone
      FROM community_posts p
      JOIN community_posters poster ON p.poster_id = poster.id
      WHERE p.status IN ('pending', 'approved', 'rejected')
      ORDER BY p.created_at DESC`,
      []
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('bulletin admin/pending error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch pending posts' });
  }
});

// PATCH /api/bulletin/admin/:id/status — approve/reject a post
router.patch('/admin/:id/status', async (req, res) => {
  // TODO: Add JWT auth middleware check
  const { id } = req.params;
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
      [status, Number(id)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('bulletin admin/status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update post status' });
  }
});

// DELETE /api/bulletin/admin/:id — delete a post
router.delete('/admin/:id', async (req, res) => {
  // TODO: Add JWT auth middleware check
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM community_posts WHERE id = $1 RETURNING id',
      [Number(id)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, data: { id: result.rows[0].id } });
  } catch (err) {
    console.error('bulletin admin delete error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
});

module.exports = router;
