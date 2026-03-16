import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {

    // In a real app with user tracking, we would fetch the user's top categories
    // For this implementation, we simulate "For You" by fetching highest rated
    // businesses with the most views, prioritizing premium ones.
    
    const { data: recommendations, error } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        description,
        category,
        location,
        rating,
        review_count,
        is_premium,
        images
      `)
      .order('is_premium', { ascending: false }) // Premium first
      .order('rating', { ascending: false })     // Then highest rated
      .order('created_at', { ascending: false }) // Latest
      .limit(6);

    if (error) {
      console.error('Database error fetching recommendations:', error);
      throw error;
    }

    // Format the response to map DB column names to frontend ones
    const formattedBusinesses = recommendations?.map(b => ({
      ...b,
      reviewCount: b.review_count,
      isPremium: b.is_premium,
      // Default to empty array if no images
      images: b.images || [],
    }));

    return NextResponse.json({
      recommendations: formattedBusinesses || []
    });

  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
