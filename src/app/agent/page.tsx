'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore, MOCK_PROFILE } from '@/lib/useStore';
import { Users, Send, Sparkles, MessageSquare, Briefcase, Award } from 'lucide-react';

export default function AgentPage() {
  const { session, updateSession, isLoaded } = useStore();
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  const handleSend = () => {
    if (!input.trim() || !isLoaded) return;

    const newSession = {
      ...session,
      messages: [
        ...session.messages,
        {
          id: `msg-${Date.now()}`,
          role: 'agent' as const,
          content: input.trim(),
          timestamp: Date.now(),
        },
      ],
    };
    
    updateSession(newSession);
    setInput('');
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
      
      setInput(data.reply); // Put suggestion into the input box instead of auto-sending
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'An error occurred while generating assistance.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isLoaded) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar - CRM Profile */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 bg-slate-900 text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          <h1 className="font-bold">Airo Workspace</h1>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-4">Customer Profile</h2>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {MOCK_PROFILE.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900">{MOCK_PROFILE.name}</div>
                <div className="text-sm text-blue-700 flex items-center gap-1">
                  <Award className="w-4 h-4" /> {MOCK_PROFILE.loyaltyTier}
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b border-blue-100 pb-1">
                <span className="text-gray-500">ID</span>
                <span className="font-medium text-black">{MOCK_PROFILE.id}</span>
              </div>
              <div className="flex justify-between border-b border-blue-100 pb-1">
                <span className="text-gray-500">Points</span>
                <span className="font-medium text-black">{MOCK_PROFILE.pointsBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-blue-100 pb-1">
                <span className="text-gray-500">Last Flight</span>
                <span className="font-medium text-black">{MOCK_PROFILE.lastBooking}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Pref</span>
                <span className="font-medium text-black capitalize">{MOCK_PROFILE.preferences.seat}, {MOCK_PROFILE.preferences.meal}</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-4">Active Ticket</h2>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-black">
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium mb-2">Active</span>
            <p><strong>Session ID:</strong> {session.id}</p>
            <p><strong>Channel:</strong> Web Chat</p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2 font-medium text-gray-800">
            <MessageSquare className="w-5 h-5 text-gray-500" />
            Chat with {MOCK_PROFILE.name}
          </div>
        </header>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-slate-50">
          {session.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[70%] ${
                msg.role === 'agent' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl ${
                  msg.role === 'agent'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : msg.role === 'user'
                    ? 'bg-gray-200 text-gray-800 rounded-bl-none'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                }`}
              >
                {msg.role === 'bot' && (
                  <div className="text-xs font-bold text-blue-600 mb-1">AI Assistant</div>
                )}
                {msg.role === 'user' && (
                  <div className="text-xs font-bold text-gray-600 mb-1">Customer</div>
                )}
                {msg.content}
              </div>
              <span className="text-xs text-gray-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleAgentAssist}
              disabled={isGenerating || session.messages.length === 0}
              className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Agent Assist (AI)'}
            </button>
          </div>
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
              placeholder="Type your response or click Agent Assist for a suggestion..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20 text-black"
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
              className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
