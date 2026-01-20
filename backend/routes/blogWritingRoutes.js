const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { trackActivity } = require('../middleware/activityMiddleware');
const { getRandomTopic, evaluateBlog } = require('../controllers/blogWritingController');

router.get('/topic', protect, trackActivity, getRandomTopic);
router.post('/evaluate', protect, trackActivity, evaluateBlog);

module.exports = router;
