const Question = require('../models/Question');
const User = require('../models/User');
const { topics, questions: seedQuestions } = require('../data/practiceQuestions');

const ensureQuestionsSeeded = async () => {
  const count = await Question.countDocuments();
  if (count === 0) {
    await Question.insertMany(seedQuestions);
    console.log(`Seeded ${seedQuestions.length} practice questions`);
  }
};

const getTopics = async (req, res) => {
  try {
    await ensureQuestionsSeeded();

    const userId = req.user._id;
    const user = await User.findById(userId);
    const solvedSet = new Set((user.solvedQuestions || []).map(id => id.toString()));

    // Build topic data with counts
    const topicData = [];

    for (const topic of topics) {
      const allQuestions = await Question.find({ topicSlug: topic.slug }).select('_id difficulty type');

      const total = allQuestions.length;
      let solved = 0;
      let easy = 0, medium = 0, hard = 0;
      let easySolved = 0, mediumSolved = 0, hardSolved = 0;
      let mcqCount = 0, sentenceCount = 0;

      allQuestions.forEach(q => {
        const isSolved = solvedSet.has(q._id.toString());
        if (q.difficulty === 'Easy') { easy++; if (isSolved) easySolved++; }
        else if (q.difficulty === 'Medium') { medium++; if (isSolved) mediumSolved++; }
        else { hard++; if (isSolved) hardSolved++; }
        if (isSolved) solved++;
        if (q.type === 'mcq') mcqCount++;
        else sentenceCount++;
      });

      topicData.push({
        ...topic,
        total,
        solved,
        easy, medium, hard,
        easySolved, mediumSolved, hardSolved,
        mcqCount, sentenceCount,
      });
    }

    res.json({ success: true, data: topicData });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch topics', error: error.message });
  }
};

const getTopicQuestions = async (req, res) => {
  try {
    await ensureQuestionsSeeded();

    const { slug } = req.params;
    const userId = req.user._id;

    const topic = topics.find(t => t.slug === slug);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const allQuestions = await Question.find({ topicSlug: slug }).sort({ difficulty: 1, type: 1 });
    const user = await User.findById(userId);
    const solvedSet = new Set((user.solvedQuestions || []).map(id => id.toString()));

    // Attach solved status, but DO NOT send answers to client
    const questionsForClient = allQuestions.map(q => ({
      _id: q._id,
      type: q.type,
      topic: q.topic,
      topicSlug: q.topicSlug,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      solved: solvedSet.has(q._id.toString()),
    }));

    res.json({
      success: true,
      data: {
        topic,
        questions: questionsForClient,
      },
    });
  } catch (error) {
    console.error('Get topic questions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questions', error: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;
    const userId = req.user._id;

    if (!questionId || userAnswer === undefined || userAnswer === null) {
      return res.status(400).json({ success: false, message: 'questionId and userAnswer are required' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Normalize comparison
    const correct = userAnswer.toString().trim().toLowerCase() === question.answer.trim().toLowerCase();

    if (correct) {
      // Add to user's solved list (idempotent)
      await User.findByIdAndUpdate(userId, {
        $addToSet: { solvedQuestions: question._id }
      });
    }

    res.json({
      success: true,
      data: {
        correct,
        correctAnswer: question.answer,
        explanation: question.explanation,
        alreadySolved: false,
      },
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit answer', error: error.message });
  }
};

const getPracticeStats = async (req, res) => {
  try {
    await ensureQuestionsSeeded();

    const userId = req.user._id;
    const user = await User.findById(userId);
    const solvedIds = (user.solvedQuestions || []).map(id => id.toString());
    const solvedSet = new Set(solvedIds);

    // Get all questions
    const allQuestions = await Question.find().select('_id difficulty topicSlug type');
    const totalQuestions = allQuestions.length;

    let totalSolved = 0;
    let easySolved = 0, mediumSolved = 0, hardSolved = 0;
    let easyTotal = 0, mediumTotal = 0, hardTotal = 0;

    // Per-topic stats
    const topicStats = {};

    allQuestions.forEach(q => {
      const slug = q.topicSlug;
      if (!topicStats[slug]) {
        topicStats[slug] = { total: 0, solved: 0, name: '' };
      }
      topicStats[slug].total++;

      if (q.difficulty === 'Easy') easyTotal++;
      else if (q.difficulty === 'Medium') mediumTotal++;
      else hardTotal++;

      if (solvedSet.has(q._id.toString())) {
        totalSolved++;
        topicStats[slug].solved++;
        if (q.difficulty === 'Easy') easySolved++;
        else if (q.difficulty === 'Medium') mediumSolved++;
        else hardSolved++;
      }
    });

    // Add topic names
    topics.forEach(t => {
      if (topicStats[t.slug]) {
        topicStats[t.slug].name = t.name;
        topicStats[t.slug].icon = t.icon;
      }
    });

    res.json({
      success: true,
      data: {
        totalQuestions,
        totalSolved,
        easyTotal, easySolved,
        mediumTotal, mediumSolved,
        hardTotal, hardSolved,
        topicStats,
      },
    });
  } catch (error) {
    console.error('Practice stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch practice stats', error: error.message });
  }
};

module.exports = { getTopics, getTopicQuestions, submitAnswer, getPracticeStats };
