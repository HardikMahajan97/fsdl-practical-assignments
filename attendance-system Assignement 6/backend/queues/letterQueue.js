const Bull = require('bull');
const logger = require('../utils/logger');
const AttendanceReport = require('../models/AttendanceReport');
const { generateStudentLetter } = require('../services/latexService');
const { sendAttendanceLetter } = require('../services/emailService');

// ── Queue Configuration ──
const QUEUE_NAME = 'attendance-letters';
const CONCURRENCY = 3; // Process 3 letters simultaneously

const queueOptions = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s, 10s, 20s
    },
    removeOnComplete: 50, // Keep last 50 completed
    removeOnFail: 100,    // Keep last 100 failed for debugging
  },
};

let letterQueue = null;

function getQueue() {
  if (!letterQueue) {
    letterQueue = new Bull(QUEUE_NAME, queueOptions);
    registerProcessors();
    registerEventHandlers();
    logger.info('Bull queue initialized', { queue: QUEUE_NAME });
  }
  return letterQueue;
}

// ══════════════════════════════════════════
//  JOB PROCESSOR
// ══════════════════════════════════════════
function registerProcessors() {
  letterQueue.process(CONCURRENCY, async (job) => {
    const { reportId, rollNumber, teacherEmail } = job.data;
    const jobId = job.id;

    logger.info('Processing letter job', { jobId, reportId, rollNumber });

    // ── Step 1: Fetch report ──
    const report = await AttendanceReport.findById(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    // ── Step 2: Find student ──
    const student = report.students.find((s) => s.rollNumber === rollNumber);
    if (!student) {
      throw new Error(`Student ${rollNumber} not found in report ${reportId}`);
    }

    // Mark as generating
    student.letterStatus = 'generating';
    await report.save();

    // ── Step 3: Generate PDF via LaTeX ──
    job.progress(20);
    let pdfPath = null;
    try {
      pdfPath = await generateStudentLetter(student, report);
      student.letterPath = pdfPath;
      student.letterStatus = 'generated';
      await report.save();
      logger.info('Letter PDF generated', { jobId, rollNumber, pdfPath });
    } catch (err) {
      logger.error('PDF generation failed', { jobId, rollNumber, error: err.message });
      student.letterStatus = 'failed';
      student.emailError = `PDF: ${err.message}`;
      await report.save();
      throw err; // Bull will retry
    }

    // ── Step 4: Send email ──
    job.progress(60);
    try {
      await sendAttendanceLetter({
        student,
        report,
        pdfPath,
        teacherEmail,
        jobId,
      });
      student.letterStatus = 'sent';
      student.emailSentAt = new Date();
      student.emailError = undefined;
      await report.save();
      logger.info('Email dispatched', { jobId, rollNumber, to: student.parentEmail });
    } catch (err) {
      logger.error('Email dispatch failed', { jobId, rollNumber, error: err.message });
      student.letterStatus = 'failed';
      student.emailError = `Email: ${err.message}`;
      await report.save();
      throw err;
    }

    job.progress(100);

    // ── Step 5: Check if all letters done ──
    await checkReportCompletion(reportId);

    return { success: true, roll: rollNumber, pdfPath };
  });
}

async function checkReportCompletion(reportId) {
  const report = await AttendanceReport.findById(reportId);
  if (!report) return;

  const belowStudents = report.students.filter((s) => s.isBelowThreshold);
  const allDone = belowStudents.every((s) =>
    ['sent', 'failed'].includes(s.letterStatus)
  );

  if (allDone) {
    report.status = 'completed';
    report.completedAt = new Date();
    await report.save();
    logger.info('All letters processed for report', {
      reportId,
      total: belowStudents.length,
      sent: belowStudents.filter((s) => s.letterStatus === 'sent').length,
      failed: belowStudents.filter((s) => s.letterStatus === 'failed').length,
    });
  }
}

// ══════════════════════════════════════════
//  EVENT HANDLERS (audit logging)
// ══════════════════════════════════════════
function registerEventHandlers() {
  letterQueue.on('completed', (job, result) => {
    logger.info('Job completed', { jobId: job.id, result });
  });

  letterQueue.on('failed', (job, err) => {
    logger.error('Job failed', {
      jobId: job.id,
      attempt: job.attemptsMade,
      maxAttempts: job.opts.attempts,
      error: err.message,
      data: job.data,
    });
  });

  letterQueue.on('stalled', (job) => {
    logger.warn('Job stalled (will retry)', { jobId: job.id, data: job.data });
  });

  letterQueue.on('error', (err) => {
    logger.error('Queue error', { error: err.message });
  });
}

// ══════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════

/**
 * Enqueue all below-threshold students for a report
 */
async function enqueueLetterJobs(reportId, teacherEmail) {
  const queue = getQueue();

  const report = await AttendanceReport.findById(reportId);
  if (!report) throw new Error('Report not found');

  const belowStudents = report.students.filter((s) => s.isBelowThreshold);

  if (belowStudents.length === 0) {
    report.status = 'completed';
    report.completedAt = new Date();
    await report.save();
    logger.info('No students below threshold, report marked complete', { reportId });
    return { queued: 0 };
  }

  report.status = 'letters_queued';
  await report.save();

  const jobs = [];
  for (const student of belowStudents) {
    const job = await queue.add(
      { reportId: String(reportId), rollNumber: student.rollNumber, teacherEmail },
      {
        priority: 1,
        jobId: `${reportId}-${student.rollNumber}`, // Idempotent
      }
    );
    jobs.push(job.id);
    logger.debug('Job enqueued', { jobId: job.id, roll: student.rollNumber });
  }

  logger.info('Letter jobs enqueued', {
    reportId,
    count: jobs.length,
    teacherEmail,
  });

  return { queued: jobs.length, jobIds: jobs };
}

/**
 * Get queue statistics
 */
async function getQueueStats() {
  const queue = getQueue();
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  return { waiting, active, completed, failed, delayed };
}

module.exports = { getQueue, enqueueLetterJobs, getQueueStats };
