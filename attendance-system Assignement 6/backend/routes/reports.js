const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

// All report routes require authentication — no students
// (students have no role in this system; only admin & teacher)

// GET /api/reports/queue/stats — must come before /:id
router.get('/queue/stats', authenticate, authorize('admin'), reportController.getQueueStatus);

// POST /api/reports/upload
router.post(
  '/upload',
  authenticate,
  authorize('admin', 'teacher'),
  reportController.uploadMiddleware,
  reportController.uploadReport
);

// GET /api/reports
router.get('/', authenticate, authorize('admin', 'teacher'), reportController.getReports);

// GET /api/reports/:id
router.get('/:id', authenticate, authorize('admin', 'teacher'), reportController.getReport);

// GET /api/reports/:id/students/below
router.get(
  '/:id/students/below',
  authenticate,
  authorize('admin', 'teacher'),
  reportController.getBelowThreshold
);

// POST /api/reports/:id/dispatch
router.post(
  '/:id/dispatch',
  authenticate,
  authorize('admin', 'teacher'),
  reportController.dispatchLetters
);

// GET /api/reports/:id/logs
router.get(
  '/:id/logs',
  authenticate,
  authorize('admin', 'teacher'),
  reportController.getEmailLogs
);

// DELETE /api/reports/:id
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'teacher'),
  reportController.deleteReport
);

module.exports = router;
