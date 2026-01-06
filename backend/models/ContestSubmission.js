const mongoose = require('mongoose');

const contestSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true,
  },
  contestNumber: {
    type: Number,
    required: true,
  },
  // Section 1: Grammar answers
  grammarAnswers: [{
    questionIndex: { type: Number },
    selectedAnswer: { type: String },
    isCorrect: { type: Boolean },
  }],
  grammarScore: {
    type: Number, // out of 10
    default: 0,
  },
  // Section 2: Speaking
  speakingCompleted: {
    type: Boolean,
    default: false,
  },
  speakingTranscript: {
    type: String,
    default: '',
  },
  speakingScore: {
    type: Number, // out of 100
    default: 0,
  },
  speakingFeedback: {
    type: String,
    default: '',
  },
  // Section 3: Reading
  readingCompleted: {
    type: Boolean,
    default: false,
  },
  readingTranscript: {
    type: String,
    default: '',
  },
  readingScore: {
    type: Number, // out of 100
    default: 0,
  },
  readingFeedback: {
    type: String,
    default: '',
  },
  // Overall
  totalScore: {
    type: Number, // 0-300 (grammar*10 + speaking + reading)
    default: 0,
  },
  ratingChange: {
    type: Number,
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

contestSubmissionSchema.index({ user: 1, contest: 1 }, { unique: true });
contestSubmissionSchema.index({ contest: 1, totalScore: -1 });

module.exports = mongoose.model('ContestSubmission', contestSubmissionSchema);
