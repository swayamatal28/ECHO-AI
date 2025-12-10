const User = require('../models/User');

const getTodayIST = () => {
  const now = new Date();
  // Shift UTC time by +5:30 to get IST
  const istMs = now.getTime() + (5.5 * 60 * 60 * 1000);
  const istDate = new Date(istMs);
  return istDate.toISOString().split('T')[0];
};

const trackActivity = async (req, res, next) => {
  try {
    if (req.user) {
      const today = getTodayIST(); // "YYYY-MM-DD" in IST

      // Only update if today is not already recorded
      if (!req.user.activityDays || !req.user.activityDays.includes(today)) {
        await User.findByIdAndUpdate(req.user._id, {
          $addToSet: { activityDays: today }
        });
      }
    }
  } catch (err) {
    // Don't block the request if tracking fails
    console.error('Activity tracking error:', err.message);
  }

  next();
};

module.exports = { trackActivity };
