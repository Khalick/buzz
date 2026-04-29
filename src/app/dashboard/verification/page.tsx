"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBusinessOwner } from '@/hooks/useBusinessOwner';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Upload, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface VerificationRequest {
  id: string;
  business_id: string;
  document_url: string;
  document_type: string;
  notes: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export default function VerificationPage() {
  const { businesses, loading: businessLoading, user, isMerchant } = useBusinessOwner();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    business_id: '',
    document_type: 'business_license' as string,
    document_url: '',
    notes: '',
  });

  useEffect(() => {
    if (businessLoading) return;
    if (businesses.length > 0 && !form.business_id) {
      setForm(prev => ({ ...prev, business_id: businesses[0].id }));
    }
    fetchRequests();
  }, [businessLoading, businesses]);

  const fetchRequests = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('merchant-documents')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('merchant-documents')
        .getPublicUrl(data.path);

      setForm(prev => ({ ...prev, document_url: publicUrl }));
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.business_id || !form.document_url) return;

    // Prevent duplicate pending requests for the same business
    const existingPending = requests.find(
      r => r.business_id === form.business_id && r.status === 'pending'
    );
    if (existingPending) {
      alert('You already have a pending verification request for this business.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('verification_requests').insert({
        user_id: user.id,
        business_id: form.business_id,
        document_url: form.document_url,
        document_type: form.document_type,
        notes: form.notes || null,
      }).select().single();

      if (error) throw error;

      setRequests([data, ...requests]);
      setShowForm(false);
      setForm(prev => ({ ...prev, document_url: '', notes: '', document_type: 'business_license' }));
    } catch (err) {
      console.error('Error submitting verification request:', err);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Verified ✓' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Rejected' };
      default:
        return { icon: Clock, color: 'text-[#856404]', bg: 'bg-[#D4AF37]/10', border: 'border-[#D4AF37]/20', label: 'Pending Review' };
    }
  };

  const getBusinessName = (businessId: string) => {
    return businesses.find(b => b.id === businessId)?.name || 'Unknown Business';
  };

  const documentTypeLabels: Record<string, string> = {
    business_license: 'Business License',
    kra_pin: 'KRA PIN Certificate',
    national_id: 'National ID',
    other: 'Other Document',
  };

  if (businessLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-gradient-hero py-12 px-4 shadow-lg"></div>
        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl h-64 animate-pulse shadow-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Hero */}
      <div className="bg-gradient-hero py-12 px-4 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white heading-display">Verification Badge</h1>
                <span className="bg-[#D4AF37] text-[#1B4332] text-xs font-bold px-2 py-1 rounded shadow-sm">✓ VERIFIED</span>
              </div>
              <p className="text-white/80 max-w-xl">
                Upload proof of business to get the &quot;Verified Merchant&quot; blue checkmark badge on your listings.
              </p>
            </div>
            {!showForm && businesses.length > 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-white text-[#1B4332] font-bold py-2 px-5 rounded-xl shadow-lg flex items-center gap-2 hover:bg-[#F2F2F2] text-sm"
              >
                <Upload className="w-4 h-4" />
                Submit Proof
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-6 relative z-10">

        {/* Submit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E5E5] p-6 mb-8 animate-fade-in">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#1B4332]" />
              Submit Verification Documents
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Business */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Business to Verify</label>
                <select
                  required
                  value={form.business_id}
                  onChange={e => setForm(prev => ({ ...prev, business_id: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#1B4332]/10 rounded-xl outline-none focus:border-[#1B4332]/40"
                >
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Document Type</label>
                <select
                  required
                  value={form.document_type}
                  onChange={e => setForm(prev => ({ ...prev, document_type: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#1B4332]/10 rounded-xl outline-none focus:border-[#1B4332]/40"
                >
                  <option value="business_license">Business License / Permit</option>
                  <option value="kra_pin">KRA PIN Certificate</option>
                  <option value="national_id">National ID</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Upload Document</label>
                <div className="border-2 border-dashed border-[#1B4332]/20 rounded-xl p-6 text-center hover:border-[#1B4332]/40 transition-colors">
                  {form.document_url ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold text-sm">Document uploaded successfully</span>
                    </div>
                  ) : uploading ? (
                    <div className="flex items-center justify-center gap-2 text-[#856404]">
                      <div className="w-4 h-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></div>
                      <span className="font-semibold text-sm">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <FileText className="h-8 w-8 text-[#1B4332]/30 mx-auto mb-2" />
                      <p className="text-sm text-[#525252] mb-2">Click to upload PDF, JPG, or PNG (max 10MB)</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className={form.document_url ? 'hidden' : 'absolute inset-0 w-full h-full opacity-0 cursor-pointer'}
                    style={form.document_url ? {} : { position: 'relative' }}
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">
                  Additional Notes <span className="font-normal text-xs text-gray-400">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional context about your business..."
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#1B4332]/10 rounded-xl outline-none focus:border-[#1B4332]/40 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#E5E5E5] mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-[#525252] font-semibold rounded-xl hover:bg-[#F2F2F2]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.document_url}
                  className="px-6 py-2.5 bg-[#1B4332] text-white font-bold rounded-xl hover:bg-[#2D6A4F] shadow-lg shadow-[#1B4332]/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Requests */}
        {requests.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-[#E5E5E5]">
            <div className="w-16 h-16 mx-auto bg-[#1B4332]/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-[#1B4332]/40" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Verification Requests</h3>
            <p className="text-[#525252] mb-6 max-w-md mx-auto">
              Get a verified badge on your business listing by uploading proof of your business registration, license, or KRA PIN.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#1B4332] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2D6A4F] transition-colors inline-flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Get Verified
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const statusConfig = getStatusConfig(req.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div key={req.id} className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] text-lg">{getBusinessName(req.business_id)}</h4>
                      <p className="text-sm text-[#737373]">{documentTypeLabels[req.document_type] || req.document_type}</p>
                      <p className="text-xs text-[#A3A3A3] mt-1">
                        Submitted {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusConfig.label}
                    </span>
                  </div>

                  {req.notes && (
                    <p className="text-sm text-[#525252] bg-[#FAFAF8] p-3 rounded-xl mb-3">{req.notes}</p>
                  )}

                  {req.status === 'rejected' && req.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-600">{req.rejection_reason}</p>
                      </div>
                    </div>
                  )}

                  {req.status === 'rejected' && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-4 text-sm font-semibold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="h-4 w-4" /> Re-submit with updated documents
                    </button>
                  )}

                  {req.document_url && (
                    <a
                      href={req.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#1B4332] hover:text-[#2D6A4F] transition-colors"
                    >
                      <FileText className="h-4 w-4" /> View Uploaded Document
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
