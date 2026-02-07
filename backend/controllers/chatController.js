const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are ECHO, a friendly and encouraging English speaking practice partner. Your role is to:

1. Help users practice conversational English in a natural, engaging way
2. Gently correct grammar and vocabulary mistakes by rephrasing their sentences correctly
3. Introduce new vocabulary naturally during conversations
4. Keep the conversation flowing with follow-up questions
5. Be patient, supportive, and encouraging
6. Adapt to the user's proficiency level
7. Use everyday topics like hobbies, travel, food, work, and daily life

Start conversations warmly and keep responses concise but helpful. If you notice errors, provide the correction naturally without being overly formal or discouraging.`;

const GREETING_MESSAGE = "Hello! I'm ECHO, your English speaking practice partner. 😊 I'm here to help you improve your English through conversation. Let's have a friendly chat! To start, could you tell me a little about yourself? What's your name and what do you enjoy doing in your free time?";

const startConversation = async (req, res) => {
  try {
    // Check for existing active conversation
    const existingConversation = await Conversation.findOne({
      user: req.user._id,
      isActive: true,
      mode: { $ne: 'correction' }
    });

    if (existingConversation) {
      return res.json({
        success: true,
        data: {
          conversationId: existingConversation._id,
          messages: existingConversation.messages,
          isExisting: true
        }
      });
    }

    const conversation = await Conversation.create({
      user: req.user._id,
      messages: [{
        role: 'assistant',
        content: GREETING_MESSAGE
      }]
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
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start conversation',
      error: error.message
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and message are required'
      });
    }

    // Find the conversation
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

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message
    });

    // Build Gemini chat history from conversation messages
    // Gemini requires history to start with 'user', so skip the initial AI greeting.
    // We only include messages that form valid user→model pairs.
    const allButLast = conversation.messages.slice(0, -1); // exclude the latest user msg (sent separately)
    
    // Find the first 'user' message index – everything before it (the greeting) goes into system instruction
    const firstUserIdx = allButLast.findIndex(m => m.role === 'user');
    const pairableMessages = firstUserIdx >= 0 ? allButLast.slice(firstUserIdx) : [];

    const geminiHistory = pairableMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Get AI response from Gemini (with model fallback for rate-limits)
    const MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];
    let aiResponse;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
        });

        const chat = model.startChat({
          history: geminiHistory,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        });

        const result = await chat.sendMessage(message);
        aiResponse = result.response.text();
        break; // success — stop trying other models
      } catch (geminiError) {
        const isRateLimit = geminiError.message?.includes('429') || geminiError.message?.includes('quota');
        console.error(`Gemini (${modelName}) error:`, geminiError.message);

        // If rate-limited, try next model
        if (isRateLimit && modelName !== MODELS[MODELS.length - 1]) {
          console.log(`Rate-limited on ${modelName}, trying next model...`);
          continue;
        }

        // All models exhausted or non-rate-limit error
        return res.status(502).json({
          success: false,
          message: 'AI service error: ' + (geminiError.message || 'Could not reach Gemini. Check your API key.'),
        });
      }
    }

    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    await conversation.save();

    res.json({
      success: true,
      data: {
        userMessage: {
          role: 'user',
          content: message
        },
        aiMessage: {
          role: 'assistant',
          content: aiResponse
        }
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

const analyzeConversation = async (messages) => {
  const userMessages = messages.filter(m => m.role === 'user');
  const totalMessages = messages.length;

  // Build conversation text for AI analysis
  const conversationText = messages
    .map(m => `${m.role === 'user' ? 'Student' : 'AI Teacher'}: ${m.content}`)
    .join('\n');

  const analysisPrompt = `You are an expert English language evaluator. Analyze this English conversation between a student and an AI teacher.

CONVERSATION:
${conversationText}

Evaluate the student's English ONLY. Be strict and realistic — do NOT inflate the score.

Respond ONLY with valid JSON (no markdown, no backticks, no explanation) in this exact format:
{
  "fluencyScore": <number 0-100>,
  "grammarMistakes": [
    {"original": "<what student wrote>", "correction": "<correct form>", "explanation": "<brief why>"}
  ],
  "vocabularySuggestions": [
    {"word": "<simple word used>", "suggestion": "<better alternatives>", "context": "<brief tip>"}
  ],
  "feedback": "<2-3 sentence overall feedback>"
}

SCORING GUIDELINES — be honest:
- 90-100: Near-native fluency, complex sentences, minimal errors, rich vocabulary
- 75-89: Good English, mostly correct grammar, decent vocabulary, minor errors
- 60-74: Understandable but noticeable grammar issues, limited vocabulary
- 40-59: Frequent errors, simple sentences, basic vocabulary  
- 20-39: Many errors, hard to understand at times, very limited English
- 0-19: Very limited ability

If the student wrote only 1-2 short messages, the score should be low (30-50) because there is not enough evidence of fluency.
If the student made grammar or spelling mistakes, deduct points accordingly.
Include at most 5 grammar mistakes and 4 vocabulary suggestions.`;

  // Try to get AI analysis
  const MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(analysisPrompt);
      const responseText = result.response.text().trim();

      // Parse JSON from the response (strip markdown code fences if any)
      const jsonStr = responseText
        .replace(/^```json?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const analysis = JSON.parse(jsonStr);

      return {
        totalMessages,
        grammarMistakes: (analysis.grammarMistakes || []).slice(0, 5),
        vocabularySuggestions: (analysis.vocabularySuggestions || []).slice(0, 4),
        fluencyScore: Math.max(0, Math.min(100, Math.round(analysis.fluencyScore || 0))),
        feedback: analysis.feedback || 'Keep practicing to improve your English skills!',
      };
    } catch (err) {
      const isRateLimit = err.message?.includes('429') || err.message?.includes('quota');
      console.error(`Analysis (${modelName}) error:`, err.message);
      if (isRateLimit && modelName !== MODELS[MODELS.length - 1]) continue;
      break; // non-rate-limit error or last model
    }
  }

  // Fallback: basic local analysis if AI fails
  console.log('AI analysis failed, using basic fallback scoring');
  const avgLen = userMessages.reduce((a, m) => a + m.content.split(' ').length, 0) / (userMessages.length || 1);
  const basicScore = Math.min(70, Math.round(userMessages.length * 4 + avgLen * 2));

  return {
    totalMessages,
    grammarMistakes: [],
    vocabularySuggestions: [],
    fluencyScore: Math.max(15, basicScore),
    feedback: 'AI analysis was unavailable. This is an estimated score based on message count and length. Keep practicing!',
  };
};

const endConversation = async (req, res) => {
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

    const analysis = await analyzeConversation(conversation.messages);

    // Update conversation with report card
    conversation.isActive = false;
    conversation.endedAt = new Date();
    conversation.reportCard = analysis;

    await conversation.save();

    res.json({
      success: true,
      data: {
        reportCard: analysis,
        conversationId: conversation._id
      }
    });
  } catch (error) {
    console.error('End conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end conversation',
      error: error.message
    });
  }
};

const getConversationHistory = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      user: req.user._id
    }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation history',
      error: error.message
    });
  }
};

module.exports = {
  startConversation,
  sendMessage,
  endConversation,
  getConversationHistory
};
