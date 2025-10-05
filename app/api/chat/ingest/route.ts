import { NextRequest, NextResponse } from "next/server";
import { app } from "@/lib/ai/graph";
// import { enqueueIngestJob } from "@/server/queues"; // your queue or background task
// import { saveMessagesDelta } from "@/server/db";    // persist quickly to DB
// import { getUserFromRequest } from "@/server/auth"; // your auth helper

export const runtime = "nodejs"; // keep Node so we can talk to DB easily

export async function POST(req: NextRequest) {
  try {
  const body = await req.json().catch(() => ({}));
  const { threadId, messages } = body ?? {};

    if (!threadId || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "threadId and messages[] required" }, { status: 400 });
    }

    // 1) Authn/authz (bind thread to user)
    // const user = await getUserFromRequest(req);
    // if (!user || !(await userOwnsThread(user.id, threadId))) {
    //   return NextResponse.json({ error: "unauthorized" }, { status: 403 });
    // }

    // 2) Persist delta FAST (no LLM/graph work here)
    // await saveMessagesDelta({ threadId, userId: user.id, messages, lastClientMessageId });

    // 3) Background processing: fire-and-forget update to LangGraph app.
    // We intentionally don't await so the beacon/sendBeacon can finish quickly.
    try {
      void app
        .invoke({ messages }, { configurable: { thread_id: threadId } } as const)
        .catch((err) => {
          // Log for later retry/inspection. In production, enqueue for retry.
          console.error("ingest: background app.invoke failed", err);
        });
    } catch (err) {
      // swallow - best-effort
      console.error("ingest: failed to start background invoke", err);
    }

    // Reply immediately so sendBeacon can finish
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (e: unknown) {
    // Still try to be quick: return 200 with ok:false so beacon resolves
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg ?? "unknown" }, { status: 200 });
  }
}
