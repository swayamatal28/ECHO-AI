const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { trackActivity } = require('../middleware/activityMiddleware');
const {
  getContests,
  getContest,
  submitContest,
  getDiscussions,
  getContestStats,
} = require('../controllers/contestController');

// All routes are protected
router.get('/', protect, trackActivity, getContests);
router.get('/stats', protect, getContestStats);
router.get('/:id', protect, trackActivity, getContest);
router.post('/:id/submit', protect, trackActivity, submitContest);
router.get('/:id/discussions', protect, getDiscussions);

module.exports = router;
