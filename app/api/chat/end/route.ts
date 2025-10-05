// app/api/chat/end/route.ts
// Minimal placeholder endpoint for saving/ending a conversation.
// The real implementation should persist the conversation to a database.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // TODO: persist `body.threadId` and `body.messages`
    // Echo back a short confirmation including the threadId when present
    const threadId = body?.threadId ?? null;
    return new Response(JSON.stringify({ ok: true, threadId }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
