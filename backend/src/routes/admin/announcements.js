const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { query } = require('../../db/pool');

router.use(adminAuth);

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
router.post('/', async (req, res) => {
  const { message_tamil, message_english, type, priority, expires_at } = req.body;
  if (!message_tamil) return res.status(400).json({ success: false, error: 'message_tamil required' });
  try {
    const result = await query(`
      INSERT INTO announcements (message_tamil, message_english, type, priority, expires_at)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [message_tamil, message_english || null, type || 'info', priority || 0, expires_at || null]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/announcements/:id — update
router.put('/:id', async (req, res) => {
  const { message_tamil, message_english, type, priority, is_active, expires_at } = req.body;
  try {
    const result = await query(`
      UPDATE announcements SET
        message_tamil  = COALESCE($1, message_tamil),
        message_english= COALESCE($2, message_english),
        type           = COALESCE($3, type),
        priority       = COALESCE($4, priority),
        is_active      = COALESCE($5, is_active),
        expires_at     = COALESCE($6, expires_at)
      WHERE id = $7 RETURNING *
    `, [message_tamil, message_english, type, priority, is_active, expires_at, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /admin/announcements/:id
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
