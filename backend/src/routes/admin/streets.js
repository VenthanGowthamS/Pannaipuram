const express   = require('express');
const router    = express.Router();
const adminAuth = require('../../middleware/auth');
const { query } = require('../../db/pool');

router.use(adminAuth);

// POST /admin/streets — add a new street
router.post('/', async (req, res) => {
  const { name_tamil, name_english } = req.body;
  if (!name_tamil) return res.status(400).json({ error: 'name_tamil required' });
  try {
    const result = await query(
      'INSERT INTO streets (name_tamil, name_english) VALUES ($1, $2) RETURNING *',
      [name_tamil, name_english]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// PUT /admin/streets/:id — update a street
router.put('/:id', async (req, res) => {
  const { name_tamil, name_english, ward_id } = req.body;
  try {
    const result = await query(`
      UPDATE streets
      SET name_tamil  = COALESCE($1, name_tamil),
          name_english = COALESCE($2, name_english),
          ward_id     = COALESCE($3, ward_id)
      WHERE id = $4 RETURNING *
    `, [name_tamil, name_english, ward_id, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Street not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// DELETE /admin/streets/:id — delete a street
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM streets WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Street not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

module.exports = router;
