"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, CheckCircle, XCircle, Eye, Clock, FileText, ExternalLink, Loader2 } from 'lucide-react';

interface VerificationRequest {
  id: string;
  user_id: string;
  business_id: string;
  document_url: string;
  document_type: string;
  notes: string | null;
  status: string;
  rejection_reason: string | null;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
  user_name?: string;
  business_name?: string;
}

export default function VerificationQueuePage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with user names + business names
      const enriched = await Promise.all((data || []).map(async (req: any) => {
        let userName = 'Unknown';
        let businessName = 'Unknown';

        const { data: u } = await supabase
          .from('users')
          .select('display_name, email')
          .eq('id', req.user_id)
          .single();
        if (u) userName = u.display_name || u.email?.split('@')[0] || 'Unknown';

        const { data: b } = await supabase
          .from('businesses')
          .select('name')
          .eq('id', req.business_id)
          .single();
        if (b) businessName = b.name;

        return { ...req, user_name: userName, business_name: businessName };
      }));

      setRequests(enriched);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, businessId: string) => {
    setProcessingId(requestId);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Update request status
      const { error: updateError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Mark business as verified
      const { error: bizError } = await supabase
        .from('businesses')
        .update({ is_verified: true })
        .eq('id', businessId);

      if (bizError) throw bizError;

      setRequests(prev => prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'approved', reviewed_at: new Date().toISOString() }
          : r
      ));
    } catch (err) {
      console.error('Error approving:', err);
      alert('Failed to approve. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setProcessingId(requestId);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectReason.trim(),
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev => prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'rejected', rejection_reason: rejectReason.trim(), reviewed_at: new Date().toISOString() }
          : r
      ));
      setRejectingId(null);
      setRejectReason('');
    } catch (err) {
      console.error('Error rejecting:', err);
      alert('Failed to reject. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const documentTypeLabels: Record<string, string> = {
    business_license: 'Business License',
    kra_pin: 'KRA PIN Certificate',
    national_id: 'National ID',
    other: 'Other Document',
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Verification Queue
          </h1>
          <p className="text-[#E0E0E0]/70 mt-1">
            Review and approve merchant verification requests.
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
        {(['pending', 'approved', 'rejected', 'all'] as const).map(status => (
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
      ) : requests.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <ShieldCheck size={48} className="text-[#D4AF37] opacity-30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No {filter === 'all' ? '' : filter} requests</h3>
          <p className="text-sm text-[#E0E0E0]/60">
            {filter === 'pending' ? 'All verification requests have been processed!' : `No ${filter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="rounded-2xl p-6 transition-all hover:-translate-y-0.5" style={{
              background: 'rgba(27, 67, 50, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 175, 55, 0.15)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                      <ShieldCheck size={20} className="text-[#D4AF37]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{req.business_name}</h4>
                      <p className="text-sm text-[#E0E0E0]/60">by {req.user_name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#E0E0E0]/40 mb-1">Document</p>
                      <p className="text-sm text-white font-medium">{documentTypeLabels[req.document_type] || req.document_type}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#E0E0E0]/40 mb-1">Submitted</p>
                      <p className="text-sm text-white font-medium">
                        {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#E0E0E0]/40 mb-1">Status</p>
                      <p className={`text-sm font-bold ${
                        req.status === 'approved' ? 'text-green-400' :
                        req.status === 'rejected' ? 'text-red-400' :
                        'text-[#D4AF37]'
                      }`}>
                        {req.status.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {req.notes && (
                    <p className="mt-3 text-sm text-[#E0E0E0]/60 bg-white/5 p-3 rounded-lg">{req.notes}</p>
                  )}

                  {req.rejection_reason && (
                    <p className="mt-3 text-sm text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      <strong>Rejection reason:</strong> {req.rejection_reason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 md:items-end flex-shrink-0">
                  <a
                    href={req.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Document
                  </a>

                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(req.id, req.business_id)}
                        disabled={processingId === req.id}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {processingId === req.id ? 'Processing...' : 'Approve & Verify'}
                      </button>

                      {rejectingId === req.id ? (
                        <div className="space-y-2 min-w-[240px]">
                          <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            rows={2}
                            className="w-full px-3 py-2 bg-white/10 border border-red-500/30 rounded-lg text-sm text-white placeholder:text-white/30 outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(req.id)}
                              disabled={processingId === req.id}
                              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectReason(''); }}
                              className="px-3 py-1.5 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRejectingId(req.id)}
                          className="px-4 py-2 bg-red-600/20 text-red-400 text-sm font-bold rounded-xl hover:bg-red-600/30 transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
