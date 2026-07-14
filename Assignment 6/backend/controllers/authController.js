const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const logger = require('../utils/logger');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    logger.warn('Failed login attempt', { email });
    throw new AppError('Invalid email or password', 401);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);

  logger.info('User logged in', { userId: user._id, email: user.email, role: user.role });

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
});

// POST /api/auth/register (admin only)
exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, role, department } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError('Email already registered', 409);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'teacher',
    department,
    createdBy: req.user._id,
  });

  logger.info('New user registered', {
    createdBy: req.user._id,
    newUser: user._id,
    role: user.role,
    email: user.email,
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// GET /api/auth/users (admin)
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// PATCH /api/auth/users/:id/deactivate (admin)
exports.deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (String(user._id) === String(req.user._id)) throw new AppError('Cannot deactivate yourself', 400);

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  logger.info('User deactivated', { adminId: req.user._id, targetUser: user._id });
  res.json({ success: true, message: 'User deactivated' });
});
