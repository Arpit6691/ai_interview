const express = require('express');
const {
  createInterview,
  getInterviews,
  getInterviewDetails,
  deleteInterview
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, authorize('recruiter'), createInterview)
  .get(protect, getInterviews);

router.route('/:id')
  .get(protect, getInterviewDetails)
  .delete(protect, authorize('recruiter'), deleteInterview);

module.exports = router;
