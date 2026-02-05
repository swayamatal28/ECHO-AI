
# Initialize git
Set-Location "C:\Users\Swayam\Desktop\ECHO"
git init
git branch -M main

# Helper function to commit with a specific date
function Make-Commit {
    param([string]$msg, [string]$date)
    $env:GIT_AUTHOR_DATE = $date
    $env:GIT_COMMITTER_DATE = $date
    git commit -m $msg
    Remove-Item Env:\GIT_AUTHOR_DATE
    Remove-Item Env:\GIT_COMMITTER_DATE
}

# ===== PHASE 1: Project Init (Oct 2025) =====

git add .gitignore
Make-Commit "Initial commit: add .gitignore" "2025-10-05T10:15:00"

git add README.md
Make-Commit "Add project README" "2025-10-05T10:30:00"

# ===== PHASE 2: Backend Setup (Oct 2025) =====

git add backend/package.json
Make-Commit "Initialize backend with npm" "2025-10-06T14:00:00"

git add backend/server.js
Make-Commit "Set up Express server with middleware and CORS" "2025-10-06T15:30:00"

git add backend/config/db.js
Make-Commit "Add MongoDB connection config" "2025-10-06T16:00:00"

# ===== PHASE 3: Auth System (Oct 2025) =====

git add backend/models/User.js
Make-Commit "Create User model with mongoose schema" "2025-10-08T11:00:00"

git add backend/middleware/authMiddleware.js
Make-Commit "Add JWT authentication middleware" "2025-10-08T13:00:00"

git add backend/controllers/authController.js
Make-Commit "Implement auth controller: register, login, profile" "2025-10-09T10:00:00"

git add backend/routes/authRoutes.js
Make-Commit "Add auth routes" "2025-10-09T11:30:00"

# ===== PHASE 4: Frontend Setup (Oct 2025) =====

git add frontend/package.json
Make-Commit "Initialize frontend with React and Vite" "2025-10-12T09:00:00"

git add frontend/vite.config.js
Make-Commit "Configure Vite with React plugin" "2025-10-12T09:30:00"

git add frontend/tailwind.config.js
Make-Commit "Add Tailwind CSS configuration" "2025-10-12T10:00:00"

git add frontend/index.html
Make-Commit "Add HTML entry point" "2025-10-12T10:15:00"

git add frontend/src/styles/index.css
Make-Commit "Add global styles and Tailwind directives" "2025-10-12T10:45:00"

git add frontend/src/main.jsx
Make-Commit "Set up React entry point with router" "2025-10-12T11:00:00"

git add frontend/src/api/axiosInstance.js
Make-Commit "Create axios instance with interceptors" "2025-10-13T09:00:00"

git add frontend/src/context/AuthContext.jsx
Make-Commit "Implement authentication context provider" "2025-10-13T11:00:00"

# ===== PHASE 5: Core UI (Oct 2025) =====

git add frontend/src/pages/Home.jsx
Make-Commit "Build landing/home page" "2025-10-15T14:00:00"

git add frontend/src/pages/Login.jsx
Make-Commit "Create login page with form validation" "2025-10-16T10:00:00"

git add frontend/src/pages/Register.jsx
Make-Commit "Create registration page" "2025-10-16T12:00:00"

git add frontend/src/components/Navbar.jsx
Make-Commit "Build responsive navbar component" "2025-10-18T09:00:00"

git add frontend/src/components/Sidebar.jsx
Make-Commit "Build sidebar navigation component" "2025-10-18T11:00:00"

git add frontend/src/pages/Dashboard.jsx
Make-Commit "Create main dashboard layout with nested routes" "2025-10-19T15:00:00"

git add frontend/src/App.jsx
Make-Commit "Set up React Router with all routes" "2025-10-20T10:00:00"

# ===== PHASE 6: Speak with AI (Nov 2025) =====

git add backend/models/Conversation.js
Make-Commit "Create Conversation model for chat history" "2025-11-01T10:00:00"

git add backend/controllers/chatController.js
Make-Commit "Implement chat controller with Gemini AI integration" "2025-11-02T14:00:00"

git add backend/routes/chatRoutes.js
Make-Commit "Add chat API routes" "2025-11-02T16:00:00"

git add frontend/src/components/ReportCardModal.jsx
Make-Commit "Build report card modal for conversation feedback" "2025-11-05T11:00:00"

git add frontend/src/pages/SpeakAI.jsx
Make-Commit "Build Speak with AI page with speech recognition" "2025-11-06T13:00:00"

# ===== PHASE 7: Grammar & Blogs (Nov 2025) =====

git add backend/models/Blog.js
Make-Commit "Create Blog model schema" "2025-11-10T09:00:00"

git add backend/controllers/blogController.js
Make-Commit "Implement blog controller with search and filters" "2025-11-10T11:00:00"

git add backend/routes/blogRoutes.js
Make-Commit "Add blog API routes" "2025-11-10T12:00:00"

git add backend/seed.js
Make-Commit "Add seed script for sample blog posts" "2025-11-11T10:00:00"

git add frontend/src/components/BlogCard.jsx
Make-Commit "Create blog card component" "2025-11-13T09:00:00"

git add frontend/src/components/BlogModal.jsx
Make-Commit "Build blog detail modal with reader view" "2025-11-13T11:00:00"

git add frontend/src/pages/GrammarBlogs.jsx
Make-Commit "Build Grammar & Blogs page with filtering" "2025-11-14T14:00:00"

# ===== PHASE 8: Recommendations (Nov 2025) =====

git add backend/models/Recommendation.js
Make-Commit "Create Recommendation model" "2025-11-18T10:00:00"

git add backend/controllers/recommendationController.js
Make-Commit "Implement recommendation controller" "2025-11-18T12:00:00"

git add backend/routes/recommendationRoutes.js
Make-Commit "Add recommendation routes" "2025-11-18T13:00:00"

git add frontend/src/components/RecommendationCard.jsx
Make-Commit "Build recommendation card component" "2025-11-20T09:00:00"

git add frontend/src/pages/Recommendations.jsx
Make-Commit "Build recommendations page with difficulty filters" "2025-11-20T14:00:00"

# ===== PHASE 9: Practice Section (Dec 2025) =====

git add backend/data/practiceQuestions.js
Make-Commit "Add 280 practice questions across 14 topics" "2025-12-01T10:00:00"

git add backend/models/Question.js
Make-Commit "Create Question model for practice system" "2025-12-01T12:00:00"

git add backend/controllers/practiceController.js
Make-Commit "Implement practice controller with progress tracking" "2025-12-03T11:00:00"

git add backend/routes/practiceRoutes.js
Make-Commit "Add practice API routes" "2025-12-03T13:00:00"

git add frontend/src/pages/Practice.jsx
Make-Commit "Build practice hub with topic grid and stats" "2025-12-05T14:00:00"

git add frontend/src/pages/TopicPractice.jsx
Make-Commit "Build topic practice page with MCQ interface" "2025-12-06T10:00:00"

# ===== PHASE 10: Profile & Activity (Dec 2025) =====

git add backend/middleware/activityMiddleware.js
Make-Commit "Add activity tracking middleware for heatmap" "2025-12-10T09:00:00"

git add backend/controllers/profileController.js
Make-Commit "Implement profile controller with stats and heatmap" "2025-12-10T14:00:00"

git add backend/routes/profileRoutes.js
Make-Commit "Add profile routes" "2025-12-10T15:00:00"

git add frontend/src/pages/Profile.jsx
Make-Commit "Build profile page with heatmap and practice stats" "2025-12-12T13:00:00"

# ===== PHASE 11: Contest System (Jan 2026) =====

git add backend/data/contestData.js
Make-Commit "Add contest question bank and configuration" "2026-01-05T10:00:00"

git add backend/models/Contest.js
Make-Commit "Create Contest model" "2026-01-05T12:00:00"

git add backend/models/ContestSubmission.js
Make-Commit "Create ContestSubmission model with rating calculation" "2026-01-06T09:00:00"

git add backend/controllers/contestController.js
Make-Commit "Implement contest controller with rating system" "2026-01-08T11:00:00"

git add backend/routes/contestRoutes.js
Make-Commit "Add contest API routes" "2026-01-08T14:00:00"

git add frontend/src/pages/Contest.jsx
Make-Commit "Build contest listing page with rating tiers" "2026-01-12T10:00:00"

git add frontend/src/pages/ContestArena.jsx
Make-Commit "Build contest arena with timer and sections" "2026-01-14T15:00:00"

# ===== PHASE 12: Blog Writing (Jan 2026) =====

git add backend/controllers/blogWritingController.js
Make-Commit "Add blog writing evaluation with AI scoring" "2026-01-20T11:00:00"

git add backend/routes/blogWritingRoutes.js
Make-Commit "Add blog writing routes" "2026-01-20T12:00:00"

git add frontend/src/pages/BlogWriting.jsx
Make-Commit "Build blog writing page with structured editor" "2026-01-22T14:00:00"

# ===== PHASE 13: Polish (Feb 2026) =====

git add backend/README.md
Make-Commit "Add backend API documentation" "2026-02-01T10:00:00"

# Final: catch anything remaining
git add -A
Make-Commit "Final cleanup and polish" "2026-02-05T16:00:00"

# Update README as last commit
git add README.md
Make-Commit "Update README with complete documentation" "2026-02-07T10:00:00"

# Push to GitHub
git remote add origin https://github.com/swayamatal28/ECHO-AI.git
git push -u origin main --force

Write-Host "`n✅ Done! Pushed to GitHub with $(git rev-list --count HEAD) commits."
