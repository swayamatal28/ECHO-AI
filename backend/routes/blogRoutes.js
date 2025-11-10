const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getGrammarTopics
} = require('../controllers/blogController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/blogs
 * @desc    Get all published blogs
 * @access  Public
 */
router.get('/', getBlogs);

/**
 * @route   GET /api/blogs/grammar
 * @desc    Get grammar topics
 * @access  Public
 */
router.get('/grammar', getGrammarTopics);

/**
 * @route   GET /api/blogs/:id
 * @desc    Get single blog
 * @access  Public
 */
router.get('/:id', getBlogById);

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog
 * @access  Private (any authenticated user can create for demo)
 */
router.post('/', protect, createBlog);

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update a blog
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, updateBlog);

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deleteBlog);

module.exports = router;
