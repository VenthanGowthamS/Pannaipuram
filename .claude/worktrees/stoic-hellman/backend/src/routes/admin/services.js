const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { validateIdParam } = require('../../middleware/auth');
const { query } = require('../../db/pool');
const { trimStr, isValidPhone } = require('../../middleware/validate');

router.use(adminAuth);

// GET /admin/services — list all (incl. inactive)
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM local_services ORDER BY category, display_order, id
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /admin/services — add new service contact
router.post('/', async (req, res) => {
  const name_tamil   = trimStr(req.body.name_tamil);
  const name_english = trimStr(req.body.name_english);
  const phone        = trimStr(req.body.phone);
  const { category, display_order } = req.body;
  if (!category || !name_tamil || !phone) {
    return res.status(400).json({ success: false, error: 'category, name_tamil, phone are required' });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ success: false, error: 'Phone must be a 10-digit Indian mobile number starting with 6-9' });
  }
  try {
    const result = await query(`
      INSERT INTO local_services
        (category, name_tamil, name_english, phone, area_tamil, area_english, notes_tamil, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [category, name_tamil, name_english, phone, trimStr(req.body.area_tamil), trimStr(req.body.area_english), trimStr(req.body.notes_tamil), display_order || 0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/services/:id — update
router.put('/:id', validateIdParam, async (req, res) => {
  const { category, name_tamil, name_english, phone, area_tamil, area_english, notes_tamil, is_active, display_order } = req.body;
  try {
    const result = await query(`
      UPDATE local_services SET
        category      = COALESCE($1, category),
        name_tamil    = COALESCE($2, name_tamil),
        name_english  = COALESCE($3, name_english),
        phone         = COALESCE($4, phone),
        area_tamil    = COALESCE($5, area_tamil),
        area_english  = COALESCE($6, area_english),
        notes_tamil   = COALESCE($7, notes_tamil),
        is_active     = COALESCE($8, is_active),
        display_order = COALESCE($9, display_order)
      WHERE id = $10
      RETURNING *
    `, [category, name_tamil, name_english, phone, area_tamil, area_english, notes_tamil, is_active, display_order, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /admin/services/:id
router.delete('/:id', validateIdParam, async (req, res) => {
  try {
    await query('DELETE FROM local_services WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
