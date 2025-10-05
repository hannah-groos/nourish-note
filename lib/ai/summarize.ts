// lib/ai/summarize.ts
import { GoogleGenAI } from "@google/genai";
import { SUMMARIZE_SYSTEM_PROMPT } from "./prompts/summarizePrompt";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string };

// Simple truncation: take last N turns so we stay within token limits
function selectRecent(messages: Msg[], max = 24) {
  const filtered = messages.filter(m => m.role !== "system");
  return filtered.slice(-max);
}

// Convert your messages into a compact transcript
function toTranscript(messages: Msg[]) {
  return messages
    .map(m => `${m.role.toUpperCase()}: ${m.content.trim()}`)
    .join("\n");
}

export async function summarizeConversation(messages: Msg[]): Promise<string | null> {
  const recent = selectRecent(messages);
  if (recent.length === 0) return null;

  const transcript = toTranscript(recent);

  const res = await ai.models.generateContent({
    model: "gemini-2.0-flash", // or "gemini-1.5-pro" for higher quality
    contents: [
      { role: "user", parts: [{ text: `CONVERSATION:\n${transcript}\n\nPlease provide a structured summary following the format specified in the system instruction.` }] }
    ],
    config: {
      systemInstruction: SUMMARIZE_SYSTEM_PROMPT,
      temperature: 0.2,
    },
  });

  // The SDK typically returns candidate text under `candidates[0]?.content?.parts[0]?.text`
  // but shapes can vary by version. Safely probe common locations.
  const getNestedString = (obj: unknown, path: (string | number)[]): string | null => {
    let cur: unknown = obj;
    for (const key of path) {
      if (typeof key === "number") {
        if (!Array.isArray(cur)) return null;
        cur = cur[key];
      } else {
        if (typeof cur !== "object" || cur === null) return null;
        cur = (cur as Record<string, unknown>)[key];
      }
    }
    return typeof cur === "string" ? cur : null;
  };

  // Try common response shapes from the GenAI SDK
  const maybeText =
    getNestedString(res, ["candidates", 0, "content", "parts", 0, "text"]) ||
    getNestedString(res, ["output", 0, "content", 0, "text"]) ||
    null;

  if (!maybeText) return null;

  // Add header to the summary
  return `AI Summary of Conversation\n\n${maybeText}`;
}
