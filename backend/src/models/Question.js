const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.ObjectId,
    ref: 'Interview',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Please add the question text'],
    trim: true
  },
  timeLimit: {
    type: Number, // In seconds for recording this question
    required: true,
    default: 60
  },
  order: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
