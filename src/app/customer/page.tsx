'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore, MOCK_PROFILE } from '@/lib/useStore';
import { Send, Plane, User, Bot, AlertTriangle, Headphones, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

const CUSTOMER_SUGGESTIONS = [
  { label: 'Points & Tier', text: 'Can you check my points balance and Platinum tier perks?' },
  { label: 'Baggage Allowance', text: 'What is my baggage allowance for my next flight?' },
  { label: 'Delay Compensation', text: 'My flight was delayed by 4 hours. I need compensation and flight rebooking assistance.' },
  { label: 'Lost Baggage', text: 'My checked baggage did not arrive on flight AI-204. I need to file an urgent claim.' },
  { label: 'Talk to Human', text: 'I would like to speak directly with a live human agent please.' },
];

export default function CustomerPage() {
  const { session, updateSession, isLoaded } = useStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isLoading]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = (customMessage ?? input).trim();
    if (!textToSend || !isLoaded || isLoading) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: textToSend,
      timestamp: Date.now(),
    };

    const newSession = {
      ...session,
      messages: [...session.messages, userMessage],
    };
    
    updateSession(newSession);
    setInput('');

    // If human agent has taken over the ticket, deliver customer message directly to agent workspace without AI auto-reply
    if (session.handledBy === 'agent' && session.status === 'agent_handling') {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newSession.messages,
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

      const botMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'bot' as const,
        content: data.reply,
        timestamp: Date.now(),
      };

      if (data.needsEscalation) {
        updateSession({
          ...newSession,
          status: 'escalated',
          handledBy: 'ai',
          escalationInfo: {
            reason: data.escalationReason || 'Customer inquiry requires human agent assistance',
            urgency: data.urgency || 'high',
            timestamp: Date.now(),
          },
          messages: [...newSession.messages, botMessage],
        });
      } else {
        updateSession({
          ...newSession,
          status: session.status === 'escalated' ? 'escalated' : 'active',
          messages: [...newSession.messages, botMessage],
        });
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'An error occurred while sending the message.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEscalate = () => {
    handleSend('I need immediate assistance from a live human agent.');
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
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-700/60 rounded-lg">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">Airo Airlines</h1>
            <span className="text-xs text-blue-200">Customer Support Portal</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetSession}
            title="Reset Chat Session"
            className="flex items-center gap-1 text-xs text-blue-100 hover:text-white bg-blue-700/60 hover:bg-blue-700 px-2.5 py-1.5 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          
          <div className="flex items-center gap-2 text-sm bg-blue-700/60 px-3 py-1.5 rounded-md">
            <User className="w-4 h-4" />
            <span className="font-medium">{MOCK_PROFILE.name}</span>
            <span className="text-xs bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded">
              {MOCK_PROFILE.loyaltyTier}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col min-h-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
          
          {/* Subheader with Ticket Handler Status */}
          <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              {isAgentHandling ? (
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <Headphones className="w-4 h-4 text-emerald-600" />
                  <span>Live Operations Agent Connected</span>
                </div>
              ) : isEscalated ? (
                <div className="flex items-center gap-2 text-amber-700">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Ticket Escalated to Agent Workspace</span>
                </div>
              ) : isResolved ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ticket Resolved</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-blue-700">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span>Airo AI Assistant (Instant Resolution)</span>
                </div>
              )}
            </div>

            {!isAgentHandling && !isEscalated && (
              <button
                onClick={handleManualEscalate}
                className="text-xs text-gray-600 hover:text-blue-700 bg-white hover:bg-gray-100 border border-gray-300 px-2.5 py-1 rounded transition-colors"
              >
                Request Human Agent
              </button>
            )}
          </div>

          {/* Alert Banner for Escalation */}
          {isEscalated && !isAgentHandling && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Alert Sent to Operations:</strong> {session.escalationInfo?.reason || 'Agent review required'}. A human agent has received your ticket in their workspace.
                </span>
              </div>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-semibold uppercase text-[10px] tracking-wider shrink-0 ml-2">
                {session.escalationInfo?.urgency || 'HIGH'} PRIORITY
              </span>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            {session.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${
                  msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : msg.role === 'agent'
                      ? 'bg-amber-100 text-amber-950 rounded-bl-none border border-amber-200'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'agent' && (
                    <div className="text-xs font-bold mb-1 flex items-center gap-1.5 text-amber-900">
                      <Headphones className="w-3.5 h-3.5 text-amber-700" />
                      Live Agent (Operations)
                    </div>
                  )}
                  {msg.role === 'bot' && (
                    <div className="text-xs font-bold mb-1 text-blue-700 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                      AI Assistant
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="self-start px-4 py-2.5 bg-gray-100 text-gray-600 rounded-2xl rounded-bl-none text-sm flex items-center gap-2 animate-pulse">
                <Bot className="w-4 h-4 text-blue-600 animate-spin" />
                Airo is analyzing and preparing reply...
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Click-to-Send Common Suggestion Messages */}
          <div className="p-2.5 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-2 px-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Suggested Inquiries (Click to send):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CUSTOMER_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSend(item.text)}
                  className="text-xs bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 transition-all text-left shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3.5 border-t border-gray-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isAgentHandling
                    ? "Type message to live agent..."
                    : isEscalated
                    ? "Agent notified. Type additional notes..."
                    : "Type your query or click a suggestion above..."
                }
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}

