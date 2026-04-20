const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// ── POST /api/pwa/ping ─────────────────────────────────────
// Public, fire-and-forget from the PWA on each load.
// Body: { visitor_id: string (8–64 chars), is_standalone?: boolean }
// Records the visit by upserting into pwa_visits.
router.post('/ping', async (req, res) => {
  const { visitor_id, is_standalone } = req.body || {};

  // Basic validation — visitor_id is client-generated; reject junk.
  if (!visitor_id || typeof visitor_id !== 'string') {
    return res.status(400).json({ success: false, error: 'visitor_id required' });
  }
  const vid = String(visitor_id).trim();
  if (vid.length < 8 || vid.length > 64 || !/^[A-Za-z0-9_-]+$/.test(vid)) {
    return res.status(400).json({ success: false, error: 'invalid visitor_id' });
  }

  const ua = String(req.headers['user-agent'] || '').slice(0, 500);
  const standalone = !!is_standalone;

  try {
    await query(
      `INSERT INTO pwa_visits (visitor_id, user_agent, is_standalone, first_seen_at, last_seen_at, visit_count)
       VALUES ($1, $2, $3, NOW(), NOW(), 1)
       ON CONFLICT (visitor_id) DO UPDATE SET
         last_seen_at   = NOW(),
         visit_count    = pwa_visits.visit_count + 1,
         is_standalone  = EXCLUDED.is_standalone,
         user_agent     = EXCLUDED.user_agent`,
      [vid, ua, standalone]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('pwa ping error:', err.message);
    // Don't fail the client — ping is analytics, not critical
    res.status(500).json({ success: false, error: 'ping failed' });
  }
});

module.exports = router;
