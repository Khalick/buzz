"use client";

import { useState, useEffect } from 'react';
import { Building, Plus, Link as LinkIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FranchiseGroup {
  id: string;
  name: string;
  branches: number;
  master_admin: string;
  total_sub: string;
}

export default function EnterprisePage() {
  const [groups, setGroups] = useState<FranchiseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    master_admin: '',
  });

  useEffect(() => {
    async function fetchGroups() {
      try {
        const { data, error } = await supabase
          .from('franchise_groups')
          .select('*')
          .order('name');
        if (error) throw error;
        setGroups(data || []);
      } catch (err) {
        console.error('Failed to fetch franchise groups:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!formData.name || !formData.master_admin) return;
    setActionLoading(true);
    try {
      const newGroup = {
        name: formData.name,
        master_admin: formData.master_admin,
        branches: 0,
        total_sub: 'KES 0'
      };
      const { data, error } = await supabase
        .from('franchise_groups')
        .insert([newGroup])
        .select()
        .single();
      
      if (error) throw error;
      if (data) setGroups(prev => [data, ...prev]);
      
      setIsModalOpen(false);
      setFormData({ name: '', master_admin: '' });
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Franchise Groups</h1>
          <p className="text-[#E0E0E0]/70 mt-1">Group multiple business profiles under a single enterprise billing master account.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
        >
          <Plus size={18} /> Create Group
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center p-12 text-[#E0E0E0]/50 border border-white/10 rounded-2xl">
          No franchise groups found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map(grp => (
             <div key={grp.id} className="rounded-2xl p-6" style={{ background: 'rgba(27, 67, 50, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-[#D4AF37]/10 rounded-xl"><Building size={20} className="text-[#D4AF37]" /></div>
                   <div>
                     <h3 className="font-bold text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>{grp.name}</h3>
                     <p className="text-xs text-[#E0E0E0]/50 font-mono">{grp.id}</p>
                   </div>
                 </div>
               </div>
               
               <div className="space-y-2 mt-4 pt-4 border-t border-white/5 text-sm">
                 <div className="flex justify-between"><span className="text-[#E0E0E0]/60">Master Admin:</span> <span className="text-white font-bold">{grp.master_admin}</span></div>
                 <div className="flex justify-between"><span className="text-[#E0E0E0]/60">Linked Branches:</span> <span className="text-white font-bold">{grp.branches} Active</span></div>
                 <div className="flex justify-between"><span className="text-[#E0E0E0]/60">Enterprise Billing:</span> <span className="text-[#D4AF37] font-bold">{grp.total_sub}</span></div>
               </div>

               <button className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                 <LinkIcon size={16} /> Manage Links
               </button>
             </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-8" style={{ background: '#0D1F16', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>New Enterprise Group</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Group Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Java House Africa" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#E0E0E0]/70">Master Admin ID</label>
                <input type="text" value={formData.master_admin} onChange={(e) => setFormData({...formData, master_admin: e.target.value})} placeholder="e.g. jdoe@javahouse.com" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              <div className="pt-4 mt-4 flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-white border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
                <button 
                  onClick={handleCreateGroup}
                  disabled={actionLoading || !formData.name || !formData.master_admin}
                  className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: '#D4AF37', color: '#0D1F16' }}
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
