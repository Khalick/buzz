import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({
        error: 'AI search is not configured yet. Please add OPENAI_API_KEY to your environment variables.',
      }, { status: 503 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch businesses for context (top 50 by rating)
    const { data: businesses, error } = await supabaseAdmin
      .from('businesses')
      .select('id, name, description, category, location, contact, rating, review_count, business_hours, website')
      .eq('approved', true)
      .order('rating', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Build context string from business data
    const businessContext = (businesses || []).map((b: any) => {
      const loc = b.location ? `${b.location.town || ''}, ${b.location.county || ''}` : 'Unknown';
      return `- ${b.name} (${b.category}) | Location: ${loc} | Rating: ${b.rating || 0}/5 (${b.review_count || 0} reviews) | Phone: ${b.contact?.phone || 'N/A'}`;
    }).join('\n');

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
            content: `You are BizHub Assistant, an expert on local businesses in Thika, Kenya. You help users find businesses and answer questions about local services.

Here are the businesses in our directory:
${businessContext}

Rules:
1. Only recommend businesses from the list above.
2. Be friendly, concise, and helpful. Use emojis sparingly.
3. If asked about something not in the directory, say so honestly.
4. Always mention the business name, category, location, and rating.
5. If multiple businesses match, list the top 3 by rating.
6. Format your response in a clean, readable way.
7. Respond in under 150 words.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!openaiResponse.ok) {
      const errData = await openaiResponse.json();
      console.error('OpenAI error:', errData);
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 502 });
    }

    const aiData = await openaiResponse.json();
    const answer = aiData.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process that request.';

    // Extract mentioned business IDs for linking
    const mentionedBusinesses = (businesses || []).filter((b: any) =>
      answer.toLowerCase().includes(b.name.toLowerCase())
    ).map((b: any) => ({ id: b.id, name: b.name, rating: b.rating }));

    return NextResponse.json({
      answer,
      mentionedBusinesses,
    });
  } catch (error) {
    console.error('AI search error:', error);
    return NextResponse.json({ error: 'Failed to process AI search' }, { status: 500 });
  }
}
