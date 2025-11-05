import { X, MessageCircle, AlertCircle, Lightbulb, TrendingUp, Award } from 'lucide-react';

/**
 * ReportCardModal component
 * Displays conversation analysis after ending a chat session
 */
const ReportCardModal = ({ isOpen, onClose, reportCard }) => {
  if (!isOpen || !reportCard) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    if (score >= 40) return '💪';
    return '🎯';
  };

  const getGradeLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    if (score >= 50) return 'Needs Improvement';
    return 'Keep Practicing';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="bg-primary-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Report Card</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/80 mt-2">Your conversation performance analysis</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Score Section */}
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-2">{getScoreEmoji(reportCard.fluencyScore)}</div>
            <div className={`text-5xl font-bold ${getScoreColor(reportCard.fluencyScore)}`}>
              {reportCard.fluencyScore}
            </div>
            <p className="text-gray-500 mt-1">Fluency Score</p>
            <p className={`text-lg font-semibold mt-2 ${getScoreColor(reportCard.fluencyScore)}`}>
              {getGradeLabel(reportCard.fluencyScore)}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-600 mb-1">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Messages</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{reportCard.totalMessages}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-orange-600 mb-1">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Grammar Issues</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">
                {reportCard.grammarMistakes?.length || 0}
              </p>
            </div>
          </div>

          {/* Grammar Mistakes */}
          {reportCard.grammarMistakes?.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span>Grammar Corrections</span>
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {reportCard.grammarMistakes.map((mistake, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-red-500 line-through text-sm">
                        {mistake.original}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 font-medium text-sm">
                        {mistake.correction}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{mistake.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary Suggestions */}
          {reportCard.vocabularySuggestions?.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <span>Vocabulary Suggestions</span>
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {reportCard.vocabularySuggestions.map((suggestion, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                        {suggestion.word}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-primary-600 text-sm">
                        {suggestion.suggestion}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{suggestion.context}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className="bg-primary-50 p-5 rounded-xl">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Feedback</h3>
                <p className="text-gray-600">{reportCard.feedback}</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCardModal;
