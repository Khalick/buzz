"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Store, MapPin, ShieldCheck, TrendingUp, Activity, Loader2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    merchants: 0,
    pendingVerifications: 0,
    proofs: 0,
    trustScoreAvg: 0
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#D4AF37', '#2D6A4F', '#0D1F16', '#40916C', '#1B4332'];

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

        // Calculate dynamic trust score
        const total = (merchantsCount || 0) + (pendingCount || 0);
        const autoScore = total > 0 ? Number(((merchantsCount || 0) / total) * 10).toFixed(1) : '0.0';

        // Fetch recent active logs
        const { data: recentLogs } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentLogs) {
          setLogs(recentLogs);
        }

        // Fetch users for growth chart
        const { data: allUsers } = await supabase.from('users').select('created_at');
        if (allUsers) {
          const dateCounts: Record<string, number> = {};
          // Group by short date string
          allUsers.forEach(u => {
             const date = new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
             dateCounts[date] = (dateCounts[date] || 0) + 1;
          });
          // For demo, creating a sequence of last 7 days if data is too small, or just using what we have
          const chartData = Object.keys(dateCounts).map(k => ({ date: k, users: dateCounts[k] })).slice(-7);
          setUserGrowth(chartData.length > 0 ? chartData : [{ date: 'Today', users: 0 }]);
        }

        // Fetch businesses for category pie chart
        const { data: allBiz } = await supabase.from('businesses').select('category');
        if (allBiz) {
          const catCounts: Record<string, number> = {};
          allBiz.forEach(b => {
             const cat = b.category || 'Other';
             catCounts[cat] = (catCounts[cat] || 0) + 1;
          });
          const pieData = Object.keys(catCounts).map(k => ({ name: k, value: catCounts[k] }))
                            .sort((a,b) => b.value - a.value).slice(0, 5); // top 5
          setCategoryData(pieData);
        }

        setStats({
          merchants: merchantsCount || 0,
          pendingVerifications: pendingCount || 0,
          proofs: proofsCount || 0,
          trustScoreAvg: parseFloat(autoScore as string),
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
    { title: 'Total Verified Merchants', value: stats.merchants.toLocaleString(), change: 'Live DB Link', icon: Store, trend: 'up' },
    { title: 'Physical Proofs Collected', value: stats.proofs.toLocaleString(), change: 'Live DB Link', icon: MapPin, trend: 'up' },
    { title: 'Pending Verifications', value: stats.pendingVerifications.toLocaleString(), change: 'Requires Action', icon: ShieldCheck, trend: stats.pendingVerifications > 0 ? 'down' : 'neutral' },
    { title: 'Network Trust Flywheel', value: stats.trustScoreAvg, change: 'Calculated Algorithm', icon: Activity, trend: 'up', suffix: '/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Overview
        </h1>
        <p className="text-[#E0E0E0]/70 mt-1">Live metrics from the Lokari Network database.</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="rounded-2xl p-6" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <h3 className="text-lg font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>New User Signups</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <XAxis dataKey="date" stroke="#E0E0E080" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#E0E0E080" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip 
                   contentStyle={{ backgroundColor: '#0D1F16', borderColor: '#D4AF3740', color: '#fff', borderRadius: '8px' }}
                   itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="users" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Category Breakdown */}
        <div className="rounded-2xl p-6 flex flex-col" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Business Category Breakdown</h3>
          <div className="flex-1 h-[300px] w-full min-h-0 relative">
            {categoryData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={categoryData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={90}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {categoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip 
                     contentStyle={{ backgroundColor: '#0D1F16', borderColor: '#D4AF3740', color: '#fff', borderRadius: '8px' }}
                   />
                   <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#E0E0E0' }} />
                 </PieChart>
               </ResponsiveContainer>
            ) : (
               <div className="w-full h-full flex items-center justify-center">
                 <p className="text-sm text-[#E0E0E0]/50">No business data available.</p>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
