const Interview = require('../models/Interview');
const Question = require('../models/Question');

// @desc    Create a new interview session and questions
// @route   POST /api/interviews
// @access  Private (Recruiter only)
exports.createInterview = async (req, res) => {
  try {
    const { title, description, durationLimit, questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide at least one question' });
    }

    // 1. Create Interview
    const interview = await Interview.create({
      title,
      description,
      durationLimit: durationLimit || 15,
      recruiter: req.user.id
    });

    // 2. Create Questions
    const questionDocs = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const newQuestion = await Question.create({
        interview: interview._id,
        text: q.text,
        timeLimit: q.timeLimit || 60,
        order: i + 1
      });
      questionDocs.push(newQuestion._id);
    }

    // 3. Link Questions in Interview
    interview.questions = questionDocs;
    await interview.save();

    res.status(201).json({
      success: true,
      interview
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all interviews
// @route   GET /api/interviews
// @access  Private
exports.getInterviews = async (req, res) => {
  try {
    let query = { status: 'active' };

    // If recruiter, only return their own interviews (active or draft)
    if (req.user.role === 'recruiter') {
      query = { recruiter: req.user.id };
    }

    const interviews = await Interview.find(query).populate('questions');
    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single interview with questions
// @route   GET /api/interviews/:id
// @access  Private
exports.getInterviewDetails = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate({
      path: 'questions',
      options: { sort: { order: 1 } }
    });

    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete/Archive an interview
// @route   DELETE /api/interviews/:id
// @access  Private (Recruiter only)
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    // Verify ownership
    if (interview.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this interview' });
    }

    // Instead of deleting, we set status to archived
    interview.status = 'archived';
    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview successfully archived'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
