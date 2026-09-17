'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore, MOCK_PROFILE } from '@/lib/useStore';
import {
  Send,
  Sparkles,
  MessageSquare,
  Briefcase,
  Award,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Bot,
  RotateCcw,
  Clock,
  ShieldAlert
} from 'lucide-react';

const AGENT_SUGGESTIONS = [
  {
    label: 'Take Over & Greet',
    text: `Hello ${MOCK_PROFILE.name}, I am taking over this ticket. I am looking into your booking details right now to get this resolved for you.`,
  },
  {
    label: 'Rebook Flight',
    text: 'I have rebooked you onto the next available flight (Departure: 18:30) with premium seat selection confirmed at no additional charge.',
  },
  {
    label: '5,000 Bonus Miles',
    text: `As a token of our apologies for the disruption, I have credited 5,000 bonus frequent flyer points to your Platinum account (${MOCK_PROFILE.id}).`,
  },
  {
    label: 'Baggage Trace',
    text: 'I have opened a priority baggage trace ticket #BG-8821 with airport ground dispatch. A courier will deliver it to your address once scanned.',
  },
  {
    label: 'Inquiry Resolved',
    text: 'Is there anything else I can assist you with today regarding your travel plans?',
  },
];

export default function AgentPage() {
  const { session, updateSession, isLoaded } = useStore();
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  const handleSend = (customMessage?: string) => {
    const textToSend = (customMessage ?? input).trim();
    if (!textToSend || !isLoaded) return;

    const newSession = {
      ...session,
      status: session.status === 'escalated' ? ('agent_handling' as const) : session.status,
      handledBy: 'agent' as const,
      messages: [
        ...session.messages,
        {
          id: `msg-${Date.now()}`,
          role: 'agent' as const,
          content: textToSend,
          timestamp: Date.now(),
        },
      ],
    };
    
    updateSession(newSession);
    setInput('');
  };

  const handleTakeOver = () => {
    updateSession({
      ...session,
      status: 'agent_handling',
      handledBy: 'agent',
    });
  };

  const handleResolveTicket = () => {
    updateSession({
      ...session,
      status: 'resolved',
      messages: [
        ...session.messages,
        {
          id: `msg-${Date.now()}`,
          role: 'agent' as const,
          content: 'This support ticket has been marked as resolved. Thank you for choosing Airo Airlines!',
          timestamp: Date.now(),
        },
      ],
    });
  };

  const handlePassBackToAI = () => {
    updateSession({
      ...session,
      status: 'active',
      handledBy: 'ai',
      escalationInfo: undefined,
    });
  };

  const handleAgentAssist = async () => {
    if (!isLoaded || session.messages.length === 0) return;
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: session.messages,
          customerProfile: MOCK_PROFILE,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('API Error: Could not parse response');
      }

      if (!res.ok) {
        throw new Error(data.error || 'API Error');
      }
      
      setInput(data.reply);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'An error occurred while generating assistance.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetSession = () => {
    if (confirm('Reset chat session to default?')) {
      const defaultState = {
        id: `sess-${Date.now().toString().slice(-4)}`,
        customerId: MOCK_PROFILE.id,
        status: 'active' as const,
        handledBy: 'ai' as const,
        messages: [
          {
            id: `msg-${Date.now()}`,
            role: 'bot' as const,
            content: `Hello ${MOCK_PROFILE.name}! I am Airo, your virtual assistant. How can I help you today?`,
            timestamp: Date.now(),
          }
        ],
      };
      updateSession(defaultState);
    }
  };

  if (!isLoaded) return <div className="p-8 font-sans">Loading...</div>;

  const isEscalated = session.status === 'escalated';
  const isAgentHandling = session.handledBy === 'agent' && session.status === 'agent_handling';
  const isResolved = session.status === 'resolved';

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar - CRM Profile */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <h1 className="font-bold">Airo Workspace</h1>
          </div>
          <button
            onClick={handleResetSession}
            title="Reset Session"
            className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Profile</h2>
          
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {MOCK_PROFILE.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900">{MOCK_PROFILE.name}</div>
                <div className="text-xs text-blue-800 font-semibold flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> {MOCK_PROFILE.loyaltyTier} Member
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-blue-100/70 pb-1.5">
                <span className="text-gray-500">Customer ID</span>
                <span className="font-semibold text-gray-900">{MOCK_PROFILE.id}</span>
              </div>
              <div className="flex justify-between border-b border-blue-100/70 pb-1.5">
                <span className="text-gray-500">Points Balance</span>
                <span className="font-semibold text-gray-900">{MOCK_PROFILE.pointsBalance.toLocaleString()} pts</span>
              </div>
              <div className="flex justify-between border-b border-blue-100/70 pb-1.5">
                <span className="text-gray-500">Last Flight</span>
                <span className="font-semibold text-gray-900">{MOCK_PROFILE.lastBooking}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-gray-500">Preferences</span>
                <span className="font-semibold text-gray-900 capitalize">{MOCK_PROFILE.preferences.seat}, {MOCK_PROFILE.preferences.meal}</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Active Ticket & Routing</h2>
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Status</span>
              {isEscalated ? (
                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-bold animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Escalated
                </span>
              ) : isAgentHandling ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> In Progress
                </span>
              ) : isResolved ? (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-semibold">
                  Resolved
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-semibold">
                  AI Active
                </span>
              )}
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Handled By</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1">
                {session.handledBy === 'agent' ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Agent (You)
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                    Airo AI
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Session ID</span>
              <span className="font-mono text-gray-700">{session.id}</span>
            </div>

            {session.escalationInfo && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-[11px] text-gray-500 font-semibold mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  Escalation Trigger:
                </div>
                <div className="bg-amber-50 text-amber-900 p-2 rounded border border-amber-200 text-[11px]">
                  <p className="font-medium">{session.escalationInfo.reason}</p>
                  <p className="text-[10px] text-amber-700 mt-1 uppercase font-bold">
                    Urgency: {session.escalationInfo.urgency}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Top Header */}
        <header className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2 font-medium text-gray-800 text-sm">
            <MessageSquare className="w-5 h-5 text-gray-500" />
            <span>Active Case: <strong>{MOCK_PROFILE.name}</strong> ({session.id})</span>
          </div>

          <div className="flex items-center gap-2">
            {isEscalated && (
              <button
                onClick={handleTakeOver}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors animate-bounce"
              >
                <UserCheck className="w-4 h-4" />
                Take Over Ticket
              </button>
            )}

            {isAgentHandling && (
              <>
                <button
                  onClick={handleResolveTicket}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Resolved
                </button>
                <button
                  onClick={handlePassBackToAI}
                  className="text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Return to AI
                </button>
              </>
            )}
          </div>
        </header>

        {/* Escalation Alert Notification Banner */}
        {isEscalated && (
          <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-900 uppercase tracking-wide">
                    ⚠️ Ticket Escalation Alert: Customer Needs Assistance
                  </span>
                  <span className="text-[10px] bg-red-200 text-red-900 font-extrabold px-2 py-0.5 rounded uppercase">
                    {session.escalationInfo?.urgency || 'HIGH'} PRIORITY
                  </span>
                </div>
                <p className="text-xs text-red-800 mt-0.5">
                  <strong>Reason:</strong> {session.escalationInfo?.reason || 'Customer inquiry exceeds AI resolution scope.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTakeOver}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                Accept & Take Over
              </button>
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-slate-50">
          {session.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[70%] ${
                msg.role === 'agent' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                  msg.role === 'agent'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : msg.role === 'user'
                    ? 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                    : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.role === 'agent' && (
                  <div className="text-xs font-bold text-blue-100 mb-1 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Agent (You)
                  </div>
                )}
                {msg.role === 'bot' && (
                  <div className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                    <Bot className="w-3 h-3" /> AI Assistant
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="text-xs font-bold text-gray-600 mb-1">
                    Customer ({MOCK_PROFILE.name})
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Footer Area: AI Assist & Click-to-Send Suggestion Messages */}
        <div className="p-3.5 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Quick Agent Responses (Click to send):</span>
            </div>
            
            <button
              onClick={handleAgentAssist}
              disabled={isGenerating || session.messages.length === 0}
              className="flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? 'Analyzing with Gemini...' : 'Generate AI Assist Draft'}
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {AGENT_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(item.text)}
                className="text-xs bg-gray-50 hover:bg-slate-900 hover:text-white text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 transition-all text-left shadow-2xs font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type agent reply or click a quick response above..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-18 text-black text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}

