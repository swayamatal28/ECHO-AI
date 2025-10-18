import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, Film, BookOpen, User, Home, UserCircle, PenTool, Swords } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Sidebar component
 * Dashboard navigation sidebar with tabs
 */
const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/dashboard',
      label: 'Overview',
      icon: Home,
      end: true,
    },
    {
      path: '/dashboard/speak-ai',
      label: 'Speak with AI',
      icon: MessageSquare,
    },
    {
      path: '/dashboard/recommendations',
      label: 'Recommendations',
      icon: Film,
    },
    {
      path: '/dashboard/grammar-blogs',
      label: 'Grammar & Blogs',
      icon: BookOpen,
    },
    {
      path: '/dashboard/practice',
      label: 'Practice',
      icon: PenTool,
    },
    {
      path: '/dashboard/contest',
      label: 'Contest',
      icon: Swords,
    },
    {
      path: '/dashboard/profile',
      label: 'My Profile',
      icon: UserCircle,
    },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] flex flex-col">
      {/* User Profile Section */}
      <div
        className="p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => navigate('/dashboard/profile')}
        title="View Profile"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {user?.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Member since {user?.joinedDate ? formatDate(user.joinedDate) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 text-center">
            🎯 Practice makes perfect!
            <br />
            Keep learning every day.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
