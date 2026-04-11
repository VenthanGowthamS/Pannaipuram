const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { validateIdParam, requireRole } = require('../../middleware/auth');
const { query } = require('../../db/pool');
const { trimStr, isValidTime } = require('../../middleware/validate');

router.use(adminAuth);

// GET /admin/bus/corridors
router.get('/corridors', async (req, res) => {
  try {
    const result = await query('SELECT * FROM bus_corridors ORDER BY id');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /admin/bus/routes — find or create
router.post('/routes', requireRole('admin', 'super_admin'), async (req, res) => {
  const { corridor_id, direction, origin_tamil, dest_tamil, stops_tamil, notes_tamil } = req.body;
  try {
    // First check if route already exists for this corridor+direction
    const existing = await query(
      'SELECT * FROM bus_routes WHERE corridor_id = $1 AND direction = $2 LIMIT 1',
      [corridor_id, direction]
    );
    if (existing.rows.length > 0) {
      return res.json({ success: true, data: existing.rows[0] });
    }
    // Create new route
    const result = await query(`
      INSERT INTO bus_routes (corridor_id, direction, origin_tamil, dest_tamil, stops_tamil, notes_tamil)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [corridor_id, direction, origin_tamil, dest_tamil, stops_tamil, notes_tamil]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /admin/bus/timings
router.post('/timings', requireRole('admin', 'super_admin'), async (req, res) => {
  const { route_id, departs_at, days_of_week, bus_type, operator_name, is_last_bus } = req.body;
  if (!route_id || !departs_at) {
    return res.status(400).json({ success: false, error: 'route_id and departs_at are required' });
  }
  const departs = trimStr(departs_at);
  // Accept HH:MM or HH:MM:SS format (admin UI sends HH:MM:SS)
  if (!isValidTime(departs)) {
    return res.status(400).json({ success: false, error: 'departs_at must be in HH:MM or HH:MM:SS format' });
  }
  try {
    const result = await query(`
      INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, operator_name, is_last_bus)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [route_id, departs, days_of_week || 'daily', bus_type || 'ordinary', operator_name || null, is_last_bus || false]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/bus/timings/:id
router.put('/timings/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  const { departs_at, days_of_week, bus_type, operator_name, is_last_bus, is_active } = req.body;
  try {
    const result = await query(`
      UPDATE bus_timings
      SET departs_at    = COALESCE($1, departs_at),
          days_of_week  = COALESCE($2, days_of_week),
          bus_type      = COALESCE($3, bus_type),
          operator_name = COALESCE($4, operator_name),
          is_last_bus   = COALESCE($5, is_last_bus),
          is_active     = COALESCE($6, is_active)
      WHERE id = $7 RETURNING *
    `, [departs_at, days_of_week, bus_type, operator_name, is_last_bus, is_active, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /admin/bus/timings/:id
router.delete('/timings/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    await query('DELETE FROM bus_timings WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /admin/bus/routes/:id — deletes route (and its timings via CASCADE)
router.delete('/routes/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    // Delete child timings first (in case no CASCADE in schema)
    await query('DELETE FROM bus_timings WHERE route_id = $1', [req.params.id]);
    const result = await query('DELETE FROM bus_routes WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Route not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
