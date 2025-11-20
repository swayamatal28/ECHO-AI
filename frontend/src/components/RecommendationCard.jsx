import { useState } from 'react';
import { Film, Tv, Star, BarChart3 } from 'lucide-react';

/**
 * RecommendationCard component
 * Displays movie/series recommendation with poster image
 */
const RecommendationCard = ({ recommendation }) => {
  const [imgError, setImgError] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = () => {
    return recommendation.type === 'movie' ? (
      <Film className="w-5 h-5" />
    ) : (
      <Tv className="w-5 h-5" />
    );
  };

  // Generate placeholder color based on title
  const getPlaceholderColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-green-600',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-cyan-600',
      'bg-violet-500',
    ];
    const index = recommendation.title.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const hasImage = recommendation.imageUrl && !imgError;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover border border-gray-100">
      {/* Poster Image / Fallback Placeholder */}
      <div className={`h-48 relative ${hasImage ? 'bg-gray-900' : getPlaceholderColor()}`}>
        {hasImage ? (
          <img
            src={recommendation.imageUrl}
            alt={recommendation.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/20 text-8xl font-bold">
              {recommendation.title.charAt(0)}
            </div>
          </div>
        )}
        {/* Type Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1.5">
          <span className="text-gray-700">{getTypeIcon()}</span>
          <span className="text-sm font-medium text-gray-700 capitalize">
            {recommendation.type}
          </span>
        </div>
        {/* Rating Badge */}
        {recommendation.rating && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-white">
              {recommendation.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Year */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {recommendation.title}
          </h3>
          {recommendation.year && (
            <span className="text-sm text-gray-400 ml-2 flex-shrink-0">
              ({recommendation.year})
            </span>
          )}
        </div>

        {/* Genre */}
        <p className="text-sm text-gray-500 mb-3">{recommendation.genre}</p>

        {/* Difficulty Badge */}
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
              recommendation.difficulty
            )}`}
          >
            {recommendation.difficulty}
          </span>
        </div>

        {/* Reason */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            💡 {recommendation.reason}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
