"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, MapPin, Phone, Loader2, ShieldCheck } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  whatsapp: string;
  address?: string;
  approved: boolean;
  created_at: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export default function VerificationQueuePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUnapproved();
  }, []);

  async function fetchUnapproved() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ approved: true })
        .eq('id', id);

      if (error) throw error;
      setBusinesses(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBusinesses(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Verification Queue
          </h1>
          <p className="text-[#E0E0E0]/70 mt-1">
            {businesses.length} business{businesses.length !== 1 ? 'es' : ''} awaiting physical verification approval.
          </p>
        </div>
        <button
          onClick={fetchUnapproved}
          className="px-4 py-2 rounded-lg text-sm font-bold text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
          style={{ border: '1px solid rgba(212, 175, 55, 0.3)' }}
        >
          Refresh Queue
        </button>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <ShieldCheck size={48} className="text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>All Clear</h3>
          <p className="text-[#E0E0E0]/60">No businesses are waiting for verification. Great work!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {businesses.map((biz) => (
            <div key={biz.id} className="rounded-2xl p-6 flex flex-col justify-between" style={{
              background: 'rgba(27, 67, 50, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 175, 55, 0.15)',
            }}>
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>{biz.name}</h3>
                    <span className="inline-block text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md mt-1 bg-[#2D6A4F]/50 text-[#D4AF37]">
                      {biz.category}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#E0E0E0]/70 mb-4 line-clamp-3">{biz.description}</p>

                {biz.whatsapp && (
                  <div className="flex items-center gap-2 text-sm text-[#E0E0E0]/60 mb-2">
                    <Phone size={14} />
                    {biz.whatsapp}
                  </div>
                )}

                {biz.address && (
                  <div className="flex items-center gap-2 text-sm text-[#E0E0E0]/60 mb-2">
                    <MapPin size={14} />
                    {biz.address}
                  </div>
                )}

                {biz.coordinates && (
                  <a
                    href={`https://www.google.com/maps?q=${biz.coordinates.latitude},${biz.coordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    📍 View on Google Maps
                  </a>
                )}

                <p className="text-xs text-[#E0E0E0]/40 mt-3">
                  Submitted: {new Date(biz.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
                <button
                  onClick={() => handleReject(biz.id)}
                  disabled={actionLoading === biz.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/30 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(biz.id)}
                  disabled={actionLoading === biz.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-all border border-green-500/30 disabled:opacity-50"
                >
                  {actionLoading === biz.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
