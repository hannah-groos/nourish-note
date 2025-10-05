import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EntriesChatSplit from "@/components/ui/entries-chat-split";

export const dynamic = "force-dynamic";

export default async function PastEntriesPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/auth/login");

  const userEmail = user.email ?? "";

  // Fetch user's entries
  const { data: rows, error } = await supabase
    .from("entries")
    .select("id, created_at, raw_data, extracted_data")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) console.error("Failed to load entries:", error);

  const entries = (rows ?? []).map((r) => {
    const raw = (r as { raw_data: string | null }).raw_data;
    const extracted = (r as { extracted_data: Record<string, unknown> | null }).extracted_data;
    const moodCandidate = extracted?.mood ?? extracted?.emotion ?? extracted?.feel ?? extracted?.sentiment ?? extracted?.top_emotion ?? extracted?.topEmotion ?? null;
    const mood = typeof moodCandidate === "string" ? moodCandidate : null;
    return {
      id: (r as { id: string }).id,
      content: raw ?? "",
      word_count: (raw ?? "").trim().split(/\s+/).filter(Boolean).length,
      mood,
      created_at: (r as { created_at: string }).created_at,
    };
  });

  // Build streakData (reuse logic similar to journal_alia)
  const createdAts: string[] = entries.map((e) => e.created_at);

  const dayStrTZ = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);

  const uniqueDays = new Set<string>();
  for (const ts of createdAts) {
    const d = new Date(ts);
    uniqueDays.add(dayStrTZ(d));
  }

  const total_entries = createdAts.length;
  const now = new Date();
  const todayStr = dayStrTZ(now);
  const [y, m, d] = todayStr.split("-").map(Number);
  const cursor = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  let current_streak = 0;
  if (!uniqueDays.has(todayStr)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (true) {
    const key = dayStrTZ(cursor);
    if (!uniqueDays.has(key)) break;
    current_streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const sortedDaysDesc = Array.from(uniqueDays)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((s) => new Date(s + "T00:00:00.000Z"));

  let longest_streak = 0;
  let run = 0;
  for (let i = 0; i < sortedDaysDesc.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = sortedDaysDesc[i - 1];
      const cur = sortedDaysDesc[i];
      const diffDays = Math.round((prev.getTime() - cur.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        run += 1;
      } else {
        longest_streak = Math.max(longest_streak, run);
        run = 1;
      }
    }
  }
  longest_streak = Math.max(longest_streak, run);

  const streakData = { current_streak, longest_streak, total_entries } as const;

  // Fetch initial chat messages (empty for now, but could be extended)
  const initialMessages: Array<{ id: string; role: "user" | "assistant"; content: string; created_at: string }> = [];

  return (
    <EntriesChatSplit 
      userEmail={userEmail}
      entries={entries}
      streakData={streakData}
      initialMessages={initialMessages}
    />
  );
}
