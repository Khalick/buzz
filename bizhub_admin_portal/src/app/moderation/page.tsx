"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Loader2, Megaphone, Trash2, ShieldAlert, Store, Clock } from 'lucide-react';

interface Deal {
  id: string;
  business_id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  created_at: string;
  business_name?: string;
}

export default function ModerationPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    setLoading(true);
    try {
      // In a real structured schema, we'd do a join. Here we fetch deals and their associated business.
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (dealsError) throw dealsError;

      // Enhance with business names if possible
      const enhancedDeals = await Promise.all((dealsData || []).map(async (deal) => {
        const { data: bizData } = await supabase
          .from('businesses')
          .select('name')
          .eq('id', deal.business_id)
          .single();
          
        return { ...deal, business_name: bizData?.name || 'Unknown Business' };
      }));

      setDeals(enhancedDeals);
    } catch (err) {
      console.error('Failed to fetch moderation feed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTakedown(dealId: string) {
    if (!confirm('Are you sure you want to delete this content? This cannot be undone.')) return;
    
    setActionLoading(dealId);
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;
      setDeals(prev => prev.filter(d => d.id !== dealId));
    } catch (err) {
      console.error('Takedown failed:', err);
      alert('Failed to remove content.');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Content Moderation
        </h1>
        <p className="text-[#E0E0E0]/70 mt-1">Monitor the Live Pulse feed. Remove spam, inappropriate content, or scams.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <ShieldAlert size={48} className="text-[#D4AF37] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Network is Clean</h3>
          <p className="text-[#E0E0E0]/60">No active flash deals or broadcasts require moderation right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deals.map((deal) => (
            <div key={deal.id} className="rounded-2xl p-6 relative overflow-hidden" style={{
              background: 'rgba(27, 67, 50, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 175, 55, 0.15)',
            }}>
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                    <Megaphone size={18} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {deal.title || 'Untitled Broadcast'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#E0E0E0]/50 mt-1">
                      <Store size={12} />
                      {deal.business_name}
                    </div>
                  </div>
                </div>
                {deal.discount_percentage && (
                  <span className="bg-red-500/10 text-red-400 font-bold px-2 py-1 rounded text-xs border border-red-500/20">
                    {deal.discount_percentage}% OFF
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl mb-6 text-sm text-[#E0E0E0]/80" style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                {deal.description}
              </div>

              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
                <div className="flex items-center gap-1.5 text-xs text-[#E0E0E0]/40">
                  <Clock size={12} />
                  Posted: {new Date(deal.created_at).toLocaleString()}
                </div>
                
                <button
                  onClick={() => handleTakedown(deal.id)}
                  disabled={actionLoading === deal.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/30 disabled:opacity-50"
                  title="Remove from public feed"
                >
                  {actionLoading === deal.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Takedown
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
