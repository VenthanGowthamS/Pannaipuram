const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// GET /api/announcements — active announcements
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, message_tamil, message_english, type, priority
      FROM announcements
      WHERE is_active = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY priority DESC, created_at DESC
      LIMIT 10
    `);
    res.json({ success: true, data: result.rows });
  } catch (_) {
    // Table may not exist yet
    res.json({ success: true, data: [] });
  }
});

module.exports = router;
