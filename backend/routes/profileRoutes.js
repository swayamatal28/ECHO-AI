const express = require('express');
const router = express.Router();
const { getProfileStats } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { trackActivity } = require('../middleware/activityMiddleware');

/**
 * @route   GET /api/profile/stats
 * @desc    Get user profile stats and heatmap data
 * @access  Private
 */
router.get('/stats', protect, trackActivity, getProfileStats);

module.exports = router;
