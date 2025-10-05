"use server";

import { OpenAI } from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { getEntry } from "@/actions/entries";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;


const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
  try {
    const userInfo = await getEntry()
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1]?.content;

    let docContext = "";

    // --- Get embeddings for the latest user message ---
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      dimensions: 768,
    });

    // --- Query Astra DB for relevant documents (placeholder) ---
    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION!);
      
      // Example: get all documents (replace with actual retrieval logic)
      const cursor = await collection.find({}, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 5
      })
      const docs = await cursor.toArray();
      docContext = docs.map((d) => (d as { content?: string }).content || "").join("\n");
    } catch (err) {
      console.error("Astra DB query error:", err);
      docContext = "";
    }

    // --- Build system message ---
    const systemMessage = {
      role: "system",
      content: `
    You are **Alia**, an empathetic and evidence-informed *Emotional Eating Coach*.  
    Your role is to provide supportive, non-judgmental guidance to help users understand and manage emotional eating patterns.
    
    **Core principles:**
    - Use a warm, encouraging, and human tone.
    - Offer realistic, actionable strategies rather than clinical advice.
    - Never use language implying you are a therapist, doctor, or dietitian.
    - Keep responses **concise and conversational** — focus on the key insight or next step.
    - When helpful, format responses with **markdown** (e.g., lists or short sections).
    
    **Your reasoning focus:**
    Base your insights and feedback solely on:
    - The user's emotional triggers, environment, and self-reported mood before and after eating.
    - Their journal entries, patterns, and reflections.
    - Any contextual documents provided.
    
    Avoid repetition, filler phrases, or excessive empathy. Aim for clarity and emotional intelligence.
    
    ---
    
    **REFERENCE CONTEXT:**
    ${docContext || "(none available)"}
    
    **USER PROFILE & JOURNAL DATA:**
    ${JSON.stringify(userInfo, null, 2)}
    `,
    };
    

    // --- Create chat completion ---
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [systemMessage, ...messages],
    });
    
    const answer = response.choices[0]?.message.content;
    console.log(answer)

    return new Response(JSON.stringify({ answer }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error querying OpenAI or Astra DB:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process your request",
        details: String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
