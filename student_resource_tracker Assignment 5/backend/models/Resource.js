const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: ['Video', 'Article', 'Documentation', 'Notes'],
        message: 'Type must be one of: Video, Article, Documentation, Notes',
      },
    },
    link: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // optional
          try {
            const url = new URL(v);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'Link must be a valid URL (http or https)',
      },
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced'],
        message: 'Difficulty must be one of: Beginner, Intermediate, Advanced',
      },
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
