"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBusinessOwner } from '@/hooks/useBusinessOwner';
import Link from 'next/link';
import { ArrowLeft, Handshake, Search, CheckCircle, XCircle } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  category: string;
  location?: {
    town: string;
    county: string;
  };
}

interface Partnership {
  id: string;
  business_a_id: string;
  business_b_id: string;
  status: string;
  created_at: string;
  partner?: Business; // dynamically assigned based on who is viewing
  direction?: 'sent' | 'received';
}

export default function PartnershipsDashboard() {
  const { businesses, loading: businessLoading } = useBusinessOwner();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [recommendations, setRecommendations] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (businessLoading) return;
    if (businesses.length === 0) {
      setLoading(false);
      return;
    }

    if (!selectedBusinessId && businesses.length > 0) {
      setSelectedBusinessId(businesses[0].id);
    }

    const fetchPartnerships = async () => {
      try {
        const activeId = selectedBusinessId || businesses[0].id;

        // Fetch partnerships where the active business is either A or B
        const { data: pData, error: pError } = await supabase
          .from('business_partnerships')
          .select('*')
          .or(`business_a_id.eq.${activeId},business_b_id.eq.${activeId}`)
          .order('created_at', { ascending: false });

        if (pError) throw pError;

        // Fetch details for the partners
        const partnerIds = pData?.map(p => p.business_a_id === activeId ? p.business_b_id : p.business_a_id) || [];
        let partnerBusinesses: Business[] = [];
        
        if (partnerIds.length > 0) {
          const { data: pbData } = await supabase
            .from('businesses')
            .select('id, name, category, location')
            .in('id', partnerIds);
          if (pbData) partnerBusinesses = pbData;
        }

        const enrichedPartnerships = (pData || []).map(p => ({
          ...p,
          partner: partnerBusinesses.find(b => b.id === (p.business_a_id === activeId ? p.business_b_id : p.business_a_id)),
          direction: p.business_a_id === activeId ? 'sent' : 'received'
        }));

        setPartnerships(enrichedPartnerships as Partnership[]);

        // Fetch Recommendations (heuristic based)
        // Find businesses in the same town but different categories
        const activeBusiness = businesses.find(b => b.id === activeId);
        
        let town = activeBusiness?.location?.town;
        
        // If the business has a town, we look for partners in that town
        if (town) {
           const { data: rData } = await supabase
             .from('businesses')
             .select('id, name, category, location')
             .neq('category', activeBusiness?.category || '')
             .neq('owner_id', businesses[0].owner_id || '') // skip other own businesses
             .limit(5); // In a real app we'd filter by town via a string search or JSONb path query, simplifying here for demo
             
           // Filter out businesses we already have a partnership request with
           const reco = (rData || []).filter(r => !partnerIds.includes(r.id));
           setRecommendations(reco);
        } else {
           // Fallback if no location data
           const { data: rData } = await supabase
             .from('businesses')
             .select('id, name, category, location')
             .neq('category', activeBusiness?.category || '')
             .neq('owner_id', businesses[0].owner_id || '')
             .limit(5);
           const reco = (rData || []).filter(r => !partnerIds.includes(r.id));
           setRecommendations(reco);
        }

      } catch (error) {
        console.error('Error fetching partnerships:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedBusinessId || businesses.length > 0) {
       fetchPartnerships();
    }
  }, [businessLoading, businesses, selectedBusinessId]);

  const handleRequest = async (partnerId: string) => {
    if (!selectedBusinessId) return;
    setUpdating(partnerId);
    try {
      const { data, error } = await supabase.from('business_partnerships').insert({
        business_a_id: selectedBusinessId,
        business_b_id: partnerId,
        status: 'pending'
      }).select().single();

      if (error) throw error;
      
      // reload UI
      const partner = recommendations.find(r => r.id === partnerId);
      if (partner) {
         setPartnerships([{ ...data, partner, direction: 'sent' }, ...partnerships]);
         setRecommendations(recommendations.filter(r => r.id !== partnerId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateStatus = async (partnershipId: string, newStatus: 'active' | 'declined') => {
    setUpdating(partnershipId);
    try {
      const { error } = await supabase
        .from('business_partnerships')
        .update({ status: newStatus })
        .eq('id', partnershipId);

      if (error) throw error;
      
      setPartnerships(partnerships.map(p => p.id === partnershipId ? { ...p, status: newStatus } : p));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  if (businessLoading || loading) {
    return <div className="min-h-screen bg-gradient-subtle py-20" />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="bg-gradient-hero py-12 px-4 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 pattern-dots opacity-30"></div>
        <div className="relative max-w-5xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white heading-display">Local Partnerships</h1>
                <span className="bg-[#D4AF37] text-[#1B4332] text-xs font-bold px-2 py-1 rounded shadow-sm">B2B NETWORK</span>
              </div>
              <p className="text-white/80 max-w-xl">
                Team up with complementary local businesses to cross-promote services and share customers.
              </p>
            </div>

            {businesses.length > 1 && (
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                <label className="text-xs font-semibold text-white/70 block mb-1">Managing Partnerships For:</label>
                <select
                  value={selectedBusinessId}
                  onChange={e => setSelectedBusinessId(e.target.value)}
                  className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-lg text-sm outline-none focus:border-white/60 appearance-none font-semibold"
                >
                  {businesses.map(b => (
                     <option key={b.id} value={b.id} className="text-[#1A1A1A]">{b.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 -mt-6 relative z-10">
        {businesses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-[#E5E5E5]">
            <Search className="w-12 h-12 mx-auto text-[#1B4332]/40 mb-3" />
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Businesses Found</h3>
            <p className="text-[#525252] mb-6">List your business to start networking with other local owners.</p>
            <Link href="/directory/add" className="bg-[#1B4332] text-white px-6 py-2.5 rounded-xl font-semibold">
              Add a Business
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Recommendations */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-bold text-[#1A1A1A] flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Suggested Partners
              </h3>
              
              {recommendations.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center border shadow-sm">
                  <p className="text-[#525252] text-sm">No new recommendations right now. We'll suggest complementary businesses as they join.</p>
                </div>
              ) : (
                recommendations.map(reco => (
                  <div key={reco.id} className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-5">
                    <span className="text-xs font-bold text-[#1B4332] bg-[#1B4332]/10 px-2 py-0.5 rounded uppercase tracking-wider">{reco.category}</span>
                    <h4 className="font-bold text-[#1A1A1A] text-lg mt-2 mb-1">{reco.name}</h4>
                    <p className="text-[#525252] text-xs mb-4">
                      {reco.location?.town ? `Based in ${reco.location.town}` : 'Local Business'}
                    </p>
                    <button 
                      onClick={() => handleRequest(reco.id)}
                      disabled={updating === reco.id}
                      className="w-full py-2 bg-white border-2 border-[#1B4332]/20 text-[#1B4332] text-sm font-semibold rounded-lg hover:bg-[#1B4332]/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {updating === reco.id ? 'Sending...' : <><Handshake className="w-4 h-4" /> Send Request</>}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Right Column: Active & Pending Network */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-bold text-[#1A1A1A] mb-4">Pending Requests</h3>
                
                {partnerships.filter(p => p.status === 'pending').length === 0 ? (
                  <div className="bg-white rounded-xl p-6 text-center border shadow-sm">
                    <p className="text-[#525252] text-sm">No pending requests.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {partnerships.filter(p => p.status === 'pending').map(p => (
                      <div key={p.id} className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-semibold text-[#525252]">{p.partner?.category}</span>
                             {p.direction === 'sent' ? (
                               <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600 rounded">SENT REQUEST</span>
                             ) : (
                               <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-blue-100 text-blue-700 rounded">NEW REQUEST</span>
                             )}
                           </div>
                           <h4 className="font-bold text-[#1A1A1A]">{p.partner?.name}</h4>
                        </div>
                        
                        {p.direction === 'received' && (
                          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <button 
                              onClick={() => handleUpdateStatus(p.id, 'active')}
                              disabled={updating === p.id}
                              className="flex-1 sm:flex-none px-4 py-1.5 bg-[#1B4332] text-white text-sm font-semibold rounded-lg hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" /> Accept
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(p.id, 'declined')}
                              disabled={updating === p.id}
                              className="flex-1 sm:flex-none px-4 py-1.5 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" /> Decline
                            </button>
                          </div>
                        )}
                        {p.direction === 'sent' && (
                          <span className="text-sm font-medium text-[#737373]">Awaiting reply...</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-[#1A1A1A] mb-4">Active Partners</h3>
                
                {partnerships.filter(p => p.status === 'active').length === 0 ? (
                  <div className="bg-[#1B4332]/5 border border-[#1B4332]/10 rounded-xl p-8 text-center shadow-sm">
                    <Handshake className="w-10 h-10 mx-auto text-[#1B4332]/40 mb-3" />
                    <p className="font-semibold text-[#1A1A1A]">No active partners yet</p>
                    <p className="text-sm text-[#525252]">Accept incoming requests or invite suggested businesses to build your network.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {partnerships.filter(p => p.status === 'active').map(p => (
                      <div key={p.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[#E5E5E5] border-l-4 border-l-[#1B4332] p-4">
                         <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-[#1B4332]/10 text-[#1B4332] rounded uppercase mb-2 inline-block">
                           {p.partner?.category}
                         </span>
                         <h4 className="font-bold text-[#1A1A1A]">{p.partner?.name}</h4>
                         <Link href={`/business/${p.partner?.id}`} className="inline-flex mt-3 text-xs font-bold text-[#1B4332] hover:underline">
                           View Profile →
                         </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Sparkles = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);
