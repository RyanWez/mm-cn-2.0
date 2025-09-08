"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface TranslateCustomerQueryInput {
  query: string;
}

export async function translateCustomerQuery(
  input: TranslateCustomerQueryInput
): Promise<ReadableStream<Uint8Array>> {
  // 1. Input validation
  if (!input.query || input.query.trim() === "") {
    // Return an empty stream if there is no query
    return new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
  }

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
    "${input.query}"

    **Translated Text Output:**
  `;

  try {
    const result = await model.generateContentStream(prompt);

    // Create a new ReadableStream to send to the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return stream;
  } catch (e) {
    console.error("AI Translation Error:", e);
    // Return a stream with an error message
    return new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(
          encoder.encode("Error: Unable to translate at the moment.")
        );
        controller.close();
      },
    });
  }
}
