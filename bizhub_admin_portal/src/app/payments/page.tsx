"use client";

import { useState } from 'react';
import { Search, Loader2, ArrowUpRight, ArrowDownLeft, ShieldCheck, DollarSign } from 'lucide-react';

export default function PaymentsLedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hardcoded realistic data for the M-Pesa Ledger since the Daraja integration table might not be fully spec'd yet
  const [transactions, setTransactions] = useState([
    { id: 'TRX-RG81KJL9A', type: 'subscription', plan: 'Premium', amount: 5000, phone: '254712***890', date: '2025-10-15T09:30:00Z', status: 'success', name: 'James Kariuki' },
    { id: 'TRX-RG81KXM2P', type: 'boost', plan: 'Flash Deal Boost', amount: 500, phone: '254722***444', date: '2025-10-15T10:15:00Z', status: 'success', name: 'Mama Ciku Salon' },
    { id: 'TRX-RG81KYZ77', type: 'subscription', plan: 'Premium', amount: 5000, phone: '254799***111', date: '2025-10-14T14:20:00Z', status: 'failed', name: 'AutoSpares Ltd' },
    { id: 'TRX-RG81KZ001', type: 'lead', plan: 'B2B Lead Match', amount: 200, phone: '254744***222', date: '2025-10-14T16:45:00Z', status: 'success', name: 'Thika Electricals' },
  ]);

  const [loadingCode, setLoadingCode] = useState<string | null>(null);

  const handleForceApprove = (id: string) => {
    setLoadingCode(id);
    setTimeout(() => {
      setTransactions(prev => prev.map(t => 
        t.id === id ? { ...t, status: 'success' } : t
      ));
      setLoadingCode(null);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            M-Pesa Ledger
          </h1>
          <p className="text-[#E0E0E0]/70 mt-1">Reconcile Daraja API transactions and override failed payments.</p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center"><DollarSign size={16} className="text-[#D4AF37]" /></div>
            <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider">Today's Revenue</p>
          </div>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>KES 5,500</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><ArrowUpRight size={16} className="text-blue-400" /></div>
            <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider">MRR</p>
          </div>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>KES 420K</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><ArrowDownLeft size={16} className="text-red-400" /></div>
            <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider">Failed Txs</p>
          </div>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>1</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-2xl overflow-hidden" style={{
        background: 'rgba(27, 67, 50, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
      }}>
        <div className="p-4" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E0E0E0]/40" size={18} />
            <input 
              type="text"
              placeholder="Search MPESA receipt (e.g. RG81K...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all placeholder:text-white/20"
              style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
            />
          </div>
        </div>

        <table className="w-full text-left text-sm text-[#E0E0E0]">
          <thead className="text-xs uppercase bg-[#1B4332]/50 text-[#D4AF37] font-bold">
            <tr>
              <th className="px-6 py-4">Receipt</th>
              <th className="px-6 py-4">Payer</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(trx => (
              <tr key={trx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-xs tracking-wider text-[#D4AF37]">{trx.id}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-white max-w-[120px] truncate">{trx.name}</div>
                  <div className="text-xs text-[#E0E0E0]/50">{trx.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="uppercase tracking-widest text-[#E0E0E0]/70 font-bold text-xs">{trx.plan}</div>
                </td>
                <td className="px-6 py-4 font-bold text-white">
                  KES {trx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {trx.status === 'success' ? (
                    <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded font-bold text-xs border border-green-500/20">Success</span>
                  ) : (
                    <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded font-bold text-xs border border-red-500/20">Failed API</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {trx.status === 'failed' && (
                    <button 
                      onClick={() => handleForceApprove(trx.id)}
                      disabled={loadingCode === trx.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {loadingCode === trx.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                      Force Override
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
