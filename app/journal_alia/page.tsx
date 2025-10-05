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

  // TODO: Replace placeholders with real queries from your DB
  const userEmail = user.email ?? "";
  const entriesRemaining = 2; // placeholder
  const streakData = {
    current_streak: 0,
    longest_streak: 0,
    total_entries: 0,
  } as const;

  return (
    <JournalInterface
      userId={user.id}
      userEmail={userEmail}
      entriesRemaining={entriesRemaining}
      streakData={streakData}
    />
  );
}
