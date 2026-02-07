import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, StopCircle, Loader, Bot, User, Mic, MicOff, Volume2, VolumeX, ArrowLeft, SpellCheck, AlertCircle, CheckCircle, Phone, PhoneOff } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import ReportCardModal from '../components/ReportCardModal';

const RealtimeCorrection = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isStarting, setIsStarting] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [reportCard, setReportCard] = useState(null);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [totalCorrections, setTotalCorrections] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceModeRef = useRef(false);

  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = !!SpeechRecognition;
  const ttsSupported = 'speechSynthesis' in window;

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!ttsSupported) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
        || voices.find(v => v.lang.startsWith('en-US'))
        || voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };
      window.speechSynthesis.speak(utterance);
    });
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (ttsSupported) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    startListening();
  };

  const startListening = () => {
    if (!speechSupported) {
      setError('Speech recognition is not supported. Use Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    if (voiceModeRef.current) {
      recognition.interimResults = false;
      recognition.continuous = false;
    } else {
      recognition.interimResults = true;
      recognition.continuous = true;
    }

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) {
        if (voiceModeRef.current) {
          setAutoSendEnabled(true);
          setInputMessage(finalTranscript.trim());
        } else {
          setInputMessage(prev => (prev + ' ' + finalTranscript).trim());
        }
      }
    };
    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError('Microphone error: ' + event.error);
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  // Auto-send in voice mode when transcript is ready
  useEffect(() => {
    if (autoSendEnabled && inputMessage.trim() && voiceMode) {
      setAutoSendEnabled(false);
      const fakeEvent = { preventDefault: () => {} };
      sendMessage(fakeEvent);
    }
  }, [autoSendEnabled, inputMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    startConversation();
  }, []);

  const startConversation = async () => {
    setIsStarting(true);
    setError('');
    try {
      const res = await axiosInstance.post('/speaking/correction/start');
      const { conversationId: convId, messages: initial } = res.data.data;
      setConversationId(convId);
      setMessages(initial.map(msg => ({
        ...msg,
        id: Date.now() + Math.random(),
        corrections: [],
        correctedSentence: '',
      })));
    } catch (err) {
      setError('Failed to start correction chat. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !conversationId) return;
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError('');

    const userMsgId = Date.now();
    const userMsgObj = { id: userMsgId, role: 'user', content: userMessage, corrections: [], correctedSentence: '' };
    setMessages(prev => [...prev, userMsgObj]);
    setIsLoading(true);

    try {
      const res = await axiosInstance.post('/speaking/correction/message', {
        conversationId,
        message: userMessage,
      });

      const { corrections, correctedSentence, aiMessage } = res.data.data;

      setMessages(prev => {
        const updated = [...prev];
        // Attach corrections to the user message
        const idx = updated.findIndex(m => m.id === userMsgId);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            corrections: corrections || [],
            correctedSentence: correctedSentence || userMessage,
          };
        }
        // Add AI response
        updated.push({
          id: Date.now() + 1,
          role: 'assistant',
          content: aiMessage.content,
          corrections: [],
          correctedSentence: '',
        });
        return updated;
      });

      // Track total corrections
      if (corrections && corrections.length > 0) {
        setTotalCorrections(prev => prev + corrections.length);
      }

      // In voice mode: speak AI response, then auto-listen
      if (voiceMode && ttsSupported) {
        // Speak corrections summary first if any, then the response
        let textToSpeak = '';
        if (corrections && corrections.length > 0) {
          textToSpeak = 'Correction: ' + (correctedSentence || '') + '. ';
        }
        textToSpeak += aiMessage.content;
        await speakText(textToSpeak);
        if (voiceModeRef.current) {
          setTimeout(() => startListening(), 400);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send message.';
      setError(errMsg);
      setMessages(prev => prev.filter(m => m.id !== userMsgId));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const endConversation = async () => {
    if (!conversationId) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await axiosInstance.post('/speaking/correction/end', { conversationId });
      setReportCard(res.data.data.reportCard);
      setShowReport(true);
    } catch (err) {
      setError('Failed to generate report.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setShowReport(false);
    setReportCard(null);
    setMessages([]);
    setConversationId(null);
    setTotalCorrections(0);
    startConversation();
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => { stopSpeaking(); recognitionRef.current?.stop(); navigate('/dashboard/speak-ai'); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <SpellCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Real-time Correction</h1>
              <p className="text-sm text-gray-500">AI corrects every sentence as you chat</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Voice Mode Toggle */}
            {speechSupported && ttsSupported && (
              <button
                onClick={() => {
                  const next = !voiceMode;
                  setVoiceMode(next);
                  if (!next) { stopSpeaking(); recognitionRef.current?.stop(); }
                }}
                disabled={isLoading || isStarting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  voiceMode
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {voiceMode ? <Phone className="w-4 h-4" /> : <PhoneOff className="w-4 h-4" />}
                <span>{voiceMode ? 'Voice On' : 'Voice Off'}</span>
              </button>
            )}
            {totalCorrections > 0 && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>{totalCorrections} correction{totalCorrections !== 1 ? 's' : ''}</span>
              </div>
            )}
            {conversationId && messages.length > 1 && (
              <button
                onClick={() => { stopSpeaking(); recognitionRef.current?.stop(); endConversation(); }}
                disabled={isLoading}
                className="btn-danger flex items-center space-x-2"
              >
                <StopCircle className="w-5 h-5" />
                <span>End</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {isStarting ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Starting correction session...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.length <= 1 && (
              <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-100">
                <div className="flex items-start space-x-3">
                  <SpellCheck className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700"><strong>How Real-time Correction works:</strong></p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Type or speak naturally — don't worry about mistakes</li>
                      <li>• After each message, AI will show corrections with grammar rules</li>
                      <li>• The corrected version of your sentence appears below your message</li>
                      <li>• AI continues the conversation naturally alongside corrections</li>
                      <li>• Click <strong>End</strong> for a full session report</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {/* Message Bubble */}
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} chat-message`}>
                  <div className={`flex items-start space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-primary-500' : 'bg-purple-600'}`}>
                      {message.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      {message.role === 'assistant' && ttsSupported && (
                        <button
                          onClick={() => isSpeaking ? stopSpeaking() : speakText(message.content)}
                          className="mt-2 flex items-center space-x-1 text-xs text-gray-400 hover:text-purple-500 transition-colors"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Correction Box — only for user messages with corrections */}
                {message.role === 'user' && message.corrections && message.corrections.length > 0 && (
                  <div className="flex justify-end">
                    <div className="max-w-[75%] mr-12">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                        {/* Corrected sentence */}
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-green-700 font-medium">{message.correctedSentence}</p>
                        </div>

                        {/* Individual corrections */}
                        <div className="space-y-2 pt-2 border-t border-amber-200">
                          {message.corrections.map((c, i) => (
                            <div key={i} className="text-xs">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className="text-red-500 line-through">{c.original}</span>
                                <span className="text-gray-400">→</span>
                                <span className="text-green-600 font-medium">{c.corrected}</span>
                              </div>
                              <p className="text-gray-400 mt-0.5 ml-0.5">{c.rule}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Perfect message indicator */}
                {message.role === 'user' && message.corrections && message.corrections.length === 0 && message.correctedSentence && messages.indexOf(message) > 0 && (
                  <div className="flex justify-end">
                    <div className="mr-12 flex items-center space-x-1.5 text-xs text-green-500">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>No corrections needed — great job!</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start chat-message">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">{error}</div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        {voiceMode ? (
          <div className="flex flex-col items-center py-2">
            <p className="text-sm text-gray-500 mb-3">
              {isSpeaking ? '🔊 AI is speaking...' : isLoading ? '🤔 Checking & replying...' : isListening ? '🎙️ Listening... speak now' : 'Tap the mic to speak'}
            </p>
            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading || isStarting || !conversationId || isSpeaking}
              className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-300 scale-110 shadow-xl shadow-red-500/30'
                  : isSpeaking
                  ? 'bg-yellow-400 text-white focus:ring-yellow-300'
                  : 'bg-purple-600 text-white hover:shadow-xl hover:scale-105 focus:ring-purple-300 shadow-lg'
              }`}
            >
              {isListening ? (
                <div className="relative">
                  <MicOff className="w-8 h-8" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
                </div>
              ) : isSpeaking ? (
                <Volume2 className="w-8 h-8 animate-pulse" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
            {isListening && (
              <div className="mt-3 flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="w-1 bg-red-500 rounded-full animate-bounce" style={{ height: `${12 + Math.random() * 16}px`, animationDelay: `${i * 100}ms`, animationDuration: '0.6s' }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <form onSubmit={sendMessage} className="flex items-center space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? '🎙️ Listening...' : 'Type a sentence — AI will correct any mistakes...'}
                disabled={isLoading || isStarting || !conversationId}
                className="flex-1 input-field"
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isLoading || isStarting || !conversationId}
                  className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading || isStarting}
                className="btn-primary flex items-center justify-center w-12 h-12 p-0"
              >
                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
            {isListening && (
              <p className="text-xs text-red-500 mt-2 flex items-center space-x-1 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
                <span>Recording... tap the mic to stop</span>
              </p>
            )}
          </>
        )}
      </div>

      <ReportCardModal isOpen={showReport} onClose={handleNewConversation} reportCard={reportCard} />
    </div>
  );
};

export default RealtimeCorrection;
