const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { validateIdParam, requireRole } = require('../../middleware/auth');
const { query } = require('../../db/pool');
const { trimStr, isValidTime, isStartBeforeEnd } = require('../../middleware/validate');

router.use(adminAuth);

// ═══════════════════════════════════════════════════════════════
// HOSPITAL CRUD
// ═══════════════════════════════════════════════════════════════

// GET /admin/hospital/list — all hospitals for dropdown
router.get('/list', async (req, res) => {
  try {
    const result = await query('SELECT id, name_tamil, name_english, address_tamil FROM hospitals ORDER BY id');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /admin/hospital — create new hospital
router.post('/', requireRole('admin', 'super_admin'), async (req, res) => {
  const name_tamil   = trimStr(req.body.name_tamil);
  const name_english = trimStr(req.body.name_english);
  const address_tamil = trimStr(req.body.address_tamil);
  if (!name_tamil || !name_english) {
    return res.status(400).json({ success: false, error: 'name_tamil and name_english are required' });
  }
  try {
    const result = await query(`
      INSERT INTO hospitals (name_tamil, name_english, address_tamil)
      VALUES ($1, $2, $3) RETURNING *
    `, [name_tamil, name_english, address_tamil]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Hospital POST error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// PUT /admin/hospital/:id — update hospital info
router.put('/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  const { name_tamil, name_english, address_tamil, phone_casualty, phone_ambulance, phone_general, pharmacy_hours } = req.body;
  try {
    const result = await query(`
      UPDATE hospitals
      SET name_tamil      = COALESCE($1, name_tamil),
          name_english    = COALESCE($2, name_english),
          address_tamil   = COALESCE($3, address_tamil),
          phone_casualty  = COALESCE($4, phone_casualty),
          phone_ambulance = COALESCE($5, phone_ambulance),
          phone_general   = COALESCE($6, phone_general),
          pharmacy_hours  = COALESCE($7, pharmacy_hours)
      WHERE id = $8 RETURNING *
    `, [name_tamil, name_english, address_tamil, phone_casualty, phone_ambulance, phone_general, pharmacy_hours, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Hospital not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /admin/hospital/:id — delete hospital (only if no doctors linked)
router.delete('/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const docs = await query('SELECT COUNT(*) as cnt FROM doctors WHERE hospital_id = $1', [req.params.id]);
    if (parseInt(docs.rows[0].cnt) > 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete hospital — it has doctors linked. Remove doctors first.' });
    }
    await query('DELETE FROM hospitals WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// DOCTOR CRUD
// ═══════════════════════════════════════════════════════════════

// POST /admin/hospital/doctors
router.post('/doctors', requireRole('admin', 'super_admin'), async (req, res) => {
  const name_tamil    = trimStr(req.body.name_tamil);
  const name_english  = trimStr(req.body.name_english);
  const specialisation = trimStr(req.body.specialisation);
  const { hospital_id, photo_url } = req.body;
  if (!name_tamil) return res.status(400).json({ success: false, error: 'name_tamil required' });
  if (!hospital_id) return res.status(400).json({ success: false, error: 'hospital_id required' });
  // Verify hospital exists
  try {
    const hCheck = await query('SELECT id FROM hospitals WHERE id = $1', [hospital_id]);
    if (hCheck.rows.length === 0) {
      return res.status(400).json({ success: false, error: `Hospital #${hospital_id} does not exist. Add the hospital first.` });
    }
    const result = await query(`
      INSERT INTO doctors (hospital_id, name_tamil, name_english, specialisation, photo_url)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [hospital_id, name_tamil, name_english, specialisation, photo_url]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Doctor POST error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
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
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Doctor not found' });
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

// ═══════════════════════════════════════════════════════════════
// DOCTOR SCHEDULE
// ═══════════════════════════════════════════════════════════════

const DAY_MAP = {
  'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
  'thursday': 4, 'friday': 5, 'saturday': 6
};

function parseDayOfWeek(day_of_week) {
  if (typeof day_of_week === 'string' && isNaN(day_of_week)) {
    const mapped = DAY_MAP[day_of_week.toLowerCase()];
    if (mapped === undefined) return { error: `Invalid day: "${day_of_week}"` };
    return { value: mapped };
  }
  const val = parseInt(day_of_week);
  if (isNaN(val) || val < 0 || val > 6) return { error: 'day_of_week must be 0 (Sun) to 6 (Sat)' };
  return { value: val };
}

// PUT /admin/hospital/doctors/:id/schedule — REPLACE all schedules for a doctor
// Body: { schedules: [{ day_of_week, start_time, end_time, notes_tamil }] }
router.put('/doctors/:id/schedule', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  const { schedules } = req.body;
  if (!Array.isArray(schedules)) {
    return res.status(400).json({ success: false, error: 'schedules array is required' });
  }
  // Validate all entries first
  for (const s of schedules) {
    if (s.day_of_week === undefined || !s.start_time || !s.end_time) {
      return res.status(400).json({ success: false, error: 'Each schedule needs day_of_week, start_time, end_time' });
    }
    const parsed = parseDayOfWeek(s.day_of_week);
    if (parsed.error) return res.status(400).json({ success: false, error: parsed.error });
    if (!isValidTime(s.start_time) || !isValidTime(s.end_time)) {
      return res.status(400).json({ success: false, error: 'Times must be in HH:MM format' });
    }
  }
  try {
    // Delete ALL existing schedules, then insert new ones (clean replace)
    await query('DELETE FROM doctor_schedules WHERE doctor_id = $1', [req.params.id]);
    const inserted = [];
    for (const s of schedules) {
      const dayVal = parseDayOfWeek(s.day_of_week).value;
      const result = await query(`
        INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, notes_tamil)
        VALUES ($1,$2,$3,$4,$5) RETURNING *
      `, [req.params.id, dayVal, s.start_time, s.end_time, trimStr(s.notes_tamil)]);
      inserted.push(result.rows[0]);
    }
    res.json({ success: true, data: inserted });
  } catch (err) {
    console.error('Schedule PUT error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// POST /admin/hospital/doctors/:id/schedule — ADD schedule entries (legacy, still works)
router.post('/doctors/:id/schedule', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  let { day_of_week, start_time, end_time } = req.body;
  const notes_tamil = trimStr(req.body.notes_tamil);
  if (day_of_week === undefined || day_of_week === null || !start_time || !end_time) {
    return res.status(400).json({ success: false, error: 'day_of_week, start_time, end_time are required' });
  }
  const parsed = parseDayOfWeek(day_of_week);
  if (parsed.error) return res.status(400).json({ success: false, error: parsed.error });
  day_of_week = parsed.value;
  if (!isValidTime(start_time) || !isValidTime(end_time)) {
    return res.status(400).json({ success: false, error: 'Times must be in HH:MM format' });
  }
  if (!isStartBeforeEnd(start_time, end_time)) {
    return res.status(400).json({ success: false, error: 'start_time must be before end_time' });
  }
  try {
    // Delete existing schedule for this day to prevent duplicates
    await query('DELETE FROM doctor_schedules WHERE doctor_id = $1 AND day_of_week = $2', [req.params.id, day_of_week]);
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

// DELETE /admin/hospital/doctors/:id/schedule — clear ALL schedules for a doctor
router.delete('/doctors/:id/schedule', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    await query('DELETE FROM doctor_schedules WHERE doctor_id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
