// /lib/embeddings.ts
import { VertexAIEmbeddings } from "@langchain/google-vertexai";

export const embeddings = new VertexAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GOOGLE_API_KEY,
});
