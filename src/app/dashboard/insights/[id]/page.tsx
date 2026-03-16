"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useBusinessOwner } from '@/hooks/useBusinessOwner';
import Link from 'next/link';
import { ArrowLeft, PieChart, TrendingUp, MessageSquare, AlertTriangle, Star, Activity } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function InsightsDashboard() {
  const params = useParams();
  const businessId = params.id as string;
  
  const { businesses, loading: businessLoading } = useBusinessOwner();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [townAvg, setTownAvg] = useState(0);

  const business = businesses.find(b => b.id === businessId);

  useEffect(() => {
    if (businessLoading) return;
    
    const fetchInsights = async () => {
      try {
        const { data: revs, error } = await supabase
          .from('reviews')
          .select('id, rating, comment, created_at')
          .eq('business_id', businessId);
          
        if (error) throw error;
        setReviews(revs || []);

        // Fetch town average for benchmarking if business has a town
        if (business?.location?.town) {
          const { data: townBiz } = await supabase
            .from('businesses')
            .select('rating')
            .eq('location->>town', business.location.town); // simplified JSON query for demo
            
          if (townBiz && townBiz.length > 0) {
            const sum = townBiz.reduce((acc, b) => acc + (b.rating || 0), 0);
            setTownAvg(sum / townBiz.length);
          }
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (businessId) fetchInsights();
  }, [businessId, businessLoading, business]);

  if (businessLoading || loading) {
    return <div className="min-h-screen bg-gradient-subtle py-20" />;
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-20 px-4 text-center">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Business Not Found</h1>
        <Link href="/dashboard" className="text-[#1B4332] underline mt-4 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  // --- HEURISTIC SENTIMENT ANALYSIS ---
  const positiveWords = ['great', 'excellent', 'good', 'amazing', 'love', 'perfect', 'friendly', 'fast', 'clean', 'professional', 'delicious', 'best'];
  const negativeWords = ['bad', 'terrible', 'slow', 'rude', 'dirty', 'expensive', 'worst', 'poor', 'late', 'unprofessional'];

  let positiveMentions = 0;
  let negativeMentions = 0;
  
  const keywords: Record<string, number> = {};

  reviews.forEach(r => {
    if (!r.comment) return;
    const words = r.comment.toLowerCase().replace(/[^a-z0-s]/g, ' ').split(/\s+/);
    
    let isPos = false;
    let isNeg = false;

    words.forEach(w => {
      if (w.length < 4) return;
      
      if (positiveWords.includes(w)) {
        positiveMentions++;
        isPos = true;
      }
      if (negativeWords.includes(w)) {
        negativeMentions++;
        isNeg = true;
      }

      // Track general noun/adjective frequency for word cloud
      if (!positiveWords.includes(w) && !negativeWords.includes(w) && w !== 'this' && w !== 'that' && w !== 'very' && w !== 'with') {
        keywords[w] = (keywords[w] || 0) + 1;
      }
    });
  });

  const totalSentimentBase = positiveMentions + negativeMentions;
  const sentimentScore = totalSentimentBase > 0 
    ? Math.round((positiveMentions / totalSentimentBase) * 100) 
    : 100;

  const topKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(k => k[0]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  
  // Benchmarking Logic
  let rankText = "Gathering data...";
  if (townAvg > 0) {
     if (parseFloat(avgRating) >= townAvg + 0.5) rankText = "Top 10% in Town";
     else if (parseFloat(avgRating) >= townAvg) rankText = "Above Average";
     else rankText = "Below Average";
  } else {
     if (parseFloat(avgRating) >= 4.5) rankText = "Top Tier";
     else rankText = "Standard";
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="bg-gradient-hero py-12 px-4 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-5xl mx-auto">
          <Link href={`/dashboard`} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white heading-display">AI Review Insights</h1>
            <span className="bg-[#D4AF37] text-[#1B4332] text-xs font-bold px-2 py-1 rounded shadow-sm">BETA</span>
          </div>
          <p className="text-white/80 max-w-xl text-lg font-medium">
            {business.name}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 -mt-6 relative z-10">
        
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-[#E5E5E5]">
            <MessageSquare className="w-12 h-12 mx-auto text-[#1B4332]/40 mb-3" />
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Not Enough Data</h3>
            <p className="text-[#525252] mb-6">You need at least one text review for the AI to analyze sentiment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Top Level Stats */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6 text-center">
                <p className="text-sm font-bold tracking-widest text-[#525252] uppercase mb-1">Overall Sentiment</p>
                <div className="flex justify-center items-end gap-1 mb-2">
                   <span className="text-5xl font-black text-[#1B4332]">{sentimentScore}%</span>
                   <span className="text-[#1B4332] font-semibold mb-1">Positive</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                  <div className="bg-gradient-to-r from-[#1B4332] to-[#40916C] h-2.5 rounded-full" style={{ width: `${sentimentScore}%` }}></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-[#1A1A1A] flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-[#D4AF37]" /> Benchmark
                   </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold">Your Rating</p>
                    <p className="text-2xl font-black text-[#1A1A1A] flex items-center gap-1.5"><Star className="w-5 h-5 text-[#D4AF37] fill-current" /> {avgRating}</p>
                  </div>
                  <div className="pt-4 border-t border-[#E5E5E5]">
                    <p className="text-xs text-[#737373] uppercase tracking-wider font-semibold">Market Position</p>
                    <p className="text-lg font-bold text-[#1B4332]">{rankText}</p>
                    {townAvg > 0 && <p className="text-xs text-[#525252] mt-1">Local Average: {townAvg.toFixed(1)}</p>}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Deep Dive & Keywords */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
                 <h3 className="font-bold text-[#1A1A1A] flex items-center gap-2 mb-4">
                   <Activity className="w-5 h-5 text-[#1B4332]" /> Actionable Insights
                 </h3>
                 
                 <div className="space-y-4">
                   {positiveMentions > negativeMentions ? (
                     <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                       <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                       <div>
                         <p className="font-bold text-green-900">Strong Customer Satisfaction</p>
                         <p className="text-sm text-green-800 mt-1">Your customers frequently use highly positive language describing your business. Keep doing what you're doing!</p>
                       </div>
                     </div>
                   ) : totalSentimentBase > 0 ? (
                     <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                       <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                       <div>
                         <p className="font-bold text-red-900">Area for Improvement</p>
                         <p className="text-sm text-red-800 mt-1">We detected negative sentiment patterns in recent reviews. Consider addressing specific complaints rapidly via the Reviews dashboard.</p>
                       </div>
                     </div>
                   ) : (
                     <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                       <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                       <div>
                         <p className="font-bold text-blue-900">Neutral Sentiment</p>
                         <p className="text-sm text-blue-800 mt-1">Reviews don't show strong emotion. Consider asking your best customers for reviews to boost positive sentiment.</p>
                       </div>
                     </div>
                   )}
                 </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
                 <h3 className="font-bold text-[#1A1A1A] flex items-center gap-2 mb-4">
                   <PieChart className="w-5 h-5 text-[#1B4332]" /> Frequent Keywords
                 </h3>
                 <p className="text-sm text-[#525252] mb-4">What people talk about most in your reviews:</p>
                 
                 <div className="flex flex-wrap gap-2">
                   {topKeywords.length > 0 ? topKeywords.map((kw, i) => (
                     <span key={i} className="px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] text-[#1A1A1A] font-semibold rounded-lg capitalize">
                       {kw}
                     </span>
                   )) : (
                     <span className="text-sm text-[#737373]">Not enough recurring words found.</span>
                   )}
                 </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}

const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
