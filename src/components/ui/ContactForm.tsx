"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Send, User, Mail, MessageCircle } from 'lucide-react';

interface ContactFormProps {
  businessId: string;
  businessName: string;
  ownerId?: string | null;
}

export default function ContactForm({ businessId, businessName, ownerId }: ContactFormProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;

    setSending(true);
    try {
      // If there's a business owner, send them a notification
      if (ownerId) {
        await supabase.from('notifications').insert({
          user_id: ownerId,
          title: `New inquiry for ${businessName}`,
          message: `From: ${form.name}${form.email ? ` (${form.email})` : ''}\n\n${form.message}`,
          type: 'message',
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending inquiry:', error);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
          <Send className="h-5 w-5 text-green-600" />
        </div>
        <p className="font-semibold text-green-800 text-sm">Message Sent!</p>
        <p className="text-xs text-green-700 mt-1">The business owner will be notified.</p>
        <button
          onClick={() => setSent(false)}
          className="mt-3 text-xs text-green-700 font-medium hover:text-green-900 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      <h3 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-[#1B4332]" />
        Send Inquiry
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your name"
            required
            className="w-full px-3 py-2.5 border-2 border-[#1B4332]/10 rounded-xl text-sm focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all"
          />
        </div>
        <div>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Email (optional)"
            className="w-full px-3 py-2.5 border-2 border-[#1B4332]/10 rounded-xl text-sm focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all"
          />
        </div>
        <div>
          <textarea
            value={form.message}
            onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Your message..."
            rows={3}
            required
            className="w-full px-3 py-2.5 border-2 border-[#1B4332]/10 rounded-xl text-sm focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none transition-all resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-[#1B4332] text-white font-semibold py-2.5 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {sending ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</>
          ) : (
            <><Send className="h-4 w-4" /> Send Message</>
          )}
        </button>
      </form>
    </div>
  );
}
