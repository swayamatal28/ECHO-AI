import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import axiosInstance from '../api/axiosInstance';
import { MessageSquare, Film, BookOpen, TrendingUp, Calendar, Award } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState('Beginner');

  const isMainDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    if (isMainDashboard) {
      axiosInstance.get('/profile/stats')
        .then(res => {
          const s = res.data?.data?.stats;
          if (s) {
            setStreak(s.currentStreak || 0);
            setLevel(s.level || 'Beginner');
          }
        })
        .catch(() => {});
    }
  }, [isMainDashboard]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const quickActions = [
    {
      title: 'Speak with AI',
      description: 'Practice your English speaking skills',
      icon: MessageSquare,
      path: '/dashboard/speak-ai',
      color: 'bg-blue-500',
    },
    {
      title: 'Recommendations',
      description: 'Discover movies & series to improve English',
      icon: Film,
      path: '/dashboard/recommendations',
      color: 'bg-purple-500',
    },
    {
      title: 'Grammar & Blogs',
      description: 'Learn grammar rules and read articles',
      icon: BookOpen,
      path: '/dashboard/grammar-blogs',
      color: 'bg-orange-500',
    },
  ];

  const stats = [
    { label: 'Learning Streak', value: `${streak} day${streak !== 1 ? 's' : ''}`, icon: TrendingUp },
    { label: 'Member Since', value: user?.joinedDate ? formatDate(user.joinedDate).split(',')[1].trim() : 'N/A', icon: Calendar },
    { label: 'Level', value: level, icon: Award },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {isMainDashboard ? (
          // Dashboard Overview
          <div className="p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-500 mt-1">
                {formatDate(new Date().toISOString())}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.path}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover group"
                  >
                    <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {action.description}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            {/* Learning Tips */}
            <div className="bg-primary-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">💡 Daily Learning Tip</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Consistency is key! Try to practice English for at least 15 minutes every day. 
                Even short, daily practice sessions are more effective than long, occasional ones.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  🎯 Set daily goals
                </span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  📺 Watch English content
                </span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  💬 Practice speaking
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Nested Route Content
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
