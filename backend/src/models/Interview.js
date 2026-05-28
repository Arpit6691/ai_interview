const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an interview title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  recruiter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Question'
  }],
  durationLimit: {
    type: Number, // In minutes (overall recommendation, optional)
    default: 15
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', InterviewSchema);
