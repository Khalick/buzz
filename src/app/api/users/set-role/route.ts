import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { 
  validateUuid, 
  validateText, 
  validateOrigin, 
  createErrorResponse 
} from '@/lib/validation';

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
    try {
        const origin = req.headers.get('origin');
        const referer = req.headers.get('referer');
        if (!validateOrigin(origin, referer)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error, status } = await verifyTokenAndAdmin(req);
        if (error) {
            return NextResponse.json({ error }, { status });
        }

        let body: Record<string, unknown>;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        if (!body.uid || !body.role) {
            return NextResponse.json({ error: 'Bad Request: Missing uid or role' }, { status: 400 });
        }

        const uid = validateUuid(body.uid, 'uid');
        const role = validateText(body.role, 'role', { maxLength: 20 });

        const supabaseAdmin = getSupabaseAdmin();
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ role })
            .eq('id', uid);

        if (updateError) throw updateError;

        return NextResponse.json({ message: `Successfully set role '${role}' for user ${uid}` }, { status: 200 });
    } catch (error) {
        return createErrorResponse(error, 'Internal Server Error');
    }
}
