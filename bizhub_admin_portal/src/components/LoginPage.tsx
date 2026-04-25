"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0D1F16 0%, #11281c 50%, #1B4332 100%)' }}>
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2D6A4F]/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 mb-6">
            <ShieldCheck size={32} className="text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Biz<span className="text-[#D4AF37]">Hub</span> Admin
          </h1>
          <p className="text-[#E0E0E0]/50 mt-2 text-sm font-medium uppercase tracking-widest">Master Control Portal</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl p-8" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        }}>
          <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Welcome Back</h2>
          <p className="text-sm text-[#E0E0E0]/60 mb-6">Enter your admin credentials to access the portal.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#E0E0E0]/70 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bizhub.co.ke"
                required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-[#E0E0E0]/30 outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all"
                style={{
                  background: 'rgba(13, 31, 22, 0.6)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E0E0E0]/70 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-[#E0E0E0]/30 outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all pr-12"
                  style={{
                    background: 'rgba(13, 31, 22, 0.6)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E0E0E0]/40 hover:text-[#D4AF37] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-[#0D1F16] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #c4a030)',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Access Portal'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[#E0E0E0]/30 text-xs mt-8">
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
