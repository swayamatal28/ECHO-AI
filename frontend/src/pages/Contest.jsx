import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import {
  Trophy, Clock, Calendar, Users, ChevronRight, MessageCircle,
  ArrowRight, Shield, Swords, ThumbsUp, Timer, CheckCircle2,
  Star, TrendingUp, AlertCircle,
} from 'lucide-react';

const Contest = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedContest, setSelectedContest] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [discussionLoading, setDiscussionLoading] = useState(false);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/contests');
      setContests(res.data.data);
    } catch (err) {
      console.error('Failed to fetch contests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async (contestId) => {
    try {
      setDiscussionLoading(true);
      const res = await axiosInstance.get(`/contests/${contestId}/discussions`);
      setDiscussions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
    } finally {
      setDiscussionLoading(false);
    }
  };

  const handleContestDiscussion = (contest) => {
    setSelectedContest(contest);
    setActiveTab('discussions');
    fetchDiscussions(contest._id);
  };

  const upcoming = contests.filter(c => c.status === 'upcoming' || c.status === 'live');
  const past = contests.filter(c => c.status === 'completed');

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getNextContestCountdown = () => {
    const next = upcoming[0];
    if (!next) return null;
    const contestDate = new Date(next.date + 'T20:00:00+05:30');
    const now = new Date();
    const diff = contestDate - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, mins, contest: next };
  };

  const countdown = getNextContestCountdown();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading contests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Swords className="w-8 h-8 text-primary-600" />
            Weekly Contests
          </h1>
          <p className="text-gray-500 mt-2">
            Every Sunday, 8:00 PM – 9:10 PM IST • Grammar, Speaking & Reading challenges
          </p>
        </div>

        {/* Next Contest Banner */}
        {countdown && (
          <div className="bg-primary-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Timer className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{countdown.contest.title}</h2>
                  <p className="text-white/80 text-sm mt-1">
                    {formatDate(countdown.contest.date)} at 8:00 PM IST
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-white/20 rounded-lg px-3 py-1 min-w-[52px]">
                      {countdown.days}
                    </div>
                    <p className="text-[10px] text-white/70 mt-1">DAYS</p>
                  </div>
                  <div className="text-2xl font-bold text-white/50 self-start pt-1">:</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-white/20 rounded-lg px-3 py-1 min-w-[52px]">
                      {countdown.hours}
                    </div>
                    <p className="text-[10px] text-white/70 mt-1">HRS</p>
                  </div>
                  <div className="text-2xl font-bold text-white/50 self-start pt-1">:</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-white/20 rounded-lg px-3 py-1 min-w-[52px]">
                      {countdown.mins}
                    </div>
                    <p className="text-[10px] text-white/70 mt-1">MIN</p>
                  </div>
                </div>
                {countdown.contest.status === 'live' ? (
                  <button
                    onClick={() => navigate(`/dashboard/contest/${countdown.contest._id}`)}
                    className="bg-white text-primary-600 font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2"
                  >
                    Enter Contest <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="bg-white/10 text-white/80 font-medium px-5 py-3 rounded-xl text-sm">
                    Starts Soon
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contest Format Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            Contest Format
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</div>
                <h4 className="font-semibold text-blue-900">Grammar MCQs</h4>
              </div>
              <p className="text-sm text-blue-700">10 multiple-choice grammar questions. Test your English grammar knowledge.</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</div>
                <h4 className="font-semibold text-green-900">Speaking</h4>
              </div>
              <p className="text-sm text-green-700">Record your voice on a given topic. Speak clearly and expressively.</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">3</div>
                <h4 className="font-semibold text-purple-900">Reading</h4>
              </div>
              <p className="text-sm text-purple-700">Read a paragraph aloud by recording your voice. Clarity and accuracy matter.</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {['upcoming', 'past', 'discussions'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab !== 'discussions') setSelectedContest(null); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'upcoming' && <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> Upcoming</span>}
              {tab === 'past' && <span className="inline-flex items-center gap-1.5"><Trophy className="w-4 h-4" /> Past Contests</span>}
              {tab === 'discussions' && <span className="inline-flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> Discussions</span>}
            </button>
          ))}
        </div>

        {/* Upcoming Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcoming.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming contests scheduled yet.</p>
              </div>
            ) : (
              upcoming.map(contest => (
                <div key={contest._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        contest.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-primary-500'
                      } text-white`}>
                        {contest.status === 'live' ? <Swords className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{contest.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {formatDate(contest.date)} • 8:00 PM – 9:10 PM IST
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {contest.status === 'live' && (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                          🔴 LIVE NOW
                        </span>
                      )}
                      <button
                        onClick={() => navigate(`/dashboard/contest/${contest._id}`)}
                        disabled={contest.status !== 'live'}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                          contest.status === 'live'
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {contest.status === 'live' ? 'Enter Contest' : 'Not Started'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Past Contests Tab */}
        {activeTab === 'past' && (
          <div className="space-y-3">
            {past.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No past contests yet.</p>
              </div>
            ) : (
              past.map(contest => (
                <div key={contest._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-500">#{contest.contestNumber}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{contest.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(contest.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Users className="w-3.5 h-3.5" />
                        {contest.participantCount}
                      </div>
                      {contest.userSubmitted ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Score: {contest.userScore}/300
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            contest.userRatingChange >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                          }`}>
                            {contest.userRatingChange >= 0 ? '+' : ''}{contest.userRatingChange}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                          Not attended
                        </span>
                      )}
                      <button
                        onClick={() => handleContestDiscussion(contest)}
                        className="text-primary-500 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50 transition-colors"
                        title="View Discussion"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/contest/${contest._id}`)}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        title="View Contest"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Discussions Tab */}
        {activeTab === 'discussions' && (
          <div>
            {!selectedContest ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Select a past contest to view its discussion</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {past.slice(0, 10).map(c => (
                    <button
                      key={c._id}
                      onClick={() => handleContestDiscussion(c)}
                      className="text-xs bg-gray-100 hover:bg-primary-50 hover:text-primary-600 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                    >
                      #{c.contestNumber}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary-500" />
                    Discussion: {selectedContest.title}
                  </h3>
                  <div className="flex gap-2">
                    {past.slice(0, 8).map(c => (
                      <button
                        key={c._id}
                        onClick={() => handleContestDiscussion(c)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-colors font-medium ${
                          selectedContest._id === c._id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        #{c.contestNumber}
                      </button>
                    ))}
                  </div>
                </div>

                {discussionLoading ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                    <div className="w-8 h-8 border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                    <p className="text-gray-400">No discussions yet for this contest.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discussions.map((d, i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary-600">
                              {d.userName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900">{d.userName}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{d.comment}</p>
                            <div className="flex items-center gap-1 mt-2">
                              <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs text-gray-400">{d.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Rating Tiers Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Rating Tiers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: 'Baratheon', rating: '1250+', color: 'bg-amber-100 border-amber-300 text-amber-800', icon: '⚔️' },
              { name: 'Stark', rating: '1500+', color: 'bg-blue-100 border-blue-300 text-blue-800', icon: '🐺' },
              { name: 'Lannister', rating: '1700+', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', icon: '🦁' },
              { name: 'Targaryen', rating: '2000+', color: 'bg-purple-100 border-purple-300 text-purple-800', icon: '🐉' },
              { name: 'Dracarys', rating: '2500+', color: 'bg-red-100 border-red-300 text-red-800', icon: '🔥' },
            ].map(t => (
              <div key={t.name} className={`${t.color} border rounded-xl p-3 text-center`}>
                <div className="text-2xl mb-1">{t.icon}</div>
                <p className="font-bold text-sm">{t.name}</p>
                <p className="text-xs opacity-75">{t.rating}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contest;
