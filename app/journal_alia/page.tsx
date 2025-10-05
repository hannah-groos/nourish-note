import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JournalInterface from "@/components/ui/journal-interface";

export default async function JournalAliaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const userEmail = user.email ?? "";

  // Load user's preferred timezone from profiles (default UTC)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) {
    console.warn("Could not load user profile timezone, defaulting to UTC:", profileError);
  }
  const userTz = profile?.timezone || "UTC";

  // Fetch only what we need for streaks/limits
  const { data: entries, error } = await supabase
    .from("entries")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load entries for streaks:", error);
  }

  const createdAts: string[] = (entries ?? []).map((e: { created_at: string }) => e.created_at);

  // Helper: day string in user's timezone (YYYY-MM-DD)
  const dayStrTZ = (d: Date, tz: string) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d); // en-CA yields YYYY-MM-DD

  // Build set of unique days (in user's timezone) with at least one entry
  const uniqueDays = new Set<string>();
  for (const ts of createdAts) {
    const d = new Date(ts);
    uniqueDays.add(dayStrTZ(d, userTz));
  }

  // Compute totals and quotas
  const total_entries = createdAts.length;
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const entriesLast24h = createdAts.filter((ts: string) => new Date(ts) > twentyFourHoursAgo).length;
  const dailyLimit = 2;
  const entriesRemaining = Math.max(0, dailyLimit - entriesLast24h);

  // Current streak (calendar days in user's timezone)
  const todayStr = dayStrTZ(now, userTz);
  // Create a "cursor" representing midnight of today in user's timezone by parsing the string
  // This avoids bringing in a heavy tz lib. We reconstruct Date from the formatted string.
  const [y, m, d] = todayStr.split("-").map(Number);
  // Interpret as UTC midnight to progress in whole-day steps independent of local offset
  const cursor = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  let current_streak = 0;
  if (!uniqueDays.has(todayStr)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (true) {
    const key = dayStrTZ(cursor, userTz);
    if (!uniqueDays.has(key)) break;
    current_streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  // Longest streak across all days (in user's timezone day-units)
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

  const streakData = {
    current_streak,
    longest_streak,
    total_entries,
  } as const;

  // Cooldown calculation for 2-per-24h quota
  let cooldownHours = 0;
  if (entriesLast24h >= dailyLimit) {
    // Find the oldest entry within the last 24h window
    const cutoff = twentyFourHoursAgo.getTime();
    const datesDesc = createdAts
      .map((ts) => new Date(ts).getTime())
      .filter((t) => t > cutoff)
      .sort((a, b) => b - a); // newest -> oldest
    const oldestInWindow = datesDesc[datesDesc.length - 1];
    if (oldestInWindow) {
      const remainingMs = 24 * 60 * 60 * 1000 - (now.getTime() - oldestInWindow);
      cooldownHours = Math.max(0, Math.ceil(remainingMs / (60 * 60 * 1000)));
    }
  }

  return (
    <JournalInterface
      userEmail={userEmail}
      entriesRemaining={entriesRemaining}
      streakData={streakData}
      cooldownHours={cooldownHours}
    />
  );
}
