"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  description: string;
  business_name: string;
  expiry_date?: string;
}

const DealsPage = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDeals(data || []);
      } catch (error) {
        console.error("Error fetching deals: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Filter out expired deals
  const now = new Date();
  const activeDeals = deals.filter(d => {
    if (!d.expiry_date) return true;
    const expiry = new Date(d.expiry_date);
    return expiry >= now;
  });

  const getDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="bg-gradient-hero py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold rounded-full mb-4 backdrop-blur-sm border border-[#D4AF37]/30">
            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></span>
            Live Deals
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 heading-display">
            Exclusive Daily Deals
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Discover amazing discounts from local businesses in Thika. Save money while supporting your community!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse overflow-hidden">
                <div className="h-full p-6 space-y-4">
                  <div className="h-6 bg-[#1B4332]/10 rounded w-3/4"></div>
                  <div className="h-4 bg-[#1B4332]/5 rounded w-full"></div>
                  <div className="h-4 bg-[#1B4332]/5 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activeDeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDeals.map((deal, index) => {
              const daysRemaining = deal.expiry_date ? getDaysRemaining(deal.expiry_date) : null;
              const isUrgent = daysRemaining !== null && daysRemaining <= 3;

              return (
                <div
                  key={deal.id}
                  className="group card-premium p-6 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Deal Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold rounded-full">
                      🏷️ DEAL
                    </span>
                    {daysRemaining !== null && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${isUrgent
                          ? 'bg-red-100 text-red-600'
                          : 'bg-[#1B4332]/10 text-[#1B4332]'
                        }`}>
                        {isUrgent ? '⚡ ' : ''}{daysRemaining} days left
                      </span>
                    )}
                  </div>

                  {/* Deal Content */}
                  <h2 className="text-xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#1B4332] transition-colors">
                    {deal.title}
                  </h2>
                  <p className="text-[#525252] text-sm mb-4 line-clamp-3 leading-relaxed">
                    {deal.description}
                  </p>

                  {/* Business Name */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#E5E5E5]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {deal.business_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#1B4332]">
                      {deal.business_name}
                    </span>
                  </div>

                  {/* Expiry Date */}
                  {deal.expiry_date && (
                    <div className={`text-sm ${isUrgent ? 'text-red-500' : 'text-[#737373]'}`}>
                      Expires: {new Date(deal.expiry_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1B4332]/10 flex items-center justify-center">
              <span className="text-4xl">🏷️</span>
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">No Active Deals</h3>
            <p className="text-[#525252] mb-8 max-w-md mx-auto">
              There are no deals available at the moment. Check back soon for amazing discounts!
            </p>
            <Link href="/directory" className="btn btn-primary btn-lg btn-pill">
              Browse Businesses
            </Link>
          </div>
        )}

        {/* CTA Section */}
        {activeDeals.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-block p-8 rounded-2xl bg-[#1B4332]/5 border border-[#1B4332]/10">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                Want to Post a Deal?
              </h3>
              <p className="text-[#525252] mb-4">
                List your business and share deals with thousands of customers
              </p>
              <Link href="/directory/add" className="btn btn-primary btn-pill">
                Add Your Business
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
