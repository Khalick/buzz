"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Loader2, Store, MapPin, Edit, ShieldAlert, Phone } from 'lucide-react';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  category: string;
  whatsapp: string;
  approved: boolean;
  address?: string;
  created_at: string;
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchMerchants() {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, category, whatsapp, approved, address, created_at')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setMerchants(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMerchants();
  }, []);

  const filteredMerchants = merchants.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.whatsapp.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Merchant Directory
          </h1>
          <p className="text-[#E0E0E0]/70 mt-1">Manage all {merchants.length} registered businesses on the network.</p>
        </div>
        <Link 
          href="/merchants/add"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{
            background: 'linear-gradient(135deg, #D4AF37, #c4a030)',
            color: '#0D1F16',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
          }}
        >
          <Plus size={18} />
          Manually Add Merchant
        </Link>
      </div>

      {/* Tool Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E0E0E0]/40" size={18} />
          <input 
            type="text"
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-white outline-none transition-all placeholder:text-white/20"
            style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}
          />
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl overflow-hidden" style={{
        background: 'rgba(27, 67, 50, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
      }}>
        {loading ? (
           <div className="flex items-center justify-center p-12">
             <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
           </div>
        ) : (
          <table className="w-full text-left text-sm text-[#E0E0E0]">
            <thead className="text-xs uppercase bg-[#1B4332]/50 text-[#D4AF37] font-bold">
              <tr>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMerchants.map(merchant => (
                <tr key={merchant.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>{merchant.name}</div>
                    <div className="text-xs text-[#E0E0E0]/50 uppercase tracking-widest mt-1">{merchant.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Phone size={14} className="text-[#E0E0E0]/40" />
                       {merchant.whatsapp}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <MapPin size={14} className="text-[#E0E0E0]/40" />
                       <span className="truncate max-w-[150px]">{merchant.address || 'GPS Only'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {merchant.approved ? (
                      <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded font-bold text-xs">Live</span>
                    ) : (
                      <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded font-bold text-xs flex items-center gap-1 w-max">
                        <ShieldAlert size={12} /> Pending Validation
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#D4AF37] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                      <Edit size={16} />
                    </button>
                    <button className="ml-2 text-[#E0E0E0]/50 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" title="Login As Merchant">
                      <Store size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
