import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({
        error: 'AI search is not configured yet. Please add OPENAI_API_KEY to your environment variables.',
      }, { status: 503 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch up to 20 recent reviews for the summary
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('rating, comment')
      .eq('business_id', businessId)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ summary: null, tags: [] });
    }

    // Build context string from reviews
    const reviewsContext = reviews
      .map(r => `Rating: ${r.rating}/5 - ${r.comment}`)
      .join('\n');

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI tasked with summarizing customer reviews for a business.
Read the provided reviews and produce a JSON object with exactly two keys:
- "summary": A well-written, concise summary paragraph (under 50 words) highlighting the general consensus, main pros, and any common cons.
- "tags": An array of 3 to 5 short strings representing the most common sentiments or keywords (e.g., ["Fast Service", "Affordable", "Clean", "Long Wait"]).
Ensure the output is pure JSON without markdown code blocks or extra text.`
          },
          {
            role: 'user',
            content: `Here are the latest reviews:\n${reviewsContext}`
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent JSON output
        max_tokens: 150,
      }),
    });

    if (!openaiResponse.ok) {
      const errData = await openaiResponse.json();
      console.error('OpenAI error:', errData);
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 502 });
    }

    const aiData = await openaiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || '{}';

    try {
      // Clean up potential markdown wrapper from GPT response
      const jsonString = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(jsonString);
      return NextResponse.json({
        summary: result.summary,
        tags: result.tags || [],
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', rawContent);
       return NextResponse.json({ error: 'Failed to process AI summary' }, { status: 500 });
    }

  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json({ error: 'Failed to process AI summary' }, { status: 500 });
  }
}
