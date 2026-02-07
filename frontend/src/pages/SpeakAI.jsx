import { useNavigate } from 'react-router-dom';
import { Mic, MessageCircle, SpellCheck, ArrowRight, Bot } from 'lucide-react';

const SpeakAI = () => {
  const navigate = useNavigate();

  const modes = [
    {
      id: 'topic',
      title: 'Topic Speaking',
      description: 'Get a random topic and speak for 2 minutes. AI evaluates your fluency, grammar, vocabulary, and relevance — scores update your profile.',
      icon: Mic,
      gradient: 'from-blue-500 to-indigo-600',
      features: ['Random topic generation', '2-minute timed session', 'Detailed AI evaluation', 'Profile score tracking'],
      path: '/dashboard/speak-ai/topic',
    },
    {
      id: 'conversation',
      title: 'Free Conversation',
      description: 'Have a natural conversation with AI. It leads the chat, keeps it flowing, and rates your English at the end with a full report card.',
      icon: MessageCircle,
      gradient: 'from-emerald-500 to-green-600',
      features: ['AI-led conversation', 'Voice & text modes', 'Fluency report card', 'Grammar & vocabulary analysis'],
      path: '/dashboard/speak-ai/conversation',
    },
    {
      id: 'correction',
      title: 'Real-time Correction',
      description: 'Chat freely while AI corrects every sentence instantly. See your mistakes, the corrected version, and the grammar rule — all in real time.',
      icon: SpellCheck,
      gradient: 'from-purple-500 to-violet-600',
      features: ['Instant error detection', 'Grammar rule explanations', 'Corrected sentences shown', 'End-session summary report'],
      path: '/dashboard/speak-ai/correction',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Speak with AI</h1>
        </div>
        <p className="text-gray-500 ml-[52px]">Choose a practice mode to sharpen your English speaking skills</p>
      </div>

      {/* Mode Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <div
              key={mode.id}
              onClick={() => navigate(mode.path)}
              className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${mode.gradient} p-6`}>
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {mode.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  {mode.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5 mb-6">
                  {mode.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-2.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center space-x-2 text-primary-600 font-semibold text-sm group-hover:translate-x-1 transition-transform duration-200">
                  <span>Start Practice</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpeakAI;
