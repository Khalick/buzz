import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  validateOrigin, 
  validateUuid, 
  validateName, 
  validateText, 
  validateUrl,
  createErrorResponse
} from '@/lib/validation';

let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabaseAdmin;
}

// GET /api/businesses/[id] - Get a single business
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rawId = (await params).id;
    const id = validateUuid(rawId, 'id');

    const { data, error } = await getSupabaseAdmin()
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return createErrorResponse(error, 'Internal server error');
  }
}

// PUT /api/businesses/[id] - Update business (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    if (!validateOrigin(origin, referer)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rawId = (await params).id;
    const id = validateUuid(rawId, 'id');

    // Get the auth token from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the user
    // We use getSupabaseAdmin() directly to verify via Supabase Admin API
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('owner_id, submitted_by')
      .eq('id', id)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.owner_id !== user.id && business.submitted_by !== user.id) {
      // Also check if user is admin
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'admin') {
        return NextResponse.json({ error: 'Not authorized to edit this business' }, { status: 403 });
      }
    }

    const body = await request.json();

    // Only allow specific fields to be updated and validate them
    const allowedFields: Record<string, any> = {};

    if (body.name !== undefined) allowedFields.name = validateName(body.name, 'name');
    if (body.description !== undefined) allowedFields.description = validateText(body.description, 'description', { maxLength: 2000 });
    if (body.category !== undefined) allowedFields.category = validateText(body.category, 'category', { maxLength: 80 });
    if (body.website !== undefined && body.website !== "") allowedFields.website = validateUrl(body.website, 'website');
    if (body.website === "") allowedFields.website = null;
    
    // We pass through complex JSON objects, but ideally they should be rigorously validated as well
    if (body.whatsapp !== undefined) allowedFields.whatsapp = body.whatsapp ? validateText(body.whatsapp.toString(), 'whatsapp', { maxLength: 30 }) : null;
    if (body.address !== undefined) allowedFields.address = validateText(body.address?.toString() || '', 'address', { maxLength: 200, required: false });
    if (body.contact !== undefined) allowedFields.contact = body.contact; 
    if (body.location !== undefined) allowedFields.location = body.location;
    if (body.business_hours !== undefined) allowedFields.business_hours = body.business_hours;
    if (body.social_media !== undefined) allowedFields.social_media = body.social_media;
    
    if (body.images !== undefined) {
      const rawImages = Array.isArray(body.images) ? (body.images as unknown[]) : [];
      allowedFields.images = rawImages
        .filter((img): img is string => typeof img === 'string' && img.startsWith('https://'))
        .slice(0, 20); // max 20 images
    }

    allowedFields.updated_at = new Date().toISOString();

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('businesses')
      .update(allowedFields)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return createErrorResponse(error, 'Internal server error');
  }
}
