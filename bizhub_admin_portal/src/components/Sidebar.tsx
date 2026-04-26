"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, ShieldCheck, CreditCard, Search, MapPin, LogOut, Megaphone, Star, ShieldAlert, FileText, Tag, LifeBuoy, Building, DownloadCloud } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/queue', label: 'Verification Queue', icon: ShieldCheck },
  { href: '/merchants', label: 'All Merchants', icon: Users },
  { href: '/payments', label: 'M-Pesa Ledger', icon: CreditCard },
  { href: '/ads', label: 'Featured Ads', icon: Star },
  { href: '/moderation', label: 'Moderation Feed', icon: ShieldCheck },
  { href: '/broadcasts', label: 'SMS/Push Broadcasts', icon: Megaphone },
  { href: '/search-metrics', label: 'AI Search Tuning', icon: Search },
  { href: '/agents', label: 'Agent Tracking', icon: MapPin },
  { href: '/audit', label: 'Audit Logs', icon: ShieldAlert },
  { href: '/invoices', label: 'B2B Invoicing', icon: FileText },
  { href: '/promotions', label: 'Promo Codes', icon: Tag },
  { href: '/enterprise', label: 'Franchise Groups', icon: Building },
  { href: '/reports', label: 'Data Exports', icon: DownloadCloud },
  { href: '/support', label: 'Support CRM', icon: LifeBuoy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="w-64 flex flex-col hidden md:flex sticky top-0 h-screen" style={{
      background: 'rgba(27, 67, 50, 0.4)',
      backdropFilter: 'blur(12px)',
      borderRight: '1px solid rgba(212, 175, 55, 0.15)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.15)' }}>
        <h1 className="text-2xl font-black text-[#F0FDF4] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Biz<span className="text-[#D4AF37]">Hub</span>
        </h1>
        <p className="text-xs text-[#D4AF37]/70 mt-1 uppercase tracking-widest font-bold">Admin Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold'
                  : 'text-[#E0E0E0]/70 hover:bg-[#2D6A4F] hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info + Sign Out */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}>
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0D1F16] flex items-center justify-center font-bold text-sm">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.email || 'Admin'}</p>
            <p className="text-xs text-[#E0E0E0]/50">Master Access</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all w-full text-sm font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
