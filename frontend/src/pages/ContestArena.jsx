import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, Mic, MicOff, Square,
  ChevronRight, ChevronLeft, Send, Trophy, BookOpen, Volume2,
  AlertCircle, Award, TrendingUp, TrendingDown,
} from 'lucide-react';

const ContestArena = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(1);

  // Section 1: Grammar
  const [grammarAnswers, setGrammarAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);

  // Section 2: Speaking
  const [isRecordingSpeaking, setIsRecordingSpeaking] = useState(false);
  const [speakingTranscript, setSpeakingTranscript] = useState('');
  const [speakingDone, setSpeakingDone] = useState(false);

  // Section 3: Reading
  const [isRecordingReading, setIsRecordingReading] = useState(false);
  const [readingTranscript, setReadingTranscript] = useState('');
  const [readingDone, setReadingDone] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(70 * 60);

  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchContest();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (submitted || result || !contest) return;
    if (contest.status === 'completed' && contest.userSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, result, contest]);

  const fetchContest = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/contests/${id}`);
      const data = res.data.data;
      setContest(data);
      setGrammarAnswers(new Array(data.grammarQuestions.length).fill(''));
      if (data.userSubmitted) {
        setSubmitted(true);
        setResult(data.existingSubmission);
      }
    } catch (err) {
      console.error('Failed to fetch contest:', err);
    } finally {
      setLoading(false);
    }
  };

  const startRecognition = (onResult, onEnd) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome.');
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    let finalText = '';
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t + ' ';
        else interim = t;
      }
      onResult(finalText + interim);
    };
    recognition.onerror = () => { onEnd(finalText); };
    recognition.onend = () => { onEnd(finalText); };
    recognition.start();
    return recognition;
  };

  const toggleSpeaking = () => {
    if (isRecordingSpeaking) {
      recognitionRef.current?.stop();
      setIsRecordingSpeaking(false);
      setSpeakingDone(true);
    } else {
      setSpeakingTranscript('');
      const rec = startRecognition(
        (text) => setSpeakingTranscript(text),
        (finalText) => {
          setSpeakingTranscript(finalText);
          setIsRecordingSpeaking(false);
          setSpeakingDone(true);
        }
      );
      recognitionRef.current = rec;
      if (rec) setIsRecordingSpeaking(true);
    }
  };

  const toggleReading = () => {
    if (isRecordingReading) {
      recognitionRef.current?.stop();
      setIsRecordingReading(false);
      setReadingDone(true);
    } else {
      setReadingTranscript('');
      const rec = startRecognition(
        (text) => setReadingTranscript(text),
        (finalText) => {
          setReadingTranscript(finalText);
          setIsRecordingReading(false);
          setReadingDone(true);
        }
      );
      recognitionRef.current = rec;
      if (rec) setIsRecordingReading(true);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await axiosInstance.post(`/contests/${id}/submit`, {
        grammarAnswers: grammarAnswers.map((a, idx) => ({ questionIndex: idx, selectedAnswer: a })),
        speakingTranscript,
        readingTranscript,
      });
      setResult(res.data.data);
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading contest...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50">
        <p className="text-gray-500">Contest not found.</p>
      </div>
    );
  }

  // Result screen
  if (submitted && result) {
    const grammarMax = 100;
    const gs = (result.grammarScore ?? 0) * 10;
    const ss = result.speakingScore ?? 0;
    const rs = result.readingScore ?? 0;
    const total = result.totalScore ?? (gs + ss + rs);
    const rc = result.ratingChange ?? 0;
    const nr = result.newRating ?? null;

    return (
      <div className="bg-gray-50 min-h-full">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={() => navigate('/dashboard/contest')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Contests
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-6">
            <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contest Results</h2>
            <p className="text-gray-500">{contest.title}</p>

            <div className="text-5xl font-bold text-primary-600 my-6">{total}<span className="text-lg text-gray-400">/300</span></div>

            {nr && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-6 ${
                rc >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {rc >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                Rating: {nr} ({rc >= 0 ? '+' : ''}{rc})
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-blue-500 font-medium mb-1">Grammar</p>
                <p className="text-2xl font-bold text-blue-700">{gs}/100</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs text-green-500 font-medium mb-1">Speaking</p>
                <p className="text-2xl font-bold text-green-700">{ss}/100</p>
                {result.speakingFeedback && <p className="text-xs text-green-600 mt-1">{result.speakingFeedback}</p>}
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-xs text-purple-500 font-medium mb-1">Reading</p>
                <p className="text-2xl font-bold text-purple-700">{rs}/100</p>
                {result.readingFeedback && <p className="text-xs text-purple-600 mt-1">{result.readingFeedback}</p>}
              </div>
            </div>
          </div>

          {/* Show grammar answers review for completed contests */}
          {contest.status === 'completed' && contest.grammarQuestions[0]?.answer && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Grammar Review</h3>
              <div className="space-y-4">
                {contest.grammarQuestions.map((q, idx) => {
                  const userAns = result.grammarAnswers?.[idx]?.selectedAnswer || grammarAnswers[idx] || '';
                  const isCorrect = result.grammarAnswers?.[idx]?.isCorrect ?? (userAns.toLowerCase().trim() === q.answer.toLowerCase().trim());
                  return (
                    <div key={idx} className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-start gap-2">
                        {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />}
                        <div>
                          <p className="text-sm font-medium text-gray-800">Q{idx + 1}. {q.question}</p>
                          {!isCorrect && <p className="text-xs text-red-600 mt-1">Your answer: {userAns || '(skipped)'}</p>}
                          <p className="text-xs text-green-700 mt-0.5">Correct: {q.answer}</p>
                          {q.explanation && <p className="text-xs text-gray-500 mt-1">{q.explanation}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const gqs = contest.grammarQuestions;

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/dashboard/contest')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="font-bold text-gray-900">{contest.title}</h2>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-sm ${
            timeLeft <= 300 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { num: 1, label: 'Grammar', icon: BookOpen, done: grammarAnswers.filter(a => a).length === gqs.length },
            { num: 2, label: 'Speaking', icon: Mic, done: speakingDone },
            { num: 3, label: 'Reading', icon: Volume2, done: readingDone },
          ].map(sec => (
            <button
              key={sec.num}
              onClick={() => setActiveSection(sec.num)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeSection === sec.num
                  ? 'bg-primary-600 text-white shadow-md'
                  : sec.done
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <sec.icon className="w-4 h-4" />
              Section {sec.num}: {sec.label}
              {sec.done && activeSection !== sec.num && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </button>
          ))}
        </div>

        {/* Section 1: Grammar MCQs */}
        {activeSection === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Question {currentQ + 1} of {gqs.length}</h3>
              <div className="flex gap-1">
                {gqs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      currentQ === i
                        ? 'bg-primary-600 text-white'
                        : grammarAnswers[i]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-lg text-gray-800 font-medium mb-4">{gqs[currentQ].question}</p>
              <div className="grid grid-cols-1 gap-3">
                {gqs[currentQ].options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => {
                      const updated = [...grammarAnswers];
                      updated[currentQ] = opt;
                      setGrammarAnswers(updated);
                    }}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      grammarAnswers[currentQ] === opt
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      grammarAnswers[currentQ] === opt
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + oi)}
                    </div>
                    <span className="font-medium">{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                disabled={currentQ === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm text-gray-400">
                {grammarAnswers.filter(a => a).length}/{gqs.length} answered
              </span>
              {currentQ < gqs.length - 1 ? (
                <button
                  onClick={() => setCurrentQ(prev => prev + 1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveSection(2)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Go to Speaking <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Section 2: Speaking */}
        {activeSection === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-2">Speaking Challenge</h3>
            <p className="text-sm text-gray-500 mb-6">Record yourself speaking on the following topic</p>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 mb-6">
              <h4 className="font-bold text-blue-900 text-lg mb-2">{contest.speakingTopic.topic}</h4>
              <p className="text-sm text-blue-700">{contest.speakingTopic.description}</p>
              <p className="text-xs text-blue-500 mt-2">
                Speak for {contest.speakingTopic.minDurationSec}–{contest.speakingTopic.maxDurationSec} seconds
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={toggleSpeaking}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isRecordingSpeaking
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-primary-600 hover:bg-primary-700'
                } text-white`}
              >
                {isRecordingSpeaking ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <p className="text-sm text-gray-500">
                {isRecordingSpeaking ? '🔴 Recording... Click to stop' : speakingDone ? '✅ Recording saved' : 'Click to start recording'}
              </p>
            </div>

            {speakingTranscript && (
              <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-400 mb-2 font-medium">Your speech transcript:</p>
                <p className="text-sm text-gray-700 leading-relaxed">{speakingTranscript}</p>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => setActiveSection(1)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                <ChevronLeft className="w-4 h-4" /> Back to Grammar
              </button>
              <button onClick={() => setActiveSection(3)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                Go to Reading <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Section 3: Reading */}
        {activeSection === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-2">Reading Challenge</h3>
            <p className="text-sm text-gray-500 mb-6">Read the following paragraph aloud and record your voice</p>

            <div className="bg-purple-50 rounded-xl p-5 border border-purple-100 mb-6">
              <h4 className="font-semibold text-purple-900 mb-2">{contest.readingParagraph.title}</h4>
              <p className="text-gray-800 leading-relaxed">{contest.readingParagraph.text}</p>
              <p className="text-xs text-purple-500 mt-2">{contest.readingParagraph.wordCount} words</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={toggleReading}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isRecordingReading
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                {isRecordingReading ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <p className="text-sm text-gray-500">
                {isRecordingReading ? '🔴 Recording... Click to stop' : readingDone ? '✅ Recording saved' : 'Click to start recording'}
              </p>
            </div>

            {readingTranscript && (
              <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-400 mb-2 font-medium">Your reading transcript:</p>
                <p className="text-sm text-gray-700 leading-relaxed">{readingTranscript}</p>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => setActiveSection(2)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                <ChevronLeft className="w-4 h-4" /> Back to Speaking
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Contest
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Summary bar */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Grammar: {grammarAnswers.filter(a => a).length}/{gqs.length}
            </span>
            <span className="flex items-center gap-1">
              <Mic className="w-4 h-4" />
              Speaking: {speakingDone ? '✅' : '❌'}
            </span>
            <span className="flex items-center gap-1">
              <Volume2 className="w-4 h-4" />
              Reading: {readingDone ? '✅' : '❌'}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Submit All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestArena;
