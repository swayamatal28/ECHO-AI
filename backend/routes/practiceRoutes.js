const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { trackActivity } = require('../middleware/activityMiddleware');
const {
  getTopics,
  getTopicQuestions,
  submitAnswer,
  getPracticeStats,
} = require('../controllers/practiceController');

// All routes are protected
router.get('/topics', protect, trackActivity, getTopics);
router.get('/topics/:slug', protect, trackActivity, getTopicQuestions);
router.post('/submit', protect, trackActivity, submitAnswer);
router.get('/stats', protect, getPracticeStats);

module.exports = router;
