const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceReport', required: true },
    studentRoll: { type: String, required: true },
    studentName: { type: String },
    recipientType: { type: String, enum: ['parent', 'teacher'], required: true },
    recipientEmail: { type: String, required: true },
    subject: { type: String },
    status: { type: String, enum: ['sent', 'failed', 'bounced'], required: true },
    messageId: { type: String },       // SMTP message ID
    errorMessage: { type: String },
    attemptCount: { type: Number, default: 1 },
    sentAt: { type: Date },
    jobId: { type: String },
  },
  { timestamps: true }
);

emailLogSchema.index({ reportId: 1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ recipientEmail: 1, createdAt: -1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
