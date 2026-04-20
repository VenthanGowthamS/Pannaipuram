const express = require('express');
const router  = express.Router();
const { query } = require('../../db/pool');
const adminAuth = require('../../middleware/auth');

router.use(adminAuth);

// ── GET /admin/pwa/stats ───────────────────────────────────
// Returns visitor analytics for the admin dashboard:
//  - totals: overall counts (lifetime, 7d active, 24h active, installed)
//  - daily:  visitors per day for last 30 days
//  - recent: last 20 visitors seen (most recent first)
router.get('/stats', async (req, res) => {
  try {
    const [totalsResult, dailyResult, recentResult] = await Promise.all([
      query(`
        SELECT
          COUNT(*)                                                      AS total_visitors,
          COUNT(*) FILTER (WHERE last_seen_at > NOW() - INTERVAL '7 days')   AS active_7d,
          COUNT(*) FILTER (WHERE last_seen_at > NOW() - INTERVAL '24 hours') AS active_24h,
          COUNT(*) FILTER (WHERE last_seen_at > NOW() - INTERVAL '1 hour')   AS active_1h,
          COUNT(*) FILTER (WHERE is_standalone = TRUE)                  AS installed,
          COALESCE(SUM(visit_count), 0)::BIGINT                         AS total_visits
        FROM pwa_visits
      `),
      query(`
        SELECT
          DATE(last_seen_at) AS day,
          COUNT(*)           AS visitors,
          SUM(visit_count)   AS visits
        FROM pwa_visits
        WHERE last_seen_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(last_seen_at)
        ORDER BY day DESC
      `),
      query(`
        SELECT
          visitor_id,
          first_seen_at,
          last_seen_at,
          visit_count,
          is_standalone,
          LEFT(user_agent, 160) AS user_agent
        FROM pwa_visits
        ORDER BY last_seen_at DESC
        LIMIT 20
      `)
    ]);

    res.json({
      success: true,
      data: {
        totals: totalsResult.rows[0] || {},
        daily:  dailyResult.rows,
        recent: recentResult.rows,
      },
    });
  } catch (err) {
    console.error('admin pwa stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch PWA stats' });
  }
});

module.exports = router;
