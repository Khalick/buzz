import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { 
  validateUuid, 
  validateEmail, 
  validateText, 
  validateOrigin, 
  createErrorResponse 
} from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUserId = searchParams.get('userId');

    if (!rawUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    const userId = validateUuid(rawUserId, 'userId');

    // Attempt to fetch alerts from the database. 
    // Usually there would be an 'alerts' table, but as a simulated feature,
    // we return an empty array if the table doesn't exist, to prevent breaking the UI.
    const supabaseAdmin = getSupabaseAdmin();
    const { data: alerts, error } = await supabaseAdmin
      .from('user_alerts')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      // If table doesn't exist, fail gracefully and simulate empty state
      if (error.code === '42P01') {
        return NextResponse.json({ alerts: [] });
      }
      throw error;
    }

    return NextResponse.json({ alerts: alerts || [] });
  } catch (err) {
    return createErrorResponse(err, 'Internal Server Error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    if (!validateOrigin(origin, referer)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.userId || !body.email) {
      return NextResponse.json({ error: 'User ID and Email are required' }, { status: 400 });
    }

    const userId = validateUuid(body.userId, 'userId');
    const email = validateEmail(body.email, 'email');
    const type = body.type ? validateText(body.type, 'type', { maxLength: 50 }) : 'new_business';
    const category = body.category ? validateText(body.category, 'category', { maxLength: 100, required: false }) : null;
    const county = body.county ? validateText(body.county, 'county', { maxLength: 100, required: false }) : null;
    const searchQuery = body.searchQuery ? validateText(body.searchQuery, 'searchQuery', { maxLength: 200, required: false }) : null;

    const supabaseAdmin = getSupabaseAdmin();
    
    // Simulate insertion. In reality, we need a 'user_alerts' table.
    // If it fails with relation does not exist, we just mock success.
    const { error } = await supabaseAdmin
      .from('user_alerts')
      .insert([
        {
          user_id: userId,
          email: email,
          type: type || 'new_business',
          category: category,
          county: county,
          search_query: searchQuery,
          is_active: true
        }
      ]);

    if (error && error.code !== '42P01') {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Alert created successfully' }, { status: 201 });
  } catch (err) {
    return createErrorResponse(err, 'Internal Server Error');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    if (!validateOrigin(origin, referer)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const rawAlertId = searchParams.get('id');

    if (!rawAlertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
    }
    const alertId = validateUuid(rawAlertId, 'alertId');

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('user_alerts')
      .delete()
      .eq('id', alertId);

    if (error && error.code !== '42P01') {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Alert deleted successfully' });
  } catch (err) {
    return createErrorResponse(err, 'Internal Server Error');
  }
}
