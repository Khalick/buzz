import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';



// Generate invite code
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// GET - Get user's invites
export async function GET(req: NextRequest) {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }
  const token = authorization.split('Bearer ')[1];

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Get all invites sent by this user
    const { data: sentInvites, error: sentError } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('inviter_id', user.id)
      .order('created_at', { ascending: false });

    if (sentError) throw sentError;

    // Get invites received by user (by email)
    const { data: receivedInvites, error: receivedError } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('invitee_email', user.email)
      .order('created_at', { ascending: false });

    if (receivedError) throw receivedError;

    return NextResponse.json({
      sentInvites: sentInvites || [],
      receivedInvites: receivedInvites || [],
      stats: {
        totalSent: sentInvites?.length || 0,
        accepted: sentInvites?.filter((i: any) => i.status === 'accepted').length || 0,
        pending: sentInvites?.filter((i: any) => i.status === 'pending').length || 0,
      },
    });

  } catch (error) {
    console.error('Error getting invites:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Send an invite
export async function POST(req: NextRequest) {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }
  const token = authorization.split('Bearer ')[1];

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { email, type, message, businessName } = await req.json();

    if (!email || !type) {
      return NextResponse.json({ error: 'Email and type are required' }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Get inviter's profile
    const { data: inviterProfile } = await supabaseAdmin
      .from('users')
      .select('display_name, email')
      .eq('id', user.id)
      .single();

    // Check if invite already exists
    const { data: existingInvite } = await supabaseAdmin
      .from('invites')
      .select('id')
      .eq('inviter_id', user.id)
      .eq('invitee_email', email)
      .eq('type', type)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json({ error: 'Invite already sent to this email' }, { status: 400 });
    }

    // Create invite
    const inviteCode = generateInviteCode();
    const inviteData = {
      inviter_id: user.id,
      inviter_email: inviterProfile?.email || user.email,
      inviter_name: inviterProfile?.display_name || user.email,
      invitee_email: email,
      type, // 'business', 'user', 'admin'
      business_name: businessName || null,
      message: message || '',
      code: inviteCode,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    const { data: invite, error: insertError } = await supabaseAdmin
      .from('invites')
      .insert(inviteData)
      .select()
      .single();

    if (insertError) throw insertError;

    // In a real app, you would send an email here
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${inviteCode}`;

    return NextResponse.json({
      message: 'Invite sent successfully',
      inviteId: invite.id,
      inviteLink,
      inviteCode,
    });

  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}