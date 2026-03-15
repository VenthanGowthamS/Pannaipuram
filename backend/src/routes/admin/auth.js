const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { query } = require('../../db/pool');

// POST /admin/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await query(
      'SELECT * FROM admin_users WHERE email = $1', [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /admin/auth/setup — first-time only, creates admin user
// Only works when no admin users exist yet
router.post('/setup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    const existing = await query('SELECT id FROM admin_users LIMIT 1');
    if (existing.rows.length > 0) {
      return res.status(403).json({ error: 'Admin already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    await query(
      'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)',
      [email, hash]
    );
    res.json({ success: true, message: 'Admin created. You can now login.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

module.exports = router;
