const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { validateIdParam, requireRole } = require('../../middleware/auth');
const { query } = require('../../db/pool');
const { trimStr, isValidPhone } = require('../../middleware/validate');
const { SERVICE_CATEGORIES } = require('../../utils/serviceCategories');

const badCategory = (c) => !SERVICE_CATEGORIES.includes(c);
const CATEGORY_ERROR = `category must be one of: ${SERVICE_CATEGORIES.join(', ')}`;

// A new category saved before migration_services_categories.sql has run hits
// the old 6-value CHECK constraint (Postgres 23514). Say so instead of a bare 500.
function dbError(res, err) {
  if (err && err.code === '23514') {
    return res.status(400).json({
      success: false,
      error: 'This category needs migration_services_categories.sql to be run in Supabase first',
    });
  }
  console.error('Services DB error:', err && err.message);
  const msg = err && err.message && err.message.includes('does not exist')
    ? 'Table local_services not found — run migration first'
    : 'Server error';
  return res.status(500).json({ success: false, error: msg });
}

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
router.post('/', requireRole('admin', 'super_admin'), async (req, res) => {
  const name_tamil   = trimStr(req.body.name_tamil);
  const name_english = trimStr(req.body.name_english);
  const phone        = trimStr(req.body.phone);
  const { category, display_order } = req.body;
  if (!category || !name_tamil || !phone) {
    return res.status(400).json({ success: false, error: 'category, name_tamil, phone are required' });
  }
  if (badCategory(category)) return res.status(400).json({ success: false, error: CATEGORY_ERROR });
  if (!isValidPhone(phone)) {
    return res.status(400).json({ success: false, error: 'Phone must be a 10-digit Indian mobile number starting with 6-9' });
  }
  try {
    const result = await query(`
      INSERT INTO local_services
        (category, name_tamil, name_english, phone, area_tamil, area_english, notes_tamil, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [category, name_tamil, name_english, phone, trimStr(req.body.area_tamil), trimStr(req.body.area_english), trimStr(req.body.notes_tamil), parseInt(display_order, 10) || 0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return dbError(res, err);
  }
});

// PUT /admin/services/:id — update
router.put('/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  const { category, is_active } = req.body;
  const has = (k) => Object.prototype.hasOwnProperty.call(req.body, k);
  // Same rules as POST — an edit used to accept any category / phone, and a
  // bad one surfaced as a bare "Server error".
  if (has('category') && badCategory(category)) return res.status(400).json({ success: false, error: CATEGORY_ERROR });
  const name_tamil = has('name_tamil') ? trimStr(req.body.name_tamil) : null;
  if (has('name_tamil') && !name_tamil) return res.status(400).json({ success: false, error: 'name_tamil cannot be empty' });
  const phone = has('phone') ? trimStr(req.body.phone) : null;
  if (has('phone') && !isValidPhone(phone)) {
    return res.status(400).json({ success: false, error: 'Phone must be a 10-digit Indian mobile number starting with 6-9' });
  }
  // Optional text: sending it (even empty) SETS it, so a cleared box stays clear.
  const opt = (k) => [has(k), trimStr(req.body[k])];
  const [hasEn, name_english] = opt('name_english');
  const [hasAreaTa, area_tamil] = opt('area_tamil');
  const [hasAreaEn, area_english] = opt('area_english');
  const [hasNotes, notes_tamil] = opt('notes_tamil');
  const display_order = has('display_order') ? (parseInt(req.body.display_order, 10) || 0) : null;
  try {
    const result = await query(`
      UPDATE local_services SET
        category      = COALESCE($1, category),
        name_tamil    = COALESCE($2, name_tamil),
        name_english  = CASE WHEN $11 THEN $3 ELSE name_english END,
        phone         = COALESCE($4, phone),
        area_tamil    = CASE WHEN $12 THEN $5 ELSE area_tamil END,
        area_english  = CASE WHEN $13 THEN $6 ELSE area_english END,
        notes_tamil   = CASE WHEN $14 THEN $7 ELSE notes_tamil END,
        is_active     = COALESCE($8, is_active),
        display_order = COALESCE($9, display_order)
      WHERE id = $10
      RETURNING *
    `, [category, name_tamil, name_english, phone, area_tamil, area_english, notes_tamil, is_active, display_order, req.params.id,
        hasEn, hasAreaTa, hasAreaEn, hasNotes]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return dbError(res, err);
  }
});

// DELETE /admin/services/:id
router.delete('/:id', validateIdParam, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    await query('DELETE FROM local_services WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
