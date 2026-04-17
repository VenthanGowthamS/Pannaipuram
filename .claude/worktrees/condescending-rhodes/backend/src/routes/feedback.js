const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// POST /api/feedback — public, no auth needed
// Body: { message: string, name_or_contact?: string }
router.post('/', async (req, res) => {
  const { message, name_or_contact } = req.body || {};
  if (!message || String(message).trim().length < 5) {
    return res.status(400).json({ success: false, error: 'Message too short (min 5 characters)' });
  }

  try {
    const result = await query(
      `INSERT INTO user_feedback (message, name_or_contact)
       VALUES ($1, $2)
       RETURNING id, created_at`,
      [String(message).trim(), name_or_contact ? String(name_or_contact).trim() : null]
    );
    res.json({ success: true, data: { id: result.rows[0].id } });
  } catch (err) {
    console.error('feedback POST error:', err);
    res.status(500).json({ success: false, error: 'Failed to save feedback' });
  }
});

module.exports = router;
