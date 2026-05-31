'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/lib/usePWA';
import { Download, X, Smartphone, Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';

/**
 * Floating install prompt + status indicator for the POS terminal.
 * Shows:
 * - Install button when app is not yet installed
 * - Online/offline status pill
 * - Update available banner
 */
export default function InstallPrompt() {
  const { canInstall, isInstalled, isOnline, hasUpdate, promptInstall, applyUpdate } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if the user previously dismissed the prompt
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wasDismissed = sessionStorage.getItem('pwa-install-dismissed');
      if (wasDismissed) setDismissed(true);
    }
  }, []);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <>
      {/* ── Update Available Banner ── */}
      {hasUpdate && (
        <div className="fixed top-0 inset-x-0 z-[60] bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-6 flex items-center justify-between shadow-lg animate-slideDown">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="animate-spin-slow" />
            <span className="font-semibold text-sm">A new version of Lokari is available</span>
          </div>
          <button
            onClick={applyUpdate}
            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors backdrop-blur-sm"
          >
            Update Now
          </button>
        </div>
      )}

      {/* ── Connectivity Status Pill (always visible in POS) ── */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl backdrop-blur-md text-sm font-bold transition-all duration-500 ${
          isOnline
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse'
        }`}>
          {isOnline ? (
            <>
              <Wifi size={16} />
              <span>Online</span>
              {isInstalled && (
                <span className="flex items-center gap-1 ml-2 pl-2 border-l border-current/20 text-xs opacity-70">
                  <Check size={12} /> Installed
                </span>
              )}
            </>
          ) : (
            <>
              <WifiOff size={16} />
              <span>Offline — POS Active</span>
            </>
          )}
        </div>
      </div>

      {/* ── Install Success Toast ── */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div className="flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-2xl">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <Check size={20} />
            </div>
            <div>
              <p className="font-bold">Lokari Installed!</p>
              <p className="text-sm opacity-80">Find it on your home screen</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Install Prompt Card ── */}
      {canInstall && !dismissed && !isInstalled && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div className="w-[340px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Gradient header strip */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">Install Lokari</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Works offline • Fast access</p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Dismiss install prompt"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Install Lokari on your device for instant POS access, offline sales processing, and push notifications.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Not now
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Install
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
