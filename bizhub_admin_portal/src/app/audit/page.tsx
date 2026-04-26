"use client";

import { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuditLog {
  id: number;
  action: string;
  target: string;
  user: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
  created_at?: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        setLogs(data || []);
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          God-Eye Audit Log
        </h1>
        <p className="text-[#E0E0E0]/70 mt-1">Immutable, unquestionable record of every administrative action.</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
      }}>
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-2">
          <Shield size={16} className="text-[#D4AF37]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">System Security Log active</span>
        </div>
        
        <table className="w-full text-left text-sm text-[#E0E0E0]">
            <thead className="text-xs uppercase bg-[#1B4332]/50 text-[#D4AF37] font-bold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target / Entity</th>
                <th className="px-6 py-4">Executed By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-[#D4AF37] mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#E0E0E0]/50">
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="border-b border-white/5 disabled">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-[#E0E0E0]/60">
                      <Clock size={14} /> {log.created_at ? new Date(log.created_at).toLocaleString() : log.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${
                      log.severity === 'high' ? 'bg-red-500/10 text-red-400' :
                      log.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white hover:text-[#D4AF37] hover:underline cursor-pointer transition-colors text-xs font-bold">
                    {log.target}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-[#E0E0E0]/80 bg-black/20 w-max px-2 py-1 rounded">
                      <User size={12} /> {log.user}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
