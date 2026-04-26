"use client";

import { useState } from 'react';
import { Shield, Clock, AlertTriangle, User } from 'lucide-react';

export default function AuditLogPage() {
  const [logs] = useState([
    { id: 1, action: 'DELETED_DEAL', target: 'Deal #8492 (Mama Ciku Hardware)', user: 'admin@bizhub.co.ke', time: '10 mins ago', severity: 'high' },
    { id: 2, action: 'FORCE_SUBSCRIBED', target: 'M-Pesa TRX-RG81KJL9A', user: 'admin@bizhub.co.ke', time: '1 hour ago', severity: 'medium' },
    { id: 3, action: 'UPDATED_SEO_SLUG', target: 'Business #110 (Nairobi Auto)', user: 'peter@bizhub.co.ke', time: '2 hours ago', severity: 'low' },
    { id: 4, action: 'SENT_BROADCAST', target: 'Audience: All Hardware Shops', user: 'admin@bizhub.co.ke', time: '1 day ago', severity: 'high' },
    { id: 5, action: 'MANUAL_BUSINESS_ADD', target: 'Business #4092 (Thika Electricals)', user: 'admin@bizhub.co.ke', time: '2 days ago', severity: 'medium' },
  ]);

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
              {logs.map(log => (
                <tr key={log.id} className="border-b border-white/5 disabled">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-[#E0E0E0]/60">
                      <Clock size={14} /> {log.time}
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
