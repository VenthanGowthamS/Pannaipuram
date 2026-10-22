const jwt = require('jsonwebtoken');
const { query } = require('../db/pool');

// Main authentication middleware
// The JWT lives 7 days, so the signature alone can't tell us a user was
// deactivated, deleted or demoted since it was issued. We therefore re-read the
// user's CURRENT role/active flag on every request (one indexed lookup) and use
// that instead of the claims baked into the token.
async function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'அணுகல் மறுக்கப்பட்டது — Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const current = await query('SELECT role, is_active FROM admin_users WHERE id = $1', [decoded.id]);
    // NULL is_active counts as active (same rule as login) — only an explicit false blocks
    if (current.rows.length === 0 || current.rows[0].is_active === false) {
      return res.status(401).json({ error: 'Account is deactivated or removed — Access denied' });
    }
    req.admin = { ...decoded, role: current.rows[0].role };
    next();
  } catch (err) {
    if (err.name !== 'TokenExpiredError' && err.name !== 'JsonWebTokenError' && err.name !== 'NotBeforeError') {
      console.error('Auth lookup error:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired — மீண்டும் உள்நுழையவும்', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'தவறான அடையாளம் — Invalid token' });
  }
}

// Role-based access control middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Validate that :id param is a positive integer
function validateIdParam(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid ID parameter' });
  }
  req.params.id = id;
  next();
}

module.exports = adminAuth;
module.exports.requireRole = requireRole;
module.exports.validateIdParam = validateIdParam;
