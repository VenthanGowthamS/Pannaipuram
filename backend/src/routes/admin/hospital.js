const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { validateIdParam, requireRole } = require('../../middleware/auth');
const { query } = require('../../db/pool');
const { trimStr, isValidTime, isStartBeforeEnd } = require('../../middleware/validate');

router.use(adminAuth);

// GET /admin/hospital/list — all hospitals for dropdown
router.get('/list', async (req, res) => {
  try {
    const result = await query('SELECT id, name_tamil, name_english FROM hospitals ORDER BY id');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/hospital/info
router.put('/info', requireRole('admin', 'super_admin'), async (req, res) => {
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
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /admin/hospital/doctors
router.post('/doctors', requireRole('admin', 'super_admin'), async (req, res) => {
  const name_tamil    = trimStr(req.body.name_tamil);
  const name_english  = trimStr(req.body.name_english);
  const specialisation = trimStr(req.body.specialisation);
  const { hospital_id, photo_url } = req.body;
  if (!name_tamil) return res.status(400).json({ success: false, error: 'name_tamil required' });
  try {
    const result = await query(`
      INSERT INTO doctors (hospital_id, name_tamil, name_english, specialisation, photo_url)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [hospital_id || 1, name_tamil, name_english, specialisation, photo_url]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/hospital/doctors/:id
router.put('/doctors/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  const { hospital_id, name_tamil, name_english, specialisation, is_active } = req.body;
  try {
    const result = await query(`
      UPDATE doctors
      SET hospital_id   = COALESCE($1, hospital_id),
          name_tamil     = COALESCE($2, name_tamil),
          name_english   = COALESCE($3, name_english),
          specialisation = COALESCE($4, specialisation),
          is_active      = COALESCE($5, is_active)
      WHERE id = $6 RETURNING *
    `, [hospital_id, name_tamil, name_english, specialisation, is_active, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /admin/hospital/doctors/:id
router.delete('/doctors/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    await query('DELETE FROM doctor_schedules WHERE doctor_id = $1', [req.params.id]);
    await query('DELETE FROM doctors WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /admin/hospital/doctors/:id/schedule
// day_of_week: accepts integer 0-6 OR day name string ("Monday"=1 ... "Sunday"=0)
const DAY_MAP = {
  'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
  'thursday': 4, 'friday': 5, 'saturday': 6
};
router.post('/doctors/:id/schedule', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  let { day_of_week, start_time, end_time } = req.body;
  const notes_tamil = trimStr(req.body.notes_tamil);
  if (day_of_week === undefined || day_of_week === null || !start_time || !end_time) {
    return res.status(400).json({ success: false, error: 'day_of_week, start_time, end_time are required' });
  }
  // Convert day name string to integer if needed
  if (typeof day_of_week === 'string' && isNaN(day_of_week)) {
    const mapped = DAY_MAP[day_of_week.toLowerCase()];
    if (mapped === undefined) {
      return res.status(400).json({ success: false, error: `Invalid day_of_week: "${day_of_week}". Use 0-6 or day name (Monday, Tuesday, etc.)` });
    }
    day_of_week = mapped;
  } else {
    day_of_week = parseInt(day_of_week);
    if (isNaN(day_of_week) || day_of_week < 0 || day_of_week > 6) {
      return res.status(400).json({ success: false, error: 'day_of_week must be 0 (Sun) to 6 (Sat)' });
    }
  }
  if (!isValidTime(start_time) || !isValidTime(end_time)) {
    return res.status(400).json({ success: false, error: 'Times must be in HH:MM format' });
  }
  if (!isStartBeforeEnd(start_time, end_time)) {
    return res.status(400).json({ success: false, error: 'start_time must be before end_time' });
  }
  try {
    const result = await query(`
      INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, notes_tamil)
      VALUES ($1,$2,$3,$4,$5) RETURNING *
    `, [req.params.id, day_of_week, start_time, end_time, notes_tamil]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Schedule POST error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

module.exports = router;
