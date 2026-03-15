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

module.exports = router;
