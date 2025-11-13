import { Book, Clock, Eye, Tag, ChevronRight } from 'lucide-react';

/**
 * BlogCard component
 * Displays blog post preview with metadata
 */
const BlogCard = ({ blog, onClick }) => {
  const getCategoryColor = (category) => {
    const colors = {
      grammar: 'bg-blue-100 text-blue-700',
      vocabulary: 'bg-purple-100 text-purple-700',
      speaking: 'bg-green-100 text-green-700',
      writing: 'bg-orange-100 text-orange-700',
      general: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.general;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      advanced: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[difficulty] || colors.beginner;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get excerpt from content (first 150 characters)
  const getExcerpt = (content) => {
    // Remove markdown formatting
    const plainText = content
      .replace(/#+\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\n/g, ' ')
      .trim();
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden card-hover border border-gray-100 cursor-pointer"
      onClick={() => onClick && onClick(blog)}
    >
      <div className="p-5">
        {/* Category & Difficulty */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(
              blog.category
            )}`}
          >
            {blog.category}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium capitalize border ${getDifficultyColor(
              blog.difficulty
            )}`}
          >
            {blog.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight hover:text-primary-600 transition-colors">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {getExcerpt(blog.content)}
        </p>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <Tag className="w-4 h-4 text-gray-400" />
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{blog.views || 0} views</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
