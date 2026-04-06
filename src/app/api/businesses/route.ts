import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  validateText,
  validateName,
  validateUrl,
  validatePhone,
  validateEmail,
  validatePagination,
  validateOrigin,
  createErrorResponse,
  ValidationError,
  sanitizeString,
  hasSqlInjection,
} from '@/lib/validation';

// Allowed sort & category values (allowlist approach)
const ALLOWED_SORTS = ['newest', 'rating', 'views', 'name'] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate and sanitize all query parameters
    const { page, limit } = validatePagination(
      searchParams.get('page') || '1',
      searchParams.get('limit') || '10'
    );

    // Prevent injection in search/filter params
    const rawSearch = searchParams.get('search') || '';
    const rawCategory = searchParams.get('category') || '';
    const rawCounty = searchParams.get('county') || '';
    const rawSort = searchParams.get('sort') || 'newest';

    if (rawSearch && hasSqlInjection(rawSearch)) {
      return NextResponse.json({ error: 'Invalid search query' }, { status: 400 });
    }
    const search = sanitizeString(rawSearch).slice(0, 100);
    const category = sanitizeString(rawCategory).slice(0, 60);
    const county = sanitizeString(rawCounty).slice(0, 60);
    const sort = ALLOWED_SORTS.includes(rawSort as typeof ALLOWED_SORTS[number])
      ? (rawSort as typeof ALLOWED_SORTS[number])
      : 'newest';

    const rawMinRating = parseFloat(searchParams.get('minRating') || '0');
    const minRating = isNaN(rawMinRating) ? 0 : Math.max(0, Math.min(5, rawMinRating));

    let query = supabase
      .from('businesses')
      .select('id, name, category, description, location, contact, website, images, rating, review_count, views, is_premium, approved, created_at', { count: 'exact' })
      .eq('approved', true);

    if (category && category !== 'all') query = query.eq('category', category);
    if (county && county !== 'all') query = query.contains('location', { county });
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }
    if (minRating > 0) query = query.gte('rating', minRating);

    switch (sort) {
      case 'rating': query = query.order('rating', { ascending: false }).order('review_count', { ascending: false }); break;
      case 'views':  query = query.order('views', { ascending: false }); break;
      case 'name':   query = query.order('name', { ascending: true }); break;
      default:       query = query.order('created_at', { ascending: false }); break;
    }

    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      businesses: data || [],
      pagination: {
        currentPage: page,
        hasNextPage: startIndex + limit < (count || 0),
        hasPrevPage: page > 1,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch businesses');
  }
}

export async function POST(request: NextRequest) {
  try {
    // CSRF: validate Origin header on all state-mutating operations
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

    // Deep input validation — rejects SQLi, XSS, and malformed data
    const name        = validateName(body.name, 'name');
    const description = validateText(body.description as unknown, 'description', { maxLength: 2000 });
    const category    = validateText(body.category as unknown, 'category', { maxLength: 80 });
    const location    = body.location as Record<string, string> | undefined;
    const contact     = body.contact as Record<string, string> | undefined;

    if (!location?.county) throw new ValidationError('County is required', 'location.county');
    const county  = validateText(location.county, 'county', { maxLength: 80 });
    const town    = validateText(location.town || '', 'town', { maxLength: 80, required: false });
    const address = validateText(location.address || '', 'address', { maxLength: 200, required: false });

    if (!contact?.phone && !contact?.email) {
      throw new ValidationError('At least one contact method (phone or email) is required');
    }
    const phone    = contact?.phone ? validatePhone(contact.phone, 'phone') : null;
    const email    = contact?.email ? validateEmail(contact.email, 'email') : null;
    const whatsapp = contact?.whatsapp ? validatePhone(contact.whatsapp, 'whatsapp') : null;
    const website  = body.website ? validateUrl(body.website as unknown, 'website') : null;

    // Images must be URLs we control
    const rawImages = Array.isArray(body.images) ? (body.images as unknown[]) : [];
    const images = rawImages
      .filter((img): img is string => typeof img === 'string' && img.startsWith('https://'))
      .slice(0, 20); // max 20 images

    const businessData = {
      name, description, category,
      location: { county, town, address, coordinates: null },
      contact: { phone, email, whatsapp },
      website,
      images,
      owner_id: user.id,
      submitted_by: user.id,
      approved: false,    // always start unapproved — admin must approve
      is_premium: false,  // never allow client to set premium
      views: 0,           // never allow client to set view counts
      rating: 0,          // never allow client to set ratings
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('businesses')
      .insert(businessData)
      .select('id')
      .single();
    if (error) throw error;

    return NextResponse.json({
      message: 'Business submitted successfully',
      businessId: data.id,
      status: 'pending_approval',
    }, { status: 201 });

  } catch (error) {
    return createErrorResponse(error, 'Failed to create business');
  }
}