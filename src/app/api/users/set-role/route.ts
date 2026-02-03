import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Helper function to verify the token and check for admin role
async function verifyTokenAndAdmin(req: NextRequest) {
    const supabaseAdmin = getSupabaseAdmin();
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { error: 'Unauthorized: No token provided', status: 401 };
    }
    const token = authorization.split('Bearer ')[1];

    try {
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return { error: 'Unauthorized: Invalid token', status: 401 };
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userError || userData?.role !== 'admin') {
            return { error: 'Forbidden: User is not an admin', status: 403 };
        }

        return { error: null, status: 200 };
    } catch (error) {
        console.error('Error verifying token:', error);
        return { error: 'Unauthorized: Invalid token', status: 401 };
    }
}

export async function POST(req: NextRequest) {
    const { error, status } = await verifyTokenAndAdmin(req);
    if (error) {
        return NextResponse.json({ error }, { status });
    }

    const { uid, role } = await req.json();

    if (!uid || !role) {
        return NextResponse.json({ error: 'Bad Request: Missing uid or role' }, { status: 400 });
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ role })
            .eq('id', uid);

        if (updateError) throw updateError;

        return NextResponse.json({ message: `Successfully set role '${role}' for user ${uid}` }, { status: 200 });
    } catch (error) {
        console.error('Error setting role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
