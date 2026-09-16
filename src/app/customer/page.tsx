'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore, MOCK_PROFILE } from '@/lib/useStore';
import { Send, Plane, User, Bot, AlertCircle } from 'lucide-react';

export default function CustomerPage() {
  const { session, updateSession, isLoaded } = useStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  const handleSend = async () => {
    if (!input.trim() || !isLoaded) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: input.trim(),
      timestamp: Date.now(),
    };

    const newSession = {
      ...session,
      messages: [...session.messages, userMessage],
    };
    
    updateSession(newSession);
    setInput('');
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

      updateSession({
        ...newSession,
        messages: [
          ...newSession.messages,
          {
            id: `msg-${Date.now() + 1}`,
            role: 'bot',
            content: data.reply,
            timestamp: Date.now(),
          },
        ],
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'An error occurred while sending the message.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Plane className="w-6 h-6" />
          <h1 className="text-xl font-bold">Airo Airlines</h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span>{MOCK_PROFILE.name} ({MOCK_PROFILE.loyaltyTier})</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-medium flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Airo Support Assistant
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            {session.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${
                  msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : msg.role === 'agent'
                      ? 'bg-amber-100 text-amber-900 rounded-bl-none border border-amber-200'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'agent' && (
                    <div className="text-xs font-bold mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" /> Live Agent
                    </div>
                  )}
                  {msg.role === 'bot' && (
                    <div className="text-xs font-bold mb-1 opacity-70 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> AI Assistant
                    </div>
                  )}
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="self-start px-4 py-2 bg-gray-100 text-gray-500 rounded-2xl rounded-bl-none animate-pulse">
                Airo is typing...
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
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
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
