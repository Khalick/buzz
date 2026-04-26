"use client";

import { Tag, Plus, Activity } from 'lucide-react';

export default function PromotionsPage() {
  const promos = [
    { code: 'THIKA-50', discount: '50% OFF', type: 'Percentage', usage: '45 / 100', status: 'Active' },
    { code: 'LAUNCH-FREE', discount: '1 Mo Free', type: 'Subscription', usage: '12 / Unlimited', status: 'Active' },
    { code: 'KIAMBU-VIP', discount: 'KES 200 OFF', type: 'Fixed Fee', usage: '500 / 500', status: 'Depleted' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Voucher & Promo Engine</h1>
          <p className="text-[#E0E0E0]/70 mt-1">Generate marketing codes for field agents and online campaigns.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
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
            {promos.map((promo, i) => (
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
    </div>
  );
}
