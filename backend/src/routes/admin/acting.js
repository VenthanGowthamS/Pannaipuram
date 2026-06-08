const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { validateIdParam, requireRole } = require('../../middleware/auth');
const { query } = require('../../db/pool');
const { trimStr, isValidPhone } = require('../../middleware/validate');

router.use(adminAuth);

// GET /admin/acting/drivers — list all (including inactive)
router.get('/drivers', async (req, res) => {
  try {
    const result = await query('SELECT * FROM acting_drivers ORDER BY display_order, id');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /admin/acting/drivers — add new acting driver
router.post('/drivers', requireRole('admin', 'super_admin'), async (req, res) => {
  const name_tamil   = trimStr(req.body.name_tamil);
  const name_english = trimStr(req.body.name_english);
  const phone        = trimStr(req.body.phone);
  const { vehicle_type, coverage_tamil, coverage_english, schedule_tamil, display_order } = req.body;
  if (!name_tamil || !phone) {
    return res.status(400).json({ success: false, error: 'name_tamil and phone are required' });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ success: false, error: 'Phone must be a 10-digit Indian mobile number starting with 6-9' });
  }
  try {
    const result = await query(`
      INSERT INTO acting_drivers (name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [name_tamil, name_english, phone, vehicle_type || 'any', trimStr(coverage_tamil), trimStr(coverage_english), trimStr(schedule_tamil), display_order || 0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/acting/drivers/:id — update
router.put('/drivers/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  const { name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, is_active, phone_verified, display_order } = req.body;
  try {
    const result = await query(`
      UPDATE acting_drivers
      SET name_tamil      = COALESCE($1, name_tamil),
          name_english    = COALESCE($2, name_english),
          phone           = COALESCE($3, phone),
          vehicle_type    = COALESCE($4, vehicle_type),
          coverage_tamil  = COALESCE($5, coverage_tamil),
          coverage_english= COALESCE($6, coverage_english),
          schedule_tamil  = COALESCE($7, schedule_tamil),
          is_active       = COALESCE($8, is_active),
          phone_verified  = COALESCE($9, phone_verified),
          display_order   = COALESCE($10, display_order)
      WHERE id = $11 RETURNING *
    `, [name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, is_active, phone_verified, display_order, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /admin/acting/drivers/:id
router.delete('/drivers/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    await query('DELETE FROM acting_drivers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
