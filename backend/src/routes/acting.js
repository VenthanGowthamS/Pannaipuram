const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// GET /api/acting/drivers — list all active substitute (acting) drivers
router.get('/drivers', async (req, res) => {
  const cols = `id, name_tamil, name_english, phone, phone_verified, vehicle_type,
             coverage_tamil, coverage_english, schedule_tamil, is_active`;
  try {
    let result;
    try {
      result = await query(`
        SELECT ${cols}, photo_url FROM acting_drivers
        WHERE is_active = TRUE ORDER BY display_order, id
      `);
    } catch (_colMissing) {
      // photo_url migration not applied yet — serve without photos
      result = await query(`
        SELECT ${cols} FROM acting_drivers
        WHERE is_active = TRUE ORDER BY display_order, id
      `);
    }
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
