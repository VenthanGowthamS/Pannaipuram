const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { query } = require('../../db/pool');

router.use(adminAuth);

// PUT /admin/water/schedule/:streetId
router.put('/schedule/:streetId', async (req, res) => {
  const { frequency_days, supply_time, last_supply_date, notes_tamil } = req.body;
  try {
    const result = await query(`
      INSERT INTO water_schedules (street_id, frequency_days, supply_time, last_supply_date, notes_tamil)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (street_id) DO UPDATE
      SET frequency_days   = COALESCE($2, water_schedules.frequency_days),
          supply_time      = COALESCE($3, water_schedules.supply_time),
          last_supply_date = COALESCE($4, water_schedules.last_supply_date),
          notes_tamil      = COALESCE($5, water_schedules.notes_tamil),
          updated_at       = NOW()
      RETURNING *
    `, [req.params.streetId, frequency_days, supply_time, last_supply_date, notes_tamil]);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /admin/streets — add a new street
router.post('/streets', async (req, res) => {
  const { name_tamil, name_english, ward_id } = req.body;
  if (!name_tamil) return res.status(400).json({ error: 'name_tamil required' });
  try {
    const result = await query(`
      INSERT INTO streets (name_tamil, name_english, ward_id)
      VALUES ($1, $2, $3) RETURNING *
    `, [name_tamil, name_english, ward_id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /admin/streets — list all streets
router.get('/streets', async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, w.number AS ward_number,
        ws.frequency_days, ws.supply_time
      FROM streets s
      LEFT JOIN wards w ON s.ward_id = w.id
      LEFT JOIN water_schedules ws ON s.id = ws.street_id
      ORDER BY s.name_tamil
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
