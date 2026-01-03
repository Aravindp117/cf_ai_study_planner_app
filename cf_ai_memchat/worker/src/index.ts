// src/index.ts
import { Memory } from "./memory";

interface Env {
  AI: any;
  MEM_CHAT: DurableObjectNamespace;
}

// CORS headers (open for dev, restrict in prod)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // ✅ Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // ✅ Health check
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(
        "✅ Cloudflare AI chat with memory is running",
        { headers: corsHeaders }
      );
    }

    // ✅ POST /api/chat
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const { message, id } = (await request.json()) as {
          message: string;
          id: string;
        };

        if (!message || !id) {
          return new Response(
            JSON.stringify({ error: "`message` and `id` are required" }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            }
          );
        }

        // Route request to Durable Object (memory per id)
        const memoryId = env.MEM_CHAT.idFromName(id);
        const stub = env.MEM_CHAT.get(memoryId);

        const doResponse = await stub.fetch(
          "https://internal/chat",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
          }
        );

        // Forward DO response + CORS headers
        const body = await doResponse.text();
        return new Response(body, {
          status: doResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.error("Worker error:", err);
        return new Response(
          JSON.stringify({ error: "Internal Worker error" }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // ❌ Fallback
    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders,
    });
  },
};

// Required so Wrangler can bind the Durable Object
export { Memory };

