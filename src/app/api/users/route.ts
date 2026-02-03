import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Helper function to verify the token and check for admin role
async function verifyTokenAndAdmin(req: NextRequest) {
    const supabaseAdmin = getSupabaseAdmin();
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { error: 'Unauthorized: No token provided', status: 401, admin: null };
    }
    const token = authorization.split('Bearer ')[1];

    try {
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return { error: 'Unauthorized: Invalid token', status: 401, admin: null };
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userError || userData?.role !== 'admin') {
            return { error: 'Forbidden: User is not an admin', status: 403, admin: null };
        }

        return { admin: user, error: null, status: 200 };
    } catch (error) {
        console.error('Error verifying token:', error);
        return { error: 'Unauthorized: Invalid token', status: 401, admin: null };
    }
}

export async function GET(req: NextRequest) {
    const { admin: adminUser, error, status } = await verifyTokenAndAdmin(req);
    if (error) {
        return NextResponse.json({ error }, { status });
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();
        // Get all users from our users table
        const { data: users, error: usersError } = await supabaseAdmin
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        const formattedUsers = (users || []).map((user: any) => ({
            uid: user.id,
            email: user.email,
            displayName: user.display_name,
            role: user.role || 'user',
            creationTime: user.created_at,
        }));

        return NextResponse.json(formattedUsers, { status: 200 });
    } catch (error) {
        console.error('Error listing users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
