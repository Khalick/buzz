'use client';

import { getTierLabel, getTierColor, type ScoreTier, type ScoreMode } from '@/lib/creditScoring';
import { ShieldCheck, TrendingUp, Calendar, Package, Activity } from 'lucide-react';

interface CreditPassportProps {
  businessName: string;
  category: string;
  score: number;
  tier: ScoreTier;
  mode: ScoreMode;
  totalRevenue30d: number;
  totalTransactions30d: number;
  activeDays: number;
  avgDailyRevenue: number;
  computedAt: string;
  shareUrl?: string;
}

export default function CreditPassport({
  businessName,
  category,
  score,
  tier,
  mode,
  totalRevenue30d,
  totalTransactions30d,
  activeDays,
  avgDailyRevenue,
  computedAt,
  shareUrl,
}: CreditPassportProps) {
  const tierColor = getTierColor(tier);
  const tierLabel = getTierLabel(tier);
  const isPOSVerified = mode === 'pos_verified';
  const computedDate = new Date(computedAt).toLocaleDateString('en-KE', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 shadow-xl"
      style={{ borderColor: tierColor + '40' }}>
      {/* Header strip */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, #0D1F16, #1B4332)` }}>
        <div>
          <h3 className="text-lg font-bold text-white truncate">{businessName}</h3>
          <p className="text-sm text-white/60">{category}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-3xl font-black" style={{ color: tierColor }}>{score}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1"
            style={{ backgroundColor: tierColor + '20', color: tierColor }}>
            {tierLabel}
          </span>
        </div>
      </div>

      {/* Mode badge */}
      <div className="px-6 pt-4 pb-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
          isPOSVerified
            ? 'bg-[#D4AF37]/10 text-[#856404] border border-[#D4AF37]/30'
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          <ShieldCheck className="h-3.5 w-3.5" />
          {isPOSVerified ? 'POS Verified' : 'Self-Declared'}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="px-6 py-4 grid grid-cols-2 gap-3">
        <div className="bg-[#FAFAF8] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-[#737373] font-semibold mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Monthly Revenue
          </div>
          <p className="text-lg font-bold text-[#1A1A1A]">
            KES {totalRevenue30d.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#FAFAF8] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-[#737373] font-semibold mb-1">
            <Activity className="h-3.5 w-3.5" />
            Transactions
          </div>
          <p className="text-lg font-bold text-[#1A1A1A]">
            {totalTransactions30d}
          </p>
        </div>
        <div className="bg-[#FAFAF8] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-[#737373] font-semibold mb-1">
            <Calendar className="h-3.5 w-3.5" />
            Active Days
          </div>
          <p className="text-lg font-bold text-[#1A1A1A]">
            {activeDays}
          </p>
        </div>
        <div className="bg-[#FAFAF8] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-[#737373] font-semibold mb-1">
            <Package className="h-3.5 w-3.5" />
            Daily Avg
          </div>
          <p className="text-lg font-bold text-[#1A1A1A]">
            KES {Math.round(avgDailyRevenue).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#E5E5E5] flex items-center justify-between bg-[#FAFAF8]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">T</span>
          </div>
          <span className="text-[10px] text-[#737373] font-medium">Verified by ThikaBizHub</span>
        </div>
        <span className="text-[10px] text-[#A3A3A3]">{computedDate}</span>
      </div>
    </div>
  );
}
