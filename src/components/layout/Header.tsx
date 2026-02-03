"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const Header = () => {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/directory', label: 'Directory' },
    { href: '/deals', label: 'Deals' },
    { href: '/events', label: 'Events' },
    { href: '/proof-of-visit', label: 'Proof of Visit' },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Admin' },
    { href: '/admin/users', label: 'Users' },
    { href: '/analytics', label: 'Analytics' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-[#1B4332]/10'
          : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center shadow-lg group-hover:shadow-[#1B4332]/30 transition-all duration-300">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#1B4332] tracking-tight">
                ThikaBiz<span className="text-[#D4AF37]">Hub</span>
              </span>
              <span className="text-[10px] text-[#525252] -mt-1 hidden sm:block">Your Local Business Directory</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[#525252] hover:text-[#1B4332] hover:bg-[#1B4332]/5 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            {user && isAdmin && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-[#1B4332]/10">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#1B4332]/20 border-t-[#1B4332] rounded-full animate-spin"></div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/favorites"
                  className="p-2 text-[#525252] hover:text-[#1B4332] hover:bg-[#1B4332]/5 rounded-lg transition-all duration-200"
                  title="Favorites"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1B4332]/5 hover:bg-[#1B4332]/10 rounded-full transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#1B4332] max-w-24 truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-[#525252] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[#1B4332] hover:bg-[#1B4332]/5 rounded-lg transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] hover:from-[#2D6A4F] hover:to-[#40916C] rounded-full shadow-lg shadow-[#1B4332]/20 hover:shadow-[#1B4332]/30 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5 hover:bg-[#1B4332]/5 rounded-lg transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className={`w-5 h-0.5 bg-[#1B4332] rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-[#1B4332] rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 scale-0' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-[#1B4332] rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="py-4 border-t border-[#1B4332]/10">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-base font-medium text-[#525252] hover:text-[#1B4332] hover:bg-[#1B4332]/5 rounded-lg transition-all duration-200"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              {user && isAdmin && (
                <>
                  <div className="h-px bg-[#1B4332]/10 my-2"></div>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-4 py-3 text-base font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all duration-200"
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#1B4332]/10">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-[#1B4332]/20 border-t-[#1B4332] rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#1B4332]/5 rounded-lg transition-all duration-200"
                    onClick={closeMobileMenu}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center">
                      <span className="font-semibold text-white">
                        {user.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#1B4332]">{user.user_metadata?.full_name || 'Your Profile'}</p>
                      <p className="text-sm text-[#737373]">{user.email}</p>
                    </div>
                  </Link>
                  <Link
                    href="/favorites"
                    className="px-4 py-3 text-base font-medium text-[#525252] hover:text-[#1B4332] hover:bg-[#1B4332]/5 rounded-lg transition-all duration-200"
                    onClick={closeMobileMenu}
                  >
                    ❤️ Favorites
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mx-4 py-3 text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Link
                    href="/login"
                    className="py-3 text-center text-base font-medium text-[#1B4332] border-2 border-[#1B4332] hover:bg-[#1B4332] hover:text-white rounded-xl transition-all duration-200"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className="py-3 text-center text-base font-semibold text-white bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-xl shadow-lg transition-all duration-200"
                    onClick={closeMobileMenu}
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
