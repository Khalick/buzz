'use client';

import { Star } from 'lucide-react';

interface ReviewCardProps {
  review: {
    id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user_name?: string;
  };
  currentUserId?: string;
  onDelete?: (reviewId: string) => void;
}

export default function ReviewCard({ review, currentUserId, onDelete }: ReviewCardProps) {
  const isOwner = currentUserId === review.user_id;
  const date = new Date(review.created_at).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const initials = (review.user_name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-[#1A1A1A] text-sm">{review.user_name || 'Anonymous User'}</p>
            <p className="text-xs text-[#737373]">{date}</p>
          </div>
        </div>

        {/* Stars + Delete */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= review.rating
                    ? 'text-[#D4AF37] fill-[#D4AF37]'
                    : 'text-[#E5E5E5]'
                }`}
              />
            ))}
          </div>
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="mt-3 text-sm text-[#525252] leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}
