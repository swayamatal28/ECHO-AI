import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Send, Loader, CheckCircle2, PenTool, BookOpen, AlignLeft } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const BlogWriting = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [intro, setIntro] = useState('');
  const [main, setMain] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [topicLoading, setTopicLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const fetchTopic = async () => {
    try {
      setTopicLoading(true);
      setError('');
      setResult(null);
      setIntro('');
      setMain('');
      setEnd('');
      const res = await axiosInstance.get('/blog-writing/topic');
      setTopic(res.data.data.topic);
    } catch {
      setError('Failed to fetch topic. Try again.');
    } finally {
      setTopicLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!intro.trim() || !main.trim() || !end.trim()) {
      setError('Please fill in all three sections before submitting.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.post('/blog-writing/evaluate', { topic, intro, main, end });
      setResult(res.data.data);
    } catch {
      setError('Evaluation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setTopic('');
    setIntro('');
    setMain('');
    setEnd('');
    setResult(null);
    setError('');
  };

  const wordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

  if (!topic) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard/practice')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Practice
        </button>

        <div className="text-center py-16">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <PenTool className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Blog Writing</h1>
          <p className="text-gray-500 mb-2 max-w-md mx-auto">
            Get a random topic and write a structured blog with an introduction, main body, and conclusion. AI will evaluate your writing and score it out of 10.
          </p>
          <p className="text-sm text-gray-400 mb-8">Each section should be at least a few sentences long for a fair evaluation.</p>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <button
            onClick={fetchTopic}
            disabled={topicLoading}
            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {topicLoading ? <Loader className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Get a Topic
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard/practice')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Practice
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary-600 p-8 text-white text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-1">Evaluation Complete</h2>
            <p className="text-white/80 text-sm">Topic: {topic}</p>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary-600">{result.scaledScore}</div>
                <div className="text-gray-500 text-sm">/10</div>
              </div>
              <div className="text-left text-sm text-gray-400 border-l border-gray-200 pl-4">
                <div>Raw score: {result.totalScore}/100</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Grammar', score: result.grammar, max: 25, color: 'bg-blue-500' },
                { label: 'Structure', score: result.structure, max: 25, color: 'bg-green-500' },
                { label: 'Vocabulary', score: result.vocabulary, max: 25, color: 'bg-purple-500' },
                { label: 'Content', score: result.content, max: 25, color: 'bg-orange-500' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-lg font-bold text-gray-900">{item.score}/{item.max}</div>
                  <div className="text-xs text-gray-500 mb-2">{item.label}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${(item.score / item.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Feedback</h3>
              <p className="text-gray-600 text-sm">{result.feedback}</p>
            </div>

            {result.improvements && result.improvements.length > 0 && (
              <div className="bg-yellow-50 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">How to Improve</h3>
                <ul className="space-y-1">
                  {result.improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span> {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button onClick={resetAll} className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                Try Another Topic
              </button>
              <button onClick={() => navigate('/dashboard/practice')} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors">
                Back to Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('/dashboard/practice')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Practice
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">✍️ Blog Writing</h1>
        <p className="text-gray-500">Write a structured blog on the given topic</p>
      </div>

      <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 mb-6 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-xs text-primary-500 font-medium mb-1">YOUR TOPIC</div>
          <div className="text-lg font-semibold text-gray-900">{topic}</div>
        </div>
        <button onClick={fetchTopic} disabled={topicLoading} className="ml-auto text-primary-500 hover:text-primary-700 transition-colors" title="Get new topic">
          <RefreshCw className={`w-4 h-4 ${topicLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">{error}</div>}

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center text-xs font-bold">1</span>
              Introduction
            </label>
            <span className="text-xs text-gray-400">{wordCount(intro)} words</span>
          </div>
          <textarea
            value={intro}
            onChange={e => setIntro(e.target.value)}
            placeholder="Set the context, hook the reader, and introduce what you'll discuss..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-100 text-green-600 rounded-md flex items-center justify-center text-xs font-bold">2</span>
              Main Body
            </label>
            <span className="text-xs text-gray-400">{wordCount(main)} words</span>
          </div>
          <textarea
            value={main}
            onChange={e => setMain(e.target.value)}
            placeholder="Develop your arguments, provide examples, discuss different perspectives..."
            rows={8}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-md flex items-center justify-center text-xs font-bold">3</span>
              Conclusion
            </label>
            <span className="text-xs text-gray-400">{wordCount(end)} words</span>
          </div>
          <textarea
            value={end}
            onChange={e => setEnd(e.target.value)}
            placeholder="Summarize your key points and leave the reader with a final thought..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
        <div className="text-sm text-gray-500">
          Total: {wordCount(intro) + wordCount(main) + wordCount(end)} words
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !intro.trim() || !main.trim() || !end.trim()}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? 'Evaluating...' : 'Submit for Evaluation'}
        </button>
      </div>
    </div>
  );
};

export default BlogWriting;
