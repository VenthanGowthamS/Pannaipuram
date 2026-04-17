const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');
const { sendToStreet } = require('../services/pushNotifications');

// GET /api/water/streets — all streets (for street picker)
router.get('/streets', async (req, res) => {
  try {
    const result = await query(`
      SELECT s.id, s.name_tamil, s.name_english
      FROM streets s
      ORDER BY s.name_tamil
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/water/schedule/:streetId
router.get('/schedule/:streetId', async (req, res) => {
  try {
    const result = await query(`
      SELECT ws.*, s.name_tamil, s.name_english,
             ws.last_supply_date + (ws.frequency_days || ' days')::interval AS next_supply_date
      FROM water_schedules ws
      JOIN streets s ON ws.street_id = s.id
      WHERE ws.street_id = $1
    `, [req.params.streetId]);

    if (result.rows.length === 0) {
      return res.json({ success: true, data: null, message: 'தகவல் இல்லை' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/water/schedule (all streets)
router.get('/schedule', async (req, res) => {
  try {
    const result = await query(`
      SELECT ws.street_id, s.name_tamil, s.name_english,
             ws.frequency_days, ws.supply_time,
             ws.last_supply_date + (ws.frequency_days || ' days')::interval AS next_supply_date
      FROM water_schedules ws
      JOIN streets s ON ws.street_id = s.id
      ORDER BY s.name_tamil
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/water/alert — resident reports "water came"
router.post('/alert', async (req, res) => {
  const { streetId, deviceId } = req.body;
  if (!streetId || !deviceId) {
    return res.status(400).json({ error: 'streetId and deviceId required' });
  }

  try {
    // Save alert
    const result = await query(`
      INSERT INTO water_alerts (street_id, device_id)
      VALUES ($1, $2) RETURNING *
    `, [streetId, deviceId]);

    // Get street name for notification
    const street = await query(
      'SELECT name_tamil FROM streets WHERE id = $1', [streetId]
    );
    const streetName = street.rows[0]?.name_tamil || '';
    const time = new Date().toLocaleTimeString('ta-IN', { hour: '2-digit', minute: '2-digit' });

    // Push notification to all devices
    await sendToStreet(null, {
      title: 'பண்ணைப்புரம் 💧',
      body:  `தண்ணீர் வந்தது! — ${streetName} — ${time}`
    });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/water/alert/:alertId/confirm — confirm water arrived
router.post('/alert/:alertId/confirm', async (req, res) => {
  try {
    const result = await query(`
      UPDATE water_alerts
      SET confirmations = confirmations + 1
      WHERE id = $1 RETURNING *
    `, [req.params.alertId]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/water/alerts/today
router.get('/alerts/today', async (req, res) => {
  try {
    const result = await query(`
      SELECT wa.*, s.name_tamil, s.name_english
      FROM water_alerts wa
      JOIN streets s ON wa.street_id = s.id
      WHERE wa.reported_at::date = CURRENT_DATE
      ORDER BY wa.reported_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
