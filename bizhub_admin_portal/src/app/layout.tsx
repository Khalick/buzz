import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { LayoutDashboard, Users, MapPin, Search, CreditCard, ShieldCheck } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'BizHub Admin | Master Control Portal',
  description: 'The central administration portal for BizHub Network.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-bizhub-dark text-bizhub-text flex min-h-screen`}>
        
        {/* Main Sidebar Layout */}
        <aside className="w-64 glass-panel border-r border-[#D4AF37]/20 flex flex-col hidden md:flex sticky top-0 h-screen">
          <div className="p-6 border-b border-[#D4AF37]/20">
            <h1 className="font-outfit font-black text-2xl text-bizhub-white tracking-tight">
              Biz<span className="text-bizhub-gold">Hub</span>
            </h1>
            <p className="text-xs text-bizhub-gold/70 mt-1 uppercase tracking-widest font-bold">Admin Portal</p>
          </div>

          <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-bizhub-gold/10 text-bizhub-gold border border-bizhub-gold/30 font-semibold transition-all">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link href="/queue" className="flex items-center gap-3 px-4 py-3 rounded-lg text-bizhub-text/70 hover:bg-bizhub-secondary hover:text-white transition-all font-medium">
              <ShieldCheck size={18} />
              Verification Queue
            </Link>
            <Link href="/merchants" className="flex items-center gap-3 px-4 py-3 rounded-lg text-bizhub-text/70 hover:bg-bizhub-secondary hover:text-white transition-all font-medium">
              <Users size={18} />
              All Merchants
            </Link>
            <Link href="/payments" className="flex items-center gap-3 px-4 py-3 rounded-lg text-bizhub-text/70 hover:bg-bizhub-secondary hover:text-white transition-all font-medium">
              <CreditCard size={18} />
              M-Pesa Ledger
            </Link>
            <Link href="/search-metrics" className="flex items-center gap-3 px-4 py-3 rounded-lg text-bizhub-text/70 hover:bg-bizhub-secondary hover:text-white transition-all font-medium">
              <Search size={18} />
              AI Search Tuning
            </Link>
            <Link href="/agents" className="flex items-center gap-3 px-4 py-3 rounded-lg text-bizhub-text/70 hover:bg-bizhub-secondary hover:text-white transition-all font-medium">
              <MapPin size={18} />
              Agent Tracking
            </Link>
          </nav>

          <div className="p-4 border-t border-[#D4AF37]/20">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-bizhub-gold text-bizhub-dark flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <p className="text-sm font-bold text-white">Admin Team</p>
                <p className="text-xs text-bizhub-text/50">Master Access</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden flex flex-col">
          <header className="h-16 glass-panel border-b border-[#D4AF37]/20 flex items-center px-8 justify-between sticky top-0 z-10">
            <h2 className="font-outfit font-bold text-lg text-white">System Overview</h2>
            <div className="flex items-center gap-4">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-400">Live Backend Connected</span>
            </div>
          </header>
          <div className="p-8 pb-20">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}
