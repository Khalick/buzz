"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Store, Phone, Loader2, Info } from 'lucide-react';

interface MerchantRequest {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  contact_phone: string;
  status: string;
  created_at: string;
}

export default function MerchantRequestsPage() {
  const [requests, setRequests] = useState<MerchantRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  async function fetchPendingRequests() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('merchant_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        // Handle case where table might not exist yet during setup
        if (error.code === '42P01') {
          console.warn('Table merchant_requests does not exist yet. Please run migration.');
        } else {
          throw error;
        }
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(request: MerchantRequest) {
    setActionLoading(request.id);
    try {
      // 1. Update the request status
      const { error: reqError } = await supabase
        .from('merchant_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);
      if (reqError) throw reqError;

      // 2. Upgrade the user's role in public.users to 'merchant'
      const { error: userError } = await supabase
        .from('users')
        .update({ role: 'merchant' })
        .eq('id', request.user_id);
      
      // Optionally handle failure on userError but keep going for now
      if (userError) console.error('Failed to update user role:', userError);

      setRequests(prev => prev.filter(req => req.id !== request.id));
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Approval failed. Check permissions.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('merchant_requests')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (err) {
      console.error('Rejection failed:', err);
      alert('Rejection failed. Check permissions.');
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
            Merchant Upgrade Requests
          </h1>
          <p className="text-[#E0E0E0]/70 mt-1">
            {requests.length} user{requests.length !== 1 ? 's' : ''} requesting to become a merchant.
          </p>
        </div>
        <button
          onClick={fetchPendingRequests}
          className="px-4 py-2 rounded-lg text-sm font-bold text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
          style={{ border: '1px solid rgba(212, 175, 55, 0.3)' }}
        >
          Refresh Queue
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <Store size={48} className="text-[#D4AF37] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>All Caught Up</h3>
          <p className="text-[#E0E0E0]/60">No pending merchant requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="rounded-2xl p-6 flex flex-col justify-between" style={{
              background: 'rgba(27, 67, 50, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 175, 55, 0.15)',
            }}>
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>{req.business_name}</h3>
                    <span className="inline-block text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md mt-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                      {req.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#E0E0E0]/60 mb-2 mt-4">
                  <Phone size={14} />
                  {req.contact_phone}
                </div>

                <div className="flex items-center gap-2 text-sm text-[#E0E0E0]/60 mb-2">
                  <Info size={14} />
                  User ID: <span className="font-mono text-xs truncate" title={req.user_id}>{req.user_id.substring(0,8)}...</span>
                </div>

                <p className="text-xs text-[#E0E0E0]/40 mt-3 pt-3 border-t border-white/10">
                  Requested on: {new Date(req.created_at).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
                <button
                  onClick={() => handleReject(req.id)}
                  disabled={actionLoading === req.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/30 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(req)}
                  disabled={actionLoading === req.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-all border border-green-500/30 disabled:opacity-50"
                >
                  {actionLoading === req.id ? (
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
