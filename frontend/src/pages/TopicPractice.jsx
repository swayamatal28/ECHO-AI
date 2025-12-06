import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, Loader, ChevronDown, ChevronUp,
  BookOpen, Lightbulb, Filter, RotateCcw
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const diffBadge = {
  Easy: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Hard: 'bg-red-100 text-red-700 border-red-200',
};

const typeBadge = {
  mcq: 'bg-blue-100 text-blue-700',
  sentence: 'bg-purple-100 text-purple-700',
};

const TopicPractice = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [filterDiff, setFilterDiff] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Per-question state: { [qId]: { selectedOption, userInput, submitted, correct, correctAnswer, explanation, showExplanation } }
  const [qState, setQState] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, [slug]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/practice/topics/${slug}`);
      setTopic(res.data.data.topic);
      const qs = res.data.data.questions || [];
      setQuestions(qs);

      // Initialize state for each question
      const init = {};
      qs.forEach(q => {
        init[q._id] = {
          selectedOption: null,
          userInput: '',
          submitted: q.solved,
          correct: q.solved,
          correctAnswer: '',
          explanation: '',
          showExplanation: false,
        };
      });
      setQState(init);
    } catch (err) {
      console.error(err);
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const updateQ = useCallback((qId, patch) => {
    setQState(prev => ({ ...prev, [qId]: { ...prev[qId], ...patch } }));
  }, []);

  const handleSubmit = async (q) => {
    const state = qState[q._id];
    const userAnswer = q.type === 'mcq' ? state.selectedOption : state.userInput;

    if (!userAnswer || !userAnswer.trim()) return;

    try {
      const res = await axiosInstance.post('/practice/submit', {
        questionId: q._id,
        userAnswer: userAnswer.trim(),
      });

      const { correct, correctAnswer, explanation } = res.data.data;

      updateQ(q._id, {
        submitted: true,
        correct,
        correctAnswer,
        explanation,
      });

      // Mark as solved in the questions array too
      if (correct) {
        setQuestions(prev => prev.map(qq => qq._id === q._id ? { ...qq, solved: true } : qq));
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleReset = (qId) => {
    updateQ(qId, {
      selectedOption: null,
      userInput: '',
      submitted: false,
      correct: false,
      correctAnswer: '',
      explanation: '',
      showExplanation: false,
    });
  };

  // Filter questions
  const filtered = questions.filter(q => {
    if (filterDiff !== 'all' && q.difficulty !== filterDiff) return false;
    if (filterType !== 'all' && q.type !== filterType) return false;
    if (filterStatus === 'solved' && !q.solved) return false;
    if (filterStatus === 'unsolved' && q.solved) return false;
    return true;
  });

  const totalSolved = questions.filter(q => q.solved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back button + Header */}
      <button
        onClick={() => navigate('/dashboard/practice')}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Topics</span>
      </button>

      {topic && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-2xl">{topic.icon}</span>
            {topic.name}
          </h1>
          <p className="text-gray-500 mt-1">
            {totalSolved}/{questions.length} questions solved
          </p>
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div
              className="h-2 rounded-full bg-green-500 transition-all"
              style={{ width: questions.length > 0 ? `${(totalSolved / questions.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">{error}</div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />

        <select
          value={filterDiff}
          onChange={e => setFilterDiff(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Types</option>
          <option value="mcq">MCQ</option>
          <option value="sentence">Fill in the Blank</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="solved">Solved</option>
          <option value="unsolved">Unsolved</option>
        </select>

        <span className="text-xs text-gray-400 ml-auto">{filtered.length} questions</span>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filtered.map((q, index) => {
          const qs = qState[q._id] || {};
          const alreadySolved = q.solved && !qs.submitted;

          return (
            <div
              key={q._id}
              className={`bg-white rounded-xl shadow-sm border transition-all ${
                qs.submitted && qs.correct ? 'border-green-200' :
                qs.submitted && !qs.correct ? 'border-red-200' :
                alreadySolved ? 'border-green-100' :
                'border-gray-100'
              }`}
            >
              <div className="p-5">
                {/* Question header */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-sm font-mono text-gray-400 mt-0.5">
                    #{questions.indexOf(q) + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${diffBadge[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeBadge[q.type]}`}>
                        {q.type === 'mcq' ? 'MCQ' : 'Fill in the Blank'}
                      </span>
                      {(alreadySolved || (qs.submitted && qs.correct)) && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-900 font-medium leading-relaxed">{q.question}</p>
                  </div>
                </div>

                {/* MCQ Options */}
                {q.type === 'mcq' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 ml-8">
                    {q.options.map((opt, i) => {
                      const isSelected = qs.selectedOption === opt;
                      const isCorrectAnswer = qs.submitted && qs.correctAnswer === opt;
                      const isWrongSelection = qs.submitted && isSelected && !qs.correct;

                      let optClasses = 'border-gray-200 hover:border-primary-300 hover:bg-primary-50';
                      if (isSelected && !qs.submitted) optClasses = 'border-primary-500 bg-primary-50';
                      if (isCorrectAnswer) optClasses = 'border-green-500 bg-green-50';
                      if (isWrongSelection) optClasses = 'border-red-500 bg-red-50';

                      return (
                        <button
                          key={i}
                          onClick={() => !qs.submitted && updateQ(q._id, { selectedOption: opt })}
                          disabled={qs.submitted}
                          className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${optClasses} ${
                            qs.submitted ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <span className="font-medium text-gray-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                          <span className="text-gray-800">{opt}</span>
                          {isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-green-500 inline ml-2" />}
                          {isWrongSelection && <XCircle className="w-4 h-4 text-red-500 inline ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sentence Input */}
                {q.type === 'sentence' && (
                  <div className="mb-4 ml-8">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={qs.userInput || ''}
                        onChange={e => !qs.submitted && updateQ(q._id, { userInput: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && !qs.submitted && handleSubmit(q)}
                        placeholder="Type your answer..."
                        disabled={qs.submitted}
                        className={`flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          qs.submitted && qs.correct ? 'border-green-300 bg-green-50' :
                          qs.submitted && !qs.correct ? 'border-red-300 bg-red-50' :
                          'border-gray-200'
                        }`}
                      />
                    </div>
                    {qs.submitted && !qs.correct && (
                      <p className="text-sm text-green-700 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct answer: <strong>{qs.correctAnswer}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Submit / Result row */}
                <div className="flex items-center gap-3 ml-8">
                  {!qs.submitted && !alreadySolved && (
                    <button
                      onClick={() => handleSubmit(q)}
                      disabled={q.type === 'mcq' ? !qs.selectedOption : !qs.userInput?.trim()}
                      className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit
                    </button>
                  )}

                  {qs.submitted && (
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-sm font-semibold ${qs.correct ? 'text-green-600' : 'text-red-600'}`}>
                        {qs.correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {qs.correct ? 'Correct!' : 'Incorrect'}
                      </span>

                      {!qs.correct && (
                        <button
                          onClick={() => handleReset(q._id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-primary-600 border border-gray-200 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Retry
                        </button>
                      )}

                      {qs.explanation && (
                        <button
                          onClick={() => updateQ(q._id, { showExplanation: !qs.showExplanation })}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-primary-600 border border-gray-200 rounded-lg transition-colors"
                        >
                          <Lightbulb className="w-3 h-3" />
                          {qs.showExplanation ? 'Hide' : 'Explain'}
                          {qs.showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  )}

                  {alreadySolved && (
                    <span className="text-sm text-green-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Already solved
                    </span>
                  )}
                </div>

                {/* Explanation */}
                {qs.showExplanation && qs.explanation && (
                  <div className="mt-3 ml-8 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {qs.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No questions match your filters.</p>
        </div>
      )}
    </div>
  );
};

export default TopicPractice;
