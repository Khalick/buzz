'use client';

import { useState } from 'react';
import { Star, Send } from 'lucide-react';

interface ReviewFormProps {
  businessId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ businessId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get the session token
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('You must be logged in to leave a review');
        return;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          businessId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setRating(0);
      setComment('');
      onReviewSubmitted();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Leave a Review</h3>

      {/* Star Picker */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#525252] mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'text-[#D4AF37] fill-[#D4AF37]'
                    : 'text-[#D4D4D4]'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-[#525252] self-center font-medium">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#525252] mb-2">
          Your Review <span className="font-normal text-[#A3A3A3]">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this business..."
          rows={3}
          className="w-full px-4 py-3 bg-white border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 text-sm outline-none transition-all resize-none placeholder:text-[#A3A3A3]"
          maxLength={500}
        />
        <p className="text-xs text-[#A3A3A3] mt-1 text-right">{comment.length}/500</p>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
          ✅ Review submitted successfully!
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full bg-[#1B4332] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#2D6A4F] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="animate-pulse">Submitting...</span>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Review
          </>
        )}
      </button>
    </form>
  );
}
