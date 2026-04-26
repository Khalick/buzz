"use client";

import { useState } from 'react';
import { Megaphone, Users, MessageSquare, Send, Loader2, Search, Smartphone, ListFilter } from 'lucide-react';

export default function BroadcastsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'all',
    channel: 'sms',
  });

  const [history] = useState([
    { id: 'bcast-1', title: 'System Maintenance', target: 'All Active Merchants', channel: 'sms', sentAt: '2025-10-14 08:00 AM', status: 'Delivered', reach: 2400 },
    { id: 'bcast-2', title: 'New Flash Deal Pricing', target: 'Premium Subscribers', channel: 'push', sentAt: '2025-10-10 14:30 PM', status: 'Delivered', reach: 180 },
    { id: 'bcast-3', title: 'Verify Your Location', target: 'Pending Verifications', channel: 'sms', sentAt: '2025-10-05 09:15 AM', status: 'Delivered', reach: 45 },
  ]);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Simulate API call to Twilio or Africa's Talking
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ title: '', message: '', target: 'all', channel: 'sms' });
      setTimeout(() => setSuccess(false), 5000);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Broadcast Engine
        </h1>
        <p className="text-[#E0E0E0]/70 mt-1">Send mass SMS and Push Notifications to specific merchant segments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Composer Form */}
        <div className="lg:col-span-2 rounded-2xl p-8" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <MessageSquare size={20} className="text-[#D4AF37]" /> Compose Broadcast
          </h2>

          {success && (
            <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-green-500/10 border border-green-500/30">
              <Megaphone className="text-green-400" size={20} />
              <p className="text-sm font-bold text-green-400">Broadcast successfully dispatched to queue!</p>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Target Audience</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]/50"><Users size={18} /></div>
                  <select 
                    value={formData.target}
                    onChange={(e) => setFormData({...formData, target: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white outline-none appearance-none cursor-pointer"
                    style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                  >
                    <option value="all">All Verified Merchants</option>
                    <option value="pending">Pending Verifications</option>
                    <option value="premium">Premium Subscribers Only</option>
                    <option value="hardware">Hardware Category Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Delivery Channel</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, channel: 'sms'})}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border ${
                      formData.channel === 'sms' 
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' 
                        : 'border-white/10 text-white hover:bg-white/5'
                    }`}
                  >
                    <Smartphone size={16} /> SMS (M-Pesa Users)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, channel: 'push'})}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border ${
                      formData.channel === 'push' 
                        ? 'border-blue-400 bg-blue-500/10 text-blue-400' 
                        : 'border-white/10 text-white hover:bg-white/5'
                    }`}
                  >
                    <Megaphone size={16} /> App Push
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Internal Campaign Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. October Maintenance Alert"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 rounded-xl text-white outline-none"
                style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
              />
            </div>

            <div>
              <label className="flex items-end justify-between text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">
                <span>Message Payload</span>
                <span className={formData.message.length > 160 && formData.channel === 'sms' ? 'text-red-400' : ''}>
                  {formData.message.length} / 160 chars {formData.channel === 'sms' && '(1 Credit)'}
                </span>
              </label>
              <textarea 
                required
                rows={5}
                placeholder="Type the exact message users will receive..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full p-4 rounded-xl text-white outline-none resize-none placeholder:text-white/20"
                style={{ background: 'rgba(13, 31, 22, 0.6)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
              />
            </div>

            <div className="pt-4" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}>
              <button 
                type="submit"
                disabled={loading || !formData.message}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #c4a030)',
                  color: '#0D1F16',
                  boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)',
                }}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                {loading ? 'Transmitting...' : 'Dispatch Broadcast NOW'}
              </button>
            </div>
          </form>
        </div>

        {/* History Radar */}
        <div className="rounded-2xl p-6" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <h3 className="font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <ListFilter size={18} className="text-[#D4AF37]" /> Transmission Log
          </h3>

          <div className="space-y-4">
            {history.map((log) => (
              <div key={log.id} className="p-4 rounded-xl" style={{ background: 'rgba(13, 31, 22, 0.6)' }}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-white">{log.title}</h4>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                    {log.status}
                  </span>
                </div>
                <div className="text-xs text-[#E0E0E0]/60 mb-3 block">To: {log.target}</div>
                <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-1.5 text-xs text-[#E0E0E0]/40">
                    {log.channel === 'sms' ? <Smartphone size={12} /> : <Megaphone size={12} />}
                    {log.sentAt}
                  </div>
                  <div className="text-xs font-bold text-[#D4AF37]">{log.reach.toLocaleString()} Reached</div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/5 transition-colors">
            View Full Audit Log
          </button>
        </div>

      </div>
    </div>
  );
}
