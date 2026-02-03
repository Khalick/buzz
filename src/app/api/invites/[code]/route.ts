import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET - Get invite details by code
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { code } = await params;

    // Find invite by code
    const { data: invite, error } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) throw error;

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Check if invite is expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    // Check if already accepted
    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite already processed' }, { status: 400 });
    }

    return NextResponse.json({
      invite: {
        id: invite.id,
        inviterEmail: invite.inviter_email,
        inviterName: invite.inviter_name,
        inviteeEmail: invite.invitee_email,
        type: invite.type,
        businessName: invite.business_name,
        message: invite.message,
        createdAt: invite.created_at,
        expiresAt: invite.expires_at,
      },
    });

  } catch (error) {
    console.error('Error getting invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Accept invite
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }
  const token = authorization.split('Bearer ')[1];

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { code } = await params;

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Find invite
    const { data: invite, error: findError } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (findError) throw findError;

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Validate invite
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite already processed' }, { status: 400 });
    }

    if (invite.invitee_email !== user.email) {
      return NextResponse.json({ error: 'Invite not intended for this email address' }, { status: 400 });
    }

    // Accept invite
    const { error: updateError } = await supabaseAdmin
      .from('invites')
      .update({
        status: 'accepted',
        invitee_id: user.id,
      })
      .eq('id', invite.id);

    if (updateError) throw updateError;

    // Process based on invite type
    switch (invite.type) {
      case 'business':
        // Add user to a business team or grant business privileges
        await supabaseAdmin
          .from('users')
          .update({
            business_role: 'member',
            invited_to_business: invite.business_name,
          })
          .eq('id', user.id);
        break;

      case 'admin':
        // Grant admin privileges (check if inviter is admin first)
        const { data: inviterData } = await supabaseAdmin
          .from('users')
          .select('role')
          .eq('id', invite.inviter_id)
          .single();

        if (inviterData?.role === 'admin') {
          await supabaseAdmin
            .from('users')
            .update({ role: 'admin' })
            .eq('id', user.id);
        }
        break;

      case 'user':
      default:
        // Regular user invite - maybe give some bonus or special access
        await supabaseAdmin
          .from('users')
          .update({
            invited_by: invite.inviter_id,
          })
          .eq('id', user.id);
        break;
    }

    return NextResponse.json({
      message: 'Invite accepted successfully',
      type: invite.type,
      inviter: {
        name: invite.inviter_name,
        email: invite.inviter_email,
      },
    });

  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}