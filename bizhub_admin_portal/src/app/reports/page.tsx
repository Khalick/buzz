"use client";

import { DownloadCloud, ExternalLink, HardDrive } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-8">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Data Exports</h1>
          <p className="text-[#E0E0E0]/70 mt-1">Extract platform data to CSV for external tools like HubSpot or Mailchimp.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <h3 className="font-bold text-lg text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Master Merchant Dump</h3>
          <p className="text-sm text-[#E0E0E0]/60 mb-6">Exports every verified merchant detail including WhatsApp numbers and categories.</p>
          <button className="w-full py-4 rounded-xl font-bold transition-all text-[#0D1F16] flex items-center justify-center gap-2 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #D4AF37, #c4a030)' }}>
            <DownloadCloud size={18} /> Export 2.4k Rows (.CSV)
          </button>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <h3 className="font-bold text-lg text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>M-Pesa Ledger Export</h3>
          <p className="text-sm text-[#E0E0E0]/60 mb-6">Exports all raw M-Pesa transaction objects, useful for accountant auditing.</p>
          <button className="w-full py-4 rounded-xl font-bold transition-all text-[#0D1F16] flex items-center justify-center gap-2 bg-white hover:bg-gray-200">
            <HardDrive size={18} /> Export Finance Ledger (.XLSX)
          </button>
        </div>

        <div className="lg:col-span-2 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]" style={{ border: '1px dashed rgba(212, 175, 55, 0.3)' }}>
          <ExternalLink size={32} className="text-[#E0E0E0]/20 mb-4" />
          <h3 className="font-bold text-white">Live Webhooks</h3>
          <p className="text-sm text-[#E0E0E0]/50 max-w-sm text-center mt-2 mb-4">Want real-time data instead of manual CSVs? You can configure outbound webhooks in your Supabase Dashboard.</p>
          <a href="https://supabase.com/dashboard" target="_blank" className="text-sm font-bold text-[#D4AF37] hover:underline">Go to Supabase Webhooks &rarr;</a>
        </div>

      </div>
    </div>
  );
}
