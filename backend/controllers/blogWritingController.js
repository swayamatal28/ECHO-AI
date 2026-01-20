const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const blogTopics = [
  'The Impact of Social Media on Modern Relationships',
  'Why Reading Books Is Still Important in the Digital Age',
  'The Role of Technology in Education',
  'Climate Change and Individual Responsibility',
  'The Benefits and Drawbacks of Remote Work',
  'How Travel Broadens Your Perspective',
  'The Importance of Mental Health Awareness',
  'Should Artificial Intelligence Replace Human Jobs?',
  'The Value of Learning a Second Language',
  'Fast Fashion and Its Environmental Impact',
  'The Future of Space Exploration',
  'Why Physical Exercise Matters for Students',
  'The Influence of Music on Human Emotions',
  'Is Social Media Making Us Less Social?',
  'The Pros and Cons of Online Learning',
  'Cultural Diversity in the Workplace',
  'The Ethics of Animal Testing',
  'How Smartphones Have Changed Daily Life',
  'The Importance of Financial Literacy for Young Adults',
  'Should College Education Be Free?',
  'The Role of Art in Society',
  'Cyberbullying and How to Prevent It',
  'The Benefits of Volunteering in Your Community',
  'How Cooking at Home Improves Your Health',
  'The Power of Positive Thinking',
  'Why History Matters in the Modern World',
  'The Impact of Streaming Services on Traditional Cinema',
  'Is Homework Necessary for Student Success?',
  'The Importance of Sleep for Productivity',
  'How Sports Build Character and Discipline',
];

const getRandomTopic = (req, res) => {
  try {
    const idx = Math.floor(Math.random() * blogTopics.length);
    res.json({ success: true, data: { topic: blogTopics[idx] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get topic' });
  }
};

const evaluateBlog = async (req, res) => {
  try {
    const { topic, intro, main, end } = req.body;

    if (!topic || !intro || !main || !end) {
      return res.status(400).json({ success: false, message: 'All sections (intro, main, end) are required' });
    }

    const fullBlog = `Introduction:\n${intro}\n\nMain Body:\n${main}\n\nConclusion:\n${end}`;

    const prompt = `You are a strict English writing evaluator. A student was given the topic: "${topic}" and wrote a blog in three sections.

STUDENT'S BLOG:
${fullBlog}

Evaluate the writing on these criteria:
1. Grammar & Spelling (0-25)
2. Structure & Organization (0-25) - how well the intro sets up, main body develops, and conclusion wraps up
3. Vocabulary & Expression (0-25)
4. Content & Relevance to topic (0-25)

Be realistic and strict. Short or lazy answers should get low scores.

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "grammar": <0-25>,
  "structure": <0-25>,
  "vocabulary": <0-25>,
  "content": <0-25>,
  "totalScore": <0-100>,
  "feedback": "<2-3 sentences of honest feedback>",
  "improvements": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}`;

    const MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];
    let result = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const response = await model.generateContent(prompt);
        const text = response.response.text().trim()
          .replace(/^```json?\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        result = JSON.parse(text);
        break;
      } catch (err) {
        const isRateLimit = err.message?.includes('429') || err.message?.includes('quota');
        if (isRateLimit && modelName !== MODELS[MODELS.length - 1]) continue;
        break;
      }
    }

    if (!result) {
      // fallback scoring
      const wordCount = fullBlog.split(/\s+/).length;
      const baseScore = Math.min(60, Math.floor(wordCount / 3));
      result = {
        grammar: Math.floor(baseScore * 0.25),
        structure: Math.floor(baseScore * 0.25),
        vocabulary: Math.floor(baseScore * 0.25),
        content: Math.floor(baseScore * 0.25),
        totalScore: baseScore,
        feedback: 'AI evaluation was unavailable. This is an estimated score based on length.',
        improvements: ['Try writing more detailed content', 'Use varied vocabulary', 'Ensure clear structure'],
      };
    }

    const totalScore = Math.max(0, Math.min(100, result.totalScore || 0));
    const scaledScore = Math.round(totalScore / 10);

    res.json({
      success: true,
      data: {
        grammar: result.grammar,
        structure: result.structure,
        vocabulary: result.vocabulary,
        content: result.content,
        totalScore,
        scaledScore,
        feedback: result.feedback,
        improvements: result.improvements || [],
      },
    });
  } catch (err) {
    console.error('Blog evaluation error:', err);
    res.status(500).json({ success: false, message: 'Failed to evaluate blog' });
  }
};

module.exports = { getRandomTopic, evaluateBlog };
