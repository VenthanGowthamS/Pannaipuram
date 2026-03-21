const jwt = require('jsonwebtoken');

// Main authentication middleware
function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'அணுகல் மறுக்கப்பட்டது — Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
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
