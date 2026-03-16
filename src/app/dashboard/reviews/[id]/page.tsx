"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { ArrowLeft, Star, MessageCircle, Send, User, CheckCircle } from 'lucide-react';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  response?: string;
  response_at?: string;
}

export default function DashboardReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const businessId = params.id as string;

  const [businessName, setBusinessName] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading, businessId]);

  const fetchData = async () => {
    try {
      // Verify ownership
      const { data: biz, error: bizError } = await supabase
        .from('businesses')
        .select('name, owner_id, submitted_by')
        .eq('id', businessId)
        .single();

      if (bizError || !biz) { router.push('/dashboard'); return; }
      if (biz.owner_id !== user?.id && biz.submitted_by !== user?.id) { router.push('/dashboard'); return; }

      setBusinessName(biz.name);

      // Fetch reviews
      const { data: reviewData, error: revError } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (revError) throw revError;

      // Enrich with user names
      const enriched = await Promise.all((reviewData || []).map(async (r: any) => {
        let userName = 'Anonymous';
        if (r.user_id) {
          const { data: u } = await supabase
            .from('users')
            .select('display_name, email')
            .eq('id', r.user_id)
            .single();
          if (u) userName = u.display_name || u.email?.split('@')[0] || 'Anonymous';
        }
        return { ...r, user_name: userName };
      }));

      setReviews(enriched);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          response: responseText.trim(),
          response_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prev => prev.map(r =>
        r.id === reviewId
          ? { ...r, response: responseText.trim(), response_at: new Date().toISOString() }
          : r
      ));
      setRespondingTo(null);
      setResponseText('');
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setSaving(false);
    }
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-gradient-hero py-12 px-4"></div>
        <div className="max-w-3xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
            <div className="h-6 bg-[#1B4332]/10 rounded w-1/3 mb-6"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-[#1B4332]/5 rounded-xl mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero */}
      <div className="bg-gradient-hero py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-3xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white heading-display mb-1">
            Reviews: {businessName}
          </h1>
          <div className="flex items-center gap-4 text-white/70 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-[#D4AF37] fill-[#D4AF37]" />
              <span className="text-white font-semibold">{avgRating.toFixed(1)}</span>
            </span>
            <span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 -mt-6">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1B4332]/10 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-[#1B4332]/40" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Reviews Yet</h3>
            <p className="text-[#525252]">Reviews will appear here once customers start sharing their experiences.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {(review.user_name || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm">{review.user_name}</p>
                      <p className="text-xs text-[#737373]">
                        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= review.rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#E5E5E5]'}`}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-[#525252] text-sm mb-4 leading-relaxed">{review.comment}</p>
                )}

                {/* Owner Response */}
                {review.response ? (
                  <div className="bg-[#1B4332]/5 rounded-xl p-4 border-l-4 border-[#1B4332]">
                    <p className="text-xs font-semibold text-[#1B4332] mb-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Your Response
                    </p>
                    <p className="text-sm text-[#525252]">{review.response}</p>
                  </div>
                ) : (
                  <div>
                    {respondingTo === review.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Write your response..."
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespond(review.id)}
                            disabled={saving || !responseText.trim()}
                            className="bg-[#1B4332] text-white font-semibold py-2 px-4 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                          >
                            <Send className="h-4 w-4" />
                            {saving ? 'Sending...' : 'Send Response'}
                          </button>
                          <button
                            onClick={() => { setRespondingTo(null); setResponseText(''); }}
                            className="text-[#525252] font-medium py-2 px-4 rounded-xl hover:bg-[#E5E5E5]/50 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingTo(review.id)}
                        className="text-[#1B4332] font-semibold text-sm hover:text-[#2D6A4F] transition-colors flex items-center gap-1.5"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Respond to this review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
