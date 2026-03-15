'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  businesses?: { id: string; name: string; rating: number }[];
}

const EXAMPLE_QUERIES = [
  'Best restaurant open now?',
  'Where can I fix my laptop?',
  'Affordable salon in Thika?',
  'Good plumber near Juja?',
];

export default function AskBizHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = async (query?: string) => {
    const q = query || input.trim();
    if (!q) return;

    const userMessage: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error || 'Something went wrong. Try again!' },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.answer,
            businesses: data.mentionedBusinesses,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error. Please check your connection.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white p-4 rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(45,106,79,0.4)] transition-all hover:scale-105 group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold hidden sm:inline">Ask BizHub</span>
          </div>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] flex flex-col overflow-hidden animate-scale-in"
          style={{ maxHeight: 'min(600px, calc(100vh - 6rem))' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              <div>
                <h3 className="text-white font-bold text-sm">Ask BizHub</h3>
                <p className="text-white/60 text-[10px]">AI-powered business discovery</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <Sparkles className="h-8 w-8 text-[#D4AF37] mx-auto mb-3" />
                <p className="text-sm text-[#525252] mb-4">
                  Ask me anything about businesses in Thika!
                </p>
                <div className="space-y-2">
                  {EXAMPLE_QUERIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSubmit(q)}
                      className="w-full text-left px-3 py-2 bg-[#1B4332]/5 rounded-lg text-xs text-[#1B4332] hover:bg-[#1B4332]/10 transition-colors flex items-center justify-between"
                    >
                      <span>{q}</span>
                      <ArrowRight className="h-3 w-3 opacity-40" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#1B4332] text-white rounded-br-md'
                      : 'bg-[#F5F5F5] text-[#1A1A1A] rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Business Links */}
                  {msg.businesses && msg.businesses.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#1B4332]/10 space-y-1">
                      {msg.businesses.map((b) => (
                        <Link
                          key={b.id}
                          href={`/business/${b.id}`}
                          className="flex items-center gap-2 text-xs text-[#1B4332] hover:text-[#D4AF37] font-medium transition-colors"
                        >
                          <ArrowRight className="h-3 w-3" />
                          {b.name} ({b.rating?.toFixed(1)}★)
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F5F5F5] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#1B4332]/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#1B4332]/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#1B4332]/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#E5E5E5] p-3 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about businesses..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-[#F5F5F5] border-0 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1B4332]/20 placeholder:text-[#A3A3A3] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-[#1B4332] text-white p-2.5 rounded-xl hover:bg-[#2D6A4F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
