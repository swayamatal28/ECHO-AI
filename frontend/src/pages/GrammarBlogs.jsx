import { useState, useEffect } from 'react';
import { BookOpen, Loader, Search, Filter } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import BlogCard from '../components/BlogCard';
import BlogModal from '../components/BlogModal';

/**
 * GrammarBlogs page component
 * Displays grammar topics and blog posts
 */
const GrammarBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    search: '',
  });

  // Grammar topics for quick access
  const grammarTopics = [
    { name: 'Tenses', category: 'grammar' },
    { name: 'Articles', category: 'grammar' },
    { name: 'Prepositions', category: 'grammar' },
    { name: 'Vocabulary', category: 'vocabulary' },
    { name: 'Speaking', category: 'speaking' },
    { name: 'Writing', category: 'writing' },
  ];

  // Fetch blogs on mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Apply filters when blogs or filters change
  useEffect(() => {
    applyFilters();
  }, [blogs, filters]);

  /**
   * Fetch blogs from API
   */
  const fetchBlogs = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get('/blogs');
      setBlogs(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      setError('Failed to load blogs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Apply filters to blogs
   */
  const applyFilters = () => {
    let filtered = [...blogs];

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(blog => blog.category === filters.category);
    }

    // Filter by difficulty
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(blog => blog.difficulty === filters.difficulty);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchLower) ||
        blog.content.toLowerCase().includes(searchLower) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredBlogs(filtered);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Handle topic click
   */
  const handleTopicClick = (category) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? 'all' : category,
    }));
  };

  /**
   * Handle blog click
   */
  const handleBlogClick = (blog) => {
    setSelectedBlog(blog);
    setShowBlogModal(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📚 Grammar & Blogs
        </h1>
        <p className="text-gray-600">
          Learn grammar rules, expand your vocabulary, and read helpful articles
        </p>
      </div>

      {/* Quick Topics */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Topics</h2>
        <div className="flex flex-wrap gap-2">
          {grammarTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => handleTopicClick(topic.category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.category === topic.category
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              <option value="grammar">Grammar</option>
              <option value="vocabulary">Vocabulary</option>
              <option value="speaking">Speaking</option>
              <option value="writing">Writing</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Clear Filters */}
          {(filters.category !== 'all' || filters.difficulty !== 'all' || filters.search) && (
            <button
              onClick={() => setFilters({ category: 'all', difficulty: 'all', search: '' })}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading articles...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg text-center">
          {error}
          <button
            onClick={fetchBlogs}
            className="ml-4 text-red-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No articles found
          </h3>
          <p className="text-gray-500">
            {filters.category !== 'all' || filters.search
              ? 'Try adjusting your filters to see more results'
              : 'No articles have been added yet'}
          </p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredBlogs.length}</span> articles
            </p>
          </div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onClick={handleBlogClick}
              />
            ))}
          </div>
        </>
      )}

      {/* Study Resources */}
      <div className="mt-12 bg-primary-50 rounded-2xl p-6 border border-primary-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          📖 How to Use This Section
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Start with grammar basics if you're a beginner</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Read articles that match your current level</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Take notes on new words and grammar rules</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Practice what you learn in the "Speak with AI" section</span>
          </li>
        </ul>
      </div>

      {/* Blog Modal */}
      <BlogModal
        isOpen={showBlogModal}
        onClose={() => setShowBlogModal(false)}
        blog={selectedBlog}
      />
    </div>
  );
};

export default GrammarBlogs;
