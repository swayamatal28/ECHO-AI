import { X, ArrowLeft, Clock, Eye, User, Tag } from 'lucide-react';

/**
 * BlogModal component
 * Full blog post view in a modal
 */
const BlogModal = ({ isOpen, onClose, blog }) => {
  if (!isOpen || !blog) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  // Simple markdown-to-HTML conversion
  const renderContent = (content) => {
    // Split by lines and process
    const lines = content.split('\n');
    const elements = [];
    let inList = false;
    let listItems = [];

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside mb-4 space-y-1">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h3 key={index} className="text-lg font-bold text-gray-900 mt-6 mb-3">{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('## ')) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside mb-4 space-y-1">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h2 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('# ')) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside mb-4 space-y-1">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h1 key={index} className="text-2xl font-bold text-gray-900 mt-4 mb-4">{line.replace('# ', '')}</h1>);
      }
      // List items
      else if (line.startsWith('- ')) {
        inList = true;
        const text = line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        listItems.push(<li key={index} className="text-gray-700" dangerouslySetInnerHTML={{ __html: text }} />);
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line)) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside mb-4 space-y-1">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        const text = line.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        elements.push(<p key={index} className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: `${line.match(/^\d+/)[0]}. ${text}` }} />);
      }
      // Regular paragraphs
      else if (line.trim()) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside mb-4 space-y-1">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        const text = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        elements.push(<p key={index} className="text-gray-700 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />);
      }
    });

    // Handle any remaining list items
    if (inList && listItems.length > 0) {
      elements.push(<ul key="final-list" className="list-disc list-inside mb-4 space-y-1">{listItems}</ul>);
    }

    return elements;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
          <div className="p-6">
            {/* Meta */}
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getCategoryColor(
                  blog.category
                )}`}
              >
                {blog.category}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium capitalize bg-gray-100 text-gray-600">
                {blog.difficulty}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            {/* Author & Date */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{blog.author?.name || 'ECHO Team'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{blog.views || 0} views</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {renderContent(blog.content)}
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center flex-wrap gap-2">
                  <Tag className="w-5 h-5 text-gray-400" />
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;
