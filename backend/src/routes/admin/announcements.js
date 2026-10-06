const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { validateIdParam, requireRole } = require('../../middleware/auth');
const { query } = require('../../db/pool');
const { trimStr } = require('../../middleware/validate');

router.use(adminAuth);

// expires_at must carry its timezone (the admin panel sends "+05:30").
// A bare "2026-10-05T23:59" is read in the DB session's zone, not IST.
function badExpiry(v) {
  return v != null && v !== '' && isNaN(Date.parse(v));
}

// GET /admin/announcements — all (incl expired/inactive)
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /admin/announcements — create
router.post('/', requireRole('admin', 'super_admin'), async (req, res) => {
  const message_tamil   = trimStr(req.body.message_tamil);
  const message_english = trimStr(req.body.message_english);
  const { type, priority, expires_at } = req.body;
  if (!message_tamil) return res.status(400).json({ success: false, error: 'message_tamil required' });
  if (badExpiry(expires_at)) return res.status(400).json({ success: false, error: 'expires_at must be a valid date-time' });
  const validTypes = ['info', 'warning', 'urgent', 'event'];
  if (type && !validTypes.includes(type)) {
    return res.status(400).json({ success: false, error: `type must be one of: ${validTypes.join(', ')}` });
  }
  try {
    const result = await query(`
      INSERT INTO announcements (message_tamil, message_english, type, priority, expires_at)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [message_tamil, message_english, type || 'info', priority || 0, expires_at || null]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/announcements/:id — update
router.put('/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  const { message_tamil, message_english, type, priority, is_active, expires_at } = req.body;
  if (badExpiry(expires_at)) return res.status(400).json({ success: false, error: 'expires_at must be a valid date-time' });
  try {
    const result = await query(`
      UPDATE announcements SET
        message_tamil  = COALESCE($1, message_tamil),
        message_english= COALESCE($2, message_english),
        type           = COALESCE($3, type),
        priority       = COALESCE($4, priority),
        is_active      = COALESCE($5, is_active),
        expires_at     = CASE WHEN $8 THEN $6::timestamptz ELSE expires_at END
      WHERE id = $7 RETURNING *
    `, [message_tamil, message_english, type, priority, is_active, expires_at || null, req.params.id,
        // Sending expires_at (even null) sets it — null means "never expires".
        // COALESCE used to keep the old date, so an expiry could never be removed.
        Object.prototype.hasOwnProperty.call(req.body, 'expires_at')]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /admin/announcements/:id
router.delete('/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    await query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
