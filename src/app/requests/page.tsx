"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Inbox, ArrowLeft, Building2, MessageCircle, DollarSign, ExternalLink } from 'lucide-react';

interface Response {
  id: string;
  message: string;
  quote_amount: string | null;
  created_at: string;
  business_id: string;
  businesses?: {
    name: string;
    contact: {
      phone?: string;
      whatsapp?: string;
    };
  };
}

interface Request {
  id: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  broadcast_responses: Response[];
}

export default function CustomerRequestsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/requests');
      return;
    }

    if (!user) return;

    const fetchRequests = async () => {
      try {
        // Fetch user requests and their nested responses with business details
        const { data, error } = await supabase
          .from('broadcast_requests')
          .select(`
            *,
            broadcast_responses (
              *,
              businesses (
                name,
                contact
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setRequests(data || []);
      } catch (err) {
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
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
    <div className="min-h-screen bg-gradient-subtle font-sans pb-20">
      <div className="bg-gradient-hero py-12 px-4 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white heading-display">My Requests Inbox</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            Track your broadcast requests and review incoming quotes from local businesses.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-6 relative z-10">
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-[#E5E5E5]">
            <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-[#1B4332]/50" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Requests Yet</h3>
            <p className="text-[#525252] mb-6">You haven't broadcasted any requests to businesses yet. Use AskBizHub to find what you need!</p>
            <Link href="/" className="bg-[#1B4332] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-colors">
              Chat with AskBizHub
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] overflow-hidden">
                {/* Request Header */}
                <div className="p-6 border-b border-[#E5E5E5] bg-[#FAFAF8]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-3 py-1 bg-[#1B4332]/10 text-[#1B4332] text-xs font-bold rounded-lg uppercase tracking-wide">
                      {req.category}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${req.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[#1A1A1A] text-sm leading-relaxed whitespace-pre-wrap">{req.description}</p>
                  <p className="text-xs text-[#737373] mt-3">
                    Requested on {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Quotes Section */}
                <div className="p-6">
                  <h4 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                    Incoming Quotes ({req.broadcast_responses?.length || 0})
                  </h4>

                  {(!req.broadcast_responses || req.broadcast_responses.length === 0) ? (
                     <div className="text-center py-6 bg-[#FAFAF8] rounded-xl border border-dashed border-[#E5E5E5]">
                       <p className="text-sm text-[#525252]">Waiting for businesses to respond...</p>
                     </div>
                  ) : (
                    <div className="space-y-4">
                      {req.broadcast_responses.map(quote => (
                        <div key={quote.id} className="bg-[#FAFAF8] border border-[#E5E5E5] rounded-xl p-4 transition-all hover:border-[#1B4332]/20">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[#1B4332]" />
                              <Link href={`/business/${quote.business_id}`} className="font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1">
                                {quote.businesses?.name || 'Unknown Business'}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            {quote.quote_amount && (
                              <div className="flex items-center gap-1 text-[#1B4332] font-bold">
                                <DollarSign className="w-3 h-3" />
                                {quote.quote_amount}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-sm text-[#525252] mb-3 bg-white p-3 rounded-lg border border-[#E5E5E5]/50 whitespace-pre-wrap">
                            {quote.message}
                          </p>

                          <div className="flex justify-end gap-2">
                            {quote.businesses?.contact?.whatsapp && (
                              <a 
                                href={`https://wa.me/${quote.businesses.contact.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${quote.businesses.name}, I'm following up on your quote sent via ThikaBizHub regarding my request: "${req.description.substring(0, 50)}..."`)}`}
                                target="_blank"
                                rel="noopener noreferrer" 
                                className="px-4 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#1EBE5D] transition-colors"
                              >
                                WhatsApp
                              </a>
                            )}
                            {quote.businesses?.contact?.phone && (
                              <a 
                                href={`tel:${quote.businesses.contact.phone}`}
                                className="px-4 py-1.5 bg-white border border-[#E5E5E5] text-[#1A1A1A] text-xs font-bold rounded-lg hover:bg-[#F5F5F5] transition-colors"
                              >
                                Call
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
