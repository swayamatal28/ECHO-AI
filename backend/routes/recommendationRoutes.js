const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  addRecommendation,
  deleteRecommendation
} = require('../controllers/recommendationController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/recommendations
 * @desc    Get all recommendations
 * @access  Public
 */
router.get('/', getRecommendations);

/**
 * @route   POST /api/recommendations
 * @desc    Add a new recommendation
 * @access  Private/Admin
 */
router.post('/', protect, admin, addRecommendation);

/**
 * @route   DELETE /api/recommendations/:id
 * @desc    Delete a recommendation
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deleteRecommendation);

module.exports = router;
