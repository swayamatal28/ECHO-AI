const Contest = require('../models/Contest');
const ContestSubmission = require('../models/ContestSubmission');
const User = require('../models/User');
const { contests: seedContests, discussions: seedDiscussions } = require('../data/contestData');

const getISTNow = () => {
  const now = new Date();
  const istMs = now.getTime() + (5.5 * 60 * 60 * 1000);
  return new Date(istMs);
};

const getSundayDate = (offsetWeeks = 0) => {
  const ist = getISTNow();
  const day = ist.getUTCDay(); // 0=Sun
  const diffToSunday = day === 0 ? 0 : 7 - day;
  const sunday = new Date(ist);
  sunday.setUTCDate(sunday.getUTCDate() + diffToSunday + (offsetWeeks * 7));
  const y = sunday.getUTCFullYear();
  const m = String(sunday.getUTCMonth() + 1).padStart(2, '0');
  const d = String(sunday.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const ensureContestsSeeded = async () => {
  const count = await Contest.countDocuments();
  if (count > 0) return;

  // Place contest 20 = the most recent past Sunday, contest 19 = the one before, etc.
  // Then future contests continue forward
  const ist = getISTNow();
  const dayOfWeek = ist.getUTCDay();
  // Most recent Sunday
  const lastSunday = new Date(ist);
  if (dayOfWeek !== 0) {
    lastSunday.setUTCDate(lastSunday.getUTCDate() - dayOfWeek);
  }

  // Contest 20 = last Sunday that already occurred, working backwards
  const docs = [];
  for (let i = 0; i < seedContests.length; i++) {
    const c = seedContests[i];
    const contestDate = new Date(lastSunday);
    // Contest 20 (index 19) → lastSunday, Contest 19 (index 18) → lastSunday - 7, etc.
    const weeksBack = seedContests.length - 1 - i;
    contestDate.setUTCDate(contestDate.getUTCDate() - weeksBack * 7);

    const y = contestDate.getUTCFullYear();
    const m = String(contestDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(contestDate.getUTCDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    docs.push({
      contestNumber: c.contestNumber,
      title: c.title,
      date: dateStr,
      startTimeIST: '20:00',
      durationMinutes: 70,
      grammarQuestions: c.grammarQuestions,
      speakingTopic: c.speakingTopic,
      readingParagraph: c.readingParagraph,
      participantCount: Math.floor(Math.random() * 50) + 10,
      status: 'completed',
    });
  }

  await Contest.insertMany(docs);
  console.log(`Seeded ${docs.length} contests`);
};

const getContestStatus = (dateStr) => {
  const ist = getISTNow();
  const todayStr = `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, '0')}-${String(ist.getUTCDate()).padStart(2, '0')}`;
  const currentHour = ist.getUTCHours();
  const currentMin = ist.getUTCMinutes();
  const currentTimeMin = currentHour * 60 + currentMin;

  if (dateStr < todayStr) return 'completed';
  if (dateStr > todayStr) return 'upcoming';

  // It's today (Sunday)
  const startMin = 20 * 60; // 8:00 PM = 1200 min
  const endMin = startMin + 70; // 9:10 PM = 1270 min
  if (currentTimeMin >= startMin && currentTimeMin < endMin) return 'live';
  if (currentTimeMin >= endMin) return 'completed';
  return 'upcoming';
};

const getContests = async (req, res) => {
  try {
    await ensureContestsSeeded();

    const allContests = await Contest.find()
      .select('-grammarQuestions.answer -grammarQuestions.explanation')
      .sort({ date: -1 });

    const userId = req.user._id;
    const submissions = await ContestSubmission.find({ user: userId }).select('contest totalScore ratingChange');
    const subMap = {};
    submissions.forEach(s => { subMap[s.contest.toString()] = s; });

    // Get next upcoming Sunday for "next contest"
    const ist = getISTNow();
    const dayOfWeek = ist.getUTCDay();
    const nextSunday = new Date(ist);
    if (dayOfWeek === 0) {
      const currentHour = ist.getUTCHours();
      if (currentHour >= 21 || (currentHour === 21 && ist.getUTCMinutes() >= 10)) {
        nextSunday.setUTCDate(nextSunday.getUTCDate() + 7);
      }
    } else {
      nextSunday.setUTCDate(nextSunday.getUTCDate() + (7 - dayOfWeek));
    }
    const nextSundayStr = `${nextSunday.getUTCFullYear()}-${String(nextSunday.getUTCMonth() + 1).padStart(2, '0')}-${String(nextSunday.getUTCDate()).padStart(2, '0')}`;

    const contestsData = allContests.map(c => {
      const status = getContestStatus(c.date);
      const sub = subMap[c._id.toString()];
      return {
        _id: c._id,
        contestNumber: c.contestNumber,
        title: c.title,
        date: c.date,
        startTimeIST: c.startTimeIST,
        durationMinutes: c.durationMinutes,
        participantCount: c.participantCount,
        status,
        userSubmitted: !!sub,
        userScore: sub ? sub.totalScore : null,
        userRatingChange: sub ? sub.ratingChange : null,
      };
    });

    // Find or create the next contest entry
    let nextContest = contestsData.find(c => c.date === nextSundayStr);
    if (!nextContest) {
      // Auto-generate next contest
      const maxNum = allContests.length > 0 ? Math.max(...allContests.map(c => c.contestNumber)) : 0;
      const nextNum = maxNum + 1;
      // Reuse questions from a cycled contest
      const cycled = seedContests[(nextNum - 1) % seedContests.length];
      const newContest = await Contest.create({
        contestNumber: nextNum,
        title: `ECHO Weekly Contest #${nextNum}`,
        date: nextSundayStr,
        startTimeIST: '20:00',
        durationMinutes: 70,
        grammarQuestions: cycled.grammarQuestions,
        speakingTopic: cycled.speakingTopic,
        readingParagraph: cycled.readingParagraph,
        status: 'upcoming',
      });
      contestsData.unshift({
        _id: newContest._id,
        contestNumber: nextNum,
        title: newContest.title,
        date: nextSundayStr,
        startTimeIST: '20:00',
        durationMinutes: 70,
        participantCount: 0,
        status: 'upcoming',
        userSubmitted: false,
        userScore: null,
        userRatingChange: null,
      });
    }

    res.json({ success: true, data: contestsData });
  } catch (error) {
    console.error('Get contests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contests', error: error.message });
  }
};

const getContest = async (req, res) => {
  try {
    await ensureContestsSeeded();
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    const status = getContestStatus(contest.date);
    const userId = req.user._id;
    const existing = await ContestSubmission.findOne({ user: userId, contest: contest._id });

    // Don't send answers unless contest is completed and user has submitted
    const grammarQs = contest.grammarQuestions.map((q, idx) => ({
      index: idx,
      question: q.question,
      options: q.options,
      ...(status === 'completed' ? { answer: q.answer, explanation: q.explanation } : {}),
    }));

    res.json({
      success: true,
      data: {
        _id: contest._id,
        contestNumber: contest.contestNumber,
        title: contest.title,
        date: contest.date,
        startTimeIST: contest.startTimeIST,
        durationMinutes: contest.durationMinutes,
        grammarQuestions: grammarQs,
        speakingTopic: contest.speakingTopic,
        readingParagraph: contest.readingParagraph,
        status,
        userSubmitted: !!existing,
        existingSubmission: existing || null,
      },
    });
  } catch (error) {
    console.error('Get contest error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contest', error: error.message });
  }
};

const submitContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.user._id;
    const { grammarAnswers, speakingTranscript, readingTranscript } = req.body;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    // Check if already submitted
    const existing = await ContestSubmission.findOne({ user: userId, contest: contestId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted this contest' });
    }

    // Grade grammar section (each correct = 1 point, max 10)
    let grammarScore = 0;
    const gradedGrammar = [];
    if (grammarAnswers && Array.isArray(grammarAnswers)) {
      grammarAnswers.forEach((ga, idx) => {
        const correct = contest.grammarQuestions[idx];
        const isCorrect = correct && ga.selectedAnswer &&
          ga.selectedAnswer.trim().toLowerCase() === correct.answer.trim().toLowerCase();
        if (isCorrect) grammarScore++;
        gradedGrammar.push({
          questionIndex: idx,
          selectedAnswer: ga.selectedAnswer || '',
          isCorrect: !!isCorrect,
        });
      });
    }

    // Speaking score: based on transcript length and content (simplified scoring)
    let speakingScore = 0;
    let speakingFeedback = '';
    if (speakingTranscript && speakingTranscript.trim().length > 0) {
      const wordCount = speakingTranscript.trim().split(/\s+/).length;
      if (wordCount >= 50) speakingScore = 85 + Math.min(15, Math.floor((wordCount - 50) / 5));
      else if (wordCount >= 30) speakingScore = 65 + Math.floor((wordCount - 30) / 2);
      else if (wordCount >= 10) speakingScore = 40 + wordCount;
      else speakingScore = wordCount * 4;
      speakingScore = Math.min(100, speakingScore);
      speakingFeedback = wordCount >= 50 ? 'Excellent speech! Good length and detail.' :
        wordCount >= 30 ? 'Good effort! Try to elaborate more for a higher score.' :
        'Try to speak more. Aim for at least 30 seconds of speaking.';
    }

    // Reading score: based on transcript matching the paragraph
    let readingScore = 0;
    let readingFeedback = '';
    if (readingTranscript && readingTranscript.trim().length > 0) {
      const originalWords = contest.readingParagraph.text.toLowerCase().split(/\s+/);
      const spokenWords = readingTranscript.trim().toLowerCase().split(/\s+/);
      let matchCount = 0;
      const origSet = new Set(originalWords);
      spokenWords.forEach(w => {
        if (origSet.has(w)) matchCount++;
      });
      const accuracy = originalWords.length > 0 ? (matchCount / originalWords.length) * 100 : 0;
      readingScore = Math.min(100, Math.round(accuracy));
      readingFeedback = readingScore >= 80 ? 'Great reading! Clear and accurate pronunciation.' :
        readingScore >= 50 ? 'Good attempt! Practice reading aloud to improve accuracy.' :
        'Keep practicing! Try to read the paragraph more carefully.';
    }

    // Total score: grammar (scaled to 100) + speaking + reading = max 300
    const totalScore = (grammarScore * 10) + speakingScore + readingScore;

    // Calculate rating change
    const user = await User.findById(userId);
    const currentRating = user.contestRating || 1000;
    let ratingChange = 0;

    // Rating change based on performance (totalScore out of 300)
    const performanceRatio = totalScore / 300;
    if (performanceRatio >= 0.9) ratingChange = Math.floor(30 + Math.random() * 15);
    else if (performanceRatio >= 0.75) ratingChange = Math.floor(15 + Math.random() * 15);
    else if (performanceRatio >= 0.5) ratingChange = Math.floor(5 + Math.random() * 10);
    else if (performanceRatio >= 0.3) ratingChange = Math.floor(-5 - Math.random() * 10);
    else ratingChange = Math.floor(-15 - Math.random() * 15);

    // Higher-rated players get less/lose more
    if (currentRating > 1500) ratingChange -= Math.floor((currentRating - 1500) / 200);
    if (currentRating < 1000) ratingChange += Math.floor((1000 - currentRating) / 200);

    const newRating = Math.max(500, currentRating + ratingChange);

    // Create submission
    const submission = await ContestSubmission.create({
      user: userId,
      contest: contestId,
      contestNumber: contest.contestNumber,
      grammarAnswers: gradedGrammar,
      grammarScore,
      speakingCompleted: speakingScore > 0,
      speakingTranscript: speakingTranscript || '',
      speakingScore,
      speakingFeedback,
      readingCompleted: readingScore > 0,
      readingTranscript: readingTranscript || '',
      readingScore,
      readingFeedback,
      totalScore,
      ratingChange,
    });

    // Update user
    await User.findByIdAndUpdate(userId, {
      contestRating: newRating,
      $inc: { contestsAttended: 1 },
      $push: {
        ratingHistory: {
          contestNumber: contest.contestNumber,
          rating: newRating,
          ratingChange,
          date: contest.date,
        },
      },
    });

    // Update contest participant count
    await Contest.findByIdAndUpdate(contestId, { $inc: { participantCount: 1 } });

    res.json({
      success: true,
      data: {
        grammarScore,
        speakingScore,
        speakingFeedback,
        readingScore,
        readingFeedback,
        totalScore,
        ratingChange,
        newRating,
        submission,
      },
    });
  } catch (error) {
    console.error('Submit contest error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit contest', error: error.message });
  }
};

const getDiscussions = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    // Return hardcoded discussions for this contest number
    const contestDiscussions = seedDiscussions.filter(d => d.contestNumber === contest.contestNumber);

    res.json({
      success: true,
      data: contestDiscussions,
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch discussions', error: error.message });
  }
};

const getContestStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('contestRating contestsAttended ratingHistory');

    const submissions = await ContestSubmission.find({ user: userId })
      .sort({ contestNumber: 1 })
      .select('contestNumber grammarScore speakingScore readingScore totalScore ratingChange');

    // Determine tier
    const rating = user.contestRating || 1000;
    let tier = 'Unranked';
    let tierColor = 'gray';
    if (rating >= 2500) { tier = 'Dracarys'; tierColor = 'red'; }
    else if (rating >= 2000) { tier = 'Targaryen'; tierColor = 'purple'; }
    else if (rating >= 1700) { tier = 'Lannister'; tierColor = 'yellow'; }
    else if (rating >= 1500) { tier = 'Stark'; tierColor = 'blue'; }
    else if (rating >= 1250) { tier = 'Baratheon'; tierColor = 'amber'; }

    res.json({
      success: true,
      data: {
        contestRating: rating,
        contestsAttended: user.contestsAttended || 0,
        tier,
        tierColor,
        ratingHistory: user.ratingHistory || [],
        submissions,
      },
    });
  } catch (error) {
    console.error('Get contest stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contest stats', error: error.message });
  }
};

module.exports = {
  getContests,
  getContest,
  submitContest,
  getDiscussions,
  getContestStats,
};
