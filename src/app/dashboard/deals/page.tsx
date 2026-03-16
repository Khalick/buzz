"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBusinessOwner } from '@/hooks/useBusinessOwner';
import Link from 'next/link';
import { ArrowLeft, Tag, Plus, Trash2, Clock, Zap } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  description: string;
  business_name: string;
  business_id: string;
  expiry_date?: string;
  is_flash_deal?: boolean;
}

export default function DealsDashboard() {
  const { businesses, loading: businessLoading } = useBusinessOwner();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    business_id: '',
    title: '',
    description: '',
    expiry_date: '',
    is_flash_deal: false,
  });

  useEffect(() => {
    if (businessLoading) return;
    
    if (businesses.length > 0 && !form.business_id) {
      setForm(prev => ({ ...prev, business_id: businesses[0].id }));
    }

    const fetchDeals = async () => {
      if (businesses.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const businessIds = businesses.map(b => b.id);
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .in('business_id', businessIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDeals(data || []);
      } catch (err) {
        console.error('Error fetching deals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [businessLoading, businesses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_id) return;
    setSubmitting(true);

    try {
      const selectedBiz = businesses.find(b => b.id === form.business_id);
      
      let finalExpiry = form.expiry_date;
      if (form.is_flash_deal) {
        // Flash deals expire in 2 hours
        const d = new Date();
        d.setHours(d.getHours() + 2);
        finalExpiry = d.toISOString();
      } else if (!finalExpiry) {
        // Default standard deals to 7 days
        const d = new Date();
        d.setDate(d.getDate() + 7);
        finalExpiry = d.toISOString();
      }

      const { data, error } = await supabase.from('deals').insert({
        business_id: form.business_id,
        business_name: selectedBiz?.name || 'Local Business',
        title: form.title,
        description: form.description,
        expiry_date: finalExpiry,
        is_flash_deal: form.is_flash_deal
      }).select().single();

      if (error) throw error;
      
      setDeals([data, ...deals]);
      setShowForm(false);
      setForm(prev => ({ ...prev, title: '', description: '', is_flash_deal: false, expiry_date: '' }));
    } catch (err) {
      console.error('Error adding deal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deal?')) return;
    try {
      await supabase.from('deals').delete().eq('id', id);
      setDeals(deals.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (businessLoading || loading) {
    return <div className="min-h-screen bg-gradient-subtle py-20" />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="bg-gradient-hero py-12 px-4 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white heading-display">Manage Deals</h1>
              <p className="text-white/80 mt-1">
                Post standard discounts or trigger a 2-hour Live Pulse flash deal.
              </p>
            </div>
            {!showForm && businesses.length > 0 && (
              <button 
                onClick={() => setShowForm(true)}
                className="bg-white text-[#1B4332] font-bold py-2 px-5 rounded-xl shadow-lg flex items-center gap-2 hover:bg-[#F2F2F2]"
              >
                <Plus className="w-5 h-5" />
                New Deal
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-6 relative z-10">
        {businesses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-[#E5E5E5]">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Businesses Found</h3>
            <p className="text-[#525252] mb-6">Add a business first to start posting deals.</p>
            <Link href="/directory/add" className="bg-[#1B4332] text-white px-6 py-2.5 rounded-xl font-semibold">
              Add a Business
            </Link>
          </div>
        ) : showForm ? (
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E5E5] p-6 mb-8 animate-fade-in">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Create New Deal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {businesses.length > 1 && (
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Select Business</label>
                  <select
                    required
                    value={form.business_id}
                    onChange={e => setForm(prev => ({ ...prev, business_id: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#1B4332]/10 rounded-xl outline-none focus:border-[#1B4332]/40"
                  >
                    {businesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Flash Deal Toggle */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex gap-4 items-start cursor-pointer hover:bg-red-100/50 transition-colors" onClick={() => setForm(prev => ({...prev, is_flash_deal: !prev.is_flash_deal}))}>
                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${form.is_flash_deal ? 'bg-red-600' : 'bg-white border-2 border-red-200'}`}>
                  {form.is_flash_deal && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className="font-extrabold text-red-700 flex items-center gap-1.5"><Zap className="w-4 h-4" /> Live Pulse (Flash Deal)</p>
                  <p className="text-red-600/80 text-sm mt-0.5">Alert nearby users instantly. Deal auto-expires in 2 hours. Perfect for slow hours!</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Deal Title</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={form.is_flash_deal ? "e.g. 50% off Coffee for the next 2 hours!" : "e.g. 10% Off All Services"}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#1B4332]/10 rounded-xl outline-none focus:border-[#1B4332]/40"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Details of the offer..."
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#1B4332]/10 rounded-xl outline-none focus:border-[#1B4332]/40 resize-none"
                />
              </div>

              {!form.is_flash_deal && (
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Expiry Date <span className="font-normal text-xs text-gray-400">(Optional)</span></label>
                  <input
                    type="date"
                    value={form.expiry_date}
                    onChange={e => setForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#1B4332]/10 rounded-xl outline-none focus:border-[#1B4332]/40"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-[#E5E5E5] mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-[#525252] font-semibold rounded-xl hover:bg-[#F2F2F2]">
                  Cancel
                </button>
                <button disabled={submitting} type="submit" className={`px-6 py-2.5 text-white font-bold rounded-xl flex items-center gap-2 ${form.is_flash_deal ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20' : 'bg-[#1B4332] hover:bg-[#2D6A4F] shadow-lg shadow-[#1B4332]/20'}`}>
                  {submitting ? 'Posting...' : form.is_flash_deal ? '⚡ Post Flash Deal' : 'Post Deal'}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="space-y-4">
          {deals.length === 0 && !showForm && (
            <div className="bg-white rounded-xl p-10 text-center border shadow-sm">
              <p className="text-[#525252]">You haven't posted any deals yet.</p>
            </div>
          )}
          {deals.map(deal => (
            <div key={deal.id} className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {deal.is_flash_deal ? (
                    <span className="text-[10px] font-black tracking-wider px-2 py-0.5 bg-red-100 text-red-600 rounded">LIVE PULSE</span>
                  ) : (
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-[#D4AF37]/10 text-[#856404] rounded">DEAL</span>
                  )}
                  <span className="text-xs font-semibold text-[#525252]">{deal.business_name}</span>
                </div>
                <h4 className="font-bold text-[#1A1A1A] text-lg">{deal.title}</h4>
                {deal.expiry_date && (
                   <p className="text-xs text-[#737373] mt-1 flex items-center gap-1">
                     <Clock className="w-3 h-3" /> Expires: {new Date(deal.expiry_date).toLocaleString()}
                   </p>
                )}
              </div>
              <button 
                onClick={() => handleDelete(deal.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Needed because we use CheckCircle outside of lucide imports in the standard set above
const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
