"use server";

import { OpenAI } from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  GEMINI_KEY,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
  try {
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
      docContext = docs.map((d: any) => d.content).join("\n");
    } catch (err) {
      console.error("Astra DB query error:", err);
      docContext = "";
    }

    // --- Build system message ---
    const systemMessage = {
      role: "system",
      content: `
You are an **Empathetic Emotional Eating Coach** and informational assistant. 
Provide supportive, non-judgmental, evidence-based guidance on emotional eating, coping mechanisms, self-regulation, and disordered eating patterns.
Do not use language suggesting you are a therapist, medical doctor, or dietitian.
Format advice using **markdown** where helpful.

CONTEXT:
${docContext}
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
