"use client";

import { useState } from 'react';
import { Search, Info, Plus } from 'lucide-react';

export default function SearchTuningPage() {
  const [rules, setRules] = useState([
    { id: 1, term: 'mbao', mapsTo: 'hardware', hits: 1420 },
    { id: 2, term: 'mtumba', mapsTo: 'fashion', hits: 890 },
    { id: 3, term: 'simu', mapsTo: 'electronics', hits: 3400 },
    { id: 4, term: 'kuku', mapsTo: 'food', hits: 512 },
  ]);

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
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
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
              {rules.map(rule => (
                <tr key={rule.id} className="border-b border-white/5 hover:bg-white/5 disabled">
                  <td className="px-6 py-4 font-mono font-bold text-white">"{rule.term}"</td>
                  <td className="px-6 py-4"><span className="bg-white/10 px-2 py-1 rounded text-xs">{rule.mapsTo}</span></td>
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
    </div>
  );
}
