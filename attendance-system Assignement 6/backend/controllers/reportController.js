const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const AttendanceReport = require('../models/AttendanceReport');
const EmailLog = require('../models/EmailLog');
const { parseAttendanceFile } = require('../services/fileParser');
const { enqueueLetterJobs, getQueueStats } = require('../queues/letterQueue');
const logger = require('../utils/logger');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// ── Multer configuration ──
const UPLOAD_DIR = path.join(__dirname, '../uploads/raw');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.memoryStorage(); // Keep in memory for processing

const fileFilter = (req, file, cb) => {
  const allowed = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream',
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.csv', '.xls', '.xlsx'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Only CSV and Excel files are accepted', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

exports.uploadMiddleware = upload.single('file');

// ══════════════════════════════════════════
//  POST /api/reports/upload
// ══════════════════════════════════════════
exports.uploadReport = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const {
    academicYear,
    semester,
    className,
    section,
    fromDate,
    toDate,
    threshold = 75,
    teacherEmail,
  } = req.body;

  logger.info('File upload received', {
    userId: req.user._id,
    filename: req.file.originalname,
    size: req.file.size,
  });

  // ── Parse file in memory ──
  const { students, errors: parseErrors } = parseAttendanceFile(
    req.file.buffer,
    req.file.originalname,
    parseFloat(threshold)
  );

  if (students.length === 0) {
    throw new AppError(
      `No valid students found. Parse errors: ${parseErrors.map((e) => `Row ${e.row}: ${e.issues.join(', ')}`).join(' | ')}`,
      422
    );
  }

  const belowThreshold = students.filter((s) => s.isBelowThreshold);

  // ── Persist to DB ──
  const report = await AttendanceReport.create({
    uploadedBy: req.user._id,
    academicYear,
    semester,
    className,
    section,
    fromDate: fromDate ? new Date(fromDate) : undefined,
    toDate: toDate ? new Date(toDate) : undefined,
    threshold: parseFloat(threshold),
    totalStudents: students.length,
    belowThresholdCount: belowThreshold.length,
    students,
    status: 'processed',
    originalFileName: req.file.originalname,
    processedAt: new Date(),
  });

  logger.info('Report saved to DB', {
    reportId: report._id,
    total: students.length,
    below: belowThreshold.length,
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'File parsed and report created successfully',
    reportId: report._id,
    summary: {
      totalStudents: students.length,
      belowThreshold: belowThreshold.length,
      parseErrors: parseErrors.length,
    },
    parseErrors: parseErrors.slice(0, 20), // Return first 20 errors
  });
});

// ══════════════════════════════════════════
//  POST /api/reports/:id/dispatch
//  Enqueue letter generation + email sending
// ══════════════════════════════════════════
exports.dispatchLetters = asyncHandler(async (req, res) => {
  const report = await AttendanceReport.findById(req.params.id);
  if (!report) throw new AppError('Report not found', 404);

  // Only the uploader or admin can dispatch
  if (
    String(report.uploadedBy) !== String(req.user._id) &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Not authorised to dispatch letters for this report', 403);
  }

  if (!['processed', 'failed'].includes(report.status)) {
    throw new AppError(`Cannot dispatch — report status is '${report.status}'`, 400);
  }

  const { teacherEmail } = req.body;

  const result = await enqueueLetterJobs(report._id, teacherEmail || req.user.email);

  logger.info('Letters dispatched', {
    reportId: report._id,
    queued: result.queued,
    teacherEmail: teacherEmail || req.user.email,
    dispatchedBy: req.user._id,
  });

  res.json({
    success: true,
    message: `${result.queued} letter job(s) queued for processing`,
    queued: result.queued,
  });
});

// ══════════════════════════════════════════
//  GET /api/reports
// ══════════════════════════════════════════
exports.getReports = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { uploadedBy: req.user._id };
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    AttendanceReport.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-students'), // Don't send full student array in list
    AttendanceReport.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    reports,
  });
});

// ══════════════════════════════════════════
//  GET /api/reports/:id
// ══════════════════════════════════════════
exports.getReport = asyncHandler(async (req, res) => {
  const report = await AttendanceReport.findById(req.params.id)
    .populate('uploadedBy', 'name email');

  if (!report) throw new AppError('Report not found', 404);

  // Teachers can only see their own reports
  if (
    req.user.role === 'teacher' &&
    String(report.uploadedBy._id) !== String(req.user._id)
  ) {
    throw new AppError('Access denied', 403);
  }

  res.json({ success: true, report });
});

// ══════════════════════════════════════════
//  GET /api/reports/:id/students/below
//  Only students below threshold
// ══════════════════════════════════════════
exports.getBelowThreshold = asyncHandler(async (req, res) => {
  const report = await AttendanceReport.findById(req.params.id)
    .select('students threshold status');

  if (!report) throw new AppError('Report not found', 404);

  const below = report.students.filter((s) => s.isBelowThreshold);
  res.json({
    success: true,
    count: below.length,
    threshold: report.threshold,
    students: below,
  });
});

// ══════════════════════════════════════════
//  GET /api/reports/:id/logs
// ══════════════════════════════════════════
exports.getEmailLogs = asyncHandler(async (req, res) => {
  const logs = await EmailLog.find({ reportId: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, count: logs.length, logs });
});

// ══════════════════════════════════════════
//  GET /api/reports/queue/stats
// ══════════════════════════════════════════
exports.getQueueStatus = asyncHandler(async (req, res) => {
  const stats = await getQueueStats();
  res.json({ success: true, queue: stats });
});

// ══════════════════════════════════════════
//  DELETE /api/reports/:id
// ══════════════════════════════════════════
exports.deleteReport = asyncHandler(async (req, res) => {
  const report = await AttendanceReport.findById(req.params.id);
  if (!report) throw new AppError('Report not found', 404);

  if (
    req.user.role !== 'admin' &&
    String(report.uploadedBy) !== String(req.user._id)
  ) {
    throw new AppError('Not authorised to delete this report', 403);
  }

  await AttendanceReport.findByIdAndDelete(req.params.id);
  await EmailLog.deleteMany({ reportId: req.params.id });

  logger.info('Report deleted', { reportId: req.params.id, deletedBy: req.user._id });
  res.json({ success: true, message: 'Report deleted' });
});
