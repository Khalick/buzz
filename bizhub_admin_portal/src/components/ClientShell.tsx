"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import AuthGate from '@/components/AuthGate';
import Sidebar from '@/components/Sidebar';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>
        <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0D1F16 0%, #11281c 100%)' }}>
          <Sidebar />
          <main className="flex-1 overflow-x-hidden flex flex-col">
            <header className="h-16 flex items-center px-8 justify-between sticky top-0 z-10" style={{
              background: 'rgba(27, 67, 50, 0.4)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            }}>
              <h2 className="font-bold text-lg text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>System Overview</h2>
              <div className="flex items-center gap-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-400">Live Backend</span>
              </div>
            </header>
            <div className="p-8 pb-20 text-[#E0E0E0]">
              {children}
            </div>
          </main>
        </div>
      </AuthGate>
    </AuthProvider>
  );
}
