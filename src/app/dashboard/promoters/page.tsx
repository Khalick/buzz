"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBusinessOwner } from '@/hooks/useBusinessOwner';
import Link from 'next/link';
import { ArrowLeft, Users, Trophy, TrendingUp, HandHeart } from 'lucide-react';

interface Proof {
  id: string;
  name: string;
  business_name: string;
  image_url: string;
  referral_views: number;
  created_at: string;
}

export default function PromotersDashboard() {
  const { businesses, loading: businessLoading } = useBusinessOwner();
  const [promoters, setPromoters] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessLoading) return;
    if (businesses.length === 0) {
      setLoading(false);
      return;
    }

    const fetchPromoters = async () => {
      try {
        const businessNames = businesses.map(b => b.name);
        
        const { data, error } = await supabase
          .from('proofs')
          .select('*')
          .in('business_name', businessNames)
          .gt('referral_views', 0)
          .order('referral_views', { ascending: false });

        if (error) throw error;
        setPromoters(data || []);
      } catch (err) {
        console.error('Error fetching promoters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoters();
  }, [businessLoading, businesses]);

  if (businessLoading || loading) {
    return <div className="min-h-screen bg-gradient-subtle py-20" />;
  }

  const totalReferrals = promoters.reduce((sum, p) => sum + (p.referral_views || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="bg-gradient-hero py-12 px-4 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white heading-display">Top Promoters</h1>
                <span className="bg-[#D4AF37] text-[#1B4332] text-xs font-bold px-2 py-1 rounded shadow-sm">INFLUENCERS</span>
              </div>
              <p className="text-white/80 max-w-xl">
                See which local customers are driving the most traffic to your business through Proof of Visit share links.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-6 relative z-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1B4332]/10 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-[#1B4332]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#525252]">Active Promoters</p>
              <p className="text-2xl font-black text-[#1A1A1A]">{promoters.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-[#856404]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#525252]">Total Referred Views</p>
              <p className="text-2xl font-black text-[#1A1A1A]">{totalReferrals}</p>
            </div>
          </div>
        </div>

        {businesses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-[#E5E5E5]">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Businesses Found</h3>
            <p className="text-[#525252] mb-6">You need an active business to see promoters.</p>
          </div>
        ) : promoters.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-[#E5E5E5]">
            <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
              <HandHeart className="w-8 h-8 text-[#1B4332]/50" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Referrals Yet</h3>
            <p className="text-[#525252] max-w-md mx-auto">
              When customers share their Proof of Visit cards on social media, you'll see how much traffic they drive to your business here.
            </p>
          </div>
        ) : (
          <div className="bg-white border text-sm border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAFAF8] text-[#525252] text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Rank</th>
                    <th className="px-6 py-4 font-bold">Promoter</th>
                    <th className="px-6 py-4 font-bold">Business</th>
                    <th className="px-6 py-4 font-bold text-right">Referral Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {promoters.map((proof, idx) => (
                    <tr key={proof.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {idx === 0 ? (
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#856404]">
                            <Trophy className="w-4 h-4" />
                          </div>
                        ) : idx === 1 ? (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                            2
                          </div>
                        ) : idx === 2 ? (
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                            3
                          </div>
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center text-[#737373] font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={proof.image_url} alt="Proof" className="w-10 h-10 rounded-lg object-cover border border-[#E5E5E5] shadow-sm" />
                          <span className="font-bold text-[#1A1A1A]">{proof.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#525252] font-medium">
                        {proof.business_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="inline-flex items-center justify-center bg-[#1B4332]/10 text-[#1B4332] font-black px-3 py-1 rounded-full text-lg">
                          {proof.referral_views}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
