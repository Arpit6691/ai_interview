const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.ObjectId,
    ref: 'InterviewSession',
    required: true,
    unique: true
  },
  scores: {
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    technical: { type: Number, default: 0 },
    overall: { type: Number, default: 0 }
  },
  feedback: {
    type: String,
    default: ''
  },
  suggestions: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);
