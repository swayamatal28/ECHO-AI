const express = require('express');
const router = express.Router();
const {
  getRandomTopic,
  evaluateTopicSpeech,
  startCorrectionChat,
  sendCorrectionMessage,
  endCorrectionChat
} = require('../controllers/speakingController');
const { protect } = require('../middleware/authMiddleware');
const { trackActivity } = require('../middleware/activityMiddleware');

router.use(protect);
router.use(trackActivity);

// Topic Speaking
router.get('/topic', getRandomTopic);
router.post('/evaluate', evaluateTopicSpeech);

// Correction Mode
router.post('/correction/start', startCorrectionChat);
router.post('/correction/message', sendCorrectionMessage);
router.post('/correction/end', endCorrectionChat);

module.exports = router;
