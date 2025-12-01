const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'sentence'],
    required: true,
  },
  topic: {
    type: String,
    required: true,
    index: true,
  },
  topicSlug: {
    type: String,
    required: true,
    index: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  // For MCQs
  options: {
    type: [String],
    default: [],
  },
  // Correct answer — for MCQ it's the option text, for sentence it's the fill-in word/phrase
  answer: {
    type: String,
    required: true,
  },
  // Optional explanation
  explanation: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Compound index for efficient queries
questionSchema.index({ topicSlug: 1, type: 1, difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);
