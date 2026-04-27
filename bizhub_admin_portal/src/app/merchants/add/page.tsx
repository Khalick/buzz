"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Loader2, Store, MapPin, Phone, MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';

export default function AddBusinessPage() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    whatsapp: '',
    county: '',
    town: '',
    address: '',
    latitude: '',
    longitude: '',
    approved: true // Admins add them as approved automatically
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data, error: insertError } = await supabase
        .from('businesses')
        .insert({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          contact: {
            whatsapp: formData.whatsapp,
            phone: formData.whatsapp,
            email: ''
          },
          location: {
            county: formData.county,
            town: formData.town,
            address: formData.address,
            coordinates: formData.latitude && formData.longitude ? {
              latitude: parseFloat(formData.latitude),
              longitude: parseFloat(formData.longitude)
            } : null
          },
          approved: formData.approved,
          user_id: (await supabase.auth.getSession()).data.session?.user?.id, // Tie to admin
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccessMessage(`Successfully added ${formData.name}! It is now live on the platform.`);
      setFormData({
        name: '',
        category: '',
        description: '',
        whatsapp: '',
        county: '',
        town: '',
        address: '',
        latitude: '',
        longitude: '',
        approved: true
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Manual Merchant Registration
        </h1>
        <p className="text-[#E0E0E0]/70 mt-1">Directly inject a verified business into the live platform.</p>
      </div>

      <div className="rounded-2xl p-8" style={{
        background: 'rgba(27, 67, 50, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
      }}>
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <CheckCircle className="text-green-400" size={24} />
            <p className="text-sm font-medium text-green-400">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Business Name *</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50">
                    <Store size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Mama Wanjiku Hardware"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white outline-none transition-all placeholder:text-white/20"
                    style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Primary Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all appearance-none"
                  style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                >
                  <option value="" disabled>Select category...</option>
                  <option value="hardware">Hardware & Construction</option>
                  <option value="electronics">Electronics & Tech</option>
                  <option value="automotive">Automotive & Spares</option>
                  <option value="beauty">Beauty & Salon</option>
                  <option value="food">Groceries & Food</option>
                  <option value="services">Professional Services</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What do they sell? Why are they highly rated?"
                  className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all placeholder:text-white/20 resize-none"
                  style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Verified WhatsApp *</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    placeholder="254712345678"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white outline-none transition-all placeholder:text-white/20"
                    style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">County *</label>
                  <input
                    type="text"
                    required
                    value={formData.county}
                    onChange={(e) => setFormData({...formData, county: e.target.value})}
                    placeholder="Kiambu"
                    className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all placeholder:text-white/20"
                    style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Town</label>
                  <input
                    type="text"
                    value={formData.town}
                    onChange={(e) => setFormData({...formData, town: e.target.value})}
                    placeholder="Thika"
                    className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all placeholder:text-white/20"
                    style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Physical Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="e.g. Workshop Rd, Makongeni"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white outline-none transition-all placeholder:text-white/20"
                    style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">GPS Override: Lat</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    placeholder="-1.033"
                    className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all placeholder:text-white/20"
                    style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">GPS Override: Lng</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    placeholder="37.066"
                    className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all placeholder:text-white/20"
                    style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                  />
                </div>
              </div>

              <div className="pt-4 mt-6" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={formData.approved}
                      onChange={(e) => setFormData({...formData, approved: e.target.checked})}
                    />
                    <div className={`w-10 h-6 bg-gray-700 rounded-full transition-colors ${formData.approved ? 'bg-[#D4AF37]' : ''}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform bg-white ${formData.approved ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">Auto-Verify</span>
                    <span className="text-xs text-[#E0E0E0]/50 block">Mark as physically verified upon creation</span>
                  </div>
                </label>
              </div>

            </div>
          </div>

          <div className="pt-8 mt-8 flex gap-4" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}>
            <Link 
              href="/merchants"
              className="px-6 py-3 rounded-xl font-bold transition-all text-white border border-white/10 hover:bg-white/5"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #c4a030)',
                color: '#0D1F16',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Registering Merchant...
                </>
              ) : (
                <>
                  <MessageSquarePlus size={18} />
                  Push to Live Network
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
