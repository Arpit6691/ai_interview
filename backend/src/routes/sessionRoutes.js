const express = require('express');
const {
  startSession,
  updateSessionProgress,
  completeSession,
  getSessionStatus,
  logProctorAlert,
  getCandidateSessions,
  getRecruiterSessions,
  getSessionResults
} = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/start', protect, authorize('candidate'), startSession);
router.put('/:id/progress', protect, updateSessionProgress);
router.post('/:id/complete', protect, authorize('candidate'), completeSession);
router.get('/:id/status', protect, getSessionStatus);
router.post('/:id/proctor-alert', protect, logProctorAlert);
router.get('/candidate', protect, authorize('candidate'), getCandidateSessions);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterSessions);
router.get('/:id/results', protect, getSessionResults);

module.exports = router;
