import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Film, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

/**
 * Home page component
 * Landing page for the ECHO app
 */
const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: 'Speak with AI',
      description: 'Practice conversational English with our AI tutor. Get real-time feedback and improve your speaking skills.',
      color: 'bg-blue-500',
    },
    {
      icon: Film,
      title: 'Movie Recommendations',
      description: 'Discover movies and series perfect for learning English at your level.',
      color: 'bg-purple-500',
    },
    {
      icon: BookOpen,
      title: 'Grammar & Blogs',
      description: 'Learn grammar rules and read engaging blogs to expand your vocabulary.',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium">AI-Powered English Learning</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Master English with
              <span className="block mt-2">ECHO</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10">
              Your personal AI companion for learning English through conversation, 
              curated content, and interactive lessons.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <span>Start Learning Free</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Wave Shape */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three powerful tools designed to accelerate your English learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of learners improving their English every day with ECHO.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold text-white">ECHO</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} ECHO. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
