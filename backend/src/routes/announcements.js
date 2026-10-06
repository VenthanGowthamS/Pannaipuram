const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// GET /api/announcements — active announcements
// expires_at is returned so the PWA can hide an item that expires while it
// sits in the phone's cache — the server filter alone never reaches a phone
// that is offline or showing its cached copy.
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, message_tamil, message_english, type, priority, expires_at
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
