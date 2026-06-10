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

// GET /api/bus/all — corridors + ALL timings in ONE response.
// Replaces 1 + N round trips (18 requests for 17 corridors) with a single
// request — critical on 2G and when Render is cold. Timings are grouped by
// corridor_id with the exact same row shape as /timings/:corridorId.
router.get('/all', async (req, res) => {
  try {
    const [corridors, timings] = await Promise.all([
      query('SELECT * FROM bus_corridors ORDER BY id ASC'),
      query(`
        SELECT br.corridor_id, bt.id, bt.departs_at, bt.days_of_week, bt.bus_type,
               bt.operator_name, bt.is_last_bus,
               br.direction, br.origin_tamil, br.dest_tamil, br.stops_tamil
        FROM bus_timings bt
        JOIN bus_routes br ON bt.route_id = br.id
        WHERE bt.is_active = TRUE
        ORDER BY bt.departs_at ASC
      `),
    ]);
    const grouped = {};
    for (const row of timings.rows) {
      const { corridor_id, ...t } = row;
      (grouped[corridor_id] = grouped[corridor_id] || []).push(t);
    }
    res.json({ success: true, data: { corridors: corridors.rows, timings: grouped } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/bus/timings/:corridorId
router.get('/timings/:corridorId', async (req, res) => {
  try {
    const result = await query(`
      SELECT bt.id, bt.departs_at, bt.days_of_week, bt.bus_type,
             bt.operator_name, bt.is_last_bus,
             br.direction, br.origin_tamil, br.dest_tamil, br.stops_tamil
      FROM bus_timings bt
      JOIN bus_routes br ON bt.route_id = br.id
      WHERE br.corridor_id = $1 AND bt.is_active = TRUE
      ORDER BY bt.departs_at ASC
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
