"use server";

// Using Ollama only for now
// Gemini code kept as backup in translate-gemini-backup.ts
import { translateCustomerQueryOllama } from "./translate-ollama";

if (!process.env.OLLAMA_API_KEY) {
  throw new Error("OLLAMA_API_KEY is not set in environment variables");
}

interface TranslateCustomerQueryInput {
  query: string;
  uid: string;
}

export async function translateCustomerQuery(
  input: TranslateCustomerQueryInput
): Promise<ReadableStream<Uint8Array>> {
  return translateCustomerQueryOllama(input);
}
