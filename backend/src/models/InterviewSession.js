const mongoose = require('mongoose');

const InterviewSessionSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  interview: {
    type: mongoose.Schema.ObjectId,
    ref: 'Interview',
    required: true
  },
  status: {
    type: String,
    enum: ['started', 'completed', 'failed', 'abandoned'],
    default: 'started'
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  warningsCount: {
    type: Number,
    default: 0
  },
  videoUrl: {
    type: String,
    default: ''
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.model('InterviewSession', InterviewSessionSchema);
