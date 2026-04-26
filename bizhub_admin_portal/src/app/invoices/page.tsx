"use client";

import { Printer, Download, Plus, FileText, Send } from 'lucide-react';

export default function InvoicesPage() {
  const invoices = [
    { id: 'INV-2025-001', company: 'Nakumatt Holdings', amount: 150000, date: '2025-10-10', status: 'paid' },
    { id: 'INV-2025-002', company: 'Thika Private Hospital', amount: 50000, date: '2025-10-12', status: 'pending' },
    { id: 'INV-2025-003', company: 'Mega Hardware Wholesale', amount: 75000, date: '2025-09-28', status: 'overdue' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Corporate Invoicing</h1>
          <p className="text-[#E0E0E0]/70 mt-1">Generate PDF B2B invoices for enterprise merchants skipping M-Pesa.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10">
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
        <table className="w-full text-left text-sm text-[#E0E0E0]">
          <thead className="text-xs uppercase bg-[#1B4332]/50 text-[#D4AF37] font-bold">
            <tr>
              <th className="px-6 py-4">Invoice ID</th>
              <th className="px-6 py-4">Enterprise Client</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-mono font-bold text-white">{inv.id}</td>
                <td className="px-6 py-4">{inv.company}</td>
                <td className="px-6 py-4 font-bold">KES {inv.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    inv.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                    inv.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                  }`}>{inv.status.toUpperCase()}</span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white" title="Email Invoice"><Send size={14} /></button>
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white" title="Download PDF"><Download size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
