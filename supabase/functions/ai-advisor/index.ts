import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const LANGFUSE_PUBLIC_KEY = Deno.env.get("LANGFUSE_PUBLIC_KEY");
const LANGFUSE_SECRET_KEY = Deno.env.get("LANGFUSE_SECRET_KEY");
const LANGFUSE_HOST = Deno.env.get("LANGFUSE_HOST") ?? "https://cloud.langfuse.com";

async function langfuseTrace(traceId: string, generationId: string, input: unknown, output: string, model: string, usage: { input: number; output: number; total: number }) {
  if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) return;
  const auth = btoa(`${LANGFUSE_PUBLIC_KEY}:${LANGFUSE_SECRET_KEY}`);
  const now = new Date().toISOString();
  await fetch(`${LANGFUSE_HOST}/api/public/ingestion`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Basic ${auth}` },
    body: JSON.stringify({
      batch: [
        {
          id: traceId,
          type: "trace-create",
          timestamp: now,
          body: { id: traceId, name: "ai-advisor", timestamp: now },
        },
        {
          id: generationId,
          type: "generation-create",
          timestamp: now,
          body: {
            id: generationId,
            traceId,
            name: "claude-response",
            model,
            input,
            output,
            startTime: now,
            endTime: now,
            usage: { input: usage.input, output: usage.output, total: usage.total },
          },
        },
      ],
    }),
  }).catch(() => { /* silencieux */ });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { systemPrompt, messages } = await req.json();
    const model = "claude-sonnet-4-20250514";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service error", details: errorText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "No response generated.";

    // Langfuse tracing
    const traceId = crypto.randomUUID();
    const generationId = crypto.randomUUID();
    const inputTokens = data.usage?.input_tokens ?? 0;
    const outputTokens = data.usage?.output_tokens ?? 0;
    const usage = { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens };
    await langfuseTrace(traceId, generationId, { system: systemPrompt, messages }, content, model, usage);

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
