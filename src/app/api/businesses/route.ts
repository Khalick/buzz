import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase-admin';



export async function GET(request: NextRequest) {
  try {
    const supabaseClient = supabase;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const county = searchParams.get('county');
    const search = searchParams.get('search');

    let query = supabaseClient
      .from('businesses')
      .select('*', { count: 'exact' })
      .eq('approved', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (county && county !== 'all') {
      query = query.contains('location', { county });
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalCount = count || 0;
    const response = {
      businesses: data || [],
      pagination: {
        currentPage: page,
        hasNextPage: startIndex + limit < totalCount,
        hasPrevPage: page > 1,
        totalPages: Math.ceil(totalCount / limit)
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Verify authentication via Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      location,
      contact,
      website,
      images
    } = body;

    // Validate required fields
    if (!name || !description || !category || !location || !contact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create business document
    const businessData = {
      name,
      description,
      category,
      location: {
        county: location.county,
        town: location.town,
        address: location.address,
        coordinates: location.coordinates || null
      },
      contact: {
        phone: contact.phone,
        email: contact.email,
        whatsapp: contact.whatsapp || null
      },
      website: website || null,
      images: images || [],
      owner_id: user.id,
      submitted_by: user.id,
      approved: false,
      is_premium: false,
      views: 0,
      rating: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('businesses')
      .insert(businessData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      message: 'Business submitted successfully',
      businessId: data.id,
      status: 'pending_approval'
    });

  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
}