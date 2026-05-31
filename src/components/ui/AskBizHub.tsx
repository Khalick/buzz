'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send, X, Mic, MicOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  businesses?: { id: string; name: string; rating: number; category: string }[];
  originalQuery?: string;
}

const EXAMPLE_QUERIES = [
  'Best restaurant open now?',
  'Where can I fix my laptop?',
  'Affordable salon in Thika?',
  'Good plumber near Juja?',
];

// Extend Window for SpeechRecognition support
interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

export default function AskBizHub() {
  const pathname = usePathname();
  if (pathname?.startsWith('/dashboard/pos')) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  // Smart Broadcast states
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (query?: string) => {
    const q = query || input.trim();
    if (!q) return;

    // Stop listening if active
    if (isListening) stopListening();

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
            originalQuery: q,
          },
        ]);
        // Reset selection for new businesses
        setSelectedTargets(new Set());
        setBroadcastMessage(null);
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

  const handleBroadcast = async (businesses: any[], originalQuery: string) => {
    setBroadcasting(true);
    setBroadcastMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setBroadcastMessage('⚠️ Please log in to broadcast requests.');
        setBroadcasting(false);
        return;
      }

      const targetIds = selectedTargets.size > 0 ? Array.from(selectedTargets) : businesses.map(b => b.id);
      const category = businesses[0]?.category || 'General';

      const { error } = await supabase.from('broadcast_requests').insert({
        user_id: session.user.id,
        category: category,
        description: originalQuery,
        target_businesses: targetIds,
        status: 'open'
      });

      if (error) {
        console.error('Broadcast insert error:', error.message, error.details, error.hint);
        setBroadcastMessage(`⚠️ Failed: ${error.message || 'Unknown error'}. Try again.`);
        setBroadcasting(false);
        return;
      }
      setBroadcastMessage('✅ Broadcast sent! Check your requests inbox for quotes.');
    } catch (err: any) {
      console.error('Broadcast error:', err);
      setBroadcastMessage(`⚠️ ${err?.message || 'Network error. Please try again.'}`);
    } finally {
      setBroadcasting(false);
    }
  };

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-KE'; // English (Kenya) for best local accent support
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      let transcript = '';
      for (let i = 0; i < Object.keys(results).length; i++) {
        transcript += results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

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
                <p className="text-sm text-[#525252] mb-1">
                  Ask me anything about businesses in Thika!
                </p>
                {speechSupported && (
                  <p className="text-[10px] text-[#A3A3A3] mb-4">
                    💡 Tap the mic to use your voice
                  </p>
                )}
                {!speechSupported && <div className="mb-4" />}
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
                    <div className="mt-2 pt-2 border-t border-[#1B4332]/10 space-y-2">
                       <p className="text-[10px] uppercase font-bold text-[#1B4332]/60 mb-1 tracking-wider">Matched Businesses</p>
                      {msg.businesses.map((b) => (
                        <div key={b.id} className="flex items-center gap-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg p-2 hover:border-[#1B4332]/20 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selectedTargets.has(b.id)}
                            onChange={() => toggleTarget(b.id)}
                            className="w-4 h-4 rounded border-[#D4AF37] text-[#1B4332] focus:ring-[#1B4332]"
                          />
                          <Link
                            href={`/business/${b.id}`}
                            className="flex-1 text-xs text-[#1B4332] hover:text-[#D4AF37] font-medium transition-colors line-clamp-1"
                          >
                            {b.name} ({b.rating?.toFixed(1)}★)
                          </Link>
                          <Link href={`/business/${b.id}`}>
                            <ArrowRight className="h-3 w-3 text-[#1B4332]/50" />
                          </Link>
                        </div>
                      ))}
                      
                      <div className="pt-2">
                        <button
                          onClick={() => handleBroadcast(msg.businesses || [], msg.originalQuery || '')}
                          disabled={broadcasting}
                          className="w-full py-2 bg-[#1B4332] text-white text-xs font-bold rounded-lg hover:bg-[#2D6A4F] transition-colors shadow-sm disabled:opacity-50"
                        >
                          {broadcasting ? 'Broadcasting...' : (selectedTargets.size > 0 ? `Broadcast to Selected (${selectedTargets.size})` : 'Broadcast to All Matching')}
                        </button>
                        {broadcastMessage && (
                          <p className="text-[10px] mt-1.5 text-center font-medium text-[#1B4332]">
                            {broadcastMessage}
                          </p>
                        )}
                      </div>
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
            {/* Listening indicator */}
            {isListening && (
              <div className="flex items-center gap-2 mb-2 px-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-[11px] text-red-500 font-medium">Listening... speak now</span>
              </div>
            )}
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
                placeholder={isListening ? 'Listening...' : 'Ask about businesses...'}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 bg-[#F5F5F5] border-0 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1B4332]/20 placeholder:text-[#A3A3A3] disabled:opacity-50 transition-all ${
                  isListening ? 'ring-2 ring-red-300 bg-red-50/50' : ''
                }`}
              />

              {/* Voice button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={loading}
                  className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                      : 'bg-[#F5F5F5] text-[#525252] hover:bg-[#E5E5E5] hover:text-[#1B4332]'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}

              {/* Send button */}
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
