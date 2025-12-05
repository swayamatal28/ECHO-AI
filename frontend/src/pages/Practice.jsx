import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, Loader, ChevronRight, Target, Zap, Award, PenTool } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const diffColors = {
  easy: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  hard: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' },
};

const topicColors = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  teal: 'bg-teal-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  cyan: 'bg-cyan-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
};

const Practice = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/practice/topics');
      setTopics(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch topics:', err);
      setError('Failed to load topics.');
    } finally {
      setLoading(false);
    }
  };

  // Aggregate stats
  const totalQuestions = topics.reduce((s, t) => s + t.total, 0);
  const totalSolved = topics.reduce((s, t) => s + t.solved, 0);
  const totalEasy = topics.reduce((s, t) => s + t.easy, 0);
  const totalMedium = topics.reduce((s, t) => s + t.medium, 0);
  const totalHard = topics.reduce((s, t) => s + t.hard, 0);
  const totalEasySolved = topics.reduce((s, t) => s + t.easySolved, 0);
  const totalMediumSolved = topics.reduce((s, t) => s + t.mediumSolved, 0);
  const totalHardSolved = topics.reduce((s, t) => s + t.hardSolved, 0);
  const progressPercent = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-3" />
          <p className="text-gray-500">Loading practice questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Practice</h1>
        <p className="text-gray-600">Master English grammar, vocabulary, and more — one topic at a time</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">{error}</div>
      )}

      {/* Overall Progress Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Donut chart */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9155" fill="none"
                stroke="#10b981" strokeWidth="3"
                strokeDasharray={`${progressPercent} ${100 - progressPercent}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{totalSolved}</span>
              <span className="text-xs text-gray-500">/ {totalQuestions}</span>
            </div>
          </div>

          {/* Difficulty breakdown */}
          <div className="flex-1 w-full space-y-3">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Overall Progress</h2>
            <DifficultyBar label="Easy" solved={totalEasySolved} total={totalEasy} colors={diffColors.easy} />
            <DifficultyBar label="Medium" solved={totalMediumSolved} total={totalMedium} colors={diffColors.medium} />
            <DifficultyBar label="Hard" solved={totalHardSolved} total={totalHard} colors={diffColors.hard} />
          </div>

          {/* Quick stats */}
          <div className="flex flex-row md:flex-col gap-4">
            <MiniStat icon={<Target className="w-5 h-5" />} value={totalQuestions} label="Total" color="bg-blue-100 text-blue-600" />
            <MiniStat icon={<CheckCircle2 className="w-5 h-5" />} value={totalSolved} label="Solved" color="bg-green-100 text-green-600" />
            <MiniStat icon={<Zap className="w-5 h-5" />} value={topics.filter(t => t.solved === t.total && t.total > 0).length} label="Completed" color="bg-purple-100 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Blog Writing Card */}
      <div
        onClick={() => navigate('/dashboard/practice/blog-writing')}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center">
            <PenTool className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">Blog Writing</h2>
            <p className="text-sm text-gray-500">Get a random topic, write an intro, body & conclusion — AI scores you out of 10</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => {
          const pct = topic.total > 0 ? Math.round((topic.solved / topic.total) * 100) : 0;
          const isComplete = topic.solved === topic.total && topic.total > 0;

          return (
            <div
              key={topic.slug}
              onClick={() => navigate(`/dashboard/practice/${topic.slug}`)}
              className={`bg-white rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
                isComplete ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'
              }`}
            >
              <div className="p-5 flex items-center gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${topicColors[topic.color] || 'bg-gray-500'} flex items-center justify-center text-white text-xl flex-shrink-0`}>
                  {topic.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{topic.name}</h3>
                    {isComplete && <Award className="w-4 h-4 text-green-500 flex-shrink-0" />}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-primary-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{topic.solved}/{topic.total} solved</span>
                    <span className="text-green-600">{topic.easySolved}/{topic.easy} Easy</span>
                    <span className="text-yellow-600">{topic.mediumSolved}/{topic.medium} Med</span>
                    <span className="text-red-600">{topic.hardSolved}/{topic.hard} Hard</span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Difficulty progress bar */
const DifficultyBar = ({ label, solved, total, colors }) => (
  <div className="flex items-center gap-3">
    <span className={`text-xs font-semibold w-16 ${colors.text}`}>{label}</span>
    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${colors.bar} transition-all`}
        style={{ width: total > 0 ? `${(solved / total) * 100}%` : '0%' }}
      />
    </div>
    <span className="text-xs text-gray-500 w-14 text-right">{solved}/{total}</span>
  </div>
);

/** Mini stat chip */
const MiniStat = ({ icon, value, label, color }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${color}`}>
    {icon}
    <div className="leading-tight">
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[10px] opacity-70">{label}</p>
    </div>
  </div>
);

export default Practice;
