const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { validateIdParam, requireRole } = require('../../middleware/auth');
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

// GET /admin/auto/whatsapp-config — per-screen WhatsApp messages
router.get('/whatsapp-config', async (req, res) => {
  const defaults = {
    phone: '9944129218',
    auto_message: 'வணக்கம் சார் 🙏\n\nஆட்டோ / கார் வேணும்.\n\nபெயர்: \nபோகும் இடம்: \nதேவையான நேரம்: \n\nநன்றி!',
    water_message: 'வணக்கம் சார் 🙏\n\nபண்ணைப்புரம் App-ல தண்ணி ஷெட்யூல் சேர்க்கணும்.\n\nதெரு பெயர்: \n\nநன்றி!',
    power_message: 'வணக்கம் சார் 🙏\n\nபண்ணைப்புரம் App-ல கரண்ட் கட் தகவல் சேர்க்கணும்.\n\nதேதி: \nநேரம்: \nகாரணம் (தெரிஞ்சா): \n\nநன்றி!',
    services_message: 'வணக்கம் சார் 🙏\n\nபண்ணைப்புரம் App-ல என் தகவல் சேர்க்கணும்.\n\nபெயர்: \nதொலைபேசி: \nசேவை வகை: \nபகுதி/தெரு: \n\nநன்றி!',
  };
  try {
    const result = await query(`SELECT value FROM app_config WHERE key = 'whatsapp_config'`);
    if (result.rows.length > 0) {
      const stored = JSON.parse(result.rows[0].value);
      return res.json({ success: true, data: { ...defaults, ...stored } });
    }
    res.json({ success: true, data: defaults });
  } catch (_) {
    res.json({ success: true, data: defaults });
  }
});

// PUT /admin/auto/whatsapp-config — save per-screen WhatsApp messages
router.put('/whatsapp-config', requireRole('admin', 'super_admin'), async (req, res) => {
  const { phone, auto_message, water_message, power_message, services_message } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: 'phone required' });
  if (!isValidPhone(phone)) return res.status(400).json({ success: false, error: 'Phone must be 10-digit Indian mobile' });
  const val = JSON.stringify({ phone, auto_message, water_message, power_message, services_message });
  try {
    await query(`CREATE TABLE IF NOT EXISTS app_config (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
    await query(`INSERT INTO app_config (key, value) VALUES ('whatsapp_config', $1) ON CONFLICT (key) DO UPDATE SET value = $1`, [val]);
    res.json({ success: true, data: JSON.parse(val) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/auto/contact — update registration contact
router.put('/contact', requireRole('admin', 'super_admin'), async (req, res) => {
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
    const vals = [name_tamil, name_english, phone, vehicle_type || 'auto', trimStr(coverage_tamil), trimStr(coverage_english), trimStr(schedule_tamil), parseInt(display_order, 10) || 0];
    if (photo) { cols.push('photo_url'); vals.push(photo); }
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    const result = await query(`
      INSERT INTO auto_drivers (${cols.join(', ')})
      VALUES (${placeholders}) RETURNING *
    `, vals);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/auto/drivers/:id — update driver
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
    params.push(req.params.id);
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
          phone_verified  = COALESCE($9, phone_verified),
          display_order   = COALESCE($10, display_order)${photoClause}
      WHERE id = $${params.length} RETURNING *
    `, params);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /admin/auto/drivers/:id — delete driver
router.delete('/drivers/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    await query('DELETE FROM auto_drivers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
