"use client";

import { useState, useEffect } from 'react';
import { LifeBuoy, Search, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Ticket {
  id: string;
  merchant: string;
  issue: string;
  priority: string;
  status: string;
  date: string;
  created_at?: string;
}

export default function SupportCRMPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        console.error('Failed to fetch support tickets:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'Resolved' })
        .eq('id', id);
      if (error) throw error;
      setTickets(prev => prev.map(tkt => tkt.id === id ? { ...tkt, status: 'Resolved' } : tkt));
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Support CRM</h1>
          <p className="text-[#E0E0E0]/70 mt-1">Lightweight Helpdesk for tracking merchant disputes and platform issues.</p>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
        <div className="p-4 flex gap-4 bg-[#1B4332]/30 border-b border-white/5">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E0E0E0]/40" size={16} />
             <input type="text" placeholder="Search ticket ID or Merchant name..." className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none bg-black/20 text-white border border-white/5" />
          </div>
          <button className="px-4 py-2 bg-black/20 border border-white/5 rounded-lg flex items-center gap-2 text-sm text-white"><Filter size={14} /> Filter</button>
        </div>

        <table className="w-full text-left text-sm text-[#E0E0E0]">
          <thead className="text-xs uppercase bg-[#1B4332]/50 text-[#D4AF37] font-bold">
            <tr>
              <th className="px-6 py-4">Ticket</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Loader2 size={24} className="animate-spin text-[#D4AF37] mx-auto" />
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#E0E0E0]/50">
                  No support tickets open.
                </td>
              </tr>
            ) : tickets.map((tkt, i) => (
              <tr key={tkt.id || i} className="border-b border-white/5 hover:bg-white/5 cursor-pointer">
                <td className="px-6 py-4">
                  <div className="font-mono text-xs text-[#D4AF37] font-bold">{tkt.id}</div>
                  <div className="text-xs text-[#E0E0E0]/60 mt-1">{tkt.created_at ? new Date(tkt.created_at).toLocaleString() : tkt.date}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-base">{tkt.issue}</div>
                  <div className="text-xs text-[#E0E0E0]/50 mt-1 opacity-70">Reported by: {tkt.merchant}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${tkt.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : tkt.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>{tkt.priority}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${tkt.status === 'Open' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>{tkt.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {tkt.status === 'Open' && (
                    <button 
                      onClick={() => handleResolve(tkt.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 font-bold transition-all"
                    >
                      Resolve
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
