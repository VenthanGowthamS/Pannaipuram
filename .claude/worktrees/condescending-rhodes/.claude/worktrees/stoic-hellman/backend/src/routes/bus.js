const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// GET /api/bus/corridors
router.get('/corridors', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM bus_corridors ORDER BY id ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/bus/timings/:corridorId
router.get('/timings/:corridorId', async (req, res) => {
  try {
    const result = await query(`
      SELECT bt.id, bt.departs_at, bt.days_of_week, bt.bus_type,
             bt.is_last_bus, br.direction, br.origin_tamil, br.dest_tamil, br.stops_tamil
      FROM bus_timings bt
      JOIN bus_routes br ON bt.route_id = br.id
      WHERE br.corridor_id = $1 AND bt.is_active = TRUE
      ORDER BY br.direction, bt.departs_at ASC
    `, [req.params.corridorId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/bus/next
// Returns next bus in each corridor direction
router.get('/next', async (req, res) => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    const result = await query(`
      SELECT DISTINCT ON (bc.id)
        bc.id AS corridor_id, bc.name_tamil, bc.name_english, bc.color_hex,
        bt.departs_at,
        EXTRACT(EPOCH FROM (bt.departs_at - $1::time)) / 60 AS minutes_away
      FROM bus_timings bt
      JOIN bus_routes br ON bt.route_id = br.id
      JOIN bus_corridors bc ON br.corridor_id = bc.id
      WHERE bt.is_active = TRUE
        AND br.direction = 'outbound'
        AND bt.departs_at > $1::time
      ORDER BY bc.id, bt.departs_at ASC
    `, [currentTime]);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
