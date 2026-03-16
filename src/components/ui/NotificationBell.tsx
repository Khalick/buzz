"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useNotifications, AppNotification } from '@/hooks/useNotifications';

const typeIcons: Record<string, string> = {
  review: '⭐',
  approval: '✅',
  message: '💬',
  alert: '🔔',
  deal: '🏷️',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#525252] hover:text-[#1B4332] hover:bg-[#1B4332]/5 rounded-lg transition-all duration-200"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#E5E5E5] flex items-center justify-between">
            <h3 className="font-bold text-[#1A1A1A] text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-[#1B4332] font-semibold hover:text-[#2D6A4F] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-[#D4D4D4] mx-auto mb-2" />
                <p className="text-sm text-[#737373]">No notifications yet</p>
              </div>
            ) : (
              recentNotifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => { markAsRead(n.id); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-[#FAFAF8] transition-colors border-b border-[#E5E5E5]/50 last:border-0 ${
                    !n.read ? 'bg-[#1B4332]/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {typeIcons[n.type || ''] || '🔔'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-[#1A1A1A]' : 'text-[#525252]'} truncate`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-[#737373] mt-0.5 line-clamp-2">{n.message}</p>
                      )}
                      <p className="text-xs text-[#A3A3A3] mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-[#1B4332] rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-center text-sm font-semibold text-[#1B4332] hover:bg-[#1B4332]/5 border-t border-[#E5E5E5] transition-colors"
            >
              View All Notifications
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
