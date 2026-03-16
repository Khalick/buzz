"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBusinessOwner } from '@/hooks/useBusinessOwner';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Send, MapPin, Search } from 'lucide-react';

interface Request {
  id: string;
  user_id: string;
  category: string;
  description: string;
  budget: string | null;
  status: string;
  created_at: string;
  distance?: string;
  user_name?: string;
}

export default function LeadsDashboard() {
  const { businesses, loading: businessLoading } = useBusinessOwner();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [responseForm, setResponseForm] = useState({ message: '', quote: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (businessLoading) return;
    if (businesses.length === 0) {
      setLoading(false);
      return;
    }

    // Set default business id for the form
    if (businesses.length > 0) setSelectedBusinessId(businesses[0].id);

    const fetchLeads = async () => {
      try {
        const categories = businesses.map(b => b.category);
        
        // Fetch open requests matching owner's business categories
        const { data, error } = await supabase
          .from('broadcast_requests')
          .select('*')
          .in('category', categories)
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Enrich with user info
        const enriched = await Promise.all((data || []).map(async (req: any) => {
          let userName = 'Local Customer';
          if (req.user_id) {
            const { data: u } = await supabase
              .from('users')
              .select('display_name')
              .eq('id', req.user_id)
              .single();
            if (u?.display_name) userName = u.display_name;
          }
          return { ...req, user_name: userName };
        }));

        setRequests(enriched);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [businessLoading, businesses]);

  const handleSendResponse = async (requestId: string) => {
    if (!responseForm.message.trim() || !selectedBusinessId) return;
    setSending(true);

    try {
      const { error } = await supabase.from('broadcast_responses').insert({
        request_id: requestId,
        business_id: selectedBusinessId,
        message: responseForm.message,
        quote_amount: responseForm.quote || null,
      });

      if (error) throw error;

      // Optimistically remove from view or mark as "Responded"
      setRequests(prev => prev.filter(r => r.id !== requestId));
      setRespondingTo(null);
      setResponseForm({ message: '', quote: '' });
    } catch (err) {
      console.error('Error sending quote:', err);
    } finally {
      setSending(false);
    }
  };

  if (businessLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-gradient-hero py-12 px-4 shadow-lg"></div>
        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl h-64 animate-pulse shadow-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="bg-gradient-hero py-12 px-4 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white heading-display">Smart Leads Inbox</h1>
            <span className="bg-[#D4AF37] text-[#1B4332] text-xs font-bold px-2 py-1 rounded shadow-sm">NEW</span>
          </div>
          <p className="text-white/80 max-w-xl">
            Local customers are looking for services you offer. Respond with a quote to win their business!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-6 relative z-10">
        {businesses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-[#E5E5E5]">
            <Search className="w-12 h-12 mx-auto text-[#1B4332]/40 mb-3" />
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Businesses Found</h3>
            <p className="text-[#525252] mb-6">You need to have an active business listing in a specific category to receive smart leads.</p>
            <Link href="/directory/add" className="bg-[#1B4332] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-colors">
              Add a Business
            </Link>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-[#E5E5E5]">
            <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-[#1B4332]/50" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Active Leads Right Now</h3>
            <p className="text-[#525252]">
              We&apos;ll notify you when a customer in Thika requests a service related to your categories: 
              <span className="font-semibold text-[#1B4332] ml-1">{businesses.map(b => b.category).join(', ')}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-[#1B4332]/10 text-[#1B4332] text-xs font-bold rounded-lg mb-2">
                      {req.category}
                    </span>
                    <h3 className="text-lg font-bold text-[#1A1A1A]">{req.user_name} Needs Help</h3>
                    <p className="text-xs text-[#737373] mt-0.5">
                      Posted {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {req.budget && (
                    <div className="text-right">
                      <span className="block text-xs font-semibold text-[#737373]">Est. Budget</span>
                      <span className="text-lg font-bold text-[#1B4332]">KSh {req.budget}</span>
                    </div>
                  )}
                </div>

                <div className="bg-[#FAFAF8] rounded-xl p-4 mb-4 border border-[#E5E5E5]/50">
                  <p className="text-[#1A1A1A] text-sm leading-relaxed whitespace-pre-wrap">{req.description}</p>
                </div>

                {respondingTo === req.id ? (
                  <div className="bg-[#1B4332]/5 p-5 rounded-xl border border-[#1B4332]/10 mt-4 animate-fade-in">
                    <h4 className="font-bold text-[#1A1A1A] text-sm mb-3">Send your quote & message</h4>
                    
                    {businesses.length > 1 && (
                      <div className="mb-3">
                        <label className="text-xs font-semibold text-[#525252] block mb-1">Responding as:</label>
                        <select
                          value={selectedBusinessId}
                          onChange={e => setSelectedBusinessId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#1B4332]/20 rounded-lg text-sm outline-none focus:border-[#1B4332]/50"
                        >
                          {businesses.filter(b => b.category === req.category).map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                      <div className="sm:col-span-3">
                        <label className="text-xs font-semibold text-[#525252] block mb-1">Message</label>
                        <textarea
                          rows={3}
                          value={responseForm.message}
                          onChange={e => setResponseForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Tell them why they should choose you..."
                          className="w-full px-3 py-2 bg-white border border-[#1B4332]/20 rounded-lg text-sm outline-none focus:border-[#1B4332]/50 resize-none"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="text-xs font-semibold text-[#525252] block mb-1">Your Quote (KSh)</label>
                        <input
                          type="text"
                          value={responseForm.quote}
                          onChange={e => setResponseForm(prev => ({ ...prev, quote: e.target.value }))}
                          placeholder="e.g. 4,500"
                          className="w-full px-3 py-2 bg-white border border-[#1B4332]/20 rounded-lg text-sm outline-none focus:border-[#1B4332]/50"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => { setRespondingTo(null); setResponseForm({message: '', quote: ''}); }}
                        className="px-4 py-2 text-sm font-semibold text-[#525252] hover:bg-[#E5E5E5] rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSendResponse(req.id)}
                        disabled={sending || !responseForm.message.trim()}
                        className="px-5 py-2 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {sending ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending</> : <><Send className="w-3.5 h-3.5" /> Send Quote</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setRespondingTo(req.id)}
                    className="w-full py-2.5 bg-white text-[#1B4332] font-semibold text-sm border-2 border-[#1B4332]/20 rounded-xl hover:bg-[#1B4332]/5 transition-colors flex items-center justify-center gap-2"
                  >
                    Respond with Quote
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
