const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { query } = require('../../db/pool');
const { sendToAll } = require('../../services/pushNotifications');

// All admin routes require auth
router.use(adminAuth);

// POST /admin/power/cuts — add a new power cut
router.post('/cuts', async (req, res) => {
  const { area_description, cut_type, start_time, end_time, reason_tamil } = req.body;
  try {
    const result = await query(`
      INSERT INTO power_cuts
        (area_description, cut_type, start_time, end_time, reason_tamil, source)
      VALUES ($1, $2, $3, $4, $5, 'admin')
      RETURNING *
    `, [area_description, cut_type || 'planned', start_time, end_time, reason_tamil]);

    // Send push notification
    const cut = result.rows[0];
    const startStr = new Date(cut.start_time).toLocaleString('ta-IN');
    await sendToAll({
      title: 'பண்ணைப்புரம் ⚡',
      body:  `${startStr} — மின் தடை — ${cut.reason_tamil || 'பராமரிப்பு'}`
    });

    res.json({ success: true, data: cut });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /admin/power/cuts/:id
router.put('/cuts/:id', async (req, res) => {
  const { area_description, cut_type, start_time, end_time, reason_tamil, is_resolved } = req.body;
  try {
    const result = await query(`
      UPDATE power_cuts
      SET area_description = COALESCE($1, area_description),
          cut_type         = COALESCE($2, cut_type),
          start_time       = COALESCE($3, start_time),
          end_time         = COALESCE($4, end_time),
          reason_tamil     = COALESCE($5, reason_tamil),
          is_resolved      = COALESCE($6, is_resolved)
      WHERE id = $7 RETURNING *
    `, [area_description, cut_type, start_time, end_time, reason_tamil, is_resolved, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
