import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateOrigin, validateText, createErrorResponse } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    if (!validateOrigin(origin, referer)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    const query = validateText(body.query, 'query', { maxLength: 300 });

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({
        error: 'AI search is not configured yet. Please add GROQ_API_KEY to your environment variables.',
      }, { status: 503 });
    }

    // Fetch businesses for context (top 50 by rating)
    const { data: businesses, error } = await supabase
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

    const systemPrompt = `You are BizHub Assistant, an expert on local businesses in Thika, Kenya. You help users find businesses and answer questions about local services.

Here are the businesses in our directory:
${businessContext}

Rules:
1. Only recommend businesses from the list above.
2. Be friendly, concise, and helpful. Use emojis sparingly.
3. If asked about something not in the directory, say so honestly.
4. Always mention the business name, category, location, and rating.
5. If multiple businesses match, list the top 3 by rating.
6. Format your response in a clean, readable way.
7. Respond in under 150 words.`;

    // Call Groq API (OpenAI-compatible format) — free tier with Llama 3.3 70B
    const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

    const groqResponse = await fetch(groqUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      console.error('Groq API error:', groqResponse.status, errData);

      if (groqResponse.status === 429) {
        return NextResponse.json({
          error: 'AI is temporarily busy. Please try again in a minute.',
        }, { status: 429 });
      }

      if (groqResponse.status === 401) {
        return NextResponse.json({
          error: 'AI API key is invalid. Please check your GROQ_API_KEY.',
        }, { status: 503 });
      }

      return NextResponse.json({
        error: 'AI service temporarily unavailable. Please try again later.',
      }, { status: 502 });
    }

    const aiData = await groqResponse.json();
    const answer =
      aiData?.choices?.[0]?.message?.content ||
      'Sorry, I couldn\'t process that request.';

    // Extract mentioned business IDs for linking
    const mentionedBusinesses = (businesses || []).filter((b: any) =>
      answer.toLowerCase().includes(b.name.toLowerCase())
    ).map((b: any) => ({ id: b.id, name: b.name, rating: b.rating, category: b.category }));

    return NextResponse.json({
      answer,
      mentionedBusinesses,
    });
  } catch (error: any) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      return NextResponse.json({
        error: 'AI request timed out. Please try again.',
      }, { status: 504 });
    }
    return createErrorResponse(error, 'Failed to process AI search');
  }
}
