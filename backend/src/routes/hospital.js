const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// GET /api/hospital/info
router.get('/info', async (req, res) => {
  try {
    const result = await query('SELECT * FROM hospitals WHERE id = 1');
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/hospital/doctors
// All doctors with full weekly schedule
router.get('/doctors', async (req, res) => {
  try {
    const result = await query(`
      SELECT d.id, d.hospital_id, d.name_tamil, d.name_english, d.specialisation, d.photo_url, d.is_active,
             COALESCE(
               json_agg(
                 json_build_object(
                   'day_of_week', ds.day_of_week,
                   'start_time', ds.start_time,
                   'end_time',   ds.end_time,
                   'notes_tamil', ds.notes_tamil
                 ) ORDER BY ds.day_of_week
               ) FILTER (WHERE ds.id IS NOT NULL),
               '[]'::json
             ) AS schedules
      FROM doctors d
      LEFT JOIN doctor_schedules ds ON d.id = ds.doctor_id
      WHERE d.is_active = TRUE
      GROUP BY d.id
      ORDER BY d.id
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/hospital/doctors/today
// Only doctors available today
router.get('/doctors/today', async (req, res) => {
  try {
    const dayOfWeek = new Date().getDay(); // 0=Sun ... 6=Sat

    const result = await query(`
      SELECT d.id, d.name_tamil, d.name_english, d.specialisation, d.photo_url,
             ds.start_time, ds.end_time, ds.notes_tamil
      FROM doctors d
      JOIN doctor_schedules ds ON d.id = ds.doctor_id
      WHERE d.is_active = TRUE AND ds.day_of_week = $1
      ORDER BY d.id
    `, [dayOfWeek]);

    res.json({ success: true, data: result.rows, day: dayOfWeek });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
