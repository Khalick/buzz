"use client";

import { useState, useEffect } from 'react';
import { Printer, Download, Plus, FileText, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Invoice {
  id: string;
  company: string;
  amount: number;
  date: string;
  status: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    amount: ''
  });

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .order('date', { ascending: false });
        if (error) throw error;
        setInvoices(data || []);
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const handleCreateInvoice = async () => {
    if (!formData.company || !formData.amount) return;
    setActionLoading(true);
    try {
      const newInvoice = {
        company: formData.company,
        amount: parseFloat(formData.amount),
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      const { data, error } = await supabase
        .from('invoices')
        .insert([newInvoice])
        .select()
        .single();
      if (error) throw error;
      if (data) setInvoices(prev => [data, ...prev]);
      setIsModalOpen(false);
      setFormData({ company: '', amount: '' });
    } catch (err) {
      console.error('Failed to create invoice:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Corporate Invoicing</h1>
          <p className="text-[#E0E0E0]/70 mt-1">Generate PDF B2B invoices for enterprise merchants skipping M-Pesa.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
        >
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
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Loader2 size={24} className="animate-spin text-[#D4AF37] mx-auto" />
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#E0E0E0]/50">
                  No invoices generated yet.
                </td>
              </tr>
            ) : invoices.map(inv => (
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-8" style={{ background: '#0D1F16', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Generate Corporate Invoice</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Enterprise Client Name</label>
                <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="e.g. Acme Corp Media" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Amount (KES)</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="e.g. 50000" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              <div className="pt-4 mt-4 flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-white border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
                <button 
                  onClick={handleCreateInvoice}
                  disabled={actionLoading || !formData.company || !formData.amount}
                  className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: '#D4AF37', color: '#0D1F16' }}
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
