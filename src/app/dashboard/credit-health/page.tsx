'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useBusinessOwner } from '@/hooks/useBusinessOwner';
import {
  computePOSScore,
  computeSelfDeclaredScore,
  getTierLabel,
  getTierColor,
  type CreditScoreResult,
  type SelfDeclaredInput,
  type POSOrder,
  type POSProduct,
} from '@/lib/creditScoring';
import ScoreRing from '@/components/credit/ScoreRing';
import CreditPassport from '@/components/credit/CreditPassport';
import {
  ArrowLeft,
  RefreshCw,
  Share2,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Calendar,
  Package,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Zap,
} from 'lucide-react';

export default function CreditHealthPage() {
  const { businesses, loading: bizLoading, user } = useBusinessOwner();
  const router = useRouter();

  const [selectedBizId, setSelectedBizId] = useState<string>('');
  const [scoreResult, setScoreResult] = useState<CreditScoreResult | null>(null);
  const [savedScore, setSavedScore] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Self-declared form
  const [usePOS, setUsePOS] = useState(true);
  const [selfDeclared, setSelfDeclared] = useState<SelfDeclaredInput>({
    weeklyRevenue: 0,
    avgTransactionSize: 0,
    yearsInBusiness: 0,
  });

  // Select first business by default
  useEffect(() => {
    if (businesses.length > 0 && !selectedBizId) {
      setSelectedBizId(businesses[0].id);
    }
  }, [businesses, selectedBizId]);

  // Fetch existing saved score
  const fetchSavedScore = useCallback(async () => {
    if (!selectedBizId) return;
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) return;

      const res = await fetch(`/api/credit-health?business_id=${selectedBizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedScore(data.score);
        if (data.score?.share_token && data.score?.sharing_enabled) {
          setShareUrl(`${window.location.origin}/api/credit-health/${data.score.share_token}`);
        }
        // Determine mode from saved score
        if (data.score?.mode === 'self_declared') {
          setUsePOS(false);
          setSelfDeclared({
            weeklyRevenue: data.score.self_declared_weekly_revenue || 0,
            avgTransactionSize: data.score.self_declared_avg_transaction || 0,
            yearsInBusiness: data.score.self_declared_years_in_business || 0,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching saved score:', err);
    }
  }, [selectedBizId]);

  useEffect(() => {
    fetchSavedScore();
  }, [fetchSavedScore]);

  // Compute POS score
  const computeScore = async () => {
    if (!selectedBizId) return;
    setLoading(true);

    try {
      if (usePOS) {
        // Fetch orders from Supabase
        const { data: orders, error: ordersErr } = await supabase
          .from('pos_orders')
          .select('id, total_amount, subtotal, payment_method, created_at')
          .eq('business_id', selectedBizId)
          .order('created_at', { ascending: true });

        if (ordersErr) throw ordersErr;

        // Fetch order items for product diversity
        let allItems: any[] = [];
        if (orders && orders.length > 0) {
          const orderIds = orders.map(o => o.id);
          const { data: items } = await supabase
            .from('pos_order_items')
            .select('pos_product_id, quantity, unit_price, total_price, pos_order_id')
            .in('pos_order_id', orderIds);
          allItems = items || [];
        }

        // Map items to orders
        const ordersWithItems: POSOrder[] = (orders || []).map(o => ({
          ...o,
          items: allItems.filter(i => i.pos_order_id === o.id),
        }));

        // Fetch products
        const { data: products } = await supabase
          .from('pos_products')
          .select('id, name, price, is_active')
          .eq('business_id', selectedBizId);

        const result = computePOSScore(ordersWithItems, (products as POSProduct[]) || []);
        setScoreResult(result);

        // If no POS data, switch to self-declared mode
        if (ordersWithItems.length === 0) {
          setUsePOS(false);
        }
      } else {
        const result = computeSelfDeclaredScore(selfDeclared);
        setScoreResult(result);
      }
    } catch (err) {
      console.error('Error computing score:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-compute on business selection
  useEffect(() => {
    if (selectedBizId) {
      computeScore();
    }
  }, [selectedBizId, usePOS]);

  // Save score to DB
  const saveScore = async () => {
    if (!scoreResult || !selectedBizId) return;
    setSaving(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) return;

      const body: any = {
        business_id: selectedBizId,
        score: scoreResult.score,
        tier: scoreResult.tier,
        mode: scoreResult.mode,
        pillars: scoreResult.pillars,
        snapshot: scoreResult.snapshot,
      };

      if (!usePOS) {
        body.self_declared = selfDeclared;
      }

      const res = await fetch('/api/credit-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedScore(data.score);
      }
    } catch (err) {
      console.error('Error saving score:', err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle sharing
  const toggleSharing = async () => {
    if (!selectedBizId) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) return;

      const enabling = !savedScore?.sharing_enabled;

      const res = await fetch('/api/credit-health', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: selectedBizId,
          sharing_enabled: enabling,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedScore(data.score);
        if (enabling && data.score?.share_token) {
          setShareUrl(`${window.location.origin}/api/credit-health/${data.score.share_token}`);
        } else {
          setShareUrl('');
        }
      }
    } catch (err) {
      console.error('Error toggling sharing:', err);
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (bizLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-gradient-hero py-12 px-4" />
        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-12 animate-pulse">
            <div className="h-48 bg-[#1B4332]/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (businesses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-gradient-hero py-12 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-30" />
          <div className="relative max-w-4xl mx-auto">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white heading-display">Credit Health</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BarChart3 className="h-12 w-12 text-[#1B4332]/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Businesses Found</h3>
            <p className="text-[#525252] mb-6">Register a business first to start building your credit score.</p>
            <Link href="/directory/add" className="inline-flex items-center gap-2 bg-[#1B4332] text-white font-semibold py-3 px-6 rounded-xl">
              Add Your Business
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedBiz = businesses.find(b => b.id === selectedBizId);
  const pillars = scoreResult?.pillars;
  const pillarItems = pillars ? [
    { key: 'Volume & Scale', value: pillars.volume, weight: '30%', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'Consistency', value: pillars.consistency, weight: '30%', icon: <Calendar className="h-4 w-4" /> },
    { key: 'Maturity', value: pillars.maturity, weight: '20%', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'Diversity', value: pillars.diversity, weight: '20%', icon: <Package className="h-4 w-4" /> },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Hero */}
      <div className="bg-gradient-hero py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="relative max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white heading-display">Credit Health</h1>
            <span className="bg-[#D4AF37] text-[#1B4332] text-xs font-bold px-2.5 py-1 rounded shadow-sm">BETA</span>
          </div>
          <p className="text-white/70 max-w-xl">
            Your Financial Health Score helps you access inventory financing and credit from partners.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-6 space-y-6">

        {/* Business Selector */}
        {businesses.length > 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Select Business</label>
            <select
              value={selectedBizId}
              onChange={(e) => setSelectedBizId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332]/30 outline-none bg-white font-medium"
            >
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Scoring Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setUsePOS(true); setScoreResult(null); }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                usePOS
                  ? 'border-[#D4AF37] bg-[#1B4332]/5'
                  : 'border-[#E5E5E5] hover:border-[#D4AF37]/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className={`h-5 w-5 ${usePOS ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                <span className="font-bold text-sm text-[#1A1A1A]">POS Verified</span>
              </div>
              <p className="text-xs text-[#737373]">Auto-calculated from your sales. Score up to 900.</p>
            </button>
            <button
              onClick={() => { setUsePOS(false); setScoreResult(null); }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                !usePOS
                  ? 'border-[#D4AF37] bg-[#1B4332]/5'
                  : 'border-[#E5E5E5] hover:border-[#D4AF37]/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className={`h-5 w-5 ${!usePOS ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                <span className="font-bold text-sm text-[#1A1A1A]">Self-Declared</span>
              </div>
              <p className="text-xs text-[#737373]">Enter your figures manually. Score capped at 650.</p>
            </button>
          </div>
        </div>

        {/* Self-Declared Form */}
        {!usePOS && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5 animate-fade-in">
            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#1B4332]" />
              Self-Declared Business Data
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                Self-declared scores are capped at <strong>650/900</strong>. Activate the free BizHub POS to unlock the full 900-point scale with verified transaction data.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Weekly Revenue (KES)</label>
                <input
                  type="number"
                  value={selfDeclared.weeklyRevenue || ''}
                  onChange={(e) => setSelfDeclared(p => ({ ...p, weeklyRevenue: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 outline-none"
                  placeholder="e.g. 15000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Avg. Transaction (KES)</label>
                <input
                  type="number"
                  value={selfDeclared.avgTransactionSize || ''}
                  onChange={(e) => setSelfDeclared(p => ({ ...p, avgTransactionSize: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 outline-none"
                  placeholder="e.g. 500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Years in Business</label>
                <input
                  type="number"
                  step="0.5"
                  value={selfDeclared.yearsInBusiness || ''}
                  onChange={(e) => setSelfDeclared(p => ({ ...p, yearsInBusiness: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border-2 border-[#1B4332]/10 rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 outline-none"
                  placeholder="e.g. 2"
                />
              </div>
            </div>
            <button
              onClick={computeScore}
              disabled={loading}
              className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Calculate Score
            </button>
          </div>
        )}

        {/* Score Display */}
        {scoreResult && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Score Ring */}
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center text-center">
              <ScoreRing
                score={scoreResult.score}
                maxScore={scoreResult.mode === 'self_declared' ? 650 : 900}
                tier={scoreResult.tier}
              />
              <div className="mt-4">
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full"
                  style={{
                    backgroundColor: getTierColor(scoreResult.tier) + '15',
                    color: getTierColor(scoreResult.tier),
                  }}
                >
                  {scoreResult.mode === 'pos_verified' && <Zap className="h-3.5 w-3.5" />}
                  {getTierLabel(scoreResult.tier)}
                </span>
              </div>
              <p className="text-xs text-[#737373] mt-3 max-w-[200px]">
                {scoreResult.mode === 'pos_verified'
                  ? 'Computed from your POS transaction history'
                  : 'Based on self-declared data (capped at 650)'}
              </p>

              {/* Save & Refresh */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={computeScore}
                  disabled={loading}
                  className="px-4 py-2 bg-white border-2 border-[#1B4332]/20 text-[#1B4332] text-sm font-semibold rounded-xl hover:bg-[#1B4332]/5 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={saveScore}
                  disabled={saving}
                  className="px-4 py-2 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-[#2D6A4F] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Right: Pillar breakdown + Passport */}
            <div className="lg:col-span-2 space-y-6">

              {/* Pillar Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#1B4332]" />
                  Score Breakdown
                </h3>
                <div className="space-y-4">
                  {pillarItems.map((p) => (
                    <div key={p.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                          {p.icon}
                          {p.key}
                        </span>
                        <span className="text-xs text-[#737373] font-medium">{p.value}/100 · {p.weight}</span>
                      </div>
                      <div className="w-full bg-[#E5E5E5] rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all duration-700"
                          style={{
                            width: `${p.value}%`,
                            background: p.value >= 70
                              ? 'linear-gradient(90deg, #1B4332, #2D6A4F)'
                              : p.value >= 40
                                ? 'linear-gradient(90deg, #D97706, #F59E0B)'
                                : 'linear-gradient(90deg, #9CA3AF, #D1D5DB)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credit Passport Preview */}
              {selectedBiz && (
                <div>
                  <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#1B4332]" />
                    Your Credit Passport
                  </h3>
                  <CreditPassport
                    businessName={selectedBiz.name}
                    category={selectedBiz.category}
                    score={scoreResult.score}
                    tier={scoreResult.tier}
                    mode={scoreResult.mode}
                    totalRevenue30d={scoreResult.snapshot.totalRevenue30d}
                    totalTransactions30d={scoreResult.snapshot.totalTransactions30d}
                    activeDays={scoreResult.snapshot.activeDays}
                    avgDailyRevenue={scoreResult.snapshot.avgDailyRevenue}
                    computedAt={new Date().toISOString()}
                  />
                </div>
              )}

              {/* Sharing Panel */}
              {savedScore && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-[#1B4332]" />
                    Share with Partners
                  </h3>
                  <p className="text-sm text-[#525252] mb-4">
                    Enable sharing to generate a public link that micro-finance partners or suppliers can use to verify your credit health.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleSharing}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        savedScore.sharing_enabled ? 'bg-[#2D6A4F]' : 'bg-[#D4D4D4]'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                          savedScore.sharing_enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-[#1A1A1A]">
                      {savedScore.sharing_enabled ? 'Sharing Enabled' : 'Sharing Disabled'}
                    </span>
                  </div>

                  {savedScore.sharing_enabled && shareUrl && (
                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="flex-1 px-3 py-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-sm text-[#525252] truncate"
                      />
                      <button
                        onClick={copyShareUrl}
                        className="px-3 py-2 bg-[#1B4332] text-white text-sm font-semibold rounded-lg hover:bg-[#2D6A4F] flex items-center gap-1.5"
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state while computing */}
        {!scoreResult && !loading && usePOS && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BarChart3 className="h-12 w-12 text-[#1B4332]/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Computing Your Score...</h3>
            <p className="text-[#525252]">We&apos;re analyzing your POS transaction history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
