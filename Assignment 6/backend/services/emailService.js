const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const EmailLog = require('../models/EmailLog');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10, // max 10 messages/second
  });

  return transporter;
}

/**
 * Build HTML email body for parent
 */
function buildParentEmailHtml(student, report) {
  const threshold = report.threshold || 75;
  const overallPct = student.overallAttendance.toFixed(2);
  const schoolName = process.env.SCHOOL_NAME || 'Greenwood Public School';
  const principalName = process.env.PRINCIPAL_NAME || 'The Principal';

  const subjectRows = (student.subjects || [])
    .map(
      (s) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${s.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${s.totalClasses || '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${s.attended || '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;color:${s.percentage < threshold ? '#c0392b' : '#1a6b3c'};font-weight:600">
          ${typeof s.percentage === 'number' ? s.percentage.toFixed(1) + '%' : '—'}
        </td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:30px 20px">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)">
        <!-- Header -->
        <tr><td style="background:#1a3a78;padding:28px 36px">
          <h1 style="color:#fff;margin:0;font-size:22px">${schoolName}</h1>
          <p style="color:#a8c0f0;margin:4px 0 0;font-size:13px">Attendance Management System</p>
        </td></tr>
        <!-- Alert Banner -->
        <tr><td style="background:#fdecea;border-left:5px solid #c0392b;padding:14px 36px">
          <p style="margin:0;color:#c0392b;font-weight:bold;font-size:15px">⚠ Attendance Below Required Threshold</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:30px 36px">
          <p style="margin:0 0 16px">Dear <strong>${student.parentName || 'Parent/Guardian'}</strong>,</p>
          <p style="margin:0 0 16px;line-height:1.7">
            We are writing to inform you that your ward, <strong>${student.name}</strong>
            (Roll No: ${student.rollNumber}), has an overall attendance of
            <span style="color:#c0392b;font-weight:bold;font-size:16px">${overallPct}%</span>,
            which is below the required minimum of <strong>${threshold}%</strong>.
          </p>

          <!-- Stats Box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #e0e0e0;border-radius:6px;margin:20px 0">
            <tr style="background:#1a3a78">
              <th style="color:#fff;padding:10px 14px;text-align:left;font-size:13px">Parameter</th>
              <th style="color:#fff;padding:10px 14px;text-align:left;font-size:13px">Value</th>
            </tr>
            <tr><td style="padding:8px 14px;border-bottom:1px solid #e0e0e0">Student Name</td><td style="padding:8px 14px;border-bottom:1px solid #e0e0e0"><strong>${student.name}</strong></td></tr>
            <tr><td style="padding:8px 14px;border-bottom:1px solid #e0e0e0">Roll Number</td><td style="padding:8px 14px;border-bottom:1px solid #e0e0e0">${student.rollNumber}</td></tr>
            <tr><td style="padding:8px 14px;border-bottom:1px solid #e0e0e0">Class / Section</td><td style="padding:8px 14px;border-bottom:1px solid #e0e0e0">${student.className || '—'} ${student.section || ''}</td></tr>
            <tr><td style="padding:8px 14px;border-bottom:1px solid #e0e0e0">Overall Attendance</td><td style="padding:8px 14px;border-bottom:1px solid #e0e0e0;color:#c0392b;font-weight:bold">${overallPct}%</td></tr>
            <tr><td style="padding:8px 14px">Required Minimum</td><td style="padding:8px 14px;color:#1a6b3c;font-weight:bold">${threshold}%</td></tr>
          </table>

          ${
            subjectRows
              ? `<p><strong>Subject-wise Attendance:</strong></p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:6px;margin-bottom:20px">
            <tr style="background:#f0f0f0">
              <th style="padding:8px 12px;text-align:left;font-size:13px">Subject</th>
              <th style="padding:8px 12px;text-align:center;font-size:13px">Total</th>
              <th style="padding:8px 12px;text-align:center;font-size:13px">Attended</th>
              <th style="padding:8px 12px;text-align:center;font-size:13px">%</th>
            </tr>
            ${subjectRows}
          </table>`
              : ''
          }

          <p style="line-height:1.7">Students with attendance below ${threshold}% may be <strong>barred from examinations</strong>. We strongly urge you to ensure regular attendance and request a meeting with the class teacher at your earliest.</p>

          <p style="margin-top:24px">Yours sincerely,<br/><strong>${principalName}</strong><br/>Principal, ${schoolName}</p>
        </td></tr>
        <tr><td style="background:#f4f4f4;padding:16px 36px;font-size:12px;color:#888;text-align:center">
          This is an auto-generated notification. Please do not reply to this email.<br/>
          Contact the school at ${process.env.SCHOOL_PHONE || ''} or ${process.env.SCHOOL_EMAIL || ''}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * Send letter email to parent + CC to teacher
 */
async function sendAttendanceLetter({ student, report, pdfPath, teacherEmail, jobId }) {
  const schoolName = process.env.SCHOOL_NAME || 'Greenwood Public School';
  const fromAddress = `"${process.env.EMAIL_FROM_ADDRESS}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`;

  const attachments = [];
  if (pdfPath && fs.existsSync(pdfPath)) {
    attachments.push({
      filename: `Attendance_Notice_${student.rollNumber}_${student.name.replace(/\s+/g, '_')}.pdf`,
      path: pdfPath,
      contentType: 'application/pdf',
    });
  }

  const mailOptions = {
    from: fromAddress,
    to: student.parentEmail,
    cc: teacherEmail ? [teacherEmail] : [],
    subject: `[${schoolName}] Attendance Notice — ${student.name} (Roll: ${student.rollNumber})`,
    html: buildParentEmailHtml(student, report),
    attachments,
  };

  let parentLog = null;
  let teacherLog = null;

  try {
    const info = await getTransporter().sendMail(mailOptions);

    logger.info('Email sent to parent', {
      to: student.parentEmail,
      student: student.name,
      messageId: info.messageId,
      jobId,
    });

    // Log parent email
    parentLog = await EmailLog.create({
      reportId: report._id,
      studentRoll: student.rollNumber,
      studentName: student.name,
      recipientType: 'parent',
      recipientEmail: student.parentEmail,
      subject: mailOptions.subject,
      status: 'sent',
      messageId: info.messageId,
      sentAt: new Date(),
      jobId,
    });

    // Log teacher CC separately
    if (teacherEmail) {
      teacherLog = await EmailLog.create({
        reportId: report._id,
        studentRoll: student.rollNumber,
        studentName: student.name,
        recipientType: 'teacher',
        recipientEmail: teacherEmail,
        subject: mailOptions.subject,
        status: 'sent',
        messageId: info.messageId,
        sentAt: new Date(),
        jobId,
      });
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error('Email send failed', {
      to: student.parentEmail,
      student: student.name,
      error: err.message,
      jobId,
    });

    await EmailLog.create({
      reportId: report._id,
      studentRoll: student.rollNumber,
      studentName: student.name,
      recipientType: 'parent',
      recipientEmail: student.parentEmail,
      subject: mailOptions.subject,
      status: 'failed',
      errorMessage: err.message,
      jobId,
    });

    throw err;
  }
}

module.exports = { sendAttendanceLetter };
