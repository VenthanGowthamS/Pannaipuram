const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// GET /api/power/cuts — upcoming and active cuts
router.get('/cuts', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM power_cuts
      WHERE is_resolved = FALSE
        AND (end_time IS NULL OR end_time > NOW())
      ORDER BY start_time ASC
      LIMIT 10
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('DB error:', err.message); res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/power/cuts/today
router.get('/cuts/today', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM power_cuts
      WHERE DATE(start_time) = CURRENT_DATE
        AND is_resolved = FALSE
      ORDER BY start_time ASC
    `);
    res.json({ success: true, data: result.rows, hasCut: result.rows.length > 0 });
  } catch (err) {
    console.error('DB error:', err.message); res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/power/restored — user reports power is back
router.post('/restored', async (req, res) => {
  const { powerCutId, deviceId } = req.body;
  if (!powerCutId || !deviceId) {
    return res.status(400).json({ error: 'powerCutId and deviceId required' });
  }
  try {
    await query(`
      INSERT INTO power_restorations (power_cut_id, device_id)
      VALUES ($1, $2)
    `, [powerCutId, deviceId]);

    // If 3+ reports, auto-mark as resolved
    const count = await query(`
      SELECT COUNT(*) FROM power_restorations WHERE power_cut_id = $1
    `, [powerCutId]);

    if (parseInt(count.rows[0].count) >= 3) {
      await query(
        'UPDATE power_cuts SET is_resolved = TRUE WHERE id = $1',
        [powerCutId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('DB error:', err.message); res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
