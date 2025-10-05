import "server-only";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash", // or gemini-1.5-pro for deeper reasoning
  temperature: 0.2,
  apiKey: process.env.GOOGLE_API_KEY,
});
