const express = require('express');
const router = express.Router();
const {
  startConversation,
  sendMessage,
  endConversation,
  getConversationHistory
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { trackActivity } = require('../middleware/activityMiddleware');

// All chat routes are protected + track activity
router.use(protect);
router.use(trackActivity);

/**
 * @route   POST /api/chat/start
 * @desc    Start a new conversation
 * @access  Private
 */
router.post('/start', startConversation);

/**
 * @route   POST /api/chat/message
 * @desc    Send message and get AI response
 * @access  Private
 */
router.post('/message', sendMessage);

/**
 * @route   POST /api/chat/end
 * @desc    End conversation and get report
 * @access  Private
 */
router.post('/end', endConversation);

/**
 * @route   GET /api/chat/history
 * @desc    Get conversation history
 * @access  Private
 */
router.get('/history', getConversationHistory);

module.exports = router;
