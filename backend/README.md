# ECHO Backend

REST API for the ECHO English learning app. Built with Express + MongoDB.

## Setup

```bash
npm install
```

Create `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/echo_db
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

Seed sample data (optional):

```bash
node seed.js
```

Run:

```bash
npm run dev    # with nodemon
npm start      # production
```

## Endpoints

**Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

**Chat**
- `POST /api/chat/start`
- `POST /api/chat/message`
- `POST /api/chat/end`
- `GET /api/chat/history`

**Practice**
- `GET /api/practice/topics`
- `GET /api/practice/topics/:slug`
- `POST /api/practice/submit`
- `GET /api/practice/stats`

**Blog Writing**
- `GET /api/blog-writing/topic`
- `POST /api/blog-writing/evaluate`

**Contests**
- `GET /api/contests`
- `GET /api/contests/stats`
- `GET /api/contests/:id`
- `POST /api/contests/:id/submit`
- `GET /api/contests/:id/discussions`

**Recommendations**
- `GET /api/recommendations`

**Blogs**
- `GET /api/blogs`
- `GET /api/blogs/grammar`
- `GET /api/blogs/:id`

**Profile**
- `GET /api/profile/stats`
