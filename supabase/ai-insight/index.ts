import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { prompt } = await req.json()

    // ✅ Groq API call (free tier)
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: "You are a concise prediction market analyst. Give a 2-3 sentence insight about the market's current probability and what could shift it. Be direct and specific.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!groqRes.ok) {
      const errBody = await groqRes.text()
      throw new Error(`Groq error: ${errBody}`)
    }

    const aiData = await groqRes.json()
    const text = aiData.choices?.[0]?.message?.content ?? "Unable to generate insight."

    return new Response(
      JSON.stringify({ text }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})