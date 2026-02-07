import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, ArrowLeft, Loader, RotateCcw, ChevronRight, Clock, Target, BookOpen, MessageSquare, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const TopicSpeaking = () => {
  const navigate = useNavigate();

  // Phase: loading → idle → speaking → evaluating → results
  const [phase, setPhase] = useState('loading');
  const [topic, setTopic] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [transcript, setTranscript] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [speechInfo, setSpeechInfo] = useState(null);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);

  const phaseRef = useRef('loading');
  const transcriptRef = useRef('');
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = !!SpeechRecognition;

  // Fetch topic on mount
  useEffect(() => {
    fetchTopic();
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'speaking') return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  const fetchTopic = async () => {
    setPhase('loading');
    setError('');
    try {
      const res = await axiosInstance.get('/speaking/topic');
      setTopic(res.data.data);
      setPhase('idle');
    } catch (err) {
      console.error('Failed to fetch topic:', err);
      setError('Failed to load topic. Please try again.');
      setPhase('idle');
    }
  };

  const startSpeaking = () => {
    if (!speechSupported) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    setTranscript('');
    setTimeLeft(120);
    setError('');
    setPhase('speaking');
    startTimeRef.current = Date.now();
    beginRecognition();
  };

  const beginRecognition = () => {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(prev => (prev + ' ' + finalTranscript).trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setError('Microphone error: ' + event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if still in speaking phase
      if (phaseRef.current === 'speaking') {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setError('Failed to start microphone. Please check permissions.');
    }
  };

  const handleSubmit = async () => {
    // Stop recognition
    recognitionRef.current?.stop();
    setIsListening(false);

    const currentTranscript = transcriptRef.current;
    const duration = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 120;

    if (!currentTranscript.trim()) {
      setError('No speech detected. Please try again and speak clearly into your microphone.');
      setPhase('idle');
      return;
    }

    setPhase('evaluating');
    setError('');

    try {
      const res = await axiosInstance.post('/speaking/evaluate', {
        topic: topic.topic,
        transcript: currentTranscript,
        duration,
      });
      setEvaluation(res.data.data.evaluation);
      setSpeechInfo(res.data.data.speechInfo);
      setPhase('results');
    } catch (err) {
      console.error('Evaluation failed:', err);
      setError(err.response?.data?.message || 'Failed to evaluate speech. Please try again.');
      setPhase('idle');
    }
  };

  const handleNewTopic = () => {
    setEvaluation(null);
    setSpeechInfo(null);
    setTranscript('');
    fetchTopic();
  };

  const handleTryAgain = () => {
    setEvaluation(null);
    setSpeechInfo(null);
    setTranscript('');
    setPhase('idle');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-yellow-600';
    if (pct >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-yellow-500';
    if (pct >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getOverallLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 55) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Practice';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard/speak-ai')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Topic Speaking</h1>
              <p className="text-sm text-gray-500">Speak for 2 minutes on a given topic</p>
            </div>
          </div>

          {phase === 'speaking' && (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
              timeLeft <= 30 ? 'bg-red-100 text-red-600' : timeLeft <= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Loading */}
        {phase === 'loading' && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading topic...</p>
            </div>
          </div>
        )}

        {/* Idle - Topic Shown */}
        {phase === 'idle' && topic && (
          <div className="space-y-6">
            {/* Topic Card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                <div className="flex items-center space-x-2 text-blue-100 text-sm mb-2">
                  <Target className="w-4 h-4" />
                  <span>Your Topic</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{topic.topic}</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">{topic.description}</p>
                <div className="mt-4 flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>2 minutes speaking time</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-semibold text-blue-800 mb-2">Tips for a great speech</h3>
              <ul className="space-y-1.5 text-sm text-blue-700">
                <li>• Start with a brief introduction to the topic</li>
                <li>• Use examples and personal experiences</li>
                <li>• Structure your thoughts — beginning, middle, conclusion</li>
                <li>• Use connecting words: however, moreover, in addition, etc.</li>
                <li>• Speak clearly and at a natural pace</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={startSpeaking}
                disabled={!speechSupported}
                className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg"
              >
                <Mic className="w-5 h-5" />
                <span>Start Speaking</span>
              </button>
              <button
                onClick={handleNewTopic}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Different Topic</span>
              </button>
            </div>

            {!speechSupported && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Speech recognition is not supported in your browser. Please use Google Chrome or Microsoft Edge.
              </div>
            )}
          </div>
        )}

        {/* Speaking Phase */}
        {phase === 'speaking' && (
          <div className="space-y-6">
            {/* Topic reminder */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-400 mb-1">Speaking about:</p>
              <p className="font-semibold text-gray-800">{topic?.topic}</p>
            </div>

            {/* Timer Progress Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Time Remaining</span>
                <span className={`text-2xl font-bold font-mono ${
                  timeLeft <= 30 ? 'text-red-600' : timeLeft <= 60 ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ease-linear ${
                    timeLeft <= 30 ? 'bg-red-500' : timeLeft <= 60 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(timeLeft / 120) * 100}%` }}
                />
              </div>
            </div>

            {/* Mic Status */}
            <div className="flex flex-col items-center py-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 shadow-xl shadow-red-500/30 scale-110'
                  : 'bg-gray-300'
              }`}>
                {isListening ? (
                  <Mic className="w-10 h-10 text-white" />
                ) : (
                  <MicOff className="w-10 h-10 text-white" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {isListening ? '🎙️ Listening... speak clearly' : 'Connecting microphone...'}
              </p>

              {/* Listening animation */}
              {isListening && (
                <div className="mt-3 flex items-center space-x-1">
                  {[...Array(7)].map((_, i) => (
                    <span
                      key={i}
                      className="w-1 bg-red-500 rounded-full animate-bounce"
                      style={{
                        height: `${8 + Math.random() * 20}px`,
                        animationDelay: `${i * 80}ms`,
                        animationDuration: '0.5s',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Live Transcript */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-500">Live Transcript</h3>
              </div>
              <div className="min-h-[120px] max-h-[250px] overflow-y-auto">
                {transcript ? (
                  <p className="text-gray-700 leading-relaxed">{transcript}</p>
                ) : (
                  <p className="text-gray-300 italic">Your speech will appear here as you speak...</p>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{transcript.split(/\s+/).filter(w => w).length} words</span>
              </div>
            </div>

            {/* Submit Early */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
                <span>Submit Early</span>
              </button>
            </div>
          </div>
        )}

        {/* Evaluating */}
        {phase === 'evaluating' && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-medium text-lg">Evaluating your speech...</p>
              <p className="text-gray-400 text-sm mt-1">AI is analyzing your fluency, grammar, vocabulary, and relevance</p>
            </div>
          </div>
        )}

        {/* Results */}
        {phase === 'results' && evaluation && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-400 mb-2">Overall Score</p>
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(evaluation.overallScore, 100)}`}>
                {evaluation.overallScore}
              </div>
              <p className="text-gray-500">out of 100</p>
              <p className={`text-lg font-semibold mt-2 ${getScoreColor(evaluation.overallScore, 100)}`}>
                {getOverallLabel(evaluation.overallScore)}
              </p>
              {speechInfo && (
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-400">
                  <span>{speechInfo.wordCount} words spoken</span>
                  <span>{Math.floor(speechInfo.duration / 60)}m {speechInfo.duration % 60}s duration</span>
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Fluency', score: evaluation.fluency, icon: MessageSquare },
                { label: 'Grammar', score: evaluation.grammar, icon: BookOpen },
                { label: 'Vocabulary', score: evaluation.vocabulary, icon: Award },
                { label: 'Relevance', score: evaluation.relevance, icon: Target },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{item.label}</span>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(item.score, 25)}`}>
                      {item.score}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">out of 25</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBg(item.score, 25)}`}
                        style={{ width: `${(item.score / 25) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feedback */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Feedback</h3>
                  <p className="text-gray-600 leading-relaxed">{evaluation.feedback}</p>
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluation.strengths?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-green-700 mb-3 flex items-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>Strengths</span>
                  </h3>
                  <ul className="space-y-2">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.improvements?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-orange-700 mb-3 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Areas to Improve</span>
                  </h3>
                  <ul className="space-y-2">
                    {evaluation.improvements.map((s, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sample Corrections */}
            {evaluation.sampleCorrections && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-2">Suggested Corrections</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{evaluation.sampleCorrections}</p>
              </div>
            )}

            {/* Your Transcript */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-2">Your Transcript</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{transcript}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button onClick={handleTryAgain} className="btn-primary flex items-center space-x-2 px-6 py-3">
                <RotateCcw className="w-4 h-4" />
                <span>Try Same Topic</span>
              </button>
              <button
                onClick={handleNewTopic}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <span>New Topic</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicSpeaking;
