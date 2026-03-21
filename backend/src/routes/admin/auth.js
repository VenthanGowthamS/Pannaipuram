const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { query } = require('../../db/pool');
const adminAuth = require('../../middleware/auth');
const { requireRole, validateIdParam } = require('../../middleware/auth');

// Rate limiters for public auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per IP
  message: { error: 'Too many login attempts — try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                    // 5 registrations per IP per hour
  message: { error: 'Too many registration attempts — try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /admin/auth/login
router.post('/login', loginLimiter, async (req, res) => {
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

    // Treat NULL as active (migration may not have run yet)
    if (admin.is_active === false) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, role: admin.role });
  } catch (err) {
    console.error('Login error:', err.message, err.stack);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// POST /admin/auth/setup — first-time only, creates super_admin user
// Only works when no admin users exist yet
router.post('/setup', registerLimiter, async (req, res) => {
  const { email, password, name } = req.body;
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
      'INSERT INTO admin_users (email, password_hash, role, name, is_active) VALUES ($1, $2, $3, $4, $5)',
      [email, hash, 'super_admin', name || email.split('@')[0], true]
    );
    res.json({ success: true, message: 'Admin created. You can now login.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// POST /admin/auth/register — public self-registration (creates inactive user)
// No auth required — user is created with is_active = false, needs admin approval
router.post('/register', registerLimiter, async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const existing = await query(
      'SELECT id FROM admin_users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO admin_users (email, password_hash, role, name, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, name',
      [email, hash, 'viewer', name || email.split('@')[0], false]
    );

    const newUser = result.rows[0];
    res.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      message: 'Account created. Please wait for admin approval.'
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// POST /admin/auth/signup — creates new user with 'viewer' role
// Requires authentication (any logged-in admin)
router.post('/signup', adminAuth, async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Check if user already exists
    const existing = await query(
      'SELECT id FROM admin_users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO admin_users (email, password_hash, role, name, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, name',
      [email, hash, 'viewer', name || email.split('@')[0], true]
    );

    const newUser = result.rows[0];
    res.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// GET /admin/auth/users — list all users
// Requires super_admin role
router.get('/users', adminAuth, requireRole('super_admin'), async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, name, role, is_active, created_at FROM admin_users ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// PUT /admin/auth/users/:id/role — update user role
// Requires super_admin role
router.put('/users/:id/role', adminAuth, requireRole('super_admin'), validateIdParam, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role required' });
  }

  if (!['super_admin', 'admin', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // Prevent self-demotion
  if (req.admin.id === parseInt(id) && role !== 'super_admin') {
    return res.status(400).json({ error: 'Cannot demote yourself' });
  }

  try {
    const result = await query(
      'UPDATE admin_users SET role = $1 WHERE id = $2 RETURNING id, email, name, role, is_active',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// PUT /admin/auth/users/:id/active — toggle user active status
// Requires super_admin role
router.put('/users/:id/active', adminAuth, requireRole('super_admin'), validateIdParam, async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be a boolean' });
  }

  // Prevent self-deactivation
  if (req.admin.id === parseInt(id) && !is_active) {
    return res.status(400).json({ error: 'Cannot deactivate yourself' });
  }

  try {
    const result = await query(
      'UPDATE admin_users SET is_active = $1 WHERE id = $2 RETURNING id, email, name, role, is_active',
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

module.exports = router;
