# ECHO — English Learning Web App

Full-stack MERN application I built to help people get better at English. It covers speaking, grammar, reading, writing, and even has weekly contests with a rating system.

## What it does

### Speak with AI
Conversational English practice — you chat back and forth, it corrects your mistakes in a natural way, and at the end you get a report card with a fluency score, grammar mistakes, vocabulary suggestions, and feedback.

### Practice
280 questions across 14 grammar/vocab topics (MCQ + fill-in-the-blank). Tracks your progress per topic with difficulty breakdown (Easy/Medium/Hard). LeetCode-style stats on your profile.

### Blog Writing
Get assigned a random topic, write a structured blog (intro → main body → conclusion), and get it evaluated with a score out of 10 broken down by grammar, structure, vocabulary, and content relevance.

### Weekly Contests
Every Sunday 8:00–9:10 PM IST. Three sections:
1. 10 grammar MCQs
2. Speaking — record yourself on a given topic
3. Reading — read a paragraph aloud by recording

Rating system starting at 1000, with Game of Thrones-themed tiers:
- 1250+ Baratheon
- 1500+ Stark
- 1700+ Lannister
- 2000+ Targaryen
- 2500+ Dracarys

Contest history, rating graph, and discussion section for each past contest.

### Recommendations
Curated movies and TV series for learning English, categorized by difficulty (Beginner/Intermediate/Advanced) with genre filtering.

### Grammar & Blogs
Grammar topics and educational blog posts. Searchable and filterable by category and difficulty.

### Profile
- GitHub-style activity heatmap (tracks daily usage)
- Learning streak counter
- Practice stats with per-topic breakdown
- Contest rating with tier badge and rating history graph
- Conversation stats and fluency scores

## Tech Stack

**Frontend:** React 18, React Router v6, Tailwind CSS, Axios, Lucide React, Vite

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Google Gemini API, bcryptjs

## Project Structure

```
ECHO/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── blogController.js
│   │   ├── blogWritingController.js
│   │   ├── chatController.js
│   │   ├── contestController.js
│   │   ├── practiceController.js
│   │   ├── profileController.js
│   │   └── recommendationController.js
│   ├── data/
│   │   ├── contestData.js
│   │   └── practiceQuestions.js
│   ├── middleware/
│   │   ├── activityMiddleware.js
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Blog.js
│   │   ├── Contest.js
│   │   ├── ContestSubmission.js
│   │   ├── Conversation.js
│   │   ├── Question.js
│   │   ├── Recommendation.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── blogRoutes.js
│   │   ├── blogWritingRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── contestRoutes.js
│   │   ├── practiceRoutes.js
│   │   ├── profileRoutes.js
│   │   └── recommendationRoutes.js
│   ├── .env
│   ├── package.json
│   ├── seed.js
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axiosInstance.js
    │   ├── components/
    │   │   ├── BlogCard.jsx
    │   │   ├── BlogModal.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── RecommendationCard.jsx
    │   │   ├── ReportCardModal.jsx
    │   │   └── Sidebar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── BlogWriting.jsx
    │   │   ├── Contest.jsx
    │   │   ├── ContestArena.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── GrammarBlogs.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Practice.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Recommendations.jsx
    │   │   ├── Register.jsx
    │   │   ├── SpeakAI.jsx
    │   │   └── TopicPractice.jsx
    │   ├── styles/
    │   │   └── index.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## Setup

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Google Gemini API key — grab one free at https://aistudio.google.com/apikey

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/echo_db
JWT_SECRET=pick_something_secure
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=development
```

```bash
node seed.js   # seeds sample blog posts (optional)
npm run dev    # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/start` | Start conversation |
| POST | `/api/chat/message` | Send message |
| POST | `/api/chat/end` | End + get report card |
| GET | `/api/chat/history` | Conversation history |

### Practice
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/practice/topics` | All topics with progress |
| GET | `/api/practice/topics/:slug` | Questions for a topic |
| POST | `/api/practice/submit` | Submit an answer |
| GET | `/api/practice/stats` | User practice stats |

### Blog Writing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blog-writing/topic` | Get random topic |
| POST | `/api/blog-writing/evaluate` | Submit blog for evaluation |

### Contests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contests` | All contests |
| GET | `/api/contests/stats` | User contest stats |
| GET | `/api/contests/:id` | Single contest |
| POST | `/api/contests/:id/submit` | Submit contest |
| GET | `/api/contests/:id/discussions` | Contest discussions |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | All recommendations |

### Blogs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blogs` | All blogs |
| GET | `/api/blogs/grammar` | Grammar topics |
| GET | `/api/blogs/:id` | Single blog |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/stats` | Profile stats + heatmap |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `PORT` | Server port (default 5000) | No |
| `NODE_ENV` | development / production | No |

## License

ISC
