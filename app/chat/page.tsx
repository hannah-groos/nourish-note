// app/chat/page.tsx
"use client";

import MoodEntry from "@/components/MoodEntry";

import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { Sparkles, X, MessageSquarePlus } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
    const [msgs, setMsgs] = useState<Msg[]>([]);
    const [input, setInput] = useState("");
    const [threadId, setThreadId] = useState<string>(""); // set after mount
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Acquire a stable threadId ONLY after mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
        try {
            const key = "chat.threadId";
            const existing = localStorage.getItem(key);
            const id = existing ?? uuidv4();
            localStorage.setItem(key, id);
            setThreadId(id);
        } catch {
            // localStorage unavailable (very rare); fall back to ephemeral id
            setThreadId(uuidv4());
        }
    }, []);

    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }, [msgs]);

    // Helper: send an arbitrary string (used by both the button and hotkey)
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

            // Guard against HTML error pages (avoids Unexpected token '<')
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
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            void send();
        }
    }

        const [showMoodBox, setShowMoodBox] = useState(true);

        // Called by MoodEntry when a suggestion is clicked.
        // Prefills the input (with a reflection prefix), focuses it, and collapses the mood box.
        function startFromPrompt(text: string) {
            const prefixed = `reflection question: ${text}`;
            setInput(prefixed);
            // Focus after state update flush
            setTimeout(() => inputRef.current?.focus(), 0);
            setShowMoodBox(false);
        }

    return (
        <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-teal-600" />
                        <h1 className="text-2xl font-bold text-teal-900">Chat with Alia</h1>
                        <p className="text-sm text-teal-600">Your AI companion for mindful eating</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/journal_alia" className="text-sm text-teal-700 hover:text-teal-900">
                            Back to Journal
                        </Link>
                    </div>
                </div>

                        <div className={showMoodBox ? 'grid grid-cols-1 lg:grid-cols-6 gap-6' : 'grid grid-cols-1 lg:grid-cols-5 gap-6'}>
                    {/* Sidebar */}
                            <aside className="col-span-1 rounded-lg bg-white border border-teal-100 p-4 shadow-sm max-h-[70vh] overflow-y-auto">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-teal-800">Conversations</h2>
                            <Link href="/chat/new" className="text-xs text-teal-600 hover:underline">
                                New
                            </Link>
                        </div>

                        <ul className="space-y-2">
                            {/* Placeholder conversation items for future enhancements */}
                            <li className={`cursor-pointer rounded-md px-3 py-2 hover:bg-teal-50/70`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-teal-900">Daily check-in</span>
                                    <span className="text-xs text-teal-600">·</span>
                                </div>
                                <p className="text-xs text-teal-600 truncate">Feeling better today</p>
                            </li>
                            <li className={`cursor-pointer rounded-md px-3 py-2 hover:bg-teal-50/70`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-teal-900">Food journal review</span>
                                    <span className="text-xs text-teal-600">·</span>
                                </div>
                                <p className="text-xs text-teal-600 truncate">I ate out and felt guilty</p>
                            </li>
                        </ul>
                    </aside>

                                {/* Main chat area */}
                                  <section className={showMoodBox ? 'col-span-1 lg:col-span-3 font-sans' : 'col-span-1 lg:col-span-4 font-sans'}>
                                    {/* When collapsed, show a small opener control near chat (now inside main area so grid can expand) */}
                                    {!showMoodBox && (
                                        <div className="mb-4 flex justify-end">
                                            <button
                                                onClick={() => setShowMoodBox(true)}
                                                className="inline-flex items-center gap-2 rounded-md bg-white border px-3 py-1 text-sm shadow-sm hover:bg-teal-50"
                                                aria-label="Open reflection prompts"
                                            >
                                                <MessageSquarePlus className="h-4 w-4 text-teal-600" />
                                                <span className="text-teal-700">Open prompts</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Chat area */}

                        <div
                            ref={listRef}
                            className="rounded-lg border border-gray-200 p-4 min-h-[20rem] h-[26rem] overflow-y-auto bg-white"
                        >
                            {msgs.length === 0 && (
                                <div className="text-gray-500">Pick a mood to get relevant prompts or say hi to start…</div>
                            )}

                            {msgs.map((m, i) => (
                                <div
                                    key={i}
                                    className={`my-3 flex ${m.role === "user" ? 'justify-end' : 'justify-start'}`}
                                >
                                                        <div
                                                            className={`inline-block rounded-xl px-4 py-2 max-w-[80%] whitespace-pre-wrap ${
                                                                m.role === 'user' ? 'bg-teal-50 text-teal-900' : 'bg-gray-50 text-gray-900'
                                                            } font-sans`}
                                                        >
                                        <small className="text-xs text-gray-500 mr-2">{m.role}</small>
                                        <div>{m.content}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-4">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder="Type a message… (Cmd/Ctrl+Enter to send)"
                                className="flex-1 h-24 p-3 rounded-md border border-gray-200 resize-none"
                                disabled={!threadId || loading}
                            />
                            <button
                                onClick={send}
                                disabled={!threadId || loading || !input.trim()}
                                className={`w-28 rounded-lg text-white ${!threadId || loading || !input.trim() ? 'bg-gray-400' : 'bg-teal-700 hover:bg-teal-800'}`}
                            >
                                {loading ? 'Sending…' : 'Send'}
                            </button>
                        </div>

                        <div className="mt-3">
                            <button
                                onClick={() => {
                                    if (!mounted) return;
                                    localStorage.removeItem("chat.threadId");
                                    const newId = uuidv4();
                                    localStorage.setItem("chat.threadId", newId);
                                    setThreadId(newId);
                                    setMsgs([]);
                                }}
                                className="text-xs text-gray-600 underline bg-transparent border-0 p-0"
                            >
                                Reset conversation
                            </button>
                            <div className="text-xs text-gray-500 mt-1">thread: {mounted && threadId ? `${threadId.slice(0, 8)}…` : '—'}</div>
                        </div>
                                </section>

                                {/* Mood box on the right for larger screens (only rendered when visible) */}
                                {showMoodBox && (
                                    <aside className="col-span-1 lg:col-span-2">
                                        <div className="rounded-lg bg-white border border-teal-100 p-4 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-semibold text-teal-800">How are you feeling?</h3>
                                                <button
                                                    onClick={() => setShowMoodBox(false)}
                                                    className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                                                    aria-label="Close prompts"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <MoodEntry
                                                onStartConversation={startFromPrompt}
                                                onSelectEmotion={() => {
                                                    // optional: analytics hook
                                                }}
                                                className="!max-w-none"
                                            />
                                        </div>
                                    </aside>
                                )}
                </div>
            </div>
        </main>
    );
}