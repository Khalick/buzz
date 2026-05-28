/**
 * BizHub Credit Scoring Engine
 * 
 * Computes a Financial Health Score (0–900) from POS transaction data.
 * Supports two modes:
 *   - POS-Verified: Full 0–900 range, computed from real order history
 *   - Self-Declared:  Capped at 0–650, computed from manual inputs
 */

// ── Types ──────────────────────────────────────────────────────────

export interface POSOrder {
  id?: string;
  total_amount: number;
  subtotal?: number;
  payment_method?: string;
  created_at: string;
  items?: { pos_product_id: string; quantity: number; unit_price: number; total_price: number }[];
}

export interface POSProduct {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
}

export interface SelfDeclaredInput {
  weeklyRevenue: number;       // KES per week
  avgTransactionSize: number;  // KES average per sale
  yearsInBusiness: number;     // e.g. 2.5
}

export interface PillarBreakdown {
  volume: number;       // 0–100
  consistency: number;  // 0–100
  maturity: number;     // 0–100
  diversity: number;    // 0–100
}

export type ScoreTier = 'excellent' | 'good' | 'building' | 'starting';
export type ScoreMode = 'pos_verified' | 'self_declared';

export interface CreditScoreResult {
  score: number;          // 0–900 (or 0–650 for self-declared)
  tier: ScoreTier;
  mode: ScoreMode;
  pillars: PillarBreakdown;
  snapshot: {
    totalRevenue30d: number;
    totalTransactions30d: number;
    activeDays: number;
    uniqueProductsSold: number;
    avgDailyRevenue: number;
  };
}

// ── Tier Thresholds ────────────────────────────────────────────────

export function getTier(score: number): ScoreTier {
  if (score >= 750) return 'excellent';
  if (score >= 600) return 'good';
  if (score >= 400) return 'building';
  return 'starting';
}

export function getTierLabel(tier: ScoreTier): string {
  switch (tier) {
    case 'excellent': return 'Excellent';
    case 'good': return 'Good';
    case 'building': return 'Building';
    case 'starting': return 'Starting';
  }
}

export function getTierColor(tier: ScoreTier): string {
  switch (tier) {
    case 'excellent': return '#D4AF37';  // Gold
    case 'good': return '#2D6A4F';       // Green
    case 'building': return '#D97706';   // Amber
    case 'starting': return '#9CA3AF';   // Grey
  }
}

// ── Utility: group orders by calendar day ──────────────────────────

function groupByDay(orders: POSOrder[]): Map<string, POSOrder[]> {
  const map = new Map<string, POSOrder[]>();
  for (const order of orders) {
    const day = order.created_at.slice(0, 10); // YYYY-MM-DD
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(order);
  }
  return map;
}

// ── POS-Verified Scoring (0–900) ──────────────────────────────────

export function computePOSScore(orders: POSOrder[], products: POSProduct[]): CreditScoreResult {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filter to last 30 days
  const recentOrders = orders.filter(o => new Date(o.created_at) >= thirtyDaysAgo);

  // ── Snapshot metrics ─────────────────────────────────────────
  const totalRevenue30d = recentOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalTransactions30d = recentOrders.length;

  const dailyGroups = groupByDay(recentOrders);
  const activeDays = dailyGroups.size;

  // Unique products sold
  const soldProductIds = new Set<string>();
  for (const order of recentOrders) {
    if (order.items) {
      for (const item of order.items) {
        soldProductIds.add(item.pos_product_id);
      }
    }
  }
  const uniqueProductsSold = soldProductIds.size;
  const avgDailyRevenue = activeDays > 0 ? totalRevenue30d / activeDays : 0;

  // ── Pillar 1: Volume & Scale (30% weight) ────────────────────
  // Full points at KES 70,000+/month (~KES 10,000/week)
  const volumeRaw = Math.min(totalRevenue30d / 70000, 1);
  const volume = Math.round(volumeRaw * 100);

  // ── Pillar 2: Consistency (30% weight) ───────────────────────
  // Full points at 20+ active days out of 30
  const consistencyRaw = Math.min(activeDays / 20, 1);
  const consistency = Math.round(consistencyRaw * 100);

  // ── Pillar 3: Maturity (20% weight) ──────────────────────────
  // Based on total history length (not just 30 days)
  // Full points at 90+ days of POS usage
  let maturity = 0;
  if (orders.length > 0) {
    const oldestOrder = orders.reduce((oldest, o) =>
      new Date(o.created_at) < new Date(oldest.created_at) ? o : oldest
    );
    const historyDays = Math.floor(
      (now.getTime() - new Date(oldestOrder.created_at).getTime()) / (24 * 60 * 60 * 1000)
    );
    maturity = Math.round(Math.min(historyDays / 90, 1) * 100);
  }

  // ── Pillar 4: Diversity (20% weight) ─────────────────────────
  // Ratio of unique products sold vs total active products
  const activeProducts = products.filter(p => p.is_active).length;
  let diversity = 0;
  if (activeProducts > 0) {
    diversity = Math.round(Math.min(uniqueProductsSold / Math.max(activeProducts, 1), 1) * 100);
  } else if (uniqueProductsSold > 0) {
    // They have sales but we can't see products — give partial credit
    diversity = Math.min(uniqueProductsSold * 20, 100);
  }

  // ── Weighted score ───────────────────────────────────────────
  const weightedScore =
    (volume * 0.30) +
    (consistency * 0.30) +
    (maturity * 0.20) +
    (diversity * 0.20);

  // Scale 0-100 → 0-900
  const score = Math.round(weightedScore * 9);
  const tier = getTier(score);

  return {
    score,
    tier,
    mode: 'pos_verified',
    pillars: { volume, consistency, maturity, diversity },
    snapshot: {
      totalRevenue30d,
      totalTransactions30d,
      activeDays,
      uniqueProductsSold,
      avgDailyRevenue,
    },
  };
}

// ── Self-Declared Scoring (0–650 cap) ─────────────────────────────

export function computeSelfDeclaredScore(input: SelfDeclaredInput): CreditScoreResult {
  const { weeklyRevenue, avgTransactionSize, yearsInBusiness } = input;

  // ── Pillar 1: Volume (30%) — based on weekly revenue
  // Full points at KES 20,000/week
  const volume = Math.round(Math.min(weeklyRevenue / 20000, 1) * 100);

  // ── Pillar 2: Consistency (30%) — based on transaction size reasonableness
  // Reasonable range: KES 100–2000 avg transaction
  let consistency = 0;
  if (avgTransactionSize > 0) {
    if (avgTransactionSize >= 100 && avgTransactionSize <= 5000) {
      consistency = 80; // Reasonable range
    } else if (avgTransactionSize > 5000) {
      consistency = 60; // High-value but less frequent
    } else {
      consistency = 40; // Very small transactions
    }
  }

  // ── Pillar 3: Maturity (20%) — years in business
  // Full points at 3+ years
  const maturity = Math.round(Math.min(yearsInBusiness / 3, 1) * 100);

  // ── Pillar 4: Diversity (20%) — not measurable in self-declared mode
  // Give a flat 50 (neutral) since we can't verify product mix
  const diversity = 50;

  const weightedScore =
    (volume * 0.30) +
    (consistency * 0.30) +
    (maturity * 0.20) +
    (diversity * 0.20);

  // Scale 0-100 → 0-650 (CAPPED)
  const score = Math.round(Math.min(weightedScore * 6.5, 650));
  const tier = getTier(score);

  // Approximate monthly figures from weekly
  const monthlyRevenue = weeklyRevenue * 4;

  return {
    score,
    tier,
    mode: 'self_declared',
    pillars: { volume, consistency, maturity, diversity },
    snapshot: {
      totalRevenue30d: monthlyRevenue,
      totalTransactions30d: avgTransactionSize > 0 ? Math.round(monthlyRevenue / avgTransactionSize) : 0,
      activeDays: Math.min(Math.round(yearsInBusiness * 365), 90),
      uniqueProductsSold: 0,
      avgDailyRevenue: monthlyRevenue / 30,
    },
  };
}
