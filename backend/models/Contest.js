const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  contestNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  // The Sunday date for this contest (YYYY-MM-DD)
  date: {
    type: String,
    required: true,
  },
  // Start time in IST (always 20:00 IST)
  startTimeIST: {
    type: String,
    default: '20:00',
  },
  // Duration in minutes (70 min = 8:00 PM to 9:10 PM)
  durationMinutes: {
    type: Number,
    default: 70,
  },
  // Section 1: Grammar MCQs
  grammarQuestions: [{
    question: { type: String, required: true },
    options: [{ type: String }],
    answer: { type: String, required: true },
    explanation: { type: String },
  }],
  // Section 2: Speaking topic
  speakingTopic: {
    topic: { type: String, required: true },
    description: { type: String },
    minDurationSec: { type: Number, default: 30 },
    maxDurationSec: { type: Number, default: 120 },
  },
  // Section 3: Reading paragraph
  readingParagraph: {
    text: { type: String, required: true },
    title: { type: String },
    wordCount: { type: Number },
  },
  // Participants count (updated on submissions)
  participantCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
    default: 'upcoming',
  },
}, {
  timestamps: true,
});

contestSchema.index({ date: -1 });

module.exports = mongoose.model('Contest', contestSchema);
