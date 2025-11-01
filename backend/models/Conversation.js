const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const reportCardSchema = new mongoose.Schema({
  totalMessages: {
    type: Number,
    default: 0
  },
  grammarMistakes: [{
    original: String,
    correction: String,
    explanation: String
  }],
  vocabularySuggestions: [{
    word: String,
    suggestion: String,
    context: String
  }],
  fluencyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  }
});

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  reportCard: reportCardSchema,
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema);
