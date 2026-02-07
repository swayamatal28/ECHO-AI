const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const blogRoutes = require('./routes/blogRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const contestRoutes = require('./routes/contestRoutes');
const blogWritingRoutes = require('./routes/blogWritingRoutes');
const speakingRoutes = require('./routes/speakingRoutes');

const app = express();

connectDB();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/blog-writing', blogWritingRoutes);
app.use('/api/speaking', speakingRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ECHO API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ECHO - English Learning Web App API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      chat: '/api/chat',
      blogs: '/api/blogs',
      recommendations: '/api/recommendations'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎯 ECHO Backend Server                                  ║
║   📍 Running on: http://localhost:${PORT}                    ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
