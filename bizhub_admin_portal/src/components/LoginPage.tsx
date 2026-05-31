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
      setLoading(false);
    }
    // If no error, AuthContext will set isReady=true and AuthGate will show dashboard
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0D1F16 0%, #11281c 50%, #1B4332 100%)' }}>
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(212,175,55,0.05)' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(45,106,79,0.1)' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <ShieldCheck size={32} color="#D4AF37" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Lok<span style={{ color: '#D4AF37' }}>ari</span> Admin
          </h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.7)' }}>Master Control Portal</p>
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
          <p className="text-sm mb-6" style={{ color: 'rgba(224,224,224,0.6)' }}>Enter your admin credentials to access the portal.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(224,224,224,0.7)' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lokari.co.ke"
                required
                className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all"
                style={{
                  background: 'rgba(13, 31, 22, 0.6)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  color: '#ffffff',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(224,224,224,0.7)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all pr-12"
                  style={{
                    background: 'rgba(13, 31, 22, 0.6)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(224,224,224,0.4)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #c4a030)',
                color: '#0D1F16',
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

        <p className="text-center text-xs mt-8" style={{ color: 'rgba(224,224,224,0.3)' }}>
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
