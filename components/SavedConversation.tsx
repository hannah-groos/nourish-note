"use client";

import { useEffect, useState } from 'react';
import conversationStore from '@/lib/conversation';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function SavedConversation({ threadId }: { threadId?: string }) {
  const [saved, setSaved] = useState<Msg[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Helper: load saved messages and return them so callers can act on the value
  function loadSaved(): Msg[] | null {
    // Try in-memory store first
    const fromStore = conversationStore.getSavedConversation();
    if (fromStore && fromStore.length) {
      setSaved(fromStore);
      return fromStore;
    }

    // Next, try per-thread key
    try {
      if (threadId && typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(`chat.saved.${threadId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as Msg[];
          setSaved(parsed);
          return parsed;
        }
      }
      // Fall back to global saved key
      const globalRaw = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('saved.chat.thread') : null;
      if (globalRaw) {
        const parsed = JSON.parse(globalRaw) as Msg[];
        setSaved(parsed);
        return parsed;
      }
    } catch {
      setSaved(null);
    }

    setSaved(null);
    return null;
  }

  useEffect(() => {
    // Load saved messages and request a summary when available
    const found = loadSaved();
    if (found && found.length && threadId) {
      void fetchSummary(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  async function fetchSummary(messages: Msg[]) {
    if (!messages || messages.length === 0 || !threadId) return;
    setIsSummarizing(true);
    setSummary(null);
    try {
      console.log('fetchSummary() threadId=', threadId, 'messages=', messages.length);
      const res = await fetch('/api/chat/summarize', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ threadId, messages }),
      });

      const data = await res.json();
      console.log('summarize response', res.status, data);

      if (!res.ok) {
        setSummary(`Summary failed: ${data?.error ?? res.statusText} — raw: ${JSON.stringify(data)}`);
        return;
      }

      const s = data?.summary ?? null;
      let formatted: string | null = null;

      // If API returned a top-level field with a different name, fall back to raw
      if (!s && data && typeof data === 'object') {
        // show whole response object as fallback for debugging
        formatted = JSON.stringify(data, null, 2);
      } else if (s && typeof s === 'object') {
        // Try common keys used by summarizeConversation
        const parts: string[] = [];
        const obj = s as Record<string, unknown>;
        const userGoal = obj['user_goal'];
        if (userGoal) parts.push(`Goal: ${String(userGoal)}`);

        const keyPoints = obj['key_points'];
        if (Array.isArray(keyPoints) && keyPoints.length) parts.push(`Key points:\n- ${(keyPoints as string[]).join('\n- ')}`);

        const patterns = obj['patterns'];
        if (Array.isArray(patterns) && patterns.length) parts.push(`Patterns:\n- ${(patterns as string[]).join('\n- ')}`);

        const nextSteps = obj['suggested_next_steps'];
        if (Array.isArray(nextSteps) && nextSteps.length) parts.push(`Next steps:\n- ${(nextSteps as string[]).join('\n- ')}`);

        if (parts.length) {
          formatted = parts.join('\n\n');
        } else {
          formatted = JSON.stringify(s, null, 2);
        }
      } else if (s && typeof s === 'string') {
        formatted = s;
      } else if (s && typeof s === 'object' && 'raw' in (s as Record<string, unknown>)) {
        formatted = String((s as Record<string, unknown>)['raw']);
      }

      setSummary(formatted ?? 'No summary produced.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('fetchSummary error', e);
      setSummary(`Summary failed: ${msg ?? 'unknown'}`);
    } finally {
      setIsSummarizing(false);
    }
  }

  if (!saved) {
    return (
      <div className="rounded-md bg-white border p-3 text-sm text-gray-600">No saved conversation found.</div>
    );
  }

  return (
    <div className="rounded-md bg-white border p-3">
      <div className="flex items-center justify-between mb-2">
        <strong className="text-sm text-teal-800">Saved conversation</strong>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const found = loadSaved();
              if (found && found.length && threadId) void fetchSummary(found);
            }}
            className="text-xs text-teal-700 hover:underline bg-transparent border-0 p-0"
          >
            Refresh
          </button>
        </div>
      </div>

      {isSummarizing ? (
        <div className="text-xs text-gray-500 mb-2">Summarizing…</div>
      ) : summary ? (
        <div className="mb-2 p-2 rounded bg-teal-50 text-teal-900 whitespace-pre-wrap text-sm">{summary}</div>
      ) : null}

      <div className="space-y-2 max-h-56 overflow-y-auto">
        {saved.map((m, i) => (
          <div key={i} className={`p-2 rounded ${m.role === 'user' ? 'bg-teal-50 text-teal-900' : 'bg-gray-50 text-gray-900'}`}>
            <small className="text-xs text-gray-500">{m.role}</small>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
