const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { query } = require('../../db/pool');

router.use(adminAuth);

// PUT /admin/hospital/info
router.put('/info', async (req, res) => {
  const { name_tamil, address_tamil, phone_casualty, phone_ambulance, phone_general, pharmacy_hours } = req.body;
  try {
    const result = await query(`
      UPDATE hospitals
      SET name_tamil      = COALESCE($1, name_tamil),
          address_tamil   = COALESCE($2, address_tamil),
          phone_casualty  = COALESCE($3, phone_casualty),
          phone_ambulance = COALESCE($4, phone_ambulance),
          phone_general   = COALESCE($5, phone_general),
          pharmacy_hours  = COALESCE($6, pharmacy_hours)
      WHERE id = 1 RETURNING *
    `, [name_tamil, address_tamil, phone_casualty, phone_ambulance, phone_general, pharmacy_hours]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /admin/hospital/doctors
router.post('/doctors', async (req, res) => {
  const { name_tamil, name_english, specialisation, photo_url } = req.body;
  if (!name_tamil) return res.status(400).json({ error: 'name_tamil required' });
  try {
    const result = await query(`
      INSERT INTO doctors (hospital_id, name_tamil, name_english, specialisation, photo_url)
      VALUES (1, $1, $2, $3, $4) RETURNING *
    `, [name_tamil, name_english, specialisation, photo_url]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /admin/hospital/doctors/:id
router.put('/doctors/:id', async (req, res) => {
  const { name_tamil, name_english, specialisation, is_active } = req.body;
  try {
    const result = await query(`
      UPDATE doctors
      SET name_tamil     = COALESCE($1, name_tamil),
          name_english   = COALESCE($2, name_english),
          specialisation = COALESCE($3, specialisation),
          is_active      = COALESCE($4, is_active)
      WHERE id = $5 RETURNING *
    `, [name_tamil, name_english, specialisation, is_active, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /admin/hospital/doctors/:id
router.delete('/doctors/:id', async (req, res) => {
  try {
    await query('DELETE FROM doctor_schedules WHERE doctor_id = $1', [req.params.id]);
    await query('DELETE FROM doctors WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /admin/hospital/doctors/:id/schedule
router.post('/doctors/:id/schedule', async (req, res) => {
  const { day_of_week, start_time, end_time, notes_tamil } = req.body;
  try {
    const result = await query(`
      INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, notes_tamil)
      VALUES ($1,$2,$3,$4,$5) RETURNING *
    `, [req.params.id, day_of_week, start_time, end_time, notes_tamil]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
