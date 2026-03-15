'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import ReviewCard from './ReviewCard';
import AIReviewSummary from './AIReviewSummary';

interface Review {
  id: string;
  user_id: string;
  business_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name?: string;
}

interface ReviewStats {
  averageRating: string;
  totalReviews: number;
}

interface ReviewListProps {
  businessId: string;
  currentUserId?: string;
  refreshTrigger?: number;
}

export default function ReviewList({ businessId, currentUserId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ averageRating: '0.0', totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?businessId=${businessId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || { averageRating: '0.0', totalReviews: 0 });
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      const res = await fetch(`/api/reviews?reviewId=${reviewId}&businessId=${businessId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const maxCount = Math.max(...ratingCounts.map((r) => r.count), 1);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-[#E5E5E5]" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* AI Review Insights */}
      {stats.totalReviews > 2 && (
        <AIReviewSummary businessId={businessId} reviewCount={stats.totalReviews} />
      )}

      {/* Rating Summary */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Big Average */}
          <div className="text-center md:text-left flex-shrink-0">
            <div className="text-4xl font-bold text-[#1A1A1A]">{stats.averageRating}</div>
            <div className="flex items-center gap-0.5 mt-1 justify-center md:justify-start">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(parseFloat(stats.averageRating))
                      ? 'text-[#D4AF37] fill-[#D4AF37]'
                      : 'text-[#E5E5E5]'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[#737373] mt-1">{stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</p>
          </div>

          {/* Rating Distribution Bars */}
          <div className="flex-1 w-full space-y-1.5">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#525252] w-5 text-right">{star}</span>
                <Star className="h-3 w-3 text-[#D4AF37] fill-[#D4AF37]" />
                <div className="flex-1 h-2.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E4C767] rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#737373] w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-10">
          <Star className="h-10 w-10 text-[#D4D4D4] mx-auto mb-3" />
          <p className="text-[#525252] font-medium">No reviews yet</p>
          <p className="text-sm text-[#737373]">Be the first to review this business!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
