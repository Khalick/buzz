"use client";

import { useState } from 'react';
import { MapPin, Users, Target, Activity, Loader2 } from 'lucide-react';

export default function AgentTrackerPage() {
  const [agents] = useState([
    { id: '1', name: 'James Makau', zone: 'Makongeni', verifications: 42, active: true, lastSeen: '10 mins ago' },
    { id: '2', name: 'Sarah Wanjiru', zone: 'Section 9', verifications: 28, active: true, lastSeen: '2 mins ago' },
    { id: '3', name: 'Kennedy Ochieng', zone: 'Ngoingwa', verifications: 15, active: false, lastSeen: '3 days ago' },
  ]);

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
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>12</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Target size={16} className="text-[#D4AF37]" />
            <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider">Today's Verifications</p>
          </div>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>85</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div className="flex items-center gap-3 mb-2">
            <Activity size={16} className="text-[#D4AF37]" />
            <p className="text-sm font-bold text-[#E0E0E0]/70 uppercase tracking-wider">Agent Commission Pool</p>
          </div>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>KES 4,250</p>
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
          <div className="divide-y divide-white/5">
            {agents.map(agent => (
               <div key={agent.id} className="p-4 hover:bg-white/5 transition-colors">
                 <div className="flex justify-between items-start mb-1">
                   <h4 className="font-bold text-sm text-white">{agent.name}</h4>
                   <span className={`w-2 h-2 rounded-full mt-1.5 ${agent.active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                 </div>
                 <div className="text-xs text-[#E0E0E0]/60">{agent.zone} • {agent.verifications} Shops</div>
                 <div className="text-[10px] text-[#E0E0E0]/40 mt-2 text-right">Seen: {agent.lastSeen}</div>
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
