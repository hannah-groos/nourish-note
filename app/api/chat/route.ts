// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { invokeChat } from "@/lib/ai/graph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { threadId, message } = body ?? {};
    if (!threadId || !message) {
      return new Response(JSON.stringify({ error: "threadId and message are required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const reply = await invokeChat(threadId, message);
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: unknown) {
    console.error("API /chat error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg ?? "Unknown error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

// Optional: block non-POST to avoid Next’s HTML 405 template
export async function GET() {
  return new Response(JSON.stringify({ error: "Use POST" }), {
    status: 405,
    headers: { "content-type": "application/json" },
  });
}
