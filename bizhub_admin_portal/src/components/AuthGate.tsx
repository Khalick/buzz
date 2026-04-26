"use client";

import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isReady } = useAuth();

  // Not authenticated → show login page immediately (no spinner)
  if (!isReady) {
    return <LoginPage />;
  }

  // Authenticated admin → show dashboard
  return <>{children}</>;
}
