const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// GET /api/services — list all active local services
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, category, name_tamil, name_english, phone,
             area_tamil, area_english, notes_tamil, display_order
      FROM local_services
      WHERE is_active = TRUE
      ORDER BY category, display_order, id
    `);
    // Group by category
    const grouped = {};
    for (const row of result.rows) {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push(row);
    }
    res.json({ success: true, data: grouped });
  } catch (err) {
    // Table may not exist yet
    res.json({ success: true, data: {} });
  }
});

// GET /api/services/:category — list by category
router.get('/:category', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, category, name_tamil, name_english, phone,
             area_tamil, area_english, notes_tamil, display_order
      FROM local_services
      WHERE is_active = TRUE AND category = $1
      ORDER BY display_order, id
    `, [req.params.category]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
});

module.exports = router;
