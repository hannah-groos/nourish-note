// app/api/chat/summarize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { summarizeConversation } from "@/lib/ai/summarize";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { threadId, messages } = await req.json();
    if (!threadId || !Array.isArray(messages)) {
      return NextResponse.json({ error: "threadId and messages[] required" }, { status: 400 });
    }

    // TODO: authZ: ensure the caller owns threadId

    const summary = await summarizeConversation(messages);

    // TODO: persist the summary to your DB (Supabase) keyed by threadId
    // await db.upsertSummary({ threadId, summary });

    return NextResponse.json({ ok: true, summary }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}
