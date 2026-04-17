const express = require('express');
const router  = express.Router();
const { query } = require('../db/pool');

// POST /api/devices/register
router.post('/register', async (req, res) => {
  const { fcmToken, streetId } = req.body;
  if (!fcmToken) return res.status(400).json({ error: 'fcmToken required' });

  try {
    const result = await query(`
      INSERT INTO devices (fcm_token, street_id)
      VALUES ($1, $2)
      ON CONFLICT (fcm_token)
      DO UPDATE SET street_id = $2, last_seen = NOW()
      RETURNING *
    `, [fcmToken, streetId || null]);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/devices/street — update selected street
router.put('/street', async (req, res) => {
  const { fcmToken, streetId } = req.body;
  if (!fcmToken || !streetId) {
    return res.status(400).json({ error: 'fcmToken and streetId required' });
  }
  try {
    await query(`
      UPDATE devices SET street_id = $1, last_seen = NOW()
      WHERE fcm_token = $2
    `, [streetId, fcmToken]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
