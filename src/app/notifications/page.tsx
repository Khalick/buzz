"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, CheckCheck, Inbox } from 'lucide-react';

const typeIcons: Record<string, string> = {
  review: '⭐',
  approval: '✅',
  message: '💬',
  alert: '🔔',
  deal: '🏷️',
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllRead } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-gradient-hero py-16 px-4">
          <div className="max-w-3xl mx-auto animate-pulse">
            <div className="h-8 bg-white/20 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 -mt-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse shadow-lg mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero */}
      <div className="bg-gradient-hero py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-3xl mx-auto flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full mb-4 backdrop-blur-sm border border-white/20">
              <Bell className="h-4 w-4" />
              Notifications
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white heading-display mb-2">
              Your Notifications
            </h1>
            <p className="text-white/70">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="mt-8 bg-white/10 text-white font-semibold py-2 px-4 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 text-sm border border-white/20"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 -mt-6">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1B4332]/10 flex items-center justify-center">
              <Inbox className="h-8 w-8 text-[#1B4332]/40" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Notifications</h3>
            <p className="text-[#525252]">You&apos;ll see notifications here when something important happens.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => { if (!n.read) markAsRead(n.id); }}
                className={`w-full text-left bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all ${
                  !n.read ? 'ring-2 ring-[#1B4332]/10 bg-[#1B4332]/[0.02]' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">
                    {typeIcons[n.type || ''] || '🔔'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm ${!n.read ? 'font-bold text-[#1A1A1A]' : 'font-medium text-[#525252]'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 bg-[#1B4332] rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    {n.message && (
                      <p className="text-sm text-[#737373] leading-relaxed">{n.message}</p>
                    )}
                    <p className="text-xs text-[#A3A3A3] mt-1.5">
                      {new Date(n.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
