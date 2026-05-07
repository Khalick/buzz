"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, CheckCircle, XCircle, Loader2, Eye, Clock } from 'lucide-react';

interface Proof {
  id: string;
  name: string;
  business_name: string;
  image_url: string;
  approved: boolean;
  submitted_by: string | null;
  referral_views: number;
  created_at: string;
  submitter_email?: string;
}

export default function ProofReviewPage() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');

  useEffect(() => {
    fetchProofs();
  }, [filter]);

  async function fetchProofs() {
    setLoading(true);
    try {
      let query = supabase
        .from('proofs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('approved', false);
      } else if (filter === 'approved') {
        query = query.eq('approved', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with submitter email
      const enriched = await Promise.all((data || []).map(async (proof: any) => {
        let submitterEmail = 'Unknown';
        if (proof.submitted_by) {
          const { data: u } = await supabase
            .from('users')
            .select('email, display_name')
            .eq('id', proof.submitted_by)
            .single();
          if (u) submitterEmail = u.display_name || u.email?.split('@')[0] || 'Unknown';
        }
        return { ...proof, submitter_email: submitterEmail };
      }));

      setProofs(enriched);
    } catch (err) {
      console.error('Failed to fetch proofs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('proofs')
        .update({ approved: true })
        .eq('id', id);
      if (error) throw error;
      setProofs(prev => prev.map(p => p.id === id ? { ...p, approved: true } : p));
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Failed to approve. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    if (!confirm('Remove this proof submission? This cannot be undone.')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('proofs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setProofs(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Rejection failed:', err);
      alert('Failed to remove. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCount = proofs.filter(p => !p.approved).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Proof of Visit Review
          </h1>
          <p className="text-[#E0E0E0]/70 mt-1">
            Review and approve user-submitted proof of visit photos.
          </p>
        </div>
        {pendingCount > 0 && filter === 'pending' && (
          <span className="px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] font-bold rounded-xl text-sm">
            {pendingCount} Pending
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'all'] as const).map(status => (
          <button
            key={status}
            onClick={() => { setFilter(status); setLoading(true); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === status
                ? 'bg-[#D4AF37] text-[#0D1F16]'
                : 'bg-white/5 text-[#E0E0E0]/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
        </div>
      ) : proofs.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <Camera size={48} className="text-[#D4AF37] opacity-30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No {filter === 'all' ? '' : filter} submissions</h3>
          <p className="text-sm text-[#E0E0E0]/60">
            {filter === 'pending' ? 'All proof submissions have been reviewed!' : `No ${filter} submissions found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {proofs.map(proof => (
            <div key={proof.id} className="rounded-2xl overflow-hidden" style={{
              background: 'rgba(27, 67, 50, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 175, 55, 0.15)',
            }}>
              {/* Image */}
              <div className="relative h-48 bg-black/30">
                <img
                  src={proof.image_url}
                  alt={`Proof for ${proof.business_name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/0D1F16/D4AF37?text=No+Image'; }}
                />
                <div className="absolute top-3 right-3">
                  {proof.approved ? (
                    <span className="bg-green-500/90 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      <CheckCircle size={12} /> Approved
                    </span>
                  ) : (
                    <span className="bg-[#D4AF37]/90 text-[#0D1F16] px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="p-5">
                <h4 className="font-bold text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>{proof.name}</h4>
                <p className="text-sm text-[#E0E0E0]/60 mt-1">Business: <span className="text-white">{proof.business_name}</span></p>
                <p className="text-sm text-[#E0E0E0]/60 mt-1">Submitted by: <span className="text-white">{proof.submitter_email}</span></p>
                
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-1.5 text-xs text-[#E0E0E0]/40">
                    <Eye size={12} /> {proof.referral_views} views
                  </div>
                  <div className="text-xs text-[#E0E0E0]/40">
                    {new Date(proof.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                {!proof.approved && (
                  <div className="flex gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <button
                      onClick={() => handleReject(proof.id)}
                      disabled={actionLoading === proof.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/30 disabled:opacity-50"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(proof.id)}
                      disabled={actionLoading === proof.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-all border border-green-500/30 disabled:opacity-50"
                    >
                      {actionLoading === proof.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
