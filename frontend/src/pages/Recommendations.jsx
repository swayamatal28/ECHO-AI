import { useState, useEffect } from 'react';
import { Film, Tv, Loader, Filter, Search } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import RecommendationCard from '../components/RecommendationCard';

/**
 * Recommendations page component
 * Displays movie/series recommendations for English learning
 */
const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    difficulty: 'all',
    search: '',
  });

  // Fetch recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Apply filters when recommendations or filters change
  useEffect(() => {
    applyFilters();
  }, [recommendations, filters]);

  /**
   * Fetch recommendations from API
   */
  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get('/recommendations');
      setRecommendations(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Apply filters to recommendations
   */
  const applyFilters = () => {
    let filtered = [...recommendations];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(rec => rec.type === filters.type);
    }

    // Filter by difficulty
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(rec => rec.difficulty === filters.difficulty);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(rec =>
        rec.title.toLowerCase().includes(searchLower) ||
        rec.genre.toLowerCase().includes(searchLower) ||
        rec.reason.toLowerCase().includes(searchLower)
      );
    }

    setFilteredRecommendations(filtered);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎬 Movie & Series Recommendations
        </h1>
        <p className="text-gray-600">
          Discover the best movies and TV series to improve your English skills
        </p>
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
                placeholder="Search movies, series, or genres..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="series">Series</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading recommendations...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg text-center">
          {error}
          <button
            onClick={fetchRecommendations}
            className="ml-4 text-red-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Film className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No recommendations found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters to see more results
          </p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredRecommendations.length}</span> recommendations
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Film className="w-4 h-4" />
                <span>{recommendations.filter(r => r.type === 'movie').length} movies</span>
              </div>
              <div className="flex items-center space-x-1">
                <Tv className="w-4 h-4" />
                <span>{recommendations.filter(r => r.type === 'series').length} series</span>
              </div>
            </div>
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation._id}
                recommendation={recommendation}
              />
            ))}
          </div>
        </>
      )}

      {/* Learning Tips */}
      <div className="mt-12 bg-primary-50 rounded-2xl p-6 border border-primary-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          💡 Tips for Learning English with Movies
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Start with English subtitles, then try without them as you improve</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Pause and repeat phrases you find interesting or challenging</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Keep a vocabulary notebook for new words and expressions</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>Watch the same movie multiple times to reinforce learning</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Recommendations;
