const express = require('express');
const router  = express.Router();
const { query } = require('../../db/pool');
const adminAuth = require('../../middleware/auth');
const { validateIdParam } = require('../../middleware/auth');

router.use(adminAuth);

// GET /admin/feedback — list all feedback, unread first then newest
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, message, name_or_contact, is_read, created_at
       FROM user_feedback
       ORDER BY is_read ASC, created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('admin feedback GET error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch feedback' });
  }
});

// PUT /admin/feedback/:id/read — mark as read
router.put('/:id/read', validateIdParam, async (req, res) => {
  try {
    await query(
      'UPDATE user_feedback SET is_read = TRUE WHERE id = $1',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('admin feedback mark-read error:', err);
    res.status(500).json({ success: false, error: 'Failed to update' });
  }
});

// DELETE /admin/feedback/:id
router.delete('/:id', validateIdParam, async (req, res) => {
  try {
    await query('DELETE FROM user_feedback WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('admin feedback DELETE error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete' });
  }
});

module.exports = router;
