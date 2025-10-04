// app/chat/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

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
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs]);

  async function send() {
    const text = input.trim();
    if (!text || !threadId) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ threadId, message: text }),
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
    } catch (e: any) {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: `⚠️ ${e?.message ?? "Unknown error"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: "2rem auto", padding: 16 }}>
      <h1 style={{ marginBottom: 4 }}>Gemini + LangGraph Chat</h1>

      <div style={{ marginBottom: 8, color: "#666", fontSize: 12 }}>
        thread: {mounted && threadId ? `${threadId.slice(0, 8)}…` : "—"}
      </div>

      <div
        ref={listRef}
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          minHeight: 320,
          height: 420,
          overflowY: "auto",
          background: "#fff",
        }}
      >
        {msgs.length === 0 && (
          <div style={{ color: "#888" }}>Say hi to start…</div>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.role === "user" ? "right" : "left",
              margin: "8px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: m.role === "user" ? "#eef6ff" : "#f6f6f6",
                borderRadius: 12,
                padding: "8px 12px",
                maxWidth: "80%",
                whiteSpace: "pre-wrap",
              }}
            >
              <small style={{ color: "#888", marginRight: 6 }}>{m.role}</small>
              {m.content}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message… (Cmd/Ctrl+Enter to send)"
          style={{ flex: 1, height: 96, padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
          disabled={!threadId || loading}
        />
        <button
          onClick={send}
          disabled={!threadId || loading || !input.trim()}
          style={{
            width: 110,
            borderRadius: 8,
            background: "#111",
            color: "#fff",
            opacity: !threadId || loading || !input.trim() ? 0.6 : 1,
          }}
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => {
            if (!mounted) return;
            localStorage.removeItem("chat.threadId");
            const newId = uuidv4();
            localStorage.setItem("chat.threadId", newId);
            setThreadId(newId);
            setMsgs([]);
          }}
          style={{ fontSize: 12, color: "#555", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
        >
          Reset conversation
        </button>
      </div>
    </div>
  );
}
