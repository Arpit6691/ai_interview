const mongoose = require('mongoose');

const SuspiciousActivitySchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.ObjectId,
    ref: 'InterviewSession',
    required: true
  },
  type: {
    type: String,
    enum: ['tab_switch', 'multiple_faces', 'no_face', 'mic_disabled', 'other'],
    required: true
  },
  timestamp: {
    type: Number, // In seconds since the interview started
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SuspiciousActivity', SuspiciousActivitySchema);
