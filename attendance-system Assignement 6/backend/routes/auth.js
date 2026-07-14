const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  authController.login
);

// POST /api/auth/register — admin only
router.post(
  '/register',
  authenticate,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 100 }),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['admin', 'teacher']).withMessage('Role must be admin or teacher'),
  ],
  authController.register
);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

// GET /api/auth/users — admin only
router.get('/users', authenticate, authorize('admin'), authController.getUsers);

// PATCH /api/auth/users/:id/deactivate — admin only
router.patch(
  '/users/:id/deactivate',
  authenticate,
  authorize('admin'),
  authController.deactivateUser
);

module.exports = router;
