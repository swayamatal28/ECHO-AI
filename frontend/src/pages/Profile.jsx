import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import {
  User,
  Calendar,
  Flame,
  Trophy,
  MessageSquare,
  Target,
  Award,
  TrendingUp,
  BarChart3,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Swords,
  TrendingDown,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Profile page with activity heatmap and stats
 * Inspired by Codeforces / LeetCode / GitHub contribution graphs
 */
const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [practiceStats, setPracticeStats] = useState(null);
  const [contestStats, setContestStats] = useState(null);

  useEffect(() => {
    fetchProfileStats();
    fetchPracticeStats();
    fetchContestStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/profile/stats');
      const { stats: s, heatmap: h } = response.data.data;
      setStats(s);
      setHeatmap(h);
    } catch (err) {
      console.error('Failed to fetch profile stats:', err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPracticeStats = async () => {
    try {
      const res = await axiosInstance.get('/practice/stats');
      setPracticeStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch practice stats:', err);
    }
  };

  const fetchContestStats = async () => {
    try {
      const res = await axiosInstance.get('/contests/stats');
      setContestStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch contest stats:', err);
    }
  };

  /**
   * Get current date in IST (UTC+5:30)
   * Ensures the heatmap day boundary is 12:00 AM IST
   */
  const getISTToday = () => {
    const now = new Date();
    // Shift to IST: add 5h30m to UTC
    const istMs = now.getTime() + (5.5 * 60 * 60 * 1000);
    const istDate = new Date(istMs);
    // Extract year/month/day from the IST-shifted date
    const year = istDate.getUTCFullYear();
    const month = istDate.getUTCMonth();
    const day = istDate.getUTCDate();
    // Return a local Date with those values (for grid computation only)
    return new Date(year, month, day);
  };

  /**
   * Build the heatmap grid data
   * Exactly 365 days: from (today - 364) to today (IST)
   * First column starts on a Sunday, last column ends on today
   * Month labels placed at the correct week column
   */
  const heatmapGrid = useMemo(() => {
    // End date is today in IST
    const today = getISTToday();
    today.setHours(0, 0, 0, 0);

    // Start date is 364 days ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // Grid starts on the Sunday on or before startDate
    const gridStart = new Date(startDate);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const daySet = new Set(Object.keys(heatmap).filter(k => heatmap[k] === 1));
    const weeks = [];
    let currentWeek = [];
    const monthLabels = [];
    let lastMonth = -1;
    let currentDate = new Date(gridStart);

    // Helper to format local date as YYYY-MM-DD without UTC conversion
    const fmtDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    while (currentDate <= today) {
      const dateStr = fmtDate(currentDate);
      const dayOfWeek = currentDate.getDay();

      // Start a new week column on every Sunday (except the very first)
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      // Detect month boundaries → label at the week where the 1st appears
      const month = currentDate.getMonth();
      if (month !== lastMonth && currentDate >= startDate) {
        monthLabels.push({
          weekIndex: weeks.length,
          month: currentDate.toLocaleString('default', { month: 'short' }),
        });
        lastMonth = month;
      }

      const isBeforeRange = currentDate < startDate;
      const isActive = daySet.has(dateStr) && !isBeforeRange;

      currentWeek.push({
        date: dateStr,
        active: isActive,
        isFuture: false,
        isBeforeRange,
        dayOfWeek,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Push the last (possibly incomplete) week
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, months: monthLabels };
  }, [heatmap]);

  /**
   * Get color for heatmap cell
   */
  const getCellColor = (day) => {
    if (day.isBeforeRange || day.isFuture) return 'bg-transparent';
    if (day.active) return 'bg-green-500 hover:bg-green-400';
    return 'bg-gray-200 hover:bg-gray-300';
  };

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-primary-600 h-32"></div>
          <div className="px-8 pb-8 relative">
            <div className="-mt-12 mb-4">
              <div className="w-24 h-24 bg-primary-600 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-400 mt-1">
                Joined {user?.joinedDate
                  ? new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Flame className="w-6 h-6" />}
              label="Current Streak"
              value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}`}
              color="bg-orange-500"
              highlight={stats.currentStreak > 0}
            />
            <StatCard
              icon={<Trophy className="w-6 h-6" />}
              label="Max Streak"
              value={`${stats.maxStreak} day${stats.maxStreak !== 1 ? 's' : ''}`}
              color="bg-yellow-500"
            />
            <StatCard
              icon={<Calendar className="w-6 h-6" />}
              label="Days Active"
              value={stats.totalDaysActive}
              color="bg-green-500"
            />
            <StatCard
              icon={<Award className="w-6 h-6" />}
              label="Level"
              value={stats.level}
              color="bg-purple-500"
            />
            <StatCard
              icon={<MessageSquare className="w-6 h-6" />}
              label="Conversations"
              value={stats.totalConversations}
              color="bg-blue-500"
            />
            <StatCard
              icon={<Target className="w-6 h-6" />}
              label="Completed"
              value={stats.completedConversations}
              color="bg-teal-500"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Messages Sent"
              value={stats.totalMessagesSent}
              color="bg-indigo-500"
            />
            <StatCard
              icon={<BarChart3 className="w-6 h-6" />}
              label="Avg Fluency"
              value={stats.avgFluencyScore > 0 ? `${stats.avgFluencyScore}%` : 'N/A'}
              color="bg-pink-500"
            />
          </div>
        )}

        {/* Heatmap */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <span>{stats?.totalDaysActive || 0} active days in the past year</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Activity tracked from conversations and app usage
              </p>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Month Labels — positioned by week index */}
              <div className="flex mb-2" style={{ paddingLeft: '36px' }}>
                {heatmapGrid.months?.map((m, i) => {
                  const nextWeekIdx = i < heatmapGrid.months.length - 1
                    ? heatmapGrid.months[i + 1].weekIndex
                    : heatmapGrid.weeks.length;
                  const span = nextWeekIdx - m.weekIndex;
                  return (
                    <div
                      key={i}
                      className="text-xs text-gray-400 font-medium"
                      style={{ width: `${span * 14}px`, flexShrink: 0 }}
                    >
                      {m.month}
                    </div>
                  );
                })}
              </div>

              {/* Grid */}
              <div className="flex">
                {/* Day-of-week labels */}
                <div className="flex flex-col mr-2 mt-0">
                  {dayLabels.map((label, i) => (
                    <div key={i} className="h-[14px] flex items-center justify-end pr-1" style={{ marginBottom: '2px' }}>
                      <span className="text-[10px] text-gray-400 leading-none">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Weeks */}
                <div className="flex gap-[2px]">
                  {heatmapGrid.weeks?.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-[2px]">
                      {week.map((day, dayIdx) => (
                        <div
                          key={day.date}
                          className={`w-[12px] h-[14px] rounded-[2px] transition-colors cursor-pointer ${getCellColor(day)}`}
                          onMouseEnter={(e) => {
                            setHoveredDay(day);
                            const rect = e.target.getBoundingClientRect();
                            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      ))}
                      {/* Pad incomplete weeks */}
                      {week.length < 7 && Array(7 - week.length).fill(null).map((_, i) => (
                        <div key={`pad-${i}`} className="w-[12px] h-[14px]" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end mt-4 space-x-2">
                <span className="text-xs text-gray-400">Less</span>
                <div className="w-[12px] h-[12px] rounded-[2px] bg-gray-200"></div>
                <div className="w-[12px] h-[12px] rounded-[2px] bg-green-300"></div>
                <div className="w-[12px] h-[12px] rounded-[2px] bg-green-500"></div>
                <span className="text-xs text-gray-400">More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
              <div className="font-semibold">
                {hoveredDay.isBeforeRange ? '' : hoveredDay.active ? '✅ Active' : '⬜ No activity'}
              </div>
              <div className="text-gray-300">{formatDate(hoveredDay.date)}</div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}

        {/* Practice Stats — LeetCode style */}
        {practiceStats && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              <span>Practice Progress</span>
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Donut */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                  {/* Hard arc */}
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#ef4444" strokeWidth="2.5"
                    strokeDasharray={`${practiceStats.totalQuestions > 0 ? (practiceStats.hardSolved / practiceStats.totalQuestions) * 100 : 0} 100`}
                    strokeDashoffset="0"
                  />
                  {/* Medium arc */}
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#eab308" strokeWidth="2.5"
                    strokeDasharray={`${practiceStats.totalQuestions > 0 ? (practiceStats.mediumSolved / practiceStats.totalQuestions) * 100 : 0} 100`}
                    strokeDashoffset={`-${practiceStats.totalQuestions > 0 ? (practiceStats.hardSolved / practiceStats.totalQuestions) * 100 : 0}`}
                  />
                  {/* Easy arc */}
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#22c55e" strokeWidth="2.5"
                    strokeDasharray={`${practiceStats.totalQuestions > 0 ? (practiceStats.easySolved / practiceStats.totalQuestions) * 100 : 0} 100`}
                    strokeDashoffset={`-${practiceStats.totalQuestions > 0 ? ((practiceStats.hardSolved + practiceStats.mediumSolved) / practiceStats.totalQuestions) * 100 : 0}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">{practiceStats.totalSolved}</span>
                  <span className="text-[10px] text-gray-400">/ {practiceStats.totalQuestions}</span>
                  <span className="text-[10px] text-gray-400">Solved</span>
                </div>
              </div>

              {/* Difficulty breakdown */}
              <div className="flex-1 w-full space-y-3">
                <PracticeDiffRow label="Easy" solved={practiceStats.easySolved} total={practiceStats.easyTotal} color="text-green-600" bg="bg-green-500" bgLight="bg-green-100" />
                <PracticeDiffRow label="Medium" solved={practiceStats.mediumSolved} total={practiceStats.mediumTotal} color="text-yellow-600" bg="bg-yellow-500" bgLight="bg-yellow-100" />
                <PracticeDiffRow label="Hard" solved={practiceStats.hardSolved} total={practiceStats.hardTotal} color="text-red-600" bg="bg-red-500" bgLight="bg-red-100" />
              </div>
            </div>

            {/* Topic badges */}
            {practiceStats.topicStats && Object.keys(practiceStats.topicStats).length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(practiceStats.topicStats).map(([slug, ts]) => {
                    const pct = ts.total > 0 ? Math.round((ts.solved / ts.total) * 100) : 0;
                    const isComplete = ts.solved === ts.total && ts.total > 0;
                    return (
                      <div
                        key={slug}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isComplete
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : ts.solved > 0
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                      >
                        <span>{ts.icon}</span>
                        <span>{ts.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isComplete ? 'bg-green-200 text-green-800' : 'bg-white/60 text-gray-500'
                        }`}>
                          {ts.solved}/{ts.total}
                        </span>
                        {isComplete && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contest Stats */}
        {contestStats && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center space-x-2">
              <Swords className="w-5 h-5 text-primary-500" />
              <span>Contest Rating</span>
            </h2>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Rating & Tier Card */}
              <div className="flex flex-col items-center gap-3 min-w-[180px]">
                <div className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center shadow-inner ${
                  contestStats.tier === 'Dracarys' ? 'bg-red-100' :
                  contestStats.tier === 'Targaryen' ? 'bg-purple-100' :
                  contestStats.tier === 'Lannister' ? 'bg-yellow-100' :
                  contestStats.tier === 'Stark' ? 'bg-blue-100' :
                  contestStats.tier === 'Baratheon' ? 'bg-amber-100' : 'bg-gray-100'
                }`}>
                  <span className="text-3xl font-bold text-gray-900">{contestStats.contestRating}</span>
                  <span className="text-[10px] text-gray-400 font-medium">RATING</span>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                  contestStats.tier === 'Dracarys' ? 'bg-red-50 border-red-200 text-red-700' :
                  contestStats.tier === 'Targaryen' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                  contestStats.tier === 'Lannister' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                  contestStats.tier === 'Stark' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                  contestStats.tier === 'Baratheon' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  {contestStats.tier === 'Dracarys' ? '🔥' :
                   contestStats.tier === 'Targaryen' ? '🐉' :
                   contestStats.tier === 'Lannister' ? '🦁' :
                   contestStats.tier === 'Stark' ? '🐺' :
                   contestStats.tier === 'Baratheon' ? '⚔️' : '⚪'}
                  {contestStats.tier}
                </div>
                <p className="text-xs text-gray-400">{contestStats.contestsAttended} contests attended</p>
              </div>

              {/* Rating Graph */}
              <div className="flex-1">
                {contestStats.ratingHistory && contestStats.ratingHistory.length > 0 ? (
                  <div>
                    <p className="text-xs text-gray-400 mb-2 font-medium">Rating Over Contests</p>
                    <RatingGraph history={contestStats.ratingHistory} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    <div className="text-center">
                      <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>Attend contests to see your rating graph</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tier Progress */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-1 justify-center">
                {[
                  { name: 'Baratheon', min: 1250, color: 'bg-amber-400' },
                  { name: 'Stark', min: 1500, color: 'bg-blue-400' },
                  { name: 'Lannister', min: 1700, color: 'bg-yellow-400' },
                  { name: 'Targaryen', min: 2000, color: 'bg-purple-400' },
                  { name: 'Dracarys', min: 2500, color: 'bg-red-400' },
                ].map((t, i) => {
                  const reached = contestStats.contestRating >= t.min;
                  return (
                    <div key={t.name} className="flex items-center gap-1">
                      {i > 0 && <div className={`w-6 h-0.5 ${reached ? t.color : 'bg-gray-200'}`} />}
                      <div className={`w-2.5 h-2.5 rounded-full ${reached ? t.color : 'bg-gray-200'}`} title={`${t.name} (${t.min}+)`} />
                      <span className={`text-[9px] font-medium ${reached ? 'text-gray-600' : 'text-gray-300'}`}>
                        {t.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Streak Banner */}
        {stats && stats.currentStreak > 0 && (
          <div className="bg-orange-500 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Flame className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  🔥 {stats.currentStreak} Day Streak!
                </h3>
                <p className="text-white/80 mt-1">
                  {stats.currentStreak >= stats.maxStreak
                    ? "You're at your all-time best! Keep going!"
                    : `Your best is ${stats.maxStreak} days. Keep pushing!`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Milestones */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Milestones</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MilestoneItem
                label="First Conversation"
                achieved={stats.totalConversations >= 1}
                description="Start your first AI conversation"
              />
              <MilestoneItem
                label="5 Day Streak"
                achieved={stats.maxStreak >= 5}
                description="Be active 5 days in a row"
              />
              <MilestoneItem
                label="10 Conversations"
                achieved={stats.totalConversations >= 10}
                description="Complete 10 conversations"
              />
              <MilestoneItem
                label="Week Warrior"
                achieved={stats.maxStreak >= 7}
                description="Maintain a 7-day streak"
              />
              <MilestoneItem
                label="100 Messages"
                achieved={stats.totalMessagesSent >= 100}
                description="Send 100 messages total"
              />
              <MilestoneItem
                label="30 Day Legend"
                achieved={stats.maxStreak >= 30}
                description="Maintain a 30-day streak"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Stat Card component
 */
const StatCard = ({ icon, label, value, color, highlight }) => (
  <div className={`bg-white rounded-xl p-5 shadow-sm border ${highlight ? 'border-orange-200 ring-2 ring-orange-100' : 'border-gray-100'} transition-all hover:shadow-md`}>
    <div className="flex items-center space-x-3">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-white flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  </div>
);

/**
 * Practice difficulty row (for profile)
 */
const PracticeDiffRow = ({ label, solved, total, color, bg, bgLight }) => (
  <div className="flex items-center gap-3">
    <span className={`text-xs font-bold w-16 ${color}`}>{label}</span>
    <div className={`flex-1 ${bgLight} rounded-full h-2.5`}>
      <div className={`h-2.5 rounded-full ${bg} transition-all`} style={{ width: total > 0 ? `${(solved / total) * 100}%` : '0%' }} />
    </div>
    <span className="text-xs text-gray-500 font-medium w-14 text-right">{solved}/{total}</span>
  </div>
);

/**
 * Milestone Item component
 */
const MilestoneItem = ({ label, achieved, description }) => (
  <div className={`flex items-center space-x-3 p-4 rounded-xl border ${achieved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${achieved ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
      {achieved ? '✓' : '🔒'}
    </div>
    <div>
      <p className={`text-sm font-semibold ${achieved ? 'text-green-700' : 'text-gray-500'}`}>{label}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  </div>
);

/**
 * Rating Graph component (SVG line chart)
 */
const RatingGraph = ({ history }) => {
  if (!history || history.length === 0) return null;

  const W = 500, H = 140, PAD = 30;
  const ratings = history.map(h => h.rating);
  const minR = Math.min(...ratings, 800);
  const maxR = Math.max(...ratings, 1200);
  const range = maxR - minR || 100;

  const points = history.map((h, i) => {
    const x = PAD + (i / Math.max(history.length - 1, 1)) * (W - PAD * 2);
    const y = H - PAD - ((h.rating - minR) / range) * (H - PAD * 2);
    return { x, y, ...h };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Tier thresholds
  const tiers = [
    { min: 1250, color: '#f59e0b', label: 'Baratheon' },
    { min: 1500, color: '#3b82f6', label: 'Stark' },
    { min: 1700, color: '#eab308', label: 'Lannister' },
    { min: 2000, color: '#8b5cf6', label: 'Targaryen' },
    { min: 2500, color: '#ef4444', label: 'Dracarys' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36" preserveAspectRatio="xMidYMid meet">
      {/* Tier lines */}
      {tiers.map(t => {
        if (t.min < minR || t.min > maxR) return null;
        const y = H - PAD - ((t.min - minR) / range) * (H - PAD * 2);
        return (
          <g key={t.label}>
            <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke={t.color} strokeWidth="0.5" strokeDasharray="4,4" opacity="0.5" />
            <text x={W - PAD + 4} y={y + 3} fontSize="7" fill={t.color} fontWeight="600">{t.min}</text>
          </g>
        );
      })}
      {/* Y axis labels */}
      <text x={PAD - 4} y={PAD + 3} fontSize="8" fill="#9ca3af" textAnchor="end">{maxR}</text>
      <text x={PAD - 4} y={H - PAD + 3} fontSize="8" fill="#9ca3af" textAnchor="end">{minR}</text>
      {/* Line */}
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#6366f1" stroke="white" strokeWidth="1.5" />
          {(i === 0 || i === points.length - 1 || history.length <= 8) && (
            <text x={p.x} y={H - PAD + 14} fontSize="7" fill="#9ca3af" textAnchor="middle">#{p.contestNumber}</text>
          )}
        </g>
      ))}
    </svg>
  );
};

export default Profile;
