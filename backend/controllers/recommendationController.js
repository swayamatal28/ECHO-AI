const Recommendation = require('../models/Recommendation');

const defaultRecommendations = [
  {
    title: "Friends",
    type: "series",
    genre: "Comedy, Romance",
    difficulty: "Beginner",
    reason: "Simple everyday conversations, clear pronunciation, and humor that helps with casual English expressions and idioms.",
    imageUrl: "https://image.tmdb.org/t/p/w500/2koX1xLkpTQM4IZebYvKysFW1Nh.jpg",
    year: 1994,
    rating: 8.9
  },
  {
    title: "The Office (US)",
    type: "series",
    genre: "Comedy, Mockumentary",
    difficulty: "Intermediate",
    reason: "Great for learning workplace vocabulary, American humor, and natural conversational English with various accents.",
    imageUrl: "https://image.tmdb.org/t/p/w500/dg9e5fPRRId8PoBE0F6jl5y85Eu.jpg",
    year: 2005,
    rating: 9.0
  },
  {
    title: "Forrest Gump",
    type: "movie",
    genre: "Drama, Romance",
    difficulty: "Beginner",
    reason: "Clear Southern American accent, simple storytelling, and emotional vocabulary that's easy to follow.",
    imageUrl: "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg",
    year: 1994,
    rating: 8.8
  },
  {
    title: "The Crown",
    type: "series",
    genre: "Drama, History",
    difficulty: "Advanced",
    reason: "Excellent for learning formal British English, rich vocabulary, and proper pronunciation with historical context.",
    imageUrl: "https://image.tmdb.org/t/p/w500/1DDE0Z2Y805rqfkEjPbZsMLyPwa.jpg",
    year: 2016,
    rating: 8.7
  },
  {
    title: "How I Met Your Mother",
    type: "series",
    genre: "Comedy, Romance",
    difficulty: "Beginner",
    reason: "Modern slang, dating vocabulary, and casual American English perfect for everyday conversations.",
    imageUrl: "https://image.tmdb.org/t/p/w500/b34jPzmB0wZy7EjUZoleXOl2RRI.jpg",
    year: 2005,
    rating: 8.3
  },
  {
    title: "The King's Speech",
    type: "movie",
    genre: "Drama, History",
    difficulty: "Advanced",
    reason: "Focus on speech therapy and pronunciation, excellent for understanding the importance of clear articulation.",
    imageUrl: "https://image.tmdb.org/t/p/w500/pVNKXVQFukBaCz6ML7GH3kiPlQP.jpg",
    year: 2010,
    rating: 8.0
  },
  {
    title: "Brooklyn Nine-Nine",
    type: "series",
    genre: "Comedy, Crime",
    difficulty: "Intermediate",
    reason: "Fast-paced dialogue, diverse characters with different speech patterns, and police vocabulary.",
    imageUrl: "https://image.tmdb.org/t/p/w500/hgRMSOt7a1b8qyQR68vUixJPang.jpg",
    year: 2013,
    rating: 8.4
  },
  {
    title: "The Social Network",
    type: "movie",
    genre: "Drama, Biography",
    difficulty: "Intermediate",
    reason: "Tech vocabulary, fast dialogue, and business English useful for professional conversations.",
    imageUrl: "https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg",
    year: 2010,
    rating: 7.8
  },
  {
    title: "Sherlock",
    type: "series",
    genre: "Crime, Drama, Mystery",
    difficulty: "Advanced",
    reason: "Complex vocabulary, British English, rapid dialogue that challenges listening comprehension skills.",
    imageUrl: "https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg",
    year: 2010,
    rating: 9.1
  },
  {
    title: "The Pursuit of Happyness",
    type: "movie",
    genre: "Drama, Biography",
    difficulty: "Beginner",
    reason: "Inspirational story with clear dialogue, emotional vocabulary, and relatable everyday situations.",
    imageUrl: "https://image.tmdb.org/t/p/w500/lBYOKAMcxIvuk9s9hMuecB9dPBV.jpg",
    year: 2006,
    rating: 8.0
  },
  {
    title: "Modern Family",
    type: "series",
    genre: "Comedy, Family",
    difficulty: "Beginner",
    reason: "Family-oriented vocabulary, different generations speaking, and diverse accents including Colombian English.",
    imageUrl: "https://image.tmdb.org/t/p/w500/k5Qg5rgPoKdh3yTJJrLtyoyYGwC.jpg",
    year: 2009,
    rating: 8.5
  },
  {
    title: "The Grand Budapest Hotel",
    type: "movie",
    genre: "Comedy, Drama",
    difficulty: "Advanced",
    reason: "Sophisticated vocabulary, formal language, and unique storytelling style that enriches language skills.",
    imageUrl: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    year: 2014,
    rating: 8.1
  }
];

/**
 * @desc    Get all recommendations
 * @route   GET /api/recommendations
 * @access  Public
 */
const getRecommendations = async (req, res) => {
  try {
    const { difficulty, type } = req.query;
    
    // Check if recommendations exist, if not seed them
    let recommendations = await Recommendation.find();
    
    if (recommendations.length === 0) {
      // Seed default recommendations
      recommendations = await Recommendation.insertMany(defaultRecommendations);
      console.log('Seeded default recommendations');
    }

    // Build query for filtering
    const query = {};
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (type) {
      query.type = type;
    }

    const filteredRecommendations = await Recommendation.find(query)
      .sort({ rating: -1 });

    res.json({
      success: true,
      count: filteredRecommendations.length,
      data: filteredRecommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: error.message
    });
  }
};

/**
 * @desc    Add a new recommendation
 * @route   POST /api/recommendations
 * @access  Private/Admin
 */
const addRecommendation = async (req, res) => {
  try {
    const { title, type, genre, difficulty, reason, imageUrl, year, rating } = req.body;

    if (!title || !type || !genre || !difficulty || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const recommendation = await Recommendation.create({
      title,
      type,
      genre,
      difficulty,
      reason,
      imageUrl,
      year,
      rating
    });

    res.status(201).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Add recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add recommendation',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a recommendation
 * @route   DELETE /api/recommendations/:id
 * @access  Private/Admin
 */
const deleteRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    await recommendation.deleteOne();

    res.json({
      success: true,
      message: 'Recommendation deleted successfully'
    });
  } catch (error) {
    console.error('Delete recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete recommendation',
      error: error.message
    });
  }
};

module.exports = {
  getRecommendations,
  addRecommendation,
  deleteRecommendation
};
