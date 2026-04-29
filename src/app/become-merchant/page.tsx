"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Store, Send, CheckCircle } from 'lucide-react';

export default function BecomeMerchantPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    category: '',
    contact_phone: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/become-merchant');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('merchant_requests').insert({
        user_id: user.id,
        business_name: form.business_name,
        category: form.category,
        contact_phone: form.contact_phone
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push('/profile'), 3000);
    } catch (err) {
      console.error('Error submitting merchant request:', err);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-[#D4AF37]"></div>
        
        {success ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Request Submitted</h2>
            <p className="text-[#525252]">Your request to become a merchant is under review. You will be redirected shortly.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/20">
                <Store className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Become a Merchant</h1>
              <p className="text-sm text-[#737373] mt-2">Grow your business on ThikaBizHub by upgrading to a merchant account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Business Name</label>
                <input
                  required
                  type="text"
                  value={form.business_name}
                  onChange={(e) => setForm(f => ({ ...f, business_name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all"
                  placeholder="e.g., Thika Tech Store"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Business Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all bg-white"
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Contact Phone</label>
                <input
                  required
                  type="tel"
                  value={form.contact_phone}
                  onChange={(e) => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all"
                  placeholder="07... or 01... "
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1B4332] text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
