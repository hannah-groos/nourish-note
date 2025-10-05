"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/supa_components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/supa_components/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Flame, BookOpen, UserCircle, Menu } from "lucide-react";

interface JournalInterfaceProps {
  userEmail: string;
  entriesRemaining: number;
  streakData: {
    current_streak: number;
    longest_streak: number;
    total_entries: number;
  } | null;
  cooldownHours?: number;
}

export default function JournalInterface({
  userEmail,
  entriesRemaining,
  streakData,
  cooldownHours,
}: JournalInterfaceProps) {
  const [content, setContent] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [lastSubmitted, setLastSubmitted] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [hasExtended, setHasExtended] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  // NEW: helpers to attach the journal text to chat prompts
  const journalBlock = lastSubmitted ? `\n\nJournal entry (verbatim):\n"""${lastSubmitted}"""`: "";

  const tinyHabitPrefill = `Help me craft a 1-minute daily habit based on today’s journal. ` + `Suggest 1 tiny action and a supportive reminder.` + journalBlock;

  const reflectPrefill = `What patterns or triggers should I watch for based on my recent journal? ` + `Offer 2 gentle suggestions.` + journalBlock;


  // Success message persists until dismissed by user

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const isOverLimit = wordCount > 400;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      // Hard stop: clamp and freeze
      if (timeLeft !== 0) setTimeLeft(0);
      if (isActive) setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const startTimer = () => {
    setIsActive(true);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const extendTimer = () => {
    setTimeLeft(30);
    setHasExtended(true);
    setIsActive(true);
  };

  const handleSubmit = async () => {
    if (isOverLimit) {
      setError("Please reduce your entry to 400 words or less");
      return;
    }

    if (wordCount === 0) {
      setError("Please write something before submitting");
      return;
    }

    if (entriesRemaining <= 0) {
      const hours =
        typeof cooldownHours === "number" && cooldownHours > 0
          ? cooldownHours
          : undefined;
      setError(
        hours
          ? `You've reached your limit of 2 entries per 24 hours. Please come back in ${hours} hour${
              hours === 1 ? "" : "s"
            }.`
          : "You've reached your limit of 2 entries per 24 hours"
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Send raw content to our API which calls actions/entries.ts -> insertEntry
      const entryText = content.trim(); // <-- NEW
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawJournalText: entryText }),
      });

      const json = await res.json();
      if (!res.ok || json?.error) {
        setError(
          typeof json?.error === "string" ? json.error : "Failed to save entry"
        );
        throw new Error(
          typeof json?.error === "string" ? json.error : "Failed to save entry"
        );
      }

      setLastSubmitted(entryText);

      setSuccess(true);
      setContent("");
      setTimeLeft(60);
      setIsActive(false);
      setHasExtended(false);

      // Refresh to update streaks and counters immediately
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // When full 90s cycle is complete (60s + 30s extension), freeze editor
  const isFrozen = !isActive && timeLeft === 0 && hasExtended;

  const canEdit = isActive && timeLeft > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50">
      {/* Integrated Navigation Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-teal-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            {/* Left: Logo + Current Page */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/"
                className="text-xl font-bold text-teal-900 hover:text-teal-700 transition-colors"
              >
                NourishNote
              </Link>
              <div className="hidden sm:block w-px h-6 bg-teal-200"></div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-md shadow-teal-200">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-teal-900">
                    Journal
                  </h1>
                  <p className="text-xs text-teal-600 hidden sm:block">
                    Daily reflection space
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Navigation + User */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-1 sm:gap-2">
                <span className="px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg">
                  Journal
                </span>
                <Link
                  href="/chat"
                  className="px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                >
                  Chat
                </Link>
                <Link
                  href="/entries"
                  className="px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                >
                  Entries
                </Link>
              </div>

              {/* User Menu */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-teal-700 hover:text-teal-900 px-1"
                  aria-label="Profile (click to sign out)"
                >
                  <UserCircle className="h-5 w-5" />
                </Button>
                <span className="text-sm text-teal-700 truncate max-w-[150px] sm:max-w-none">
                  {userEmail}
                </span>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-teal-100 bg-white/95 backdrop-blur-sm">
              <div className="px-4 py-3 space-y-1">
                <span className="block px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg">
                  Journal
                </span>
                <Link
                  href="/chat"
                  className="block px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Chat
                </Link>
                <Link
                  href="/entries"
                  className="block px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entries
                </Link>
                <div className="border-t border-teal-100 pt-2 mt-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="text-teal-700 hover:text-teal-900 px-1"
                      aria-label="Profile (click to sign out)"
                    >
                      <UserCircle className="h-5 w-5" />
                    </Button>
                    <span className="text-sm text-teal-700 truncate">
                      {userEmail}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-4xl">
        {/* Stats Bar (match /entries gradients) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Current Streak */}
          <Card className="border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-xl shadow-teal-200/50 sm:col-span-1 lg:col-span-1">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                  <Flame className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-teal-50 font-medium">
                    Current Streak
                  </p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {streakData?.current_streak || 0}
                  </p>
                  <p className="text-xs text-teal-100">days in a row</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Longest Streak */}
          <Card className="border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-200/50 sm:col-span-1 lg:col-span-1">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-amber-50 font-medium">
                    Longest Streak
                  </p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {streakData?.longest_streak || 0}
                  </p>
                  <p className="text-xs text-amber-100">days achieved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Entries */}
          <Card className="border-0 bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-xl shadow-teal-200/50 sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-teal-50 font-medium">
                    Total Entries
                  </p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {streakData?.total_entries || 0}
                  </p>
                  <p className="text-xs text-teal-100">reflections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Journal Card */}
        <Card className="border-teal-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-teal-900">
              How are you feeling?
            </CardTitle>
            <CardDescription className="text-teal-600">
              Take a moment to reflect. You have {entriesRemaining}{" "}
              {entriesRemaining === 1 ? "entry" : "entries"} remaining today.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timer Display */}
            {!isActive && timeLeft === 60 && !success && (
              <div className="text-center py-6 sm:py-8">
                <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-teal-100 mb-4">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-900">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-teal-700 mb-4 px-4">
                  Ready to begin? You&apos;ll have 60 seconds to write.
                </p>
                <Button
                  onClick={startTimer}
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={entriesRemaining <= 0}
                >
                  Start Writing
                </Button>
                {entriesRemaining <= 0 && (
                  <p className="text-xs sm:text-sm text-amber-700 mt-2 px-4">
                    {typeof cooldownHours === "number" && cooldownHours > 0
                      ? `You\'ve reached your daily limit. Please come back in ${cooldownHours} hour${
                          cooldownHours === 1 ? "" : "s"
                        }.`
                      : `You\'ve reached your daily limit. Come back tomorrow!`}
                  </p>
                )}
              </div>
            )}

            {/* Active Timer */}
            {isActive && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-teal-700" />
                    <span className="text-xl sm:text-2xl font-bold text-teal-900">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-teal-700">
                    {wordCount} / 400 words{" "}
                    {isOverLimit && (
                      <span className="text-red-600">(over limit)</span>
                    )}
                  </div>
                </div>
                <Progress
                  value={(timeLeft / (hasExtended ? 30 : 60)) * 100}
                  className="h-2"
                />
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    if (!canEdit) return;
                    setContent(e.target.value);
                  }}
                  readOnly={!canEdit}
                  disabled={!canEdit}
                  placeholder="Write freely about your thoughts and feelings..."
                  className={`min-h-[250px] sm:min-h-[300px] resize-none border-teal-200 focus:border-teal-400 ${
                    !canEdit
                      ? "opacity-80 cursor-not-allowed pointer-events-none"
                      : ""
                  }`}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={isSubmitting || isOverLimit || wordCount === 0}
                  >
                    {isSubmitting ? "Saving..." : "Submit now"}
                  </Button>
                </div>
              </div>
            )}

            {/* Timer Ended - Extension Offer */}
            {!isActive && timeLeft === 0 && !hasExtended && !success && (
              <div className="text-center py-6 sm:py-8 px-4">
                <p className="text-sm sm:text-base text-teal-900 font-semibold mb-4">
                  Time&apos;s up! Would you like 30 more seconds?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button
                    onClick={extendTimer}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Yes, extend time
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="outline"
                    disabled={isSubmitting || isOverLimit}
                  >
                    {isSubmitting ? "Saving..." : "Submit now"}
                  </Button>
                </div>
              </div>
            )}

            {/* Extended Timer Ended (freeze editor) */}
            {isFrozen && !success && (
              <div className="space-y-3 sm:space-y-4 text-center py-6 sm:py-8 px-4">
                <p className="text-sm sm:text-base text-teal-900 font-semibold">
                  Time to wrap up your thoughts.
                </p>
                <Textarea
                  value={content}
                  readOnly
                  placeholder="Your final entry"
                  className="min-h-[250px] sm:min-h-[300px] resize-none border-teal-200 bg-teal-50/60 text-teal-900 opacity-80 cursor-not-allowed"
                />
                <div className="flex justify-center">
                  <Button
                    onClick={handleSubmit}
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={isSubmitting || isOverLimit}
                  >
                    {isSubmitting ? "Saving..." : "Submit Entry"}
                  </Button>
                </div>
              </div>
            )}


            {/* Success Message */}
            {success && (
              <div className="text-center py-6 sm:py-8 space-y-4 px-4">
                {/* Celebration */}
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-teal-100 to-amber-100 flex items-center justify-center shadow-sm">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-teal-900 font-semibold text-lg">
                    Nice work—entry saved!
                  </p>
                  <p className="text-sm text-teal-700">
                    Want to turn today’s reflection into a tiny habit with Alia?
                  </p>
                </div>

                {/* CTAs to Chat with prefilled prompts */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <Button asChild className="bg-teal-600 hover:bg-teal-700">
                    <Link
                      href={{
                        pathname: "/chat",
                        query: { prefill: tinyHabitPrefill, autosend: "1" },
                    }}
                      aria-label="Ask Alia for a tiny habit"
                    >
                      Ask Alia for a tiny habit
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-amber-200 text-amber-800 hover:bg-amber-50"
                  >
                    <Link
                      href={{
                        pathname: "/chat",
                        query: { prefill: reflectPrefill },
                      }}
                      aria-label="Reflect with Alia"
                    >
                      Reflect with Alia
                    </Link>
                  </Button>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setSuccess(false)}
                    variant="ghost"
                    className="text-teal-700 hover:bg-teal-50"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
