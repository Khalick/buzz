import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { 
  validateUuid, 
  validateText, 
  validateOrigin, 
  createErrorResponse 
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    if (!validateOrigin(origin, referer)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.businessId || !body.reason) {
      return NextResponse.json({ error: 'Business ID and reason required' }, { status: 400 });
    }

    const businessId = validateUuid(body.businessId, 'businessId');
    const reason = validateText(body.reason, 'reason', { maxLength: 100 });
    const description = body.description ? validateText(body.description, 'description', { maxLength: 1500, required: false }) : '';

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
    return createErrorResponse(error, 'Failed to submit report');
  }
}
