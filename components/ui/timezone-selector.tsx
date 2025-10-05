"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Utility to get a list of IANA time zones.
// IMPORTANT: To avoid hydration mismatches, SSR should always render the same initial list.
// We therefore return a stable fallback here, and upgrade to the full Intl list after mount.
function getTimeZones(): string[] {
  return [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Asia/Singapore",
    "Australia/Sydney",
  ];
}

export default function TimezoneSelector() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>("UTC");
  const [timezones, setTimezones] = useState<string[]>(getTimeZones());

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const uid = authData.user?.id ?? null;
        if (!isMounted) return;
        setUserId(uid);
        if (!uid) {
          setLoading(false);
          return;
        }
        // Load existing timezone
        const { data, error } = await supabase
          .from("profiles")
          .select("timezone")
          .eq("user_id", uid)
          .maybeSingle();
        if (!isMounted) return;
        if (!error && data?.timezone) {
          setTimezone(data.timezone);
        }
        // After mount, attempt to upgrade to the full Intl-supported time zone list (client-only)
        // This preserves identical initial SSR/CSR markup, preventing hydration mismatch.
        // @ts-ignore stage-3 API in modern browsers
        const supported = typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function"
          ? // @ts-ignore
            (Intl.supportedValuesOf("timeZone") as string[])
          : null;
        if (supported && supported.length > 0) {
          setTimezones(supported);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const handleChange = async (tz: string) => {
    setTimezone(tz);
    if (!userId) return; // if not logged in, do nothing
    await supabase
      .from("profiles")
      .upsert({ user_id: userId, timezone: tz }, { onConflict: "user_id" });
  };

  // Styling: compact, inline with label, custom chevron, teal accent
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm font-medium text-[var(--teal-900)] dark:text-[var(--teal-100)]">Time Zone</span>
      <div className="relative">
        <select
          disabled={loading || !userId}
          value={timezone}
          onChange={(e) => handleChange(e.target.value)}
          className="appearance-none min-w-52 rounded-md border border-[var(--teal-300)] dark:border-[var(--teal-800)] bg-white dark:bg-[var(--teal-950)] pr-9 pl-3 py-2 text-sm text-[var(--teal-900)] dark:text-[var(--teal-100)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal-400)] hover:bg-[var(--teal-50)] dark:hover:bg-[var(--teal-900)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          aria-label="Select time zone"
          title={userId ? undefined : "Sign in to set your time zone"}
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz} className="bg-white dark:bg-[var(--teal-950)]">
              {tz}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--teal-600)]"
        >
          <path fill="currentColor" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.06l3.71-2.83a.75.75 0 1 1 .92 1.18l-4.17 3.18a.75.75 0 0 1-.92 0L5.21 8.41a.75.75 0 0 1 .02-1.2Z" />
        </svg>
      </div>
    </div>
  );
}
