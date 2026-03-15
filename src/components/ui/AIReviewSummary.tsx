'use client';

import { useState, useEffect } from 'react';
import { Sparkles, MessageCircleWarning } from 'lucide-react';

interface AIReviewSummaryProps {
  businessId: string;
  reviewCount: number;
}

interface SummaryData {
  summary: string | null;
  tags: string[];
}

export default function AIReviewSummary({ businessId, reviewCount }: AIReviewSummaryProps) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only fetch summary if there are reviews
    if (reviewCount === 0) {
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/reviews/summary?businessId=${businessId}`);
        const result = await res.json();

        if (!res.ok) {
          setError(result.error || 'Failed to generate AI summary');
        } else {
          setData({ summary: result.summary, tags: result.tags });
        }
      } catch (err) {
        setError('Network error generating summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [businessId, reviewCount]);

  if (reviewCount === 0) return null;

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[#1B4332]/5 to-[#2D6A4F]/10 rounded-xl p-6 mb-6 border border-[#1B4332]/10 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <div className="h-5 bg-[#1B4332]/10 rounded w-32" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-[#1B4332]/5 rounded w-full" />
          <div className="h-4 bg-[#1B4332]/5 rounded w-4/5" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-[#1B4332]/10 rounded-full w-16" />
          <div className="h-6 bg-[#1B4332]/10 rounded-full w-20" />
          <div className="h-6 bg-[#1B4332]/10 rounded-full w-24" />
        </div>
      </div>
    );
  }

  if (error || !data?.summary) {
    return (
      <div className="bg-[#F5F5F5] rounded-xl p-4 mb-6 text-sm text-[#737373] flex items-start gap-3">
        <MessageCircleWarning className="h-5 w-5 text-[#A3A3A3] shrink-0" />
        <p>AI Review Summary is currently unavailable. {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-xl p-6 mb-6 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-white/10 transition-colors duration-500" />

      <div className="relative z-10 flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-[#D4AF37]" />
        <h3 className="font-bold">AI Review Insights</h3>
      </div>

      <p className="text-white/90 text-sm leading-relaxed mb-4">
        {data.summary}
      </p>

      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
          {data.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white/90 border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
