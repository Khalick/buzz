import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/credit-health/[token] — public endpoint for partners to view a shared credit passport
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch score by share token
    const { data: score, error } = await supabaseAdmin
      .from('credit_health_scores')
      .select('score, tier, mode, pillar_volume, pillar_consistency, pillar_maturity, pillar_diversity, total_revenue_30d, total_transactions_30d, active_days, avg_daily_revenue, computed_at, sharing_enabled, business_id')
      .eq('share_token', token)
      .eq('sharing_enabled', true)
      .maybeSingle();

    if (error || !score) {
      return NextResponse.json({ error: 'Credit passport not found or sharing is disabled' }, { status: 404 });
    }

    // Fetch business name and category for display
    const { data: biz } = await supabaseAdmin
      .from('businesses')
      .select('name, category, address, is_verified, created_at')
      .eq('id', score.business_id)
      .single();

    return NextResponse.json({
      passport: {
        businessName: biz?.name || 'Unknown Business',
        category: biz?.category || '',
        address: biz?.address || '',
        isVerified: biz?.is_verified || false,
        businessSince: biz?.created_at,
        score: score.score,
        tier: score.tier,
        mode: score.mode,
        pillars: {
          volume: score.pillar_volume,
          consistency: score.pillar_consistency,
          maturity: score.pillar_maturity,
          diversity: score.pillar_diversity,
        },
        totalRevenue30d: score.total_revenue_30d,
        totalTransactions30d: score.total_transactions_30d,
        activeDays: score.active_days,
        avgDailyRevenue: score.avg_daily_revenue,
        computedAt: score.computed_at,
      },
    });
  } catch (error) {
    console.error('Error fetching shared credit passport:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
