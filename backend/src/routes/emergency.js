const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// GET /api/emergency/contacts
// Returns all emergency contacts grouped by category
router.get('/contacts', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, category, name_tamil, name_english, phone, is_national, is_verified
      FROM emergency_contacts
      ORDER BY display_order ASC
    `);

    // Group by category
    const grouped = result.rows.reduce((acc, row) => {
      if (!acc[row.category]) acc[row.category] = [];
      acc[row.category].push(row);
      return acc;
    }, {});

    res.json({ success: true, data: grouped });
  } catch (err) {
    console.error('Emergency contacts error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
