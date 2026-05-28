import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createErrorResponse } from '@/lib/validation';
import crypto from 'crypto';

// GET /api/credit-health — fetch the latest score for the user's business
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = request.nextUrl.searchParams.get('business_id');
    if (!businessId) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: biz, error: bizErr } = await supabaseAdmin
      .from('businesses')
      .select('owner_id, submitted_by')
      .eq('id', businessId)
      .single();

    if (bizErr || !biz) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    if (biz.owner_id !== user.id && biz.submitted_by !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Fetch existing score
    const { data: score } = await supabaseAdmin
      .from('credit_health_scores')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle();

    return NextResponse.json({ score: score || null });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch credit health');
  }
}

// POST /api/credit-health — save/update a computed score
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { business_id, score, tier, mode, pillars, snapshot, self_declared } = body;

    if (!business_id || score === undefined || !tier || !mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership
    const { data: biz, error: bizErr } = await supabaseAdmin
      .from('businesses')
      .select('owner_id, submitted_by')
      .eq('id', business_id)
      .single();

    if (bizErr || !biz) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    if (biz.owner_id !== user.id && biz.submitted_by !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const upsertData: Record<string, any> = {
      business_id,
      score: Math.max(0, Math.min(900, Math.round(score))),
      tier,
      mode,
      pillar_volume: pillars?.volume || 0,
      pillar_consistency: pillars?.consistency || 0,
      pillar_maturity: pillars?.maturity || 0,
      pillar_diversity: pillars?.diversity || 0,
      total_revenue_30d: snapshot?.totalRevenue30d || 0,
      total_transactions_30d: snapshot?.totalTransactions30d || 0,
      active_days: snapshot?.activeDays || 0,
      unique_products_sold: snapshot?.uniqueProductsSold || 0,
      avg_daily_revenue: snapshot?.avgDailyRevenue || 0,
      computed_at: now,
      updated_at: now,
    };

    // Include self-declared data if present
    if (self_declared) {
      upsertData.self_declared_weekly_revenue = self_declared.weeklyRevenue || 0;
      upsertData.self_declared_avg_transaction = self_declared.avgTransactionSize || 0;
      upsertData.self_declared_years_in_business = self_declared.yearsInBusiness || 0;
    }

    const { data: existing } = await supabaseAdmin
      .from('credit_health_scores')
      .select('id, share_token')
      .eq('business_id', business_id)
      .maybeSingle();

    let result;
    if (existing) {
      // Preserve existing share_token
      const { data, error } = await supabaseAdmin
        .from('credit_health_scores')
        .update(upsertData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      upsertData.created_at = now;
      const { data, error } = await supabaseAdmin
        .from('credit_health_scores')
        .insert(upsertData)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ score: result });
  } catch (error) {
    return createErrorResponse(error, 'Failed to save credit health');
  }
}

// PATCH /api/credit-health — toggle sharing, generate share token
export async function PATCH(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { business_id, sharing_enabled } = body;

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: biz } = await supabaseAdmin
      .from('businesses')
      .select('owner_id, submitted_by')
      .eq('id', business_id)
      .single();

    if (!biz || (biz.owner_id !== user.id && biz.submitted_by !== user.id)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updateData: Record<string, any> = {
      sharing_enabled: !!sharing_enabled,
      updated_at: new Date().toISOString(),
    };

    // Generate share token if enabling sharing
    if (sharing_enabled) {
      const { data: existing } = await supabaseAdmin
        .from('credit_health_scores')
        .select('share_token')
        .eq('business_id', business_id)
        .maybeSingle();

      if (!existing?.share_token) {
        updateData.share_token = crypto.randomBytes(16).toString('hex');
      }
    }

    const { data, error } = await supabaseAdmin
      .from('credit_health_scores')
      .update(updateData)
      .eq('business_id', business_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ score: data });
  } catch (error) {
    return createErrorResponse(error, 'Failed to update sharing');
  }
}
