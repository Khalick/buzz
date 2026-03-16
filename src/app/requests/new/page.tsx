"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Send, Sparkles, Building2, AlignLeft, DollarSign, CheckCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export default function NewRequestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    category: '',
    description: '',
    budget: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/requests/new');
      return;
    }

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name', { ascending: true });

        if (!error && data) setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from('broadcast_requests').insert({
        user_id: user.id,
        category: form.category,
        description: form.description,
        budget: form.budget || null,
        status: 'open'
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-gradient-subtle py-20" />;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-subtle font-sans">
        <div className="bg-gradient-hero py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-30"></div>
        </div>
        <div className="max-w-xl mx-auto px-4 -mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-[#E5E5E5]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2 heading-display">Request Broadcasted!</h2>
            <p className="text-[#525252] mb-6 leading-relaxed">
              We&apos;ve alerted matching businesses in Thika. Check your notifications for quotes and responses over the next 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/notifications"
                className="bg-[#1B4332] text-white font-semibold flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl hover:bg-[#2D6A4F] transition-colors shadow-lg shadow-[#1B4332]/20"
              >
                Go to Inbox
              </Link>
              <button
                onClick={() => { setSubmitted(false); setForm({ category: '', description: '', budget: '' }); }}
                className="bg-white text-[#1B4332] border-2 border-[#1B4332]/20 font-semibold py-2.5 px-6 rounded-xl hover:bg-[#1B4332]/5 transition-colors"
              >
                New Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle font-sans pb-20">
      {/* Hero */}
      <div className="bg-gradient-hero py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-white/20">
            <Sparkles className="h-4 w-4" />
            Reverse Market
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white heading-display mb-4 tracking-tight">
            Let Businesses Come to You
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium">
            Post what you need, and local professionals will respond with quotes and offers.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-[#1B4332]/5 border border-[#E5E5E5] p-6 text-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Category */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-bold text-[#1A1A1A]">
                <Building2 className="w-4 h-4 text-[#1B4332]" />
                What kind of service? *
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-white border-2 border-[#1B4332]/10 rounded-xl focus:ring-4 focus:ring-[#1B4332]/10 focus:border-[#1B4332]/40 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-bold text-[#1A1A1A]">
                <AlignLeft className="w-4 h-4 text-[#1B4332]" />
                What exactly do you need? *
              </label>
              <p className="text-xs text-[#737373] ml-6 mb-2">Be specific to get the best quotes (e.g., "Need a chocolate cake for 20 people by Friday at 4 PM").</p>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your request..."
                className="w-full px-4 py-3 bg-white border-2 border-[#1B4332]/10 rounded-xl focus:ring-4 focus:ring-[#1B4332]/10 focus:border-[#1B4332]/40 outline-none transition-all resize-none"
              />
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-bold text-[#1A1A1A]">
                <DollarSign className="w-4 h-4 text-[#1B4332]" />
                Estimated Budget <span className="text-[#a3a3a3] font-medium text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[#525252]">KSh</span>
                <input
                  type="text"
                  value={form.budget}
                  onChange={(e) => setForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="e.g., 5,000"
                  className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#1B4332]/10 rounded-xl focus:ring-4 focus:ring-[#1B4332]/10 focus:border-[#1B4332]/40 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5E5] mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white font-bold py-4 px-6 rounded-xl hover:from-[#2D6A4F] hover:to-[#40916C] shadow-lg shadow-[#1B4332]/20 hover:shadow-xl hover:shadow-[#1B4332]/30 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:scale-100 active:scale-[0.98]"
              >
                {submitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Broadcasting...</>
                ) : (
                  <><Send className="w-5 h-5" /> Broadcast Request</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
