"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { firestoreAdmin } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const cacheCollection = firestoreAdmin.collection("translations_cache");

interface TranslateCustomerQueryInput {
  query: string;
}

// Helper to create a stream from a string
function streamFromString(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

// Function to create ReadableStream from AsyncGenerator
function createReadableStreamFromAsyncGenerator(
  generator: AsyncGenerator<any, void, undefined>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function translateCustomerQuery(
  input: TranslateCustomerQueryInput
): Promise<ReadableStream<Uint8Array>> {
  // 1. Input validation
  if (!input.query || input.query.trim() === "") {
    return new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
  }

  const sourceText = input.query.trim();

  try {
    // 2. Check cache first
    const querySnapshot = await cacheCollection
      .where("sourceText", "==", sourceText)
      .get();

    if (!querySnapshot.empty) {
      const cachedDoc = querySnapshot.docs[0];
      const cachedTranslation = cachedDoc.data().translatedText;
      console.log("Cache hit for:", sourceText);
      return streamFromString(cachedTranslation);
    }

    console.log("Cache miss for:", sourceText);
    // 3. If not in cache, call the AI
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.5,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const prompt = `You are an expert translator specializing in customer service communications for online gaming and betting platforms, fluent in both Burmese and Chinese. Your task is to translate customer queries accurately, maintaining the specific tone and terminology of the industry.

    **Instructions:**
    1.  Detect the language of the user's query (Burmese or Chinese).
    2.  Translate it to the other language.
    3.  Use the provided glossary for key terms to ensure consistency.
    4.  The translation should be natural and professional, suitable for a customer service context.
    5.  Return only the translated text, without any additional formatting, labels, or JSON structure.

    **Glossary (Terminology):**
    * Turnover / Rollover -> လည်ပတ်ငွေ / 流水
    * Bonus -> ဘောနပ်စ် / 红利 or 奖金
    * Withdrawal -> ငွေထုတ်ခြင်း / 提款
    * Deposit -> ငွေသွင်းခြင်း / 存款
    * Username -> အကောင့်အမည် / 用户名
    * Promotion -> ပရိုမိုးရှင်း / 优惠活动
    * Brother -> အကို /  哥 / 大哥

    **User Query:**
    "${sourceText}"

    **Translated Text Output:**
  `;

    const result = await model.generateContentStream(prompt);

    let fullTranslation = "";
    const transformer = new TransformStream({
      transform(chunk, controller) {
        fullTranslation += new TextDecoder().decode(chunk);
        controller.enqueue(chunk);
      },
      async flush(controller) {
        // 4. After stream is complete, save the full translation to cache
        if (fullTranslation) {
          try {
            await cacheCollection.add({
              sourceText: sourceText,
              translatedText: fullTranslation,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log("Saved to cache:", sourceText);
          } catch (cacheError) {
            console.error("Failed to save to cache:", cacheError);
          }
        }
      },
    });

    return createReadableStreamFromAsyncGenerator(result.stream).pipeThrough(
      transformer
    );
  } catch (e) {
    console.error("AI Translation Error:", e);
    return streamFromString("Error: Unable to translate at the moment.");
  }
}
