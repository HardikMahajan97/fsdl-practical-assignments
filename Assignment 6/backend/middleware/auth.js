const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Verify JWT and attach user to req
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      return res.status(401).json({ success: false, message: msg });
    }

    const user = await User.findById(decoded.id).select('+isActive');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('Auth middleware error', { error: err.message });
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

/**
 * Restrict to specific roles
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    logger.warn('Unauthorized role access attempt', {
      userId: req.user._id,
      role: req.user.role,
      requiredRoles: roles,
      path: req.path,
    });
    return res.status(403).json({
      success: false,
      message: `Role '${req.user.role}' is not permitted to perform this action`,
    });
  }
  next();
};

module.exports = { authenticate, authorize };
