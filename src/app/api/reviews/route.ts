import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch user display names for the reviews
    const userIds = [...new Set((reviews || []).map((r: any) => r.user_id))];
    let userMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, display_name, email')
        .in('id', userIds);

      if (users) {
        userMap = Object.fromEntries(
          users.map((u: any) => [u.id, u.display_name || u.email?.split('@')[0] || 'User'])
        );
      }
    }

    const enrichedReviews = (reviews || []).map((r: any) => ({
      ...r,
      user_name: userMap[r.user_id] || 'Anonymous',
    }));

    // Calculate average rating
    const totalRating = (reviews || []).reduce((sum: number, review: any) => sum + review.rating, 0);
    const averageRating = reviews && reviews.length > 0 ? totalRating / reviews.length : 0;

    return NextResponse.json({
      reviews: enrichedReviews,
      stats: {
        averageRating: averageRating.toFixed(1),
        totalReviews: reviews?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { businessId, rating, comment } = body;

    if (!businessId || !rating) {
      return NextResponse.json({ error: 'Business ID and rating required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user already reviewed this business
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this business' }, { status: 400 });
    }

    const reviewData = {
      business_id: businessId,
      user_id: user.id,
      rating,
      comment: comment || '',
    };

    const { data: review, error: insertError } = await supabaseAdmin
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();

    if (insertError) throw insertError;

    // Update business rating
    const { data: allReviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('business_id', businessId);

    const totalRating = (allReviews || []).reduce((sum: number, r: any) => sum + r.rating, 0);
    const averageRating = allReviews && allReviews.length > 0 ? totalRating / allReviews.length : 0;

    await supabaseAdmin
      .from('businesses')
      .update({
        rating: averageRating,
        review_count: allReviews?.length || 0
      })
      .eq('id', businessId);

    return NextResponse.json({
      success: true,
      reviewId: review.id,
      averageRating: averageRating.toFixed(1)
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');
    const businessId = searchParams.get('businessId');

    if (!reviewId || !businessId) {
      return NextResponse.json({ error: 'Review ID and Business ID required' }, { status: 400 });
    }

    // Verify the review belongs to the user
    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('id, user_id')
      .eq('id', reviewId)
      .single();

    if (!review || review.user_id !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own reviews' }, { status: 403 });
    }

    // Delete the review
    const { error: deleteError } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) throw deleteError;

    // Recalculate business rating
    const { data: remainingReviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('business_id', businessId);

    const totalRating = (remainingReviews || []).reduce((sum: number, r: any) => sum + r.rating, 0);
    const averageRating = remainingReviews && remainingReviews.length > 0 ? totalRating / remainingReviews.length : 0;

    await supabaseAdmin
      .from('businesses')
      .update({
        rating: averageRating,
        review_count: remainingReviews?.length || 0
      })
      .eq('id', businessId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
