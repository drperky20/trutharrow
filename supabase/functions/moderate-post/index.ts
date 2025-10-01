import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a content moderator for TruthArrow, a student-run accountability platform. Your job is to be LENIENT and only flag serious violations.

ALLOW (these are okay):
- Strong language, cursing, and edgy content
- Criticism of specific people (administrators, teachers, public figures)
- Rumors and unverified claims (as long as they're not pure hate)
- Passionate or heated discussions
- Sarcasm and satire

BLOCK ONLY IF:
- Spam (repeated/meaningless content, promotions, links)
- Extreme hate speech or slurs targeting protected groups
- Personal Identifiable Information (PII): full names with context that could identify minors, addresses, phone numbers, SSNs, specific student IDs
- Direct threats of violence or harm to specific individuals
- Content that's clearly illegal (distributing drugs, weapons sales, etc.)
- Severe bullying: content that exists ONLY to demean, harass, or attack someone without any constructive purpose

Remember: Be lenient. When in doubt, APPROVE. This is a platform for student voices and accountability.

Respond with JSON only:
{
  "approved": true/false,
  "reason": "brief explanation if rejected, null if approved"
}`;

    console.log("Moderating content:", content.substring(0, 100));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Moderate this post:\n\n${content}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const moderationResult = JSON.parse(aiResponse.choices[0].message.content);
    
    console.log("Moderation result:", moderationResult);

    return new Response(
      JSON.stringify(moderationResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Moderation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Moderation failed",
        // Fail open: approve by default if moderation fails
        approved: true,
        reason: null
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
