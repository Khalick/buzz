"use client";

import { Users, TrendingUp, ShieldAlert, Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-outfit font-black text-bizhub-gold tracking-tight">System Analytics</h1>
          <p className="text-bizhub-text/70 mt-1">Real-time pulse of the BizHub marketplace.</p>
        </div>
        <button className="bg-bizhub-gold text-bizhub-dark px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-all font-outfit shadow-[0_0_15px_rgba(212,175,55,0.4)]">
          Generate Report
        </button>
      </div>

      {/* Primary Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-bizhub-gold/50 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-bizhub-gold/10 rounded-full blur-xl group-hover:bg-bizhub-gold/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-bizhub-gold/20 text-bizhub-gold flex items-center justify-center">
              <Users size={20} />
            </div>
            <h3 className="font-outfit font-semibold text-bizhub-white">Total Merchants</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-white font-outfit">2,419</p>
            <span className="text-sm font-bold text-green-400 flex items-center gap-1">
              <TrendingUp size={14} /> +12%
            </span>
          </div>
          <p className="text-xs text-bizhub-text/50 mt-2 uppercase tracking-wider font-semibold">Active Profiles</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-[#10b981]/50 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#10b981]/10 rounded-full blur-xl group-hover:bg-[#10b981]/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 text-[#10b981] flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h3 className="font-outfit font-semibold text-bizhub-white">Market Liquidity</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-white font-outfit">342</p>
            <span className="text-sm font-bold text-[#10b981]">Smart Leads Today</span>
          </div>
          <div className="w-full bg-[#0D1F16] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#10b981] h-full w-[85%] rounded-full"></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-bizhub-gold/50 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-bizhub-gold/20 text-bizhub-gold flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-outfit font-semibold text-bizhub-white">Verification Queue</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-bizhub-gold font-outfit">48</p>
          </div>
          <p className="text-xs text-bizhub-text/50 mt-2 uppercase tracking-wider font-semibold text-red-300">Requires Action</p>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-bizhub-primary to-[#0D1F16]">
          <h3 className="font-outfit font-bold text-bizhub-gold mb-2 text-xl">Trust Flywheel</h3>
          <p className="text-sm text-bizhub-text/80 mb-6">Overall system trust score based on user verification density.</p>
          <div className="flex items-end justify-between">
            <p className="text-5xl font-black text-white font-outfit">94<span className="text-2xl text-bizhub-text/50">/100</span></p>
          </div>
        </div>

      </div>

      {/* Secondary Dashboard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 h-96 flex flex-col items-center justify-center border border-dashed border-bizhub-gold/30">
          <p className="text-bizhub-text/50 font-bold tracking-widest uppercase">Recharts Line Graph Payload Goes Here</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 h-96 flex flex-col items-center justify-center border border-dashed border-bizhub-gold/30">
          <p className="text-bizhub-text/50 font-bold tracking-widest uppercase">Recent Verifications Feed Goes Here</p>
        </div>
      </div>
    </div>
  );
}
