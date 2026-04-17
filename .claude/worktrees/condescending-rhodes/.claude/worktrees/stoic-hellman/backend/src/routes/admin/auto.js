const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { validateIdParam } = require('../../middleware/auth');
const { query } = require('../../db/pool');
const { trimStr, isValidPhone } = require('../../middleware/validate');

router.use(adminAuth);

// GET /admin/auto/contact — get registration contact
router.get('/contact', async (req, res) => {
  try {
    const result = await query(`SELECT value FROM app_config WHERE key = 'auto_registration_contact'`);
    const defaultContact = { name: 'கௌதம்', name_english: 'Gowtham', phone: '8888888888' };
    if (result.rows.length > 0) {
      try {
        return res.json({ success: true, data: JSON.parse(result.rows[0].value) });
      } catch (parseErr) {
        console.error('JSON parse error for auto_registration_contact:', parseErr.message);
        return res.json({ success: true, data: defaultContact });
      }
    }
    res.json({ success: true, data: defaultContact });
  } catch (_) {
    res.json({ success: true, data: { name: 'கௌதம்', name_english: 'Gowtham', phone: '8888888888' } });
  }
});

// PUT /admin/auto/contact — update registration contact
router.put('/contact', async (req, res) => {
  const phone        = trimStr(req.body.phone);
  const name        = trimStr(req.body.name) || '';
  const name_english = trimStr(req.body.name_english) || '';
  if (!phone) return res.status(400).json({ success: false, error: 'phone required' });
  if (!isValidPhone(phone)) {
    return res.status(400).json({ success: false, error: 'Phone must be a 10-digit Indian mobile number starting with 6-9' });
  }
  const val = JSON.stringify({ name, name_english, phone });
  try {
    await query(`CREATE TABLE IF NOT EXISTS app_config (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
    await query(`INSERT INTO app_config (key, value) VALUES ('auto_registration_contact', $1)
      ON CONFLICT (key) DO UPDATE SET value = $1`, [val]);
    res.json({ success: true, data: JSON.parse(val) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

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
      INSERT INTO auto_drivers (name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [name_tamil, name_english, phone, vehicle_type || 'auto', trimStr(coverage_tamil), trimStr(coverage_english), trimStr(schedule_tamil), display_order || 0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/auto/drivers/:id — update driver
router.put('/drivers/:id', validateIdParam, async (req, res) => {
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
router.delete('/drivers/:id', validateIdParam, async (req, res) => {
  try {
    await query('DELETE FROM auto_drivers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
