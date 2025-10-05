// lib/ai/summarize.ts
import { GoogleGenAI } from "@google/genai";
import { SUMMARIZE_SYSTEM_PROMPT } from "./prompts/summarizePrompt";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

// (Optional) a JSON schema that mirrors the fields requested by the system prompt
const summarySchema = {
  type: "object",
  properties: {
    goal: { type: "string" },
    current_state: { type: "string" },
    triggers_contexts: { type: "array", items: { type: "string" } },
    coping_attempts: { type: "array", items: { type: "string" } },
    emotions: { type: "array", items: { type: "string" } },
    patterns: { type: "array", items: { type: "string" } },
    growth_edge: { type: "array", items: { type: "string" } },
    next_steps: { type: "array", items: { type: "string" } },
    metadata: { type: "array", items: { type: "string" } }
  },
  required: ["goal"]
} as const;

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

export async function summarizeConversation(messages: Msg[]) {
  const recent = selectRecent(messages);
  if (recent.length === 0) return null;

  const transcript = toTranscript(recent);

  const res = await ai.models.generateContent({
    model: "gemini-2.0-flash", // or "gemini-1.5-pro" for higher quality
    contents: [
      { role: "user", parts: [{ text: `CONVERSATION:\n${transcript}\n\nProduce a JSON summary that captures conversation.` }] }
    ],
    config: {
      systemInstruction: SUMMARIZE_SYSTEM_PROMPT,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: summarySchema,
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

  try {
    return JSON.parse(maybeText as string);
  } catch {
    // Fallback if model returned non-JSON for any reason - shape aligned with prompt
    return {
      goal: "",
      current_state: "",
      triggers_contexts: [],
      coping_attempts: [],
      emotions: [],
      patterns: [],
      growth_edge: [],
      next_steps: [],
      metadata: [],
      raw: maybeText,
    };
  }
}
