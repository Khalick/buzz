'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MapPin, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  category: string;
  location: { town: string; county: string };
  rating: number;
  reviewCount: number;
  isPremium: boolean;
}

export default function ForYouRecommendations() {
  const [recommendations, setRecommendations] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/businesses/recommendations');
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error('Failed to grab recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-64 bg-[#E5E5E5] rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-[#E5E5E5]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-[#1B4332]/5 to-transparent relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1B4332]/5 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#1B4332] font-semibold text-sm uppercase tracking-wider">Just For You</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">
              Personalized Recommendations
            </h2>
            <p className="text-[#525252] mt-2 max-w-2xl">
              Based on your recent activity and top-rated spots in your area, here are some businesses we think you'll love.
            </p>
          </div>
          <Link 
            href="/directory?sort=highest-rated" 
            className="flex items-center gap-1 text-[#1B4332] font-semibold hover:text-[#D4AF37] transition-colors"
          >
            Explore More <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((business, index) => (
            <Link 
              href={`/business/${business.id}`} 
              key={business.id}
              className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#E5E5E5] hover:border-[#D4AF37]/30 flex flex-col relative overflow-hidden"
            >
              {business.isPremium && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#E4C767] text-[#1B4332] text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  PREMIUM
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4 mt-2">
                <div className="bg-[#1B4332]/5 text-[#1B4332] text-xs font-semibold px-2.5 py-1 rounded-full">
                  {business.category}
                </div>
                {index === 0 && (
                  <div className="flex items-center gap-1 text-[#D4AF37] text-xs font-semibold bg-[#D4AF37]/10 px-2 py-1 rounded-full">
                    <TrendingUp className="h-3 w-3" /> Top Pick
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#1B4332] transition-colors mb-2 line-clamp-1">
                {business.name}
              </h3>

              <div className="flex items-center text-sm text-[#525252] mb-4">
                <MapPin className="h-4 w-4 mr-1 text-[#A3A3A3]" />
                {business.location?.town && business.location?.county 
                  ? `${business.location.town}, ${business.location.county}`
                  : 'Location not specified'}
              </div>

              <div className="mt-auto pt-4 border-t border-[#F5F5F5] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="font-bold text-[#1A1A1A]">
                    {business.rating ? business.rating.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-xs text-[#737373]">
                    ({business.reviewCount || 0} reviews)
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#1B4332] flex items-center gap-1 transform group-hover:translate-x-1 transition-transform">
                  View <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
