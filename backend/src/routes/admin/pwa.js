const express = require('express');
const router  = express.Router();
const { query } = require('../../db/pool');
const adminAuth = require('../../middleware/auth');
const { requireRole } = require('../../middleware/auth');

router.use(adminAuth);

// ── GET /admin/pwa/stats ───────────────────────────────────
// Returns visitor analytics for the admin dashboard:
//  - totals: overall counts (lifetime, 7d/24h/1h active, LIVE 5-min, installed, installs today)
//  - daily:  TRUE unique users per day (from pwa_visit_days) + installs per day, last 30 days
//  - recent: last 30 visitors seen (most recent first), incl. label + visitor_id for labelling
// Query param ?exclude_labeled=1 removes labelled devices (e.g. Venthan's own
// phones) from totals + daily so village-only numbers are visible.
router.get('/stats', async (req, res) => {
  const excludeLabeled = req.query.exclude_labeled === '1';
  const lblTotals = excludeLabeled ? 'WHERE label IS NULL' : '';
  const lblAnd    = excludeLabeled ? 'AND v.label IS NULL' : '';
  const lblAnd2   = excludeLabeled ? 'AND label IS NULL' : '';

  try {
    const [totalsResult, labeledResult, dailyResult, installsResult, recentResult] = await Promise.all([
      query(`
        SELECT
          COUNT(*)                                                           AS total_visitors,
          COUNT(*) FILTER (WHERE last_seen_at > NOW() - INTERVAL '7 days')   AS active_7d,
          COUNT(*) FILTER (WHERE last_seen_at > NOW() - INTERVAL '24 hours') AS active_24h,
          COUNT(*) FILTER (WHERE last_seen_at > NOW() - INTERVAL '1 hour')   AS active_1h,
          COUNT(*) FILTER (WHERE last_seen_at > NOW() - INTERVAL '5 minutes') AS live_now,
          COUNT(*) FILTER (WHERE is_standalone = TRUE)                       AS installed,
          COUNT(*) FILTER (WHERE installed_at >= CURRENT_DATE)               AS installs_today,
          COALESCE(SUM(visit_count), 0)::BIGINT                              AS total_visits
        FROM pwa_visits ${lblTotals}
      `),
      query(`SELECT COUNT(*) AS labeled_devices FROM pwa_visits WHERE label IS NOT NULL`),
      query(`
        SELECT d.day, COUNT(*) AS visitors, COALESCE(SUM(d.opens), 0)::BIGINT AS visits
        FROM pwa_visit_days d
        JOIN pwa_visits v ON v.visitor_id = d.visitor_id
        WHERE d.day > CURRENT_DATE - INTERVAL '30 days' ${lblAnd}
        GROUP BY d.day
        ORDER BY d.day DESC
      `),
      query(`
        SELECT DATE(installed_at) AS day, COUNT(*) AS installs
        FROM pwa_visits
        WHERE installed_at IS NOT NULL
          AND installed_at > CURRENT_DATE - INTERVAL '30 days' ${lblAnd2}
        GROUP BY DATE(installed_at)
        ORDER BY day DESC
      `),
      query(`
        SELECT
          visitor_id,
          label,
          first_seen_at,
          last_seen_at,
          installed_at,
          visit_count,
          is_standalone,
          LEFT(user_agent, 160) AS user_agent
        FROM pwa_visits
        ORDER BY last_seen_at DESC
        LIMIT 30
      `)
    ]);

    // Merge daily installs into the daily rows (keyed by ISO day)
    const installsByDay = {};
    for (const r of installsResult.rows) {
      installsByDay[String(r.day)] = Number(r.installs);
    }
    const daily = dailyResult.rows.map((r) => ({
      ...r,
      installs: installsByDay[String(r.day)] || 0,
    }));

    res.json({
      success: true,
      data: {
        totals: { ...(totalsResult.rows[0] || {}), ...(labeledResult.rows[0] || {}) },
        daily,
        recent: recentResult.rows,
      },
    });
  } catch (err) {
    console.error('admin pwa stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch PWA stats' });
  }
});

// ── PUT /admin/pwa/visitors/:visitorId/label ───────────────
// Tag a device with a label (e.g. "Venthan iPhone") so known devices can be
// segregated from real village users. Empty label = remove the tag.
router.put('/visitors/:visitorId/label', requireRole('admin', 'super_admin'), async (req, res) => {
  const vid = String(req.params.visitorId || '').trim();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(vid)) {
    return res.status(400).json({ success: false, error: 'invalid visitor id' });
  }
  const label = String(req.body?.label ?? '').trim().slice(0, 60) || null;
  try {
    const result = await query(
      'UPDATE pwa_visits SET label = $1 WHERE visitor_id = $2 RETURNING visitor_id, label',
      [label, vid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'visitor not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('admin pwa label error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to set label' });
  }
});

module.exports = router;
