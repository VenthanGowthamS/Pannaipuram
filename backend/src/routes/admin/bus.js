const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { query } = require('../../db/pool');

router.use(adminAuth);

// POST /admin/bus/routes
router.post('/routes', async (req, res) => {
  const { corridor_id, direction, origin_tamil, dest_tamil, stops_tamil, notes_tamil } = req.body;
  try {
    const result = await query(`
      INSERT INTO bus_routes
        (corridor_id, direction, origin_tamil, dest_tamil, stops_tamil, notes_tamil)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [corridor_id, direction, origin_tamil, dest_tamil, stops_tamil, notes_tamil]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /admin/bus/timings
router.post('/timings', async (req, res) => {
  const { route_id, departs_at, days_of_week, bus_type, is_last_bus } = req.body;
  try {
    const result = await query(`
      INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus)
      VALUES ($1,$2,$3,$4,$5) RETURNING *
    `, [route_id, departs_at, days_of_week || 'daily', bus_type || 'ordinary', is_last_bus || false]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /admin/bus/timings/:id
router.put('/timings/:id', async (req, res) => {
  const { departs_at, days_of_week, bus_type, is_last_bus, is_active } = req.body;
  try {
    const result = await query(`
      UPDATE bus_timings
      SET departs_at   = COALESCE($1, departs_at),
          days_of_week = COALESCE($2, days_of_week),
          bus_type     = COALESCE($3, bus_type),
          is_last_bus  = COALESCE($4, is_last_bus),
          is_active    = COALESCE($5, is_active)
      WHERE id = $6 RETURNING *
    `, [departs_at, days_of_week, bus_type, is_last_bus, is_active, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
