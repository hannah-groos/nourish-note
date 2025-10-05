"use client";

import type React from "react";

import MoodEntry from "@/components/MoodEntry";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, X, MessageSquarePlus, Send, Menu, UserCircle } from "lucide-react";
import conversationStore, { type ThreadMsg } from "@/lib/conversation";
import SavedConversation from "@/components/SavedConversation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/supa_components/button";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const router = useRouter();

  function handleSaveConversation() {
    conversationStore.saveConversation(msgs as ThreadMsg[]);
    try {
      if (typeof window !== "undefined" && window.localStorage && threadId) {
        window.localStorage.setItem(
          `chat.saved.${threadId}`,
          JSON.stringify(msgs)
        );
      }
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  useEffect(() => {
    setMounted(true);
    try {
      const key = "chat.threadId";
      const existing = localStorage.getItem(key);
      const id = existing ?? uuidv4();
      localStorage.setItem(key, id);
      setThreadId(id);
    } catch {
      setThreadId(uuidv4());
    }

    // Get user information
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const prefill = url.searchParams.get("prefill");
    const autosend = url.searchParams.get("autosend");
    if (prefill) {
      setInput(prefill);
      if (autosend === "1") {
        setTimeout(() => {
          void sendText(prefill);
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs]);

  async function sendText(text: string) {
    const message = text.trim();
    if (!message || !threadId) return;

    setInput("");
    setMsgs((m) => [...m, { role: "user", content: message }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ threadId, message }),
      });

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const raw = await res.text();
        throw new Error(`Server returned non-JSON: ${raw.slice(0, 200)}`);
      }

      const data = (await res.json()) as { reply?: string; error?: string };
      if (data.error) throw new Error(data.error);
      setMsgs((m) => [...m, { role: "assistant", content: data.reply ?? "" }]);
    } catch (e) {
      const err = e as Error | undefined;
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: `⚠️ ${err?.message ?? "Unknown error"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    await sendText(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const [showMoodBox, setShowMoodBox] = useState(true);

  function startFromPrompt(text: string) {
    const prefixed = `reflection question: ${text}`;
    setInput(prefixed);
    setTimeout(() => inputRef.current?.focus(), 0);
    setShowMoodBox(false);
  }

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-amber-50/50">
      {/* Integrated Navigation Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-teal-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-7xl">
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
                <div className="relative p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 shadow-md shadow-teal-500/30">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-teal-900">
                    Chat with Alia
                  </h1>
                  <p className="text-xs text-teal-600 hidden sm:block">
                    AI companion for emotional support
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Navigation + User */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-1 sm:gap-2">
                <Link
                  href="/journal_alia"
                  className="px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                >
                  Journal
                </Link>
                <span className="px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg">
                  Chat
                </span>
                <Link
                  href="/entries"
                  className="px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                >
                  Entries
                </Link>
              </div>

              {/* User Menu */}
              {userEmail && (
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
              )}

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
                <Link
                  href="/journal_alia"
                  className="block px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Journal
                </Link>
                <span className="block px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg">
                  Chat
                </span>
                <Link
                  href="/entries"
                  className="block px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entries
                </Link>
                {userEmail && (
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
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <aside className="w-full lg:w-80 xl:w-96 rounded-2xl bg-white border-2 border-teal-100 p-4 sm:p-6 shadow-xl shadow-teal-100/50 max-h-[400px] lg:max-h-[calc(100vh-12rem)] overflow-y-auto order-2 lg:order-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-teal-900">Conversations</h2>
              <button
                onClick={() => {
                  if (!mounted) return;
                  localStorage.removeItem("chat.threadId");
                  const newId = uuidv4();
                  localStorage.setItem("chat.threadId", newId);
                  setThreadId(newId);
                  setMsgs([]);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                + New Chat
              </button>
            </div>

            <ul className="space-y-3">
              <li className="cursor-pointer rounded-xl px-4 py-4 hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100/50 transition-all border-2 border-transparent hover:border-teal-200 hover:shadow-md group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-teal-900 group-hover:text-teal-700">
                    Daily check-in
                  </span>
                  <span className="text-xs text-teal-500 bg-teal-50 px-2 py-1 rounded-full">
                    2h ago
                  </span>
                </div>
                <p className="text-xs text-teal-600 truncate">
                  Feeling better today
                </p>
              </li>
              <li className="cursor-pointer rounded-xl px-4 py-4 hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100/50 transition-all border-2 border-transparent hover:border-teal-200 hover:shadow-md group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-teal-900 group-hover:text-teal-700">
                    Food journal review
                  </span>
                  <span className="text-xs text-teal-500 bg-teal-50 px-2 py-1 rounded-full">
                    1d ago
                  </span>
                </div>
                <p className="text-xs text-teal-600 truncate">
                  I ate out and felt guilty
                </p>
              </li>
            </ul>
          </aside>

          <section className="flex-1 font-sans order-1 lg:order-2">
            {!showMoodBox && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowMoodBox(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white border-2 border-teal-200 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-teal-100/50 hover:bg-teal-50 hover:border-teal-300 transition-all hover:shadow-xl"
                  aria-label="Open reflection prompts"
                >
                  <MessageSquarePlus className="h-5 w-5 text-teal-600" />
                  <span className="text-teal-700">Open Reflection Prompts</span>
                </button>
              </div>
            )}

            <div
              ref={listRef}
              className="rounded-2xl border-2 border-teal-100 p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[500px] lg:min-h-[32rem] h-[400px] sm:h-[500px] lg:h-[32rem] overflow-y-auto bg-gradient-to-b from-white via-teal-50/20 to-teal-50/40 shadow-xl shadow-teal-100/50 backdrop-blur-sm"
            >
              {msgs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="relative p-6 rounded-3xl bg-gradient-to-br from-teal-100 via-teal-200 to-teal-300 mb-6 shadow-lg">
                    <Sparkles className="h-12 w-12 text-teal-700" />
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-teal-900 mb-3">
                    Welcome to Alia
                  </h3>
                  <p className="text-base text-teal-600 max-w-md leading-relaxed">
                    I&apos;m here to support you on your journey. Pick a mood to get
                    started, or just say hello!
                  </p>
                </div>
              )}

              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`my-5 flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-teal-500/40 ring-2 ring-white">
                      A
                    </div>
                  )}
                  <div className="flex flex-col gap-2 max-w-[75%]">
                    <span
                      className={`text-xs font-bold tracking-wide ${
                        m.role === "user"
                          ? "text-right text-amber-700"
                          : "text-left text-teal-700"
                      }`}
                    >
                      {m.role === "user" ? "You" : "Alia"}
                    </span>
                    <div
                      className={`inline-block rounded-2xl px-5 py-4 whitespace-pre-wrap shadow-lg leading-relaxed ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-tr-md shadow-amber-500/40"
                          : "bg-white text-gray-800 border-2 border-teal-100 rounded-tl-md shadow-teal-100/50"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                  {m.role === "user" && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-amber-500/40 ring-2 ring-white">
                      Y
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="my-5 flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-teal-500/40 ring-2 ring-white">
                    A
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold tracking-wide text-teal-700">
                      Alia
                    </span>
                    <div className="bg-white border-2 border-teal-100 rounded-2xl rounded-tl-md px-6 py-4 shadow-lg shadow-teal-100/50">
                      <div className="flex gap-1.5">
                        <div
                          className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce shadow-sm"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce shadow-sm"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce shadow-sm"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-6 bg-white rounded-2xl border-2 border-teal-100 p-4 sm:p-5 shadow-xl shadow-teal-100/50">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
                  className="flex-1 h-20 sm:h-24 p-3 sm:p-4 rounded-xl border-2 border-teal-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-800 placeholder:text-teal-400"
                  disabled={!threadId || loading}
                />
                <button
                  onClick={send}
                  disabled={!threadId || loading || !input.trim()}
                  className={`px-6 sm:px-8 py-3 sm:py-0 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg min-h-[48px] ${
                    !threadId || loading || !input.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 hover:from-teal-700 hover:via-teal-800 hover:to-teal-900 shadow-teal-500/40 hover:shadow-xl hover:shadow-teal-500/50 hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Sending</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  if (!mounted) return;
                  localStorage.removeItem("chat.threadId");
                  const newId = uuidv4();
                  localStorage.setItem("chat.threadId", newId);
                  setThreadId(newId);
                  setMsgs([]);
                }}
                className="text-sm font-semibold text-teal-700 hover:text-teal-900 underline decoration-2 underline-offset-4 hover:decoration-teal-900 transition-all"
              >
                Reset conversation
              </button>

              <button
                onClick={handleSaveConversation}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all hover:scale-105"
                aria-label="Save conversation"
              >
                {saved ? "✓ Saved!" : "Save Conversation"}
              </button>

              <button
                onClick={() => setShowSaved((s) => !s)}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold text-teal-700 bg-white border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all shadow-md hover:shadow-lg"
              >
                {showSaved ? "Hide Saved" : "View Saved"}
              </button>

              <div className="text-xs font-semibold text-teal-600 ml-auto bg-teal-50 px-3 py-1.5 rounded-lg">
                Thread:{" "}
                {mounted && threadId ? `${threadId.slice(0, 8)}...` : "—"}
              </div>
            </div>

            {showSaved && (
              <div className="mt-5 p-5 bg-white rounded-2xl border-2 border-teal-100 shadow-xl shadow-teal-100/50 animate-in fade-in slide-in-from-top-2 duration-500">
                <SavedConversation threadId={threadId} />
              </div>
            )}
          </section>

          {showMoodBox && (
            <aside className="w-full lg:w-80 xl:w-96 rounded-2xl bg-white border-2 border-teal-100 p-4 sm:p-6 shadow-xl shadow-teal-100/50 order-3">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-teal-900">
                  How are you feeling?
                </h3>
                <button
                  onClick={() => setShowMoodBox(false)}
                  className="p-2 rounded-xl text-gray-500 hover:bg-teal-50 hover:text-teal-700 transition-all hover:shadow-md"
                  aria-label="Close prompts"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <MoodEntry
                onStartConversation={startFromPrompt}
                onSelectEmotion={() => {}}
                className="!max-w-none"
              />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
