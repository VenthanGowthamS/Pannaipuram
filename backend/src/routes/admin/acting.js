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
    // photo_url column only exists after migration_driver_photos.sql —
    // include it only when a photo was actually sent so plain adds keep
    // working on a pre-migration database.
    const photo = req.body.photo_url || null;
    const cols = ['name_tamil', 'name_english', 'phone', 'vehicle_type', 'coverage_tamil', 'coverage_english', 'schedule_tamil', 'display_order'];
    const vals = [name_tamil, name_english, phone, vehicle_type || 'any', trimStr(coverage_tamil), trimStr(coverage_english), trimStr(schedule_tamil), parseInt(display_order, 10) || 0];
    if (photo) { cols.push('photo_url'); vals.push(photo); }
    if ('license_verified' in req.body) { cols.push('license_verified'); vals.push(req.body.license_verified === true); }
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    const result = await query(`
      INSERT INTO acting_drivers (${cols.join(', ')})
      VALUES (${placeholders}) RETURNING *
    `, vals);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/acting/drivers/:id — update
router.put('/drivers/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  const { name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, is_active, phone_verified, display_order } = req.body;
  // '' from a cleared number field must not reach COALESCE (int cast error)
  const orderVal = (display_order === '' || display_order === undefined) ? null : parseInt(display_order, 10);
  try {
    const params = [name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, is_active, phone_verified, orderVal];
    // photo_url is only touched when the client sends it ('' clears the photo);
    // keeps updates working on a pre-migration database.
    let photoClause = '';
    if ('photo_url' in req.body) {
      params.push(req.body.photo_url || '');
      photoClause = `, photo_url = NULLIF($${params.length}, '')`;
    }
    if ('license_verified' in req.body) {
      params.push(req.body.license_verified === true);
      photoClause += `, license_verified = $${params.length}`;
    }
    params.push(req.params.id);
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
          display_order   = COALESCE($10, display_order)${photoClause}
      WHERE id = $${params.length} RETURNING *
    `, params);
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
