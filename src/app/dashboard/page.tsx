"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBusinessOwner } from '@/hooks/useBusinessOwner';
import { LayoutDashboard, Star, Eye, MessageCircle, Edit3, Tag, Plus, Building2, CheckCircle, Clock, TrendingUp, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { businesses, loading, user } = useBusinessOwner();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-gradient-hero py-16 px-4">
          <div className="max-w-6xl mx-auto animate-pulse">
            <div className="h-8 bg-white/20 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 -mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse shadow-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const totalViews = businesses.reduce((sum, b) => sum + (b.views || 0), 0);
  const totalReviews = businesses.reduce((sum, b) => sum + (b.review_count || 0), 0);
  const avgRating = businesses.length > 0
    ? businesses.reduce((sum, b) => sum + (b.rating || 0), 0) / businesses.length
    : 0;
  const approvedCount = businesses.filter(b => b.approved).length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero */}
      <div className="bg-gradient-hero py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-6xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-white/20">
            <LayoutDashboard className="h-4 w-4" />
            Business Dashboard
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white heading-display mb-2">
            Welcome Back!
          </h1>
          <p className="text-white/70">
            Manage your businesses, reviews, and deals in one place
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 -mt-6">

        {/* Stats Cards */}
        {businesses.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B4332]/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-[#1B4332]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{businesses.length}</p>
                  <p className="text-xs text-[#737373]">Businesses</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{totalViews.toLocaleString()}</p>
                  <p className="text-xs text-[#737373]">Total Views</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{avgRating.toFixed(1)}</p>
                  <p className="text-xs text-[#737373]">Avg Rating</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-[#2D6A4F]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{totalReviews}</p>
                  <p className="text-xs text-[#737373]">Reviews</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Businesses List */}
        {businesses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1B4332]/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-[#1B4332]/40" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Businesses Yet</h3>
            <p className="text-[#525252] mb-6">
              List your first business on ThikaBizHub and start reaching local customers.
            </p>
            <Link
              href="/directory/add"
              className="inline-flex items-center gap-2 bg-[#1B4332] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#2D6A4F] transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Your Business
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <h2 className="text-xl font-bold text-[#1A1A1A]">Your Businesses</h2>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/promoters"
                  className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#856404] border border-[#D4AF37]/30 font-semibold py-2.5 px-5 rounded-xl hover:bg-[#D4AF37]/20 transition-colors text-sm"
                >
                  <TrendingUp className="h-4 w-4" />
                  Top Promoters
                </Link>
                <Link
                  href="/dashboard/partnerships"
                  className="inline-flex items-center gap-2 bg-[#1B4332]/5 text-[#1A1A1A] border border-[#1B4332]/20 font-semibold py-2.5 px-5 rounded-xl hover:bg-[#1B4332]/10 transition-colors text-sm"
                >
                  <Building2 className="h-4 w-4" />
                  Partnerships
                </Link>
                <Link
                  href="/dashboard/deals"
                  className="inline-flex items-center gap-2 bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/30 font-semibold py-2.5 px-5 rounded-xl hover:bg-[#1B4332]/20 transition-colors text-sm"
                >
                  <Tag className="h-4 w-4" />
                  Manage Deals
                </Link>
                <Link
                  href="/dashboard/leads"
                  className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#856404] border border-[#D4AF37]/30 font-semibold py-2.5 px-5 rounded-xl hover:bg-[#D4AF37]/20 transition-colors text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  Smart Leads Inbox
                </Link>
                <Link
                  href="/directory/add"
                  className="inline-flex items-center gap-2 bg-[#1B4332] text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-[#2D6A4F] transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </Link>
              </div>
            </div>

            {businesses.map(biz => (
              <div key={biz.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {biz.images && biz.images.length > 0 ? (
                          <img src={biz.images[0]} alt={biz.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-lg">{biz.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-[#1A1A1A] truncate">{biz.name}</h3>
                          {biz.approved ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                              <CheckCircle className="h-3 w-3" />
                              Live
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-[#D4AF37]/10 text-[#856404] text-xs font-semibold rounded-full border border-[#D4AF37]/20">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                          {biz.is_premium && (
                            <span className="px-2 py-0.5 bg-[#D4AF37] text-[#1B4332] text-xs font-bold rounded-full">
                              ⭐ PREMIUM
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#525252]">{biz.category}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#737373]">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {biz.views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-[#D4AF37]" />
                            {biz.rating?.toFixed(1) || '0.0'} ({biz.review_count || 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/edit/${biz.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-[#2D6A4F] transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/reviews/${biz.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#1B4332] border-2 border-[#1B4332]/20 text-sm font-semibold rounded-xl hover:bg-[#1B4332]/5 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Reviews
                      </Link>
                      <Link
                        href={`/dashboard/insights/${biz.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 text-[#856404] border-2 border-[#D4AF37]/30 text-sm font-semibold rounded-xl hover:bg-[#D4AF37]/20 transition-colors"
                      >
                        <Sparkles className="h-4 w-4" />
                        Insights
                      </Link>
                      <Link
                        href={`/business/${biz.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#525252] border-2 border-[#E5E5E5] text-sm font-medium rounded-xl hover:bg-[#FAFAF8] transition-colors"
                      >
                        <TrendingUp className="h-4 w-4" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
