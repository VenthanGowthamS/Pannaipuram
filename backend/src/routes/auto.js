const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

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
