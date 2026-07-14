const mongoose = require('mongoose');

// Sub-document: per-subject attendance
const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    totalClasses: { type: Number, required: true, min: 0 },
    attended: { type: Number, required: true, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

subjectSchema.pre('validate', function () {
  if (this.totalClasses > 0) {
    this.percentage = parseFloat(
      ((this.attended / this.totalClasses) * 100).toFixed(2)
    );
  } else {
    this.percentage = 0;
  }
});

// Sub-document: individual student
const studentSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    parentName: { type: String, trim: true, default: 'Parent/Guardian' },
    parentEmail: {
      type: String,
      required: [true, 'Parent email is required for notifications'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid parent email'],
    },
    className: { type: String, trim: true },
    section: { type: String, trim: true },
    subjects: [subjectSchema],
    overallAttendance: { type: Number, min: 0, max: 100 },
    isBelowThreshold: { type: Boolean, default: false },
    // Letter generation status
    letterStatus: {
      type: String,
      enum: ['pending', 'generating', 'generated', 'sent', 'failed'],
      default: 'pending',
    },
    letterPath: { type: String },
    emailSentAt: { type: Date },
    emailError: { type: String },
  },
  { _id: false }
);

// Main report document
const reportSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    academicYear: { type: String, trim: true },
    semester: { type: String, trim: true },
    className: { type: String, trim: true },
    section: { type: String, trim: true },
    fromDate: { type: Date },
    toDate: { type: Date },
    threshold: { type: Number, default: 75 },
    totalStudents: { type: Number, default: 0 },
    belowThresholdCount: { type: Number, default: 0 },
    students: [studentSchema],
    // Processing state
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'letters_queued', 'completed', 'failed'],
      default: 'uploaded',
    },
    processingError: { type: String },
    jobId: { type: String },       // Bull job ID
    originalFileName: { type: String },
    // Audit
    processedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for performance
reportSchema.index({ uploadedBy: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ 'students.parentEmail': 1 });
reportSchema.index({ 'students.isBelowThreshold': 1 });

module.exports = mongoose.model('AttendanceReport', reportSchema);
