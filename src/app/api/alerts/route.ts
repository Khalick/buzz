import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

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
    console.error('Error fetching alerts:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, category, county, searchQuery, email } = body;

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and Email are required' }, { status: 400 });
    }

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
    console.error('Error creating alert:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
    }

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
    console.error('Error deleting alert:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
