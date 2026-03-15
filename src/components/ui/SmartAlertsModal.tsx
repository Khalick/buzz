'use client';

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

interface SmartAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSearch?: string;
  currentCategory?: string;
  currentCounty?: string;
}

export default function SmartAlertsModal({
  isOpen,
  onClose,
  currentSearch,
  currentCategory,
  currentCounty
}: SmartAlertsModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserId(session.user.id);
          setEmail(session.user.email || '');
        }
      } catch (err) {
        console.error('Failed to get session:', err);
      } finally {
        setLoading(false);
      }
    }
    
    if (isOpen) {
      checkUser();
      setSuccess(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Create a temporary unverified user ID if not logged in
      const finalUserId = userId || `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: finalUserId,
          email,
          type: 'new_business',
          category: currentCategory !== 'All Categories' ? currentCategory : undefined,
          county: currentCounty !== 'All Counties' ? currentCounty : undefined,
          searchQuery: currentSearch || undefined
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create alert');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error creating alert:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A3A3A3] hover:text-[#1A1A1A] transition-colors rounded-full hover:bg-[#F5F5F5]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 md:p-8">
          <div className="w-12 h-12 bg-[#1B4332]/10 rounded-2xl flex items-center justify-center mb-6">
            <Bell className="h-6 w-6 text-[#1B4332]" />
          </div>

          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Smart Alerts
          </h2>
          <p className="text-[#525252] mb-6">
            Get notified when new businesses match your current search criteria. Never miss a great place again!
          </p>

          <div className="bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl p-4 mb-6 space-y-2 text-sm">
            <p className="font-semibold text-[#1B4332] flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
              Alert Criteria
            </p>
            {currentSearch && (
              <div className="flex justify-between">
                <span className="text-[#737373]">Keyword:</span>
                <span className="font-medium text-[#1A1A1A] max-w-[200px] truncate">"{currentSearch}"</span>
              </div>
            )}
            {currentCategory && currentCategory !== 'All Categories' && (
              <div className="flex justify-between">
                <span className="text-[#737373]">Category:</span>
                <span className="font-medium text-[#1A1A1A] truncate">{currentCategory}</span>
              </div>
            )}
            {currentCounty && currentCounty !== 'All Counties' && (
              <div className="flex justify-between">
                <span className="text-[#737373]">County:</span>
                <span className="font-medium text-[#1A1A1A] truncate">{currentCounty}</span>
              </div>
            )}
            {!currentSearch && (!currentCategory || currentCategory === 'All Categories') && (!currentCounty || currentCounty === 'All Counties') && (
              <div className="text-[#737373] italic">
                Any new business added to ThikaBizHub
              </div>
            )}
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col items-center justify-center text-center py-8">
              <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
              <h3 className="font-bold text-green-800 mb-1">Alert Created!</h3>
              <p className="text-sm text-green-600">We'll email you when matches are found.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              
              {!userId && !loading && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] focus:ring-2 focus:ring-[#1B4332] outline-none text-[#1A1A1A]"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] h-5 w-5" />
                  </div>
                </div>
              )}

              {userId && (
                <p className="text-sm text-[#525252] bg-[#F5F5F5] p-3 rounded-xl flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#A3A3A3]" />
                  Alerts will be sent to <strong>{email}</strong>
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full bg-[#1B4332] text-white py-3.5 rounded-xl font-bold hover:bg-[#2D6A4F] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? 'Creating Alert...' : 'Create Alert'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
