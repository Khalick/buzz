"use client";

import { useState, useEffect } from 'react';
import { Tag, Plus, Activity, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Promotion {
  code: string;
  discount: string;
  type: string;
  usage: string;
  status: string;
}

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'Percentage',
    usage: '100',
    status: 'Active'
  });

  useEffect(() => {
    async function fetchPromos() {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .order('code');
        if (error) throw error;
        setPromos(data || []);
      } catch (err) {
        console.error('Failed to fetch promotions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPromos();
  }, []);

  const handleCreatePromo = async () => {
    if (!formData.code || !formData.discount) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('promotions')
        .insert([formData])
        .select()
        .single();
      if (error) throw error;
      if (data) setPromos(prev => [data, ...prev]);
      setIsModalOpen(false);
      setFormData({ code: '', discount: '', type: 'Percentage', usage: '100', status: 'Active' });
    } catch (err) {
      console.error('Failed to create promotion:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Voucher & Promo Engine</h1>
          <p className="text-[#E0E0E0]/70 mt-1">Generate marketing codes for field agents and online campaigns.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
        >
          <Plus size={18} /> New Promo Code
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
        <table className="w-full text-left text-sm text-[#E0E0E0]">
          <thead className="text-xs uppercase bg-[#1B4332]/50 text-[#D4AF37] font-bold">
            <tr>
              <th className="px-6 py-4">Promo Code</th>
              <th className="px-6 py-4">Discount Value</th>
              <th className="px-6 py-4">Usage Limit</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Analytics</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Loader2 size={24} className="animate-spin text-[#D4AF37] mx-auto" />
                </td>
              </tr>
            ) : promos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#E0E0E0]/50">
                  No promotions available.
                </td>
              </tr>
            ) : promos.map((promo, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-mono font-bold text-[#D4AF37] text-lg bg-black/20 w-max px-2">{promo.code}</td>
                <td className="px-6 py-4 font-bold text-white"><span className="text-xs opacity-50 px-2">{promo.type}</span>{promo.discount}</td>
                <td className="px-6 py-4 font-mono text-xs">{promo.usage}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${promo.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                    {promo.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white" title="View ROI"><Activity size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Promo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-8" style={{ background: '#0D1F16', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Create Promo Code</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Code</label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER24" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Discount Value</label>
                  <input type="text" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} placeholder="e.g. 25% or KES 500" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 rounded-xl text-white outline-none appearance-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed Amount">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Usage Limit</label>
                <input type="number" value={formData.usage} onChange={(e) => setFormData({...formData, usage: e.target.value})} className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              <div className="pt-4 mt-4 flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-white border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
                <button 
                  onClick={handleCreatePromo}
                  disabled={actionLoading || !formData.code || !formData.discount}
                  className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: '#D4AF37', color: '#0D1F16' }}
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Create Promo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
