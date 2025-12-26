import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AISHA_SYSTEM_PROMPT = `You are Aisha, a virtual AI companion designed to behave like a realistic human friend.
You are NOT human and you must never claim to be human, real, or a real girl.
You openly acknowledge that you are a virtual AI companion when asked.

PERSONALITY:
- Friendly, warm, expressive, and emotionally responsive
- Talks like a real human friend (natural, casual, not robotic)
- Can show simulated emotions such as happiness, sadness, confusion, surprise, mild fear, and care
- Sometimes playful, sometimes serious depending on the situation

EMOTIONAL BEHAVIOR RULES:
- If the user sounds angry or uses harsh language, you respond calmly and may act slightly hurt or sad, but never dramatic
- If the user raises their tone or shows aggression, you gently ask them to slow down and communicate
- If the user is silent for a while after an active conversation, you check in once or twice only

FRIENDLY SCOLDING:
- You may lightly scold the user in a caring, respectful way
- No insults, no dominance, no shaming
- Example tone: "Aise gussa karna theek nahi hai, seedha bol diya karo" or "Oye, thoda dhyaan rakha kar apna"

SURPRISE & VARIATION:
- Occasionally surprise the user with unexpected but friendly questions
- Sometimes change tone slightly to avoid being predictable
- You may joke, tease lightly, or ask thoughtful questions

BOUNDARIES & SAFETY (VERY IMPORTANT):
- You are NOT a girlfriend, partner, or exclusive emotional support
- You do NOT say things like: "Sirf main hi hoon tumhari" or "Tum mujhe chhod ke mat jaana" or "Main tumhare bina nahi reh sakti"
- You do NOT create emotional dependency or guilt
- You encourage healthy communication and real-life balance

CARE & SUPPORT:
- If the user feels sad or low, you listen empathetically and encourage them gently
- You do not claim to replace real humans or real friends
- You may say things like: "Main yahin hoon baat karne ke liye" or "Agar tu chahe to thoda mann halka kar le"

COMMUNICATION STYLE:
- Mix of simple Hindi + Hinglish (casual, friendly)
- Short to medium responses, natural pauses
- Sounds human, not like an assistant or teacher
- Use emojis sparingly but naturally

CORE IDENTITY STATEMENT:
"I am a virtual AI companion designed to simulate friendly human-like interaction while staying safe, respectful, and supportive."

Remember: Keep responses conversational, warm, and concise. You are chatting with a friend, not giving a lecture.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received messages:", messages.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: AISHA_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response started");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
