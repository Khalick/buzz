"use client";

import { useState } from 'react';
import { DownloadCloud, ExternalLink, HardDrive, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ReportsPage() {
  const [loadingMerchant, setLoadingMerchant] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);

  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMerchants = async () => {
    setLoadingMerchant(true);
    try {
      const { data, error } = await supabase.from('businesses').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
        downloadCSV(`${headers}\n${rows}`, 'verified_merchants_dump.csv');
      }
    } catch (err) {
      console.error('Merchant dump failed', err);
    } finally {
      setLoadingMerchant(false);
    }
  };

  const handleExportLedger = async () => {
    setLoadingLedger(true);
    try {
      const { data, error } = await supabase.from('mpesa_ledger').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
        downloadCSV(`${headers}\n${rows}`, 'mpesa_ledger_export.csv');
      }
    } catch (err) {
      console.error('Ledger export failed', err);
    } finally {
      setLoadingLedger(false);
    }
  };

  const [loadingUsers, setLoadingUsers] = useState(false);
  const handleExportUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
        downloadCSV(`${headers}\n${rows}`, 'platform_users_export.csv');
      }
    } catch (err) {
      console.error('Users export failed', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const [loadingRequests, setLoadingRequests] = useState(false);
  const handleExportRequests = async () => {
    setLoadingRequests(true);
    try {
      const { data, error } = await supabase.from('merchant_requests').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
        downloadCSV(`${headers}\n${rows}`, 'merchant_requests_export.csv');
      }
    } catch (err) {
      console.error('Requests export failed', err);
    } finally {
      setLoadingRequests(false);
    }
  };

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
          <button 
            onClick={handleExportMerchants}
            disabled={loadingMerchant}
            className="w-full py-4 rounded-xl font-bold transition-all text-[#0D1F16] flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50" 
            style={{ background: 'linear-gradient(135deg, #D4AF37, #c4a030)' }}
          >
            {loadingMerchant ? <Loader2 size={18} className="animate-spin" /> : <DownloadCloud size={18} />}
            {loadingMerchant ? 'Building File...' : 'Export Verified Merchants (.CSV)'}
          </button>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <h3 className="font-bold text-lg text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>M-Pesa Ledger Export</h3>
          <p className="text-sm text-[#E0E0E0]/60 mb-6">Exports all raw M-Pesa transaction objects, useful for accountant auditing.</p>
          <button 
            onClick={handleExportLedger}
            disabled={loadingLedger}
            className="w-full py-4 rounded-xl font-bold transition-all text-[#0D1F16] flex items-center justify-center gap-2 bg-white hover:bg-gray-200 disabled:opacity-50"
          >
            {loadingLedger ? <Loader2 size={18} className="animate-spin" /> : <HardDrive size={18} />}
            {loadingLedger ? 'Building File...' : 'Export Finance Ledger (.CSV)'}
          </button>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <h3 className="font-bold text-lg text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Platform Users Export</h3>
          <p className="text-sm text-[#E0E0E0]/60 mb-6">Exports all registered user accounts globally, including their roles and joined dates.</p>
          <button 
            onClick={handleExportUsers}
            disabled={loadingUsers}
            className="w-full py-4 rounded-xl font-bold transition-all text-[#0D1F16] flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
          >
            {loadingUsers ? <Loader2 size={18} className="animate-spin" /> : <HardDrive size={18} />}
            {loadingUsers ? 'Building File...' : 'Export All Users (.CSV)'}
          </button>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <h3 className="font-bold text-lg text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Merchant Requests Export</h3>
          <p className="text-sm text-[#E0E0E0]/60 mb-6">Exports all pending, approved, and rejected merchant upgrade requests for auditing.</p>
          <button 
            onClick={handleExportRequests}
            disabled={loadingRequests}
            className="w-full py-4 rounded-xl font-bold transition-all text-[#0D1F16] flex items-center justify-center gap-2 bg-orange-100 hover:bg-orange-200 disabled:opacity-50"
          >
            {loadingRequests ? <Loader2 size={18} className="animate-spin" /> : <HardDrive size={18} />}
            {loadingRequests ? 'Building File...' : 'Export Upgrade Requests (.CSV)'}
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
