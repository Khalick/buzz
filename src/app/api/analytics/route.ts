import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cache } from '@/lib/cache';


export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const cacheKey = 'dashboard_analytics';

    // Check cache first (cache for 10 minutes)
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Get total counts
    const [usersResult, businessesResult, invitesResult] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact' }),
      supabaseAdmin.from('businesses').select('*', { count: 'exact' }),
      supabaseAdmin.from('invites').select('*', { count: 'exact' })
    ]);

    // Get approved businesses count
    const { count: approvedCount } = await supabaseAdmin
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('approved', true);

    // Get pending businesses count
    const { count: pendingCount } = await supabaseAdmin
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('approved', false);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentUsers } = await supabaseAdmin
      .from('users')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: recentBusinesses } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate growth rates
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: newUsersCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: newBusinessesCount } = await supabaseAdmin
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // Get category breakdown
    const categoryBreakdown: { [key: string]: number } = {};
    (businessesResult.data || []).forEach((doc: any) => {
      const category = doc.category;
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });

    // Get county breakdown
    const countyBreakdown: { [key: string]: number } = {};
    (businessesResult.data || []).forEach((doc: any) => {
      const county = doc.location?.county;
      if (county) {
        countyBreakdown[county] = (countyBreakdown[county] || 0) + 1;
      }
    });

    const analytics = {
      overview: {
        totalUsers: usersResult.count || 0,
        totalBusinesses: businessesResult.count || 0,
        approvedBusinesses: approvedCount || 0,
        pendingBusinesses: pendingCount || 0,
        totalInvites: invitesResult.count || 0
      },
      growth: {
        newUsersThisWeek: newUsersCount || 0,
        newBusinessesThisWeek: newBusinessesCount || 0,
        userGrowthRate: newUsersCount || 0,
        businessGrowthRate: newBusinessesCount || 0
      },
      breakdown: {
        byCategory: categoryBreakdown,
        byCounty: countyBreakdown
      },
      recent: {
        users: recentUsers || [],
        businesses: recentBusinesses || []
      },
      lastUpdated: new Date().toISOString()
    };

    // Cache for 10 minutes
    cache.set(cacheKey, analytics, 600);

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}