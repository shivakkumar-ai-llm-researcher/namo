// Supabase Edge Function: ai-assistant
// Proxies requests to Groq API server-side.
// The GROQ_API_KEY is stored only as an Edge Function secret — never exposed to clients.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 1024;
const ALLOWED_ORIGIN = '*'; // Restrict in production per your domain

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 1. Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Parse request body
    const body = await req.json();
    const { message, context, systemPrompt } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (message.length > 2000) {
      return new Response(JSON.stringify({ error: 'message too long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Read server-side secret — NEVER log or return this
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      console.error('GROQ_API_KEY secret not configured in Edge Function environment');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Build context string
    const contextStr = context ? JSON.stringify({
      activeFunction: context.activeFunction?.name ?? null,
      totalContributions: context.summary?.totalContributions ?? 0,
      totalExpenses: context.summary?.totalExpenses ?? 0,
      balance: context.summary?.balance ?? 0,
      functionCount: context.functionCount ?? 0,
      memberCount: context.memberCount ?? 0,
    }) : '{}';

    const defaultSystemPrompt = `You are Namo AI Assistant — a helpful financial assistant for a Tamil community fund management system.
You help community administrators track contributions, expenses, and balances for annual and four-year festivals.
Respond in English. Be concise. For financial data, show amounts in Indian Rupees (₹).
Current community context: ${contextStr}`;

    // 5. Call Groq — key never leaves server
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt || defaultSystemPrompt },
          { role: 'user', content: message.trim() },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.4,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errText.substring(0, 200));
      return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const groqData = await groqResponse.json();
    const replyText = groqData?.choices?.[0]?.message?.content?.trim() ?? '';

    if (!replyText) {
      return new Response(JSON.stringify({ text: 'I could not generate a response. Please try again.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 6. Return only the result — never the key
    return new Response(JSON.stringify({ text: replyText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('ai-assistant edge function error:', e instanceof Error ? e.message : String(e));
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
