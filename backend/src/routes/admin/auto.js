const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { query } = require('../../db/pool');

router.use(adminAuth);

// GET /admin/auto/drivers — list all (including inactive)
router.get('/drivers', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM auto_drivers ORDER BY display_order, id
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /admin/auto/drivers — add new driver
router.post('/drivers', async (req, res) => {
  const { name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, display_order } = req.body;
  if (!name_tamil || !phone) {
    return res.status(400).json({ success: false, error: 'name_tamil and phone are required' });
  }
  try {
    const result = await query(`
      INSERT INTO auto_drivers (name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [name_tamil, name_english || null, phone, vehicle_type || 'auto', coverage_tamil || null, coverage_english || null, schedule_tamil || null, display_order || 0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/auto/drivers/:id — update driver
router.put('/drivers/:id', async (req, res) => {
  const { name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, is_active, display_order } = req.body;
  try {
    const result = await query(`
      UPDATE auto_drivers
      SET name_tamil      = COALESCE($1, name_tamil),
          name_english    = COALESCE($2, name_english),
          phone           = COALESCE($3, phone),
          vehicle_type    = COALESCE($4, vehicle_type),
          coverage_tamil  = COALESCE($5, coverage_tamil),
          coverage_english= COALESCE($6, coverage_english),
          schedule_tamil  = COALESCE($7, schedule_tamil),
          is_active       = COALESCE($8, is_active),
          display_order   = COALESCE($9, display_order)
      WHERE id = $10 RETURNING *
    `, [name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, is_active, display_order, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /admin/auto/drivers/:id — delete driver
router.delete('/drivers/:id', async (req, res) => {
  try {
    await query('DELETE FROM auto_drivers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
