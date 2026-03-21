const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// GET /api/auto/contact — registration contact (admin-controlled in DB)
router.get('/contact', async (req, res) => {
  try {
    const result = await query(`
      SELECT value FROM app_config WHERE key = 'auto_registration_contact'
    `);
    if (result.rows.length > 0) {
      try {
        const cfg = JSON.parse(result.rows[0].value);
        return res.json({ success: true, data: cfg });
      } catch (parseErr) {
        console.error('JSON parse error for auto_registration_contact:', parseErr.message);
      }
    }
    // Default fallback
    res.json({ success: true, data: { name: 'கௌதம்', name_english: 'Gowtham', phone: '8888888888' } });
  } catch (_) {
    // Table may not exist yet — return default
    res.json({ success: true, data: { name: 'கௌதம்', name_english: 'Gowtham', phone: '8888888888' } });
  }
});

// GET /api/auto/drivers — list all active auto/van drivers
router.get('/drivers', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, name_tamil, name_english, phone, vehicle_type,
             coverage_tamil, coverage_english, schedule_tamil, is_active
      FROM auto_drivers
      WHERE is_active = TRUE
      ORDER BY display_order, id
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
