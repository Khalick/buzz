"use client";

import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import { Loader2 } from 'lucide-react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  // Show a brief spinner only while checking (max 5 seconds due to timeout)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0D1F16 0%, #11281c 100%)' }}>
        <div className="text-center">
          <Loader2 size={40} className="text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-[#E0E0E0]/60 text-sm font-medium">Connecting...</p>
        </div>
      </div>
    );
  }

  // No user logged in OR user is not admin → show login
  if (!user || !isAdmin) {
    return <LoginPage />;
  }

  // Authenticated admin → show dashboard
  return <>{children}</>;
}
