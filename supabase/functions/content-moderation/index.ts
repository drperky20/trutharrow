import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModerationRequest {
  content: string;
}

interface ModerationResponse {
  shouldApprove: boolean;
  flagReason?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content }: ModerationRequest = await req.json();

    if (!content?.trim()) {
      return new Response(
        JSON.stringify({ shouldApprove: false, flagReason: "Empty content" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      // Fail open if API key missing
      return new Response(
        JSON.stringify({ shouldApprove: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Moderation] Checking content (${content.length} chars)`);

    const moderationPrompt = `You are a lenient content moderator for a student accountability platform.

YOUR ROLE: APPROVE most content. Only FLAG extreme violations.

✅ APPROVE (allow these):
• Strong language, cursing
• Criticism of specific people
• Rumors and allegations
• Heated discussions
• Sarcasm, satire

🚫 FLAG ONLY IF (block these):
• Spam/promotions
• Extreme hate speech or slurs
• PII: full names + context revealing minors, addresses, phone numbers
• Direct violent threats
• Illegal activity (drug sales, weapons)
• Pure harassment with zero substance

DEFAULT: When unsure, APPROVE.

Respond ONLY with valid JSON:
{
  "shouldApprove": true,
  "flagReason": null
}

OR

{
  "shouldApprove": false,
  "flagReason": "Brief reason why"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: moderationPrompt },
          { role: 'user', content: `Content to moderate:\n\n${content}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[Moderation] AI API error ${aiResponse.status}:`, errorText);
      
      // Fail open on AI service errors
      return new Response(
        JSON.stringify({ shouldApprove: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const result: ModerationResponse = JSON.parse(aiData.choices[0].message.content);

    console.log('[Moderation] Result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Moderation] Unexpected error:', error);
    
    // Fail open on any error
    return new Response(
      JSON.stringify({ shouldApprove: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
