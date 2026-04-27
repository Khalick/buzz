"use client";

import { useState, useEffect } from 'react';
import { Search, Info, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SearchRule {
  id: number;
  term: string;
  maps_to: string;
  hits: number;
}

export default function SearchTuningPage() {
  const [rules, setRules] = useState<SearchRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    term: '',
    maps_to: ''
  });

  useEffect(() => {
    async function fetchRules() {
      try {
        const { data, error } = await supabase
          .from('search_tuning_rules')
          .select('*')
          .order('hits', { ascending: false });
        if (error) throw error;
        setRules(data || []);
      } catch (err) {
        console.error('Failed to fetch search rules:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRules();
  }, []);

  const handleAddRule = async () => {
    if (!formData.term || !formData.maps_to) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('search_tuning_rules')
        .insert([{ term: formData.term.toLowerCase(), maps_to: formData.maps_to, hits: 0 }])
        .select()
        .single();
      
      if (error) throw error;
      if (data) setRules(prev => [data, ...prev]);
      
      setIsModalOpen(false);
      setFormData({ term: '', maps_to: '' });
    } catch (err) {
      console.error('Failed to create search synonym rule:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            AI Search Tuning
          </h1>
          <p className="text-[#E0E0E0]/70 mt-1">Map vernacular slang to standard system categories to fix "0 Results" queries.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
        >
          <Plus size={18} />
          Add Synonym Rule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <div className="p-5 flex items-center gap-2 bg-[#D4AF37]/5 border-b border-[#D4AF37]/20">
            <Info size={16} className="text-[#D4AF37]" />
            <p className="text-xs font-bold text-[#E0E0E0]/80">Active Routing Rules inject directly into the PostgreSQL Text Search engine.</p>
          </div>
          <table className="w-full text-left text-sm text-[#E0E0E0]">
            <thead className="text-xs uppercase bg-[#1B4332]/50 text-[#D4AF37] font-bold">
              <tr>
                <th className="px-6 py-4">Sheng / Slang Term</th>
                <th className="px-6 py-4">Maps To Category</th>
                <th className="px-6 py-4 text-right">Query Hits</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-[#D4AF37] mx-auto" />
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-[#E0E0E0]/50">
                    No active routing rules found.
                  </td>
                </tr>
              ) : rules.map(rule => (
                <tr key={rule.id} className="border-b border-white/5 hover:bg-white/5 disabled">
                  <td className="px-6 py-4 font-mono font-bold text-white">"{rule.term}"</td>
                  <td className="px-6 py-4"><span className="bg-white/10 px-2 py-1 rounded text-xs">{rule.maps_to}</span></td>
                  <td className="px-6 py-4 text-right text-[#D4AF37] font-bold">{rule.hits.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl p-6" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Search size={18} className="text-red-400" /> Top "0 Result" Queries
          </h3>
          <p className="text-xs text-[#E0E0E0]/60 mb-6">Users searched for these this week but found nothing. Map them!</p>

          <div className="space-y-3">
             <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
               <span className="font-mono text-sm text-white">"fundi"</span>
               <span className="text-xs text-red-400 font-bold">342 drops</span>
             </div>
             <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
               <span className="font-mono text-sm text-white">"mchele"</span>
               <span className="text-xs text-red-400 font-bold">128 drops</span>
             </div>
             <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
               <span className="font-mono text-sm text-white">"plumber"</span>
               <span className="text-xs text-red-400 font-bold">95 drops</span>
             </div>
          </div>
        </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-8" style={{ background: '#0D1F16', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Map Search Synonym</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Slang / Searched Term</label>
                <input type="text" value={formData.term} onChange={(e) => setFormData({...formData, term: e.target.value})} placeholder="e.g. fundi" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Maps To System Category</label>
                <input type="text" value={formData.maps_to} onChange={(e) => setFormData({...formData, maps_to: e.target.value})} placeholder="e.g. Handyman Search" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              <div className="pt-4 mt-4 flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-white border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
                <button 
                  onClick={handleAddRule}
                  disabled={actionLoading || !formData.term || !formData.maps_to}
                  className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: '#D4AF37', color: '#0D1F16' }}
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Map Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
