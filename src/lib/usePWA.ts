'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export interface PWAStatus {
  /** Whether the service worker is registered and active */
  isReady: boolean;
  /** Whether a new version is waiting to activate */
  hasUpdate: boolean;
  /** Whether the app is running in standalone mode (installed) */
  isInstalled: boolean;
  /** Whether an install prompt is available */
  canInstall: boolean;
  /** Whether the device is currently online */
  isOnline: boolean;
  /** Trigger the native install prompt */
  promptInstall: () => Promise<boolean>;
  /** Apply pending update (will reload the page) */
  applyUpdate: () => void;
}

/**
 * React hook for PWA lifecycle management.
 * Handles service worker registration, install prompts, and online/offline state.
 */
export function usePWA(): PWAStatus {
  const [isReady, setIsReady] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register Service Worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Check if already installed as standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Set initial online state
    setIsOnline(navigator.onLine);

    // Online/Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture the install prompt
    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // Prevent the mini-infobar
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect when the app is installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for messages from the service worker (e.g., sync triggers)
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_POS_ORDERS') {
        // Import dynamically to avoid circular dependency
        import('@/lib/posOfflineSync').then(({ syncOrdersUp }) => {
          syncOrdersUp();
        });
      }
    };
    navigator.serviceWorker.addEventListener('message', handleSWMessage);

    // Register the service worker
    navigator.serviceWorker
      .register('/sw.js?v=5', { scope: '/' })
      .then((reg) => {
        setRegistration(reg);
        setIsReady(true);
        console.log('[PWA] Service worker registered, scope:', reg.scope);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              setHasUpdate(true);
              console.log('[PWA] New version available');
            }
          });
        });

        // Periodic update check (every 60 minutes)
        setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000);
      })
      .catch((err) => {
        console.error('[PWA] Service worker registration failed:', err);
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      navigator.serviceWorker.removeEventListener('message', handleSWMessage);
    };
  }, []);

  // Trigger native install prompt
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === 'accepted') {
        setIsInstalled(true);
        return true;
      }
    } catch (err) {
      console.error('[PWA] Install prompt failed:', err);
    }
    return false;
  }, [deferredPrompt]);

  // Apply pending update
  const applyUpdate = useCallback(() => {
    if (!registration?.waiting) return;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }, [registration]);

  return {
    isReady,
    hasUpdate,
    isInstalled,
    canInstall: !!deferredPrompt,
    isOnline,
    promptInstall,
    applyUpdate,
  };
}
