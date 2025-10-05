// lib/conversation.ts
// Simple conversation store used by the chat UI. Keeps an in-memory value
// and persists to localStorage so other parts of the app can access the
// last saved conversation thread.

export type ThreadMsg = { role: 'user' | 'assistant'; content: string };

const STORAGE_KEY = 'saved.chat.thread';

let inMemory: ThreadMsg[] | null = null;

export function saveConversation(thread: ThreadMsg[]) {
  inMemory = thread.slice();
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemory));
    }
  } catch {
    // ignore storage errors
  }
}

export function getSavedConversation(): ThreadMsg[] | null {
  if (inMemory) return inMemory.slice();
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ThreadMsg[];
      inMemory = parsed;
      return parsed.slice();
    }
  } catch {
    return null;
  }
  return null;
}

export function clearSavedConversation() {
  inMemory = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

const conversation = {
  saveConversation,
  getSavedConversation,
  clearSavedConversation,
};

export default conversation;
