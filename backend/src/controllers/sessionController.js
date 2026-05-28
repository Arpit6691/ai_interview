const InterviewSession = require('../models/InterviewSession');
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const MediaChunk = require('../models/MediaChunk');
const SuspiciousActivity = require('../models/SuspiciousActivity');
const Transcript = require('../models/Transcript');
const Evaluation = require('../models/Evaluation');
const ffmpegService = require('../services/ffmpegService');
const aiService = require('../services/aiService');
const storageService = require('../services/storageService');

// Active processing tasks map to track merge status
const activeProcesses = new Map();

// Helper to run background session processing
const processSessionBackground = async (session) => {
  const sessionId = session._id.toString();
  activeProcesses.set(sessionId, { status: 'processing', progress: 10 });
  console.log(`[Queue] Starting background processing for Session ${sessionId}`);

  try {
    // 1. Get all questions in order
    const interview = await Interview.findById(session.interview).populate({
      path: 'questions',
      options: { sort: { order: 1 } }
    });

    activeProcesses.set(sessionId, { status: 'processing', progress: 30 });

    // 2. For each question, merge its chunks and transcribe it
    const questionVideos = [];
    const transcripts = [];

    for (let i = 0; i < interview.questions.length; i++) {
      const question = interview.questions[i];
      const qId = question._id.toString();

      // Find chunks for this question
      const chunks = await MediaChunk.find({
        session: sessionId,
        question: qId
      }).sort({ chunkNumber: 1 });

      if (chunks.length > 0) {
        console.log(`[Queue] Merging ${chunks.length} chunks for Question ${qId}`);
        const chunkPaths = chunks.map(c => c.filePath);
        
        // Merge chunks
        const mergedQVideo = await ffmpegService.mergeChunks(sessionId, qId, chunkPaths);
        questionVideos.push(mergedQVideo);

        // Transcribe
        console.log(`[Queue] Transcribing response for Question ${qId}`);
        const transcriptionResult = await aiService.transcribeAudio(mergedQVideo, question.text);
        
        // Save transcript
        const transcript = await Transcript.create({
          session: sessionId,
          question: qId,
          text: transcriptionResult.text,
          confidence: transcriptionResult.confidence
        });
        
        transcripts.push(transcript);
      }
    }

    activeProcesses.set(sessionId, { status: 'processing', progress: 60 });

    // 3. Merge all question videos into the final interview video
    let finalVideoUrl = '';
    if (questionVideos.length > 0) {
      console.log(`[Queue] Merging final candidate video...`);
      const finalVideoPath = await ffmpegService.mergeSessionVideos(sessionId, questionVideos);
      finalVideoUrl = storageService.getPublicUrl(finalVideoPath);
    }

    activeProcesses.set(sessionId, { status: 'processing', progress: 80 });

    // 4. Retrieve total warning count from SuspiciousActivities
    const warningsCount = await SuspiciousActivity.countDocuments({ session: sessionId });

    // 5. Generate AI evaluation
    console.log(`[Queue] Generating AI evaluation reports...`);
    const evalData = await aiService.evaluateSession(transcripts, warningsCount);

    // Save evaluation
    await Evaluation.create({
      session: sessionId,
      scores: evalData.scores,
      feedback: evalData.feedback,
      suggestions: evalData.suggestions,
      status: 'completed'
    });

    // 6. Complete the session document
    session.videoUrl = finalVideoUrl;
    session.warningsCount = warningsCount;
    session.status = 'completed';
    session.completedAt = Date.now();
    await session.save();

    activeProcesses.set(sessionId, { status: 'completed', progress: 100 });
    console.log(`[Queue] Session ${sessionId} completed processing successfully!`);
  } catch (err) {
    console.error(`[Queue] Error processing session ${sessionId}:`, err);
    session.status = 'failed';
    await session.save();
    activeProcesses.set(sessionId, { status: 'failed', error: err.message, progress: 100 });
  }
};

// @desc    Start / Resume interview session
// @route   POST /api/sessions/start
// @access  Private (Candidate only)
exports.startSession = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview template not found' });
    }

    // Check if session already exists for this candidate/interview combo (to support resumption)
    let session = await InterviewSession.findOne({
      candidate: req.user.id,
      interview: interviewId,
      status: { $in: ['started', 'abandoned'] }
    });

    if (session) {
      // Resume existing session
      session.status = 'started';
      await session.save();
      return res.status(200).json({
        success: true,
        message: 'Resuming existing session',
        session
      });
    }

    // Create a new session
    session = await InterviewSession.create({
      candidate: req.user.id,
      interview: interviewId,
      status: 'started',
      currentQuestionIndex: 0
    });

    res.status(201).json({
      success: true,
      message: 'New session started',
      session
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update session question index
// @route   PUT /api/sessions/:id/progress
// @access  Private
exports.updateSessionProgress = async (req, res) => {
  try {
    const { currentQuestionIndex } = req.body;
    const session = await InterviewSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    session.currentQuestionIndex = currentQuestionIndex;
    await session.save();

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Finish / Complete session (triggers async compilation queue)
// @route   POST /api/sessions/:id/complete
// @access  Private (Candidate only)
exports.completeSession = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Session already completed' });
    }

    // Set status to completed in UI state but process merging in background
    session.status = 'completed';
    await session.save();

    // Trigger async processing thread
    processSessionBackground(session);

    res.status(200).json({
      success: true,
      message: 'Interview submitted. Transcripts and AI scoring are processing in the background.',
      session
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get session processing status
// @route   GET /api/sessions/:id/status
// @access  Private
exports.getSessionStatus = async (req, res) => {
  const sessionId = req.params.id;
  const process = activeProcesses.get(sessionId);

  if (!process) {
    // If not in active queue, check if it's already completed in DB
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    return res.status(200).json({
      success: true,
      status: session.status,
      progress: session.status === 'completed' ? 100 : 0
    });
  }

  res.status(200).json({
    success: true,
    ...process
  });
};

// @desc    Log a proctoring incident
// @route   POST /api/sessions/:id/proctor-alert
// @access  Private
exports.logProctorAlert = async (req, res) => {
  try {
    const { type, timestamp, details } = req.body;
    const session = await InterviewSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Log the event
    const alert = await SuspiciousActivity.create({
      session: session._id,
      type,
      timestamp,
      details: details || ''
    });

    // Increment warnings counter
    session.warningsCount += 1;
    await session.save();

    res.status(201).json({
      success: true,
      alert,
      warningsCount: session.warningsCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get candidate's sessions (Candidate dashboard)
// @route   GET /api/sessions/candidate
// @access  Private (Candidate only)
exports.getCandidateSessions = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ candidate: req.user.id })
      .populate('interview')
      .sort({ startedAt: -1 })
      .lean();

    const sessionIds = sessions.map(s => s._id);
    const evaluations = await Evaluation.find({ session: { $in: sessionIds } }).lean();

    const sessionsWithEvals = sessions.map(session => {
      const evalObj = evaluations.find(e => e.session.toString() === session._id.toString());
      return { ...session, evaluation: evalObj };
    });

    res.status(200).json({
      success: true,
      count: sessionsWithEvals.length,
      sessions: sessionsWithEvals
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get recruiter's candidate sessions
// @route   GET /api/sessions/recruiter
// @access  Private (Recruiter only)
exports.getRecruiterSessions = async (req, res) => {
  try {
    // Retrieve all sessions for interviews created by this recruiter
    const recruiterInterviews = await Interview.find({ recruiter: req.user.id }).select('_id');
    const interviewIds = recruiterInterviews.map(i => i._id);

    const sessions = await InterviewSession.find({ interview: { $in: interviewIds } })
      .populate('candidate')
      .populate('interview')
      .sort({ startedAt: -1 })
      .lean();

    const sessionIds = sessions.map(s => s._id);
    const evaluations = await Evaluation.find({ session: { $in: sessionIds } }).lean();

    const sessionsWithEvals = sessions.map(session => {
      const evalObj = evaluations.find(e => e.session.toString() === session._id.toString());
      return { ...session, evaluation: evalObj };
    });

    res.status(200).json({
      success: true,
      count: sessionsWithEvals.length,
      sessions: sessionsWithEvals
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get full session attempt detailed breakdown
// @route   GET /api/sessions/:id/results
// @access  Private
exports.getSessionResults = async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id)
      .populate('candidate')
      .populate({
        path: 'interview',
        populate: { path: 'questions' }
      });

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Verify authorized user: must be the candidate or the recruiter who owns the interview
    const interview = await Interview.findById(session.interview);
    if (
      session.candidate._id.toString() !== req.user.id &&
      interview.recruiter.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ success: false, error: 'Not authorized to view these results' });
    }

    const evaluation = await Evaluation.findOne({ session: session._id });
    const transcripts = await Transcript.find({ session: session._id }).populate('question');
    const suspiciousActivities = await SuspiciousActivity.find({ session: session._id }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      session,
      evaluation: evaluation || { status: 'pending', scores: { overall: 0 } },
      transcripts,
      suspiciousActivities
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
