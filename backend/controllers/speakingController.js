const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];

// ═══════════════════════════════════════════════════════════════
// SPEAKING TOPICS POOL
// ═══════════════════════════════════════════════════════════════

const SPEAKING_TOPICS = [
  {
    topic: "Describe Your Ideal Weekend",
    description: "Talk about what a perfect weekend looks like for you. Include activities, places you'd visit, and people you'd spend time with.",
    difficulty: "easy"
  },
  {
    topic: "A Memorable Childhood Experience",
    description: "Share a vivid memory from your childhood. Describe what happened, how you felt, and why it has stayed with you.",
    difficulty: "easy"
  },
  {
    topic: "The Importance of Learning a New Language",
    description: "Discuss why learning a new language is valuable. Share your own experience and the challenges you've faced.",
    difficulty: "easy"
  },
  {
    topic: "Your Favorite Season and Why",
    description: "Describe which season you enjoy most and explain why. Include activities and experiences unique to that season.",
    difficulty: "easy"
  },
  {
    topic: "A Person Who Has Influenced Your Life",
    description: "Talk about someone who has had a significant impact on your life. Explain how they influenced you and what you learned.",
    difficulty: "easy"
  },
  {
    topic: "The Role of Technology in Education",
    description: "Discuss how technology has transformed the way we learn. Consider both advantages and disadvantages.",
    difficulty: "medium"
  },
  {
    topic: "A Place You Would Love to Visit",
    description: "Talk about a destination you dream of visiting. Explain what attracts you and what you would do there.",
    difficulty: "easy"
  },
  {
    topic: "The Benefits and Drawbacks of Remote Work",
    description: "Share your thoughts on working from home. Discuss productivity, work-life balance, and social aspects.",
    difficulty: "medium"
  },
  {
    topic: "A Skill You Want to Learn",
    description: "Describe a skill you'd like to acquire. Explain why it interests you and how you plan to learn it.",
    difficulty: "easy"
  },
  {
    topic: "How Social Media Affects Relationships",
    description: "Discuss the impact of social media on friendships and family relationships. Include positive and negative effects.",
    difficulty: "medium"
  },
  {
    topic: "Your Morning Routine",
    description: "Walk through your typical morning. What do you do from the moment you wake up until you start your day?",
    difficulty: "easy"
  },
  {
    topic: "The Future of Artificial Intelligence",
    description: "Share your thoughts on how AI will shape our future. Consider its impact on jobs, healthcare, and daily life.",
    difficulty: "hard"
  },
  {
    topic: "A Book or Movie That Changed Your Perspective",
    description: "Describe a book or movie that impacted how you see the world. What was it about and what did you learn?",
    difficulty: "medium"
  },
  {
    topic: "Environmental Issues in Your City",
    description: "Discuss environmental challenges in your area. What problems exist and what solutions could help?",
    difficulty: "medium"
  },
  {
    topic: "The Importance of Physical Exercise",
    description: "Talk about why regular exercise matters. Share your own fitness routine or goals.",
    difficulty: "easy"
  },
  {
    topic: "Describe Your Dream Job",
    description: "Explain what your ideal career would look like. What would you do, where would you work, and why?",
    difficulty: "easy"
  },
  {
    topic: "Cultural Differences You Have Observed",
    description: "Discuss interesting cultural differences you've noticed through travel, media, or meeting people from other backgrounds.",
    difficulty: "medium"
  },
  {
    topic: "The Impact of Fast Food on Health",
    description: "Talk about how fast food affects people's health. Suggest healthier alternatives and lifestyle changes.",
    difficulty: "medium"
  },
  {
    topic: "A Challenging Situation You Overcame",
    description: "Share a difficult experience you faced and how you handled it. What did you learn from that challenge?",
    difficulty: "medium"
  },
  {
    topic: "Should School Uniforms Be Mandatory?",
    description: "Present arguments for and against school uniforms. Share your personal opinion with supporting reasons.",
    difficulty: "medium"
  },
  {
    topic: "The Value of Travel",
    description: "Discuss how traveling broadens your mind. Share memorable travel experiences and what you gained from them.",
    difficulty: "easy"
  },
  {
    topic: "How to Manage Stress Effectively",
    description: "Talk about stress management techniques that work. Give advice on maintaining mental well-being.",
    difficulty: "medium"
  },
  {
    topic: "The Evolution of Communication",
    description: "Discuss how communication has changed from letters to smartphones. Compare past and present methods.",
    difficulty: "hard"
  },
  {
    topic: "Your Favorite Festival or Celebration",
    description: "Describe a festival or celebration you love. Include traditions, food, activities, and what makes it special.",
    difficulty: "easy"
  },
  {
    topic: "Online Education vs Classroom Learning",
    description: "Compare online and traditional classroom education. Discuss the pros and cons of each approach.",
    difficulty: "hard"
  },
  {
    topic: "Describe Your Hometown",
    description: "Paint a picture of where you grew up. Talk about landmarks, culture, food, and what makes it unique.",
    difficulty: "easy"
  },
  {
    topic: "The Influence of Music on Emotions",
    description: "Discuss how music affects our mood. Share examples of songs or genres that have a strong effect on you.",
    difficulty: "medium"
  },
  {
    topic: "Should Animals Be Kept in Zoos?",
    description: "Present both sides of the debate on keeping animals in captivity. Share your personal stance with reasons.",
    difficulty: "hard"
  },
  {
    topic: "The Importance of Time Management",
    description: "Talk about why managing time effectively is crucial. Share your own strategies and tools you use.",
    difficulty: "medium"
  },
  {
    topic: "A Tradition in Your Family",
    description: "Describe a special tradition your family follows. Explain its origin, significance, and how it brings the family together.",
    difficulty: "easy"
  }
];

// ═══════════════════════════════════════════════════════════════
// TOPIC SPEAKING ENDPOINTS
// ═══════════════════════════════════════════════════════════════

const getRandomTopic = (req, res) => {
  const randomIndex = Math.floor(Math.random() * SPEAKING_TOPICS.length);
  res.json({ success: true, data: SPEAKING_TOPICS[randomIndex] });
};

const evaluateTopicSpeech = async (req, res) => {
  try {
    const { topic, transcript, duration } = req.body;

    if (!topic || !transcript) {
      return res.status(400).json({
        success: false,
        message: 'Topic and transcript are required'
      });
    }

    const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
    const durationSec = duration || 120;

    const prompt = `You are an expert English speech evaluator. A student was given a topic and asked to speak for 2 minutes. Analyze their speech transcript.

Note: This transcript was generated via speech recognition, so minor transcription artifacts may exist. Focus on evaluating the overall quality of the student's English.

TOPIC: "${topic}"

TRANSCRIPT:
"${transcript}"

DURATION: ${durationSec} seconds | WORD COUNT: ${wordCount}

Evaluate the student's speech and respond ONLY with valid JSON (no markdown, no backticks, no extra text):
{
  "fluency": <number 0-25>,
  "grammar": <number 0-25>,
  "vocabulary": <number 0-25>,
  "relevance": <number 0-25>,
  "feedback": "<2-3 sentences of overall feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<area1>", "<area2>", "<area3>"],
  "sampleCorrections": "<show 2-3 corrected sentences from their speech, or empty string if no major errors>"
}

SCORING CRITERIA:
- Fluency & Coherence (0-25): Flow of speech, logical structure, use of connectors, natural pace
- Grammar & Accuracy (0-25): Correct tense, subject-verb agreement, articles, prepositions, sentence structure
- Vocabulary Range (0-25): Variety of words, appropriate usage, avoidance of repetition, advanced words
- Topic Relevance (0-25): How well the speech addresses the topic, depth of content, supporting details

BE STRICT AND REALISTIC:
- Under 30 words = max 8 per category
- Under 80 words = max 15 per category
- Simple or repetitive sentences = lower vocabulary and fluency scores
- Off-topic content = lower relevance score
- Many grammar errors = lower grammar score`;

    let evaluation;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonStr = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
        evaluation = JSON.parse(jsonStr);
        break;
      } catch (err) {
        const isRateLimit = err.message?.includes('429') || err.message?.includes('quota');
        console.error(`Speech eval (${modelName}) error:`, err.message);

        if (err instanceof SyntaxError) {
          evaluation = {
            fluency: Math.min(20, Math.round(wordCount / 10)),
            grammar: 12,
            vocabulary: 10,
            relevance: 12,
            feedback: 'Your speech was evaluated with basic scoring. Keep practicing to improve!',
            strengths: ['Attempted the topic', 'Showed effort'],
            improvements: ['Speak more fluently', 'Use varied vocabulary', 'Elaborate on your points'],
            sampleCorrections: ''
          };
          break;
        }

        if (isRateLimit && modelName !== MODELS[MODELS.length - 1]) continue;

        return res.status(502).json({
          success: false,
          message: 'AI evaluation service is temporarily unavailable. Please try again.'
        });
      }
    }

    // Clamp scores to valid range
    evaluation.fluency = Math.max(0, Math.min(25, Math.round(evaluation.fluency || 0)));
    evaluation.grammar = Math.max(0, Math.min(25, Math.round(evaluation.grammar || 0)));
    evaluation.vocabulary = Math.max(0, Math.min(25, Math.round(evaluation.vocabulary || 0)));
    evaluation.relevance = Math.max(0, Math.min(25, Math.round(evaluation.relevance || 0)));
    const overallScore = evaluation.fluency + evaluation.grammar + evaluation.vocabulary + evaluation.relevance;

    // Update user profile speaking stats
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        const prev = user.speakingStats || { totalTopicSessions: 0, averageTopicScore: 0, bestTopicScore: 0 };
        const newTotal = (prev.totalTopicSessions || 0) + 1;
        const newAvg = Math.round((((prev.averageTopicScore || 0) * (prev.totalTopicSessions || 0)) + overallScore) / newTotal);

        user.speakingStats = {
          totalTopicSessions: newTotal,
          averageTopicScore: newAvg,
          bestTopicScore: Math.max(prev.bestTopicScore || 0, overallScore),
          lastSessionDate: new Date()
        };

        await user.save();
      }
    } catch (profileErr) {
      console.error('Failed to update speaking stats:', profileErr.message);
    }

    res.json({
      success: true,
      data: {
        evaluation: { ...evaluation, overallScore },
        speechInfo: { wordCount, duration: durationSec }
      }
    });
  } catch (error) {
    console.error('Evaluate speech error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate speech',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// REAL-TIME CORRECTION MODE
// ═══════════════════════════════════════════════════════════════

const CORRECTION_SYSTEM_PROMPT = `You are ECHO, an English correction assistant. Your PRIMARY responsibility is to find and correct ALL errors in the student's messages while having a natural conversation.

For EVERY user message, you MUST:
1. Identify ALL grammar, spelling, vocabulary, and sentence structure errors
2. Provide the full corrected version of their message
3. List each specific correction with the grammar rule
4. Then respond naturally to keep the conversation flowing

CRITICAL: You must ALWAYS respond in this EXACT JSON format (no markdown, no code fences, just raw JSON):
{
  "corrections": [
    {"original": "exact error text from student", "corrected": "correct version", "rule": "brief grammar rule"}
  ],
  "correctedSentence": "the student's full message rewritten correctly",
  "response": "your natural conversational response (never mention corrections here)"
}

RULES:
- If the message has NO errors, set corrections to [] and correctedSentence to the original message
- Catch EVERYTHING: missing articles (a/an/the), wrong prepositions, subject-verb agreement, tense errors, spelling, punctuation, word order
- Your "response" must be a natural conversational reply — ask questions, share thoughts, be friendly
- NEVER mention corrections in the "response" field
- Keep conversations engaging and explore diverse topics`;

const CORRECTION_GREETING = "Hey there! I'm ECHO, your real-time correction partner. Let's have a conversation — I'll correct any mistakes as we go so you learn naturally. Don't worry about making errors, that's exactly how you improve! What would you like to talk about?";

const startCorrectionChat = async (req, res) => {
  try {
    const existing = await Conversation.findOne({
      user: req.user._id,
      isActive: true,
      mode: 'correction'
    });

    if (existing) {
      return res.json({
        success: true,
        data: {
          conversationId: existing._id,
          messages: existing.messages,
          isExisting: true
        }
      });
    }

    const conversation = await Conversation.create({
      user: req.user._id,
      mode: 'correction',
      messages: [{ role: 'assistant', content: CORRECTION_GREETING }]
    });

    res.status(201).json({
      success: true,
      data: {
        conversationId: conversation._id,
        messages: conversation.messages,
        isExisting: false
      }
    });
  } catch (error) {
    console.error('Start correction chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start correction chat'
    });
  }
};

const sendCorrectionMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and message are required'
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user._id,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Active conversation not found'
      });
    }

    conversation.messages.push({ role: 'user', content: message });

    // Build Gemini chat history (skip greeting, start from first user message)
    const allButLast = conversation.messages.slice(0, -1);
    const firstUserIdx = allButLast.findIndex(m => m.role === 'user');
    const pairableMessages = firstUserIdx >= 0 ? allButLast.slice(firstUserIdx) : [];

    const geminiHistory = pairableMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    let corrections = [];
    let correctedSentence = message;
    let aiResponse = '';

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: CORRECTION_SYSTEM_PROMPT,
        });

        const chat = model.startChat({
          history: geminiHistory,
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.5,
          },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text().trim();

        // Parse JSON response
        try {
          const jsonStr = responseText
            .replace(/^```json?\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
          const parsed = JSON.parse(jsonStr);
          corrections = Array.isArray(parsed.corrections) ? parsed.corrections : [];
          correctedSentence = parsed.correctedSentence || message;
          aiResponse = parsed.response || 'Could you tell me more about that?';
        } catch {
          // JSON parse failed — use the raw text as conversation
          aiResponse = responseText;
          corrections = [];
          correctedSentence = message;
        }

        break;
      } catch (geminiError) {
        const isRateLimit = geminiError.message?.includes('429') || geminiError.message?.includes('quota');
        console.error(`Correction (${modelName}) error:`, geminiError.message);

        if (isRateLimit && modelName !== MODELS[MODELS.length - 1]) continue;

        return res.status(502).json({
          success: false,
          message: 'AI service temporarily unavailable. Please try again.'
        });
      }
    }

    // Store the conversational response in the DB
    conversation.messages.push({ role: 'assistant', content: aiResponse });
    await conversation.save();

    res.json({
      success: true,
      data: {
        corrections,
        correctedSentence,
        aiMessage: { role: 'assistant', content: aiResponse }
      }
    });
  } catch (error) {
    console.error('Correction message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
};

const endCorrectionChat = async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required'
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user._id,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Active conversation not found'
      });
    }

    const conversationText = conversation.messages
      .map(m => `${m.role === 'user' ? 'Student' : 'ECHO'}: ${m.content}`)
      .join('\n');

    const analysisPrompt = `You are an expert English evaluator. Analyze this conversation where the student was practicing English with real-time corrections.

CONVERSATION:
${conversationText}

Evaluate the student's English ability. Respond ONLY with valid JSON (no markdown, no backticks):
{
  "fluencyScore": <0-100>,
  "grammarMistakes": [
    {"original": "<error from student>", "correction": "<correct version>", "explanation": "<brief grammar rule>"}
  ],
  "vocabularySuggestions": [
    {"word": "<basic word used>", "suggestion": "<better alternative>", "context": "<usage tip>"}
  ],
  "feedback": "<3-4 sentences of constructive feedback about the student's English>"
}

SCORING GUIDELINES:
- 90-100: Near-native, minimal errors
- 75-89: Good English, minor issues
- 60-74: Understandable, noticeable errors
- 40-59: Frequent errors, limited vocabulary
- 20-39: Many errors, basic English
- 0-19: Very limited ability

Include at most 5 grammar mistakes and 4 vocabulary suggestions.`;

    let analysis;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(analysisPrompt);
        const text = result.response.text().trim();
        const jsonStr = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
        analysis = JSON.parse(jsonStr);
        break;
      } catch (err) {
        const isRateLimit = err.message?.includes('429') || err.message?.includes('quota');
        console.error(`Correction analysis (${modelName}) error:`, err.message);
        if (isRateLimit && modelName !== MODELS[MODELS.length - 1]) continue;
        break;
      }
    }

    if (!analysis) {
      const userMsgs = conversation.messages.filter(m => m.role === 'user');
      const avgLen = userMsgs.reduce((a, m) => a + m.content.split(' ').length, 0) / (userMsgs.length || 1);
      analysis = {
        fluencyScore: Math.min(60, Math.max(15, Math.round(userMsgs.length * 4 + avgLen * 2))),
        grammarMistakes: [],
        vocabularySuggestions: [],
        feedback: 'Session completed. AI analysis was unavailable — this is an estimated score. Keep practicing!'
      };
    }

    const reportCard = {
      totalMessages: conversation.messages.length,
      fluencyScore: Math.max(0, Math.min(100, Math.round(analysis.fluencyScore || 50))),
      grammarMistakes: (analysis.grammarMistakes || []).slice(0, 5),
      vocabularySuggestions: (analysis.vocabularySuggestions || []).slice(0, 4),
      feedback: analysis.feedback || 'Keep practicing!'
    };

    conversation.isActive = false;
    conversation.endedAt = new Date();
    conversation.reportCard = reportCard;
    await conversation.save();

    res.json({
      success: true,
      data: { reportCard, conversationId: conversation._id }
    });
  } catch (error) {
    console.error('End correction chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end correction session'
    });
  }
};

module.exports = {
  getRandomTopic,
  evaluateTopicSpeech,
  startCorrectionChat,
  sendCorrectionMessage,
  endCorrectionChat
};
