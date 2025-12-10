const User = require('../models/User');
const Conversation = require('../models/Conversation');

const getISTNow = () => {
  const now = new Date();
  const istMs = now.getTime() + (5.5 * 60 * 60 * 1000);
  return new Date(istMs);
};

const toISTDateStr = (date) => {
  // date is already shifted to IST
  return date.toISOString().split('T')[0];
};

const computeStreaks = (days) => {
  if (!days || days.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }

  // Sort chronologically
  const sorted = [...days].sort();
  const dateSet = new Set(sorted);

  let maxStreak = 1;
  let currentStreak = 0;
  let streak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else if (diffDays > 1) {
      streak = 1;
    }
    // diffDays === 0 means duplicate date, skip
  }

  if (sorted.length === 1) maxStreak = 1;

  // Current streak: count backwards from today (IST)
  const istNow = getISTNow();
  const todayStr = toISTDateStr(istNow);
  const yesterdayIST = new Date(istNow.getTime() - 86400000);
  const yesterdayStr = toISTDateStr(yesterdayIST);

  // Start checking from today or yesterday
  let checkDate;
  if (dateSet.has(todayStr)) {
    checkDate = new Date(todayStr + 'T00:00:00Z');
  } else if (dateSet.has(yesterdayStr)) {
    checkDate = new Date(yesterdayStr + 'T00:00:00Z');
  } else {
    return { currentStreak: 0, maxStreak };
  }

  currentStreak = 0;
  while (dateSet.has(checkDate.toISOString().split('T')[0])) {
    currentStreak++;
    checkDate = new Date(checkDate.getTime() - 86400000);
  }

  return { currentStreak, maxStreak };
};

const getProfileStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with activity data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get conversation stats
    const totalConversations = await Conversation.countDocuments({ user: userId });
    const completedConversations = await Conversation.countDocuments({
      user: userId,
      isActive: false,
    });

    // Get conversations with report cards for average score
    const conversationsWithReports = await Conversation.find({
      user: userId,
      isActive: false,
      'reportCard.fluencyScore': { $gt: 0 },
    }).select('reportCard.fluencyScore');

    let avgFluencyScore = 0;
    if (conversationsWithReports.length > 0) {
      const total = conversationsWithReports.reduce(
        (sum, c) => sum + (c.reportCard?.fluencyScore || 0),
        0
      );
      avgFluencyScore = Math.round(total / conversationsWithReports.length);
    }

    // Count total messages sent by user
    const allConversations = await Conversation.find({ user: userId }).select('messages');
    let totalMessagesSent = 0;
    allConversations.forEach((conv) => {
      totalMessagesSent += conv.messages.filter((m) => m.role === 'user').length;
    });

    // Activity data
    const activityDays = user.activityDays || [];
    const { currentStreak, maxStreak } = computeStreaks(activityDays);

    // Build heatmap data: last 365 days (IST) → count per day (1 or 0)
    const heatmapData = {};
    const daySet = new Set(activityDays);
    const istNow = getISTNow();

    for (let i = 364; i >= 0; i--) {
      const d = new Date(istNow);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      heatmapData[key] = daySet.has(key) ? 1 : 0;
    }

    // Determine level based on stats
    let level = 'Beginner';
    if (totalMessagesSent > 200 || completedConversations > 20) level = 'Advanced';
    else if (totalMessagesSent > 50 || completedConversations > 5) level = 'Intermediate';

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          joinedDate: user.joinedDate,
        },
        stats: {
          totalDaysActive: activityDays.length,
          currentStreak,
          maxStreak,
          totalConversations,
          completedConversations,
          totalMessagesSent,
          avgFluencyScore,
          level,
        },
        heatmap: heatmapData,
      },
    });
  } catch (error) {
    console.error('Profile stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile stats',
      error: error.message,
    });
  }
};

module.exports = { getProfileStats };
