import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SpeakAI from './pages/SpeakAI';
import Recommendations from './pages/Recommendations';
import GrammarBlogs from './pages/GrammarBlogs';
import Profile from './pages/Profile';
import Practice from './pages/Practice';
import TopicPractice from './pages/TopicPractice';
import Contest from './pages/Contest';
import ContestArena from './pages/ContestArena';
import BlogWriting from './pages/BlogWriting';

/**
 * Protected Route component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Public Route component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * App Layout component
 * Wraps pages with navbar
 */
const AppLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

/**
 * Main App component
 * Sets up routing and authentication context
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <AppLayout>
                <Home />
              </AppLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          >
            {/* Nested Dashboard Routes */}
            <Route path="speak-ai" element={<SpeakAI />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="grammar-blogs" element={<GrammarBlogs />} />
            <Route path="practice" element={<Practice />} />
            <Route path="practice/:slug" element={<TopicPractice />} />
            <Route path="practice/blog-writing" element={<BlogWriting />} />
            <Route path="contest" element={<Contest />} />
            <Route path="contest/:id" element={<ContestArena />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
