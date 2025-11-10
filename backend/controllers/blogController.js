const Blog = require('../models/Blog');

const getBlogs = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    
    // Build query
    const query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, content, category, difficulty, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const blog = await Blog.create({
      title,
      content,
      category: category || 'general',
      difficulty: difficulty || 'beginner',
      tags: tags || [],
      author: req.user._id
    });

    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { title, content, category, difficulty, tags, isPublished } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (difficulty) blog.difficulty = difficulty;
    if (tags) blog.tags = tags;
    if (typeof isPublished === 'boolean') blog.isPublished = isPublished;

    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await blog.deleteOne();

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message
    });
  }
};

const getGrammarTopics = async (req, res) => {
  try {
    const blogs = await Blog.find({
      category: 'grammar',
      isPublished: true
    })
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    console.error('Get grammar topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grammar topics',
      error: error.message
    });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getGrammarTopics
};
