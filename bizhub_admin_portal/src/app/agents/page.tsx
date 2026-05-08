"use client";

import { useState, useEffect } from 'react';
import { MapPin, Users, Target, Activity, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Agent {
  id: string;
  name: string;
  zone: string;
  verifications: number;
  active: boolean;
  lastSeen: string;
  last_seen_at?: string;
}

export default function AgentTrackerPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const { data, error } = await supabase
          .from('field_agents')
          .select('*')
          .order('verifications', { ascending: false });
        if (error) throw error;
        setAgents(data || []);
      } catch (err) {
        console.error('Failed to fetch field agents:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Field Verification Agents
        </h1>
        <p className="text-[#E0E0E0]/70 mt-1">Track physical agent locations, verification quotas, and performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Users size={16} className="text-[#D4AF37]" />
            <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider">Active Field Agents</p>
          </div>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {agents.filter(a => a.active).length}
          </p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Target size={16} className="text-[#D4AF37]" />
            <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider">Total Verifications</p>
          </div>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {agents.reduce((sum, a) => sum + (a.verifications || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Activity size={16} className="text-[#D4AF37]" />
            <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider">Agent Commission Pool</p>
          </div>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            KES {(agents.reduce((sum, a) => sum + (a.verifications || 0), 0) * 50).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px]" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <MapPin size={48} className="text-[#D4AF37] mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Live Tracking Map Setup</h3>
          <p className="text-[#E0E0E0]/60 max-w-sm text-center text-sm">Please provide your Google Maps API key in the Vercel environment variables to enable the geospatial realtime tracker.</p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{
          background: 'rgba(27, 67, 50, 0.4)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}>
          <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Top Performers</h3>
          </div>
          <div className="divide-y divide-white/5 min-h-[150px]">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#D4AF37]" size={24} /></div>
            ) : agents.length === 0 ? (
              <div className="text-center p-8 text-[#E0E0E0]/50 text-sm">No agents found.</div>
            ) : agents.map(agent => (
               <div key={agent.id} className="p-4 hover:bg-white/5 transition-colors">
                 <div className="flex justify-between items-start mb-1">
                   <h4 className="font-bold text-sm text-white">{agent.name}</h4>
                   <span className={`w-2 h-2 rounded-full mt-1.5 ${agent.active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                 </div>
                 <div className="text-xs text-[#E0E0E0]/60">{agent.zone} • {agent.verifications} Shops</div>
                 <div className="text-[10px] text-[#E0E0E0]/40 mt-2 text-right">Seen: {agent.last_seen_at ? new Date(agent.last_seen_at).toLocaleString() : agent.lastSeen || 'Unknown'}</div>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
