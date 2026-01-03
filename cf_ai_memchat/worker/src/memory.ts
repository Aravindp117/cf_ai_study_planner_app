// worker/src/memory.ts
interface Env {
  AI: any;
}

export class Memory {
  state: DurableObjectState;
  env: { AI: any };

  constructor(state: DurableObjectState, env: { AI: any }) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    try {
      if (request.method !== "POST") {
        return new Response("Only POST is allowed", { status: 405 });
      }

      // Parse JSON body safely
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const message: string = body?.message ?? "";
      if (!message || typeof message !== "string") {
        return new Response(JSON.stringify({ error: "`message` is required (string)" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Load prior turns (small rolling window)
      const turns: Array<{ role: "user" | "assistant"; content: string }> =
        (await this.state.storage.get("turns")) || [];

      // Build prompt with a system instruction + memory turns + new user msg
      const messages = [
        { role: "system", content: "You are a concise, helpful assistant with short, direct answers." },
        ...turns.map(t => ({ role: t.role, content: t.content })),
        { role: "user", content: message }
      ];

      // Call a real, available model on Workers AI
      const aiResp = await this.env.AI.run("@cf/meta/llama-3-8b-instruct", { messages });

      const reply: string =
        (aiResp && (aiResp.response ?? aiResp.result)) || "No response";

      // Update memory (cap last 10 turns total, i.e., 5 exchanges)
      const updated = [...turns, { role: "user" as const, content: message }, { role: "assistant" as const, content: reply }];
      const capped = updated.slice(-10);
      await this.state.storage.put("turns", capped);

      return new Response(JSON.stringify({ reply }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (err: any) {
      // Minimal logging and safe error
      console.error("Memory DO error:", err);
      return new Response(JSON.stringify({ error: "Internal error in Memory Durable Object" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
}

