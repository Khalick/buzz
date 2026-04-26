"use client";

import { useState } from 'react';
import { Star, Plus, UploadCloud, Calendar, Clock, Loader2, Play, Square, Store } from 'lucide-react';

// Hardcoded for UI visualization, this would normally connect to a 'featured_placements' Supabase table
const MOCK_ADS = [
  { id: 'ad-1', merchant: 'Thika Electricals', slot: 'Homepage Carousel', status: 'active', startDate: '2025-10-10', endDate: '2025-10-17', views: 4200, clicks: 310 },
  { id: 'ad-2', merchant: 'Mama Ciku Hardware', slot: 'Category Top-Spot', status: 'active', startDate: '2025-10-12', endDate: '2025-10-19', views: 1500, clicks: 89 },
  { id: 'ad-3', merchant: 'Nairobi Auto Spares', slot: 'Search Results Banner', status: 'scheduled', startDate: '2025-10-20', endDate: '2025-10-27', views: 0, clicks: 0 },
  { id: 'ad-4', merchant: 'Fashion Hub', slot: 'Homepage Carousel', status: 'expired', startDate: '2025-09-01', endDate: '2025-09-08', views: 12000, clicks: 840 },
];

export default function FeaturedAdsPage() {
  const [ads, setAds] = useState(MOCK_ADS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStopAd = (id: string) => {
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, status: 'expired' } : ad));
  };

  const handleActivateAd = (id: string) => {
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, status: 'active' } : ad));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Featured Ads & Placements
          </h1>
          <p className="text-[#E0E0E0]/70 mt-1">Monetize app real estate. Manage homepage banners and premium category slots.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #D4AF37, #c4a030)',
            color: '#0D1F16',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
          }}
        >
          <Plus size={18} />
          Create New Campaign
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider mb-2">Active Campaigns</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{ads.filter(a => a.status === 'active').length}</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider mb-2">Total Impressions</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>17.7K</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider mb-2">Total Clicks</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>1.2K</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider mb-2">Ad Revenue</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>KES 45K</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-2xl overflow-hidden" style={{
        background: 'rgba(27, 67, 50, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
      }}>
        <table className="w-full text-left text-sm text-[#E0E0E0]">
          <thead className="text-xs uppercase bg-[#1B4332]/50 text-[#D4AF37] font-bold">
            <tr>
              <th className="px-6 py-4">Merchant & Slot</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Schedule</th>
              <th className="px-6 py-4">Performance</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => (
              <tr key={ad.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-base flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <Store size={14} className="text-[#D4AF37]" /> {ad.merchant}
                  </div>
                  <div className="text-xs text-[#E0E0E0]/50 mt-1">{ad.slot}</div>
                </td>
                <td className="px-6 py-4">
                  {ad.status === 'active' && <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded font-bold text-xs flex items-center gap-1 w-max"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div> Live</span>}
                  {ad.status === 'scheduled' && <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded font-bold text-xs flex items-center gap-1 w-max"><Clock size={12} /> Scheduled</span>}
                  {ad.status === 'expired' && <span className="bg-gray-500/10 text-gray-400 px-2 py-1 rounded font-bold text-xs">Expired</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs">{ad.startDate} <span className="text-[#E0E0E0]/30 mx-1">to</span> {ad.endDate}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-white font-bold">{ad.views.toLocaleString()} Views</div>
                  <div className="text-xs text-[#E0E0E0]/50 mt-0.5">{ad.clicks.toLocaleString()} Clicks</div>
                </td>
                <td className="px-6 py-4 text-right">
                  {ad.status === 'active' ? (
                    <button onClick={() => handleStopAd(ad.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Stop Campaign">
                      <Square size={16} />
                    </button>
                  ) : ad.status === 'scheduled' ? (
                    <button onClick={() => handleActivateAd(ad.id)} className="text-green-400 hover:bg-green-500/10 p-2 rounded-lg transition-colors" title="Force Start Campaign">
                      <Play size={16} />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Campaign Modal overlay placeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-8" style={{
            background: '#0D1F16',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>New Ad Campaign</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Target Merchant DB ID</label>
                <input type="text" placeholder="UUID from Database..." className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Placement Slot</label>
                <select className="w-full px-4 py-3 rounded-xl text-white outline-none appearance-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option>Homepage Carousel (Top)</option>
                  <option>Category Sticky Banner</option>
                  <option>Search Results Priority</option>
                </select>
              </div>

              <div>
                 <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Banner Asset Upload</label>
                 <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                    <UploadCloud size={32} className="text-[#D4AF37] mb-3" />
                    <p className="text-sm font-bold text-white">Click to upload banner image</p>
                    <p className="text-xs text-[#E0E0E0]/50 mt-1">1080x400px WEBP or PNG</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Start Date</label>
                    <input type="date" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">End Date</label>
                    <input type="date" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                 </div>
              </div>

              <div className="pt-4 mt-4 flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-white border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
                <button 
                  className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ background: '#D4AF37', color: '#0D1F16' }}
                >
                  <Star size={18} /> Launch Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
