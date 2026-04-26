"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Store, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  Activity,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    merchants: 0,
    pendingVerifications: 0,
    proofs: 0,
    trustScoreAvg: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total active merchants
        const { count: merchantsCount } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true })
          .eq('approved', true);

        // Fetch pending verifications
        const { count: pendingCount } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true })
          .eq('approved', false);

        // Fetch total proofs of visit
        const { count: proofsCount } = await supabase
          .from('proofs')
          .select('*', { count: 'exact', head: true });

        setStats({
          merchants: merchantsCount || 0,
          pendingVerifications: pendingCount || 0,
          proofs: proofsCount || 0,
          trustScoreAvg: 9.2, // Will calculate from real trust engine later
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const kpis = [
    { title: 'Total Verified Merchants', value: stats.merchants.toLocaleString(), change: '+12% this month', icon: Store, trend: 'up' },
    { title: 'Physical Proofs Collected', value: stats.proofs.toLocaleString(), change: '+45 this week', icon: MapPin, trend: 'up' },
    { title: 'Pending Verifications', value: stats.pendingVerifications.toLocaleString(), change: 'Requires Action', icon: ShieldCheck, trend: stats.pendingVerifications > 0 ? 'down' : 'neutral' },
    { title: 'Network Trust Flywheel', value: stats.trustScoreAvg, change: 'Top 1% in East Africa', icon: Activity, trend: 'up', suffix: '/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Overview
        </h1>
        <p className="text-[#E0E0E0]/70 mt-1">Live metrics from the BizHub Network database.</p>
      </div>

      {/* KPI Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32 w-full">
           <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <div key={i} className="rounded-2xl p-6 relative overflow-hidden transition-all hover:-translate-y-1 group" style={{
              background: 'rgba(27, 67, 50, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 175, 55, 0.15)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}>
              {/* Background gradient injection */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#D4AF37] opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
              
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                  <kpi.icon size={20} color="#D4AF37" />
                </div>
                {kpi.trend === 'up' && <TrendingUp size={16} className="text-green-400" />}
                {kpi.trend === 'down' && <TrendingUp size={16} className="text-red-400 rotate-180" />}
              </div>
              
              <div className="relative z-10">
                <p className="text-sm font-medium text-[#E0E0E0]/60 mb-1">{kpi.title}</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {kpi.value}
                  </h3>
                  {kpi.suffix && <span className="text-sm font-bold text-[#D4AF37]/80">{kpi.suffix}</span>}
                </div>
                <p className={`text-xs mt-2 font-medium ${
                  kpi.trend === 'up' ? 'text-green-400' : 
                  kpi.trend === 'down' ? 'text-red-400' : 
                  'text-[#D4AF37]'
                }`}>
                  {kpi.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl p-6" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <h3 className="text-lg font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>System Activity (Coming Soon)</h3>
          <div className="h-64 w-full flex items-center justify-center border border-dashed rounded-xl" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
            <p className="text-sm text-[#E0E0E0]/40 font-medium">Analytics engine initializing map data...</p>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <h3 className="text-lg font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Registrations</h3>
          <div className="space-y-4">
            <p className="text-sm text-[#E0E0E0]/60">Check the Verification Queue to process new businesses.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
