const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { validateIdParam, requireRole } = require('../../middleware/auth');
const { query } = require('../../db/pool');
const { trimStr, isValidPhone } = require('../../middleware/validate');

router.use(adminAuth);

// POST /admin/contacts
router.post('/', requireRole('admin', 'super_admin'), async (req, res) => {
  const name_tamil   = trimStr(req.body.name_tamil);
  const name_english = trimStr(req.body.name_english);
  const phone        = trimStr(req.body.phone);
  const { category, is_national, display_order } = req.body;
  if (!name_tamil || !phone) return res.status(400).json({ success: false, error: 'name_tamil and phone required' });
  // Emergency contacts can have short numbers (100, 108, etc.) or landlines with STD codes
  // Only validate if it looks like a mobile number (10+ digits)
  if (phone.replace(/\D/g, '').length >= 10 && !isValidPhone(phone)) {
    return res.status(400).json({ success: false, error: 'Phone must be a valid Indian mobile number starting with 6-9' });
  }
  try {
    const result = await query(`
      INSERT INTO emergency_contacts (category, name_tamil, name_english, phone, is_national, is_verified, display_order)
      VALUES ($1,$2,$3,$4,$5,TRUE,$6) RETURNING *
    `, [category, name_tamil, name_english, phone, is_national || false, display_order || 0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /admin/contacts/:id
router.put('/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  const { name_tamil, name_english, phone, is_verified, display_order } = req.body;
  try {
    const result = await query(`
      UPDATE emergency_contacts
      SET name_tamil    = COALESCE($1, name_tamil),
          name_english  = COALESCE($2, name_english),
          phone         = COALESCE($3, phone),
          is_verified   = COALESCE($4, is_verified),
          display_order = COALESCE($5, display_order)
      WHERE id = $6 RETURNING *
    `, [name_tamil, name_english, phone, is_verified, display_order, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /admin/contacts/:id
router.delete('/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    await query('DELETE FROM emergency_contacts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
