"use client";

import { useState } from 'react';
import { signInWithEmail, signInWithGoogle } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await signInWithEmail(email, password);

      if (error) throw error;

      router.push('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();

      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-30"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#40916C]/20 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col justify-center items-center w-full p-12">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <span className="text-[#D4AF37] font-bold text-2xl">T</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  ThikaBiz<span className="text-[#D4AF37]">Hub</span>
                </h1>
                <p className="text-sm text-white/60">Your Local Business Directory</p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-6 max-w-md">
            {[
              { icon: '🏪', text: 'Discover 500+ verified local businesses' },
              { icon: '💰', text: 'Access exclusive deals and discounts' },
              { icon: '📍', text: 'Share and read authentic reviews' },
              { icon: '🎉', text: 'Stay updated with local events' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 text-white/80">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-lg">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="mt-16 flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-[#D4AF37]">⭐</span>
            <span className="text-white/90 text-sm font-medium">Trusted by 1,000+ users in Thika</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#FAFAF8]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-[#1B4332]">
                ThikaBiz<span className="text-[#D4AF37]">Hub</span>
              </span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-[#525252]">
                {isSignUp ? 'Join the ThikaBizHub community' : 'Sign in to your account'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="input"
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  className="input"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                className="w-full btn btn-primary btn-lg"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 h-px bg-[#E5E5E5]"></div>
              <span className="px-4 text-sm text-[#737373]">or continue with</span>
              <div className="flex-1 h-px bg-[#E5E5E5]"></div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full btn btn-lg bg-white border-2 border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F5F5F5] hover:border-[#D4D4D4]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.3l6.8-6.8C35.5 2.1 30.1 0 24 0 14.8 0 6.9 5.2 2.8 12.7l7.9 6.1C12.9 13.2 18 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.3-4H24v8h12.9c-.6 3.5-3.1 6.4-6.6 8.1l7.9 6.1C42.9 38.6 46.5 31.9 46.5 24.5z" />
                <path fill="#FBBC05" d="M10.7 29.8c-.8-2.4-1.3-4.9-1.3-7.8s.5-5.4 1.3-7.8L2.8 7.6C1 11.3 0 15.5 0 20c0 4.6 1 8.7 2.8 12.4l7.9-2.6z" />
                <path fill="#34A853" d="M24 48c6.1 0 11.5-2 15.4-5.4l-7.3-5.6C29.8 37.5 27.1 38.6 24 38.6c-6 0-11.1-3.7-13.5-9.1l-7.9 6.1C6.9 42.8 14.8 48 24 48z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Toggle Sign Up / Sign In */}
            <p className="mt-8 text-center text-sm text-[#525252]">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-semibold text-[#1B4332] hover:text-[#D4AF37] transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-[#737373] hover:text-[#1B4332] transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
