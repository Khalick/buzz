import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

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
    const { businessId, reason, description } = body;

    if (!businessId || !reason) {
      return NextResponse.json({ error: 'Business ID and reason required' }, { status: 400 });
    }

    const reportData = {
      business_id: businessId,
      reported_by: user.id,
      reporter_email: user.email,
      reason,
      description: description || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from('reports')
      .insert(reportData);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
