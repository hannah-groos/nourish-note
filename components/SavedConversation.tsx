"use client";

import { useEffect, useState } from 'react';
import conversationStore from '@/lib/conversation';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function SavedConversation({ threadId }: { threadId?: string }) {
  const [saved, setSaved] = useState<Msg[] | null>(null);

  function loadSaved() {
    // Try in-memory store first
    const fromStore = conversationStore.getSavedConversation();
    if (fromStore && fromStore.length) {
      setSaved(fromStore);
      return;
    }

    // Next, try per-thread key
    try {
      if (threadId && typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(`chat.saved.${threadId}`);
        if (raw) {
          setSaved(JSON.parse(raw));
          return;
        }
      }
      // Fall back to global saved key
      const globalRaw = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('saved.chat.thread') : null;
      if (globalRaw) {
        setSaved(JSON.parse(globalRaw));
        return;
      }
    } catch {
      setSaved(null);
    }

    setSaved(null);
  }

  useEffect(() => {
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

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
            onClick={() => loadSaved()}
            className="text-xs text-teal-700 hover:underline bg-transparent border-0 p-0"
          >
            Refresh
          </button>
        </div>
      </div>

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
