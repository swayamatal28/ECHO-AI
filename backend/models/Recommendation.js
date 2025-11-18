const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['movie', 'series'],
    required: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  year: {
    type: Number
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
