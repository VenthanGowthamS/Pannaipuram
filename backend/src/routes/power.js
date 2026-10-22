const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// power_cuts.start_time / end_time are TIMESTAMP WITHOUT a zone holding the IST
// wall-clock time the admin typed. Compare them with the current IST wall-clock
// time — NOW() / CURRENT_DATE use the DB session zone (UTC), which is 5.5h off.
const IST_NOW = "(NOW() AT TIME ZONE 'Asia/Kolkata')";

// GET /api/power/cuts — upcoming and active cuts
router.get('/cuts', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM power_cuts
      WHERE is_resolved = FALSE
        AND (end_time IS NULL OR end_time > ${IST_NOW})
      ORDER BY start_time ASC
      LIMIT 10
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('DB error:', err.message); res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/power/cuts/today
router.get('/cuts/today', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM power_cuts
      WHERE DATE(start_time) = ${IST_NOW}::date
        AND is_resolved = FALSE
      ORDER BY start_time ASC
    `);
    res.json({ success: true, data: result.rows, hasCut: result.rows.length > 0 });
  } catch (err) {
    console.error('DB error:', err.message); res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/power/restored — user reports power is back
router.post('/restored', async (req, res) => {
  const { powerCutId, deviceId } = req.body;
  if (!powerCutId || !deviceId) {
    return res.status(400).json({ error: 'powerCutId and deviceId required' });
  }
  const cutId = parseInt(powerCutId, 10);
  if (!Number.isInteger(cutId) || cutId <= 0 || String(deviceId).length > 255) {
    return res.status(400).json({ error: 'Invalid powerCutId or deviceId' });
  }
  try {
    // One report per device per cut — otherwise a single device repeating the
    // request would hit the 3-report threshold alone and hide a real outage.
    await query(`
      INSERT INTO power_restorations (power_cut_id, device_id)
      SELECT $1::int, $2::varchar
      WHERE NOT EXISTS (
        SELECT 1 FROM power_restorations WHERE power_cut_id = $1::int AND device_id = $2::varchar
      )
    `, [cutId, String(deviceId)]);

    // If 3+ DIFFERENT devices report, auto-mark as resolved
    const count = await query(`
      SELECT COUNT(DISTINCT device_id) FROM power_restorations WHERE power_cut_id = $1
    `, [cutId]);

    if (parseInt(count.rows[0].count) >= 3) {
      await query(
        'UPDATE power_cuts SET is_resolved = TRUE WHERE id = $1',
        [cutId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('DB error:', err.message); res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
