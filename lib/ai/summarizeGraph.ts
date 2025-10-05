"use server";

import { randomUUID } from "crypto";
import { app } from "@/lib/ai/graph";
import { SUMMARIZE_SYSTEM_PROMPT } from "./prompts/summarizePrompt";

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

/**
 * Summarize a thread of messages using the langgraph `app` (Gemini).
 * Returns a plain text summary string.
 */
export async function summarizeThread(threadId: string, messages: Msg[]): Promise<string | null> {
  if (!threadId) throw new Error("threadId required");
  if (!Array.isArray(messages) || messages.length === 0) return null;

  // Prepare input messages: include system instruction then the transcript
  const transcript = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content.trim()}`)
    .join("\n");

  const systemMessage = { role: "system", content: SUMMARIZE_SYSTEM_PROMPT };
  const userMessage = { role: "user", content: `CONVERSATION:\n${transcript}\n\nPlease provide a structured summary following the format specified in the system instruction.` };

  // Use a dedicated thread id for summarization so it doesn't inherit/chat with the main conversation
  const summaryThreadId = `${threadId}-summary-${randomUUID()}`;
  const config = { configurable: { thread_id: summaryThreadId } } as const;

  // Call the compiled langgraph app - it will route to the Gemini model
  const input = { messages: [systemMessage, userMessage] };
  const out = await app.invoke(input, config);

  // The app returns messages array; the last entry is typically model output
  const last = out.messages?.[out.messages.length - 1];
  const text = last?.content ?? null;

  if (!text) return null;

  // Add header to the summary
  return `AI summary of user conversation with Alia\n\n${String(text)}`;
}
