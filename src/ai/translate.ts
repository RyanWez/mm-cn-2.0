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
const cooldownsCollection = firestoreAdmin.collection("user_cooldowns");
const COOLDOWN_SECONDS = 15;
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second base delay
const MAX_DELAY = 10000; // 10 seconds max delay

interface TranslateCustomerQueryInput {
  query: string;
  uid: string;
}

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = BASE_DELAY
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain error types
      if (error.message?.includes("API key") ||
          error.message?.includes("authentication") ||
          error.message?.includes("permission") ||
          error.status === 401 ||
          error.status === 403 ||
          error.status === 400) {
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }
      
      // For 503 errors (service unavailable), use longer delays
      const isServiceUnavailable = error.status === 503 ||
                                   error.statusText === 'Service Unavailable' ||
                                   error.message?.includes('overloaded');
      
      const multiplier = isServiceUnavailable ? 3 : 2; // Longer delays for service unavailable
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(multiplier, attempt) + Math.random() * 1000,
        MAX_DELAY
      );
      
      console.log(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message || error.status}, retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Enhanced error handling function
function handleApiError(error: any): string {
  console.error("AI Translation Error:", error);
  
  if (error.status === 503 || error.statusText === 'Service Unavailable' ||
      error.message?.includes('overloaded') || error.message?.includes('Service Unavailable')) {
    return "ဝန်ဆောင်မှုယာယီမရရှိနိုင်ပါ။ ခဏစောင့်ပြီးပြန်လည်ကြိုးစားပေးပါ။ / 服务暂时不可用，请稍后重试。";
  }
  
  if (error.status === 429) {
    return "တောင်းဆိုမှုများလွန်းပါသည်။ ခဏစောင့်ပေးပါ။ / 请求过于频繁，请稍后重试。";
  }
  
  if (error.status === 400) {
    return "တောင်းဆိုမှုမှားယွင်းနေပါသည်။ / 请求格式错误。";
  }
  
  if (error.status === 401 || error.status === 403) {
    return "ခွင့်ပြုချက်ပြဿနာရှိနေပါသည်။ / 权限验证失败။";
  }
  
  // Generic error message
  return "ယာယီဘာသာပြန်ဆောင်ရွက်၍မရပါ။ ခဏစောင့်ပြီးပြန်လည်ကြိုးစားပေးပါ။ / 翻译服务暂时不可用，请稍后重试。";
}

// Simple fallback translation for common phrases
function getFallbackTranslation(text: string): string | null {
  const fallbackMap: { [key: string]: string } = {
    // Common customer service phrases
    "ငွေထုတ်": "提款 / Withdrawal",
    "ငွေသွင်း": "存款 / Deposit",
    "လက်ကျန်ငွေ": "余额 / Balance",
    "အကောင့်": "账户 / Account",
    "ပြဿနာ": "问题 / Problem",
    "အကူအညီ": "帮助 / Help",
    "စောင့်ဆိုင်းနေ": "等待中 / Waiting",
    "လုပ်ဆောင်နေ": "处理中 / Processing",
    
    // Chinese to Burmese/English
    "提款": "ငွေထုတ် / Withdrawal",
    "存款": "ငွေသွင်း / Deposit",
    "余额": "လက်ကျန်ငွေ / Balance",
    "账户": "အကောင့် / Account",
    "问题": "ပြဿနာ / Problem",
    "帮助": "အကူအညီ / Help",
    "等待": "စောင့်ဆိုင်း / Wait",
    "处理": "လုပ်ဆောင် / Process",
  };
  
  const lowerText = text.toLowerCase().trim();
  
  // Check for exact matches first
  if (fallbackMap[text.trim()]) {
    return fallbackMap[text.trim()];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(fallbackMap)) {
    if (text.includes(key) || lowerText.includes(key.toLowerCase())) {
      return `${value} (အခြေခံဘာသာပြန်ချက် / 基础翻译)`;
    }
  }
  
  return null;
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
  if (!input.query || input.query.trim() === "" || !input.uid) {
    return new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
  }

  const { query, uid } = input;
  const sourceText = query.trim();
  const userCooldownRef = cooldownsCollection.doc(uid);

  try {
    // 2. Cooldown check
    const cooldownDoc = await userCooldownRef.get();
    if (cooldownDoc.exists) {
      const lastTranslatedAt = cooldownDoc.data()?.lastTranslatedAt as admin.firestore.Timestamp;
      const secondsSinceLastTranslation =
        Date.now() / 1000 - lastTranslatedAt.seconds;
      if (secondsSinceLastTranslation < COOLDOWN_SECONDS) {
        const remaining = Math.ceil(
          COOLDOWN_SECONDS - secondsSinceLastTranslation
        );
        throw new Error(
          `You must wait ${remaining} more seconds before translating again.`
        );
      }
    }

    // 3. Check cache first
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
    // 4. If not in cache, call the AI
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

    const prompt = `You are an elite translator specializing in customer service communications for online gaming and betting platforms, with native-level fluency in both Burmese and Chinese. You possess deep cultural understanding and expertise in industry-specific terminology across both languages.

      **Core Translation Philosophy:**
      Translate for meaning, context, and cultural appropriateness rather than literal word-for-word conversion. Your goal is seamless communication that feels natural to native speakers while maintaining professional customer service standards.

      **Advanced Translation Protocol:**

      1. **Language Detection & Analysis:**
        - Identify source language (Burmese/Chinese) and any mixed-language elements
        - Analyze formality level, urgency, and emotional tone
        - Detect regional dialects or colloquialisms

      2. **Contextual Translation Process:**
        - Preserve original intent and emotional undertone
        - Adapt cultural references to target language context
        - Maintain industry-appropriate terminology consistency
        - Handle code-switching (mixed languages) naturally

      3. **Quality Assurance Checks:**
        - Verify technical terms align with platform standards
        - Ensure tone matches customer service expectations
        - Confirm numerical values and dates remain unchanged
        - Check for cultural sensitivity and appropriateness

      4. **Output Standards:**
        - Return only the translated text
        - No explanations, labels, or additional formatting
        - Natural flow that sounds native, not translated

      **Enhanced Glossary (Context & Register Aware):**

      **Gaming/Betting Specific:**
      * Turnover/Rollover → လည်ပတ်ငွေ / 流水量
      * Bonus → ဘောနပ်စ် / 红利 | ဆုငွေ / 奖金 (achievement-based)
      * Cashback → ငွေပြန်အမ် / 返现
      * Jackpot → ဂျက်ပေါ့ / 大奖
      * Odds → ကမ္ဘာ့ / 赔率
      * Bet → လောင်းထား / 下注
      * Stake → လောင်းငွေ / 投注额
      * Payout → အမ်ငွေ / 派彩

      **Financial Terms:**
      * Withdrawal → ငွေထုတ်ခြင်း / 提款
      * Deposit → ငွေသွင်းခြင်း / 存款  
      * Balance → လက်ကျန်ငွေ / 余额
      * Transaction → ငွေလွှဲခြင်း / 交易
      * Processing → လုပ်ဆောင်နေခြင်း / 处理中
      * Pending → စောင့်ဆိုင်းနေ / 待处理

      **Customer Service:**
      * Account → အကောင့် / 账户
      * Username → အကောင့်အမည် / 用户名
      * Password → စကားဝှက် / 密码
      * Verification → အတည်ပြုခြင်း / 验证
      * Customer Service → ဖောက်သည်ဝန်ဆောင်မှု / 客服
      * Support → အကူအညီ / 技术支持
      * Issue → ပြဿနা / 问题

      **Cultural & Social:**
      * Brother → အကို / 哥哥 (respectful) | ညီ / 兄弟 (casual/equal)
      * Sister → အစ်မ / 姐姐 (respectful) | ညီမ / 妹妹 (casual)
      * Boss → ဘောစ် / 老板
      * Friend → သူငယ်ချင်း / 朋友

      **Tone & Context Guidelines:**

      **Formal Requests:** Use respectful honorifics and complete sentence structures
      **Urgent Issues:** Maintain urgency while staying professional  
      **Complaints:** Preserve emotional intensity but keep constructive tone
      **Technical Problems:** Use precise, clear terminology without jargon
      **Casual Inquiries:** Match friendly, approachable tone naturally
      **Sensitive Topics:** Handle with extra cultural awareness and discretion

      **Special Handling Instructions:**

      - **Mixed Languages:** Translate all parts while maintaining natural flow
      - **Unclear Queries:** Focus on most likely intent based on context clues
      - **Cultural References:** Adapt to equivalent concepts in target culture
      - **Slang/Internet Language:** Find appropriate equivalents that maintain meaning
      - **Numbers & Dates:** Preserve original format but clarify if ambiguous
      - **Emotional Expressions:** Maintain intensity level while being culturally appropriate

      **Error Prevention:**
      - Never add explanatory text or translations notes
      - Don't assume gender unless clearly indicated
      - Avoid over-formal language in casual contexts
      - Don't literalize idioms - find equivalent expressions

      **User Query:**
      "${sourceText}"

      **Professional Translation:**`;



    // Use retry logic for the API call
    const result = await retryWithBackoff(async () => {
      return await model.generateContentStream(prompt);
    });

    let fullTranslation = "";
    const transformer = new TransformStream({
      transform(chunk, controller) {
        fullTranslation += new TextDecoder().decode(chunk);
        controller.enqueue(chunk);
      },
      async flush(controller) {
        // 5. After stream is complete, save to cache and update cooldown
        if (fullTranslation) {
          try {
            await Promise.all([
              cacheCollection.add({
                sourceText: sourceText,
                translatedText: fullTranslation,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              }),
              userCooldownRef.set(
                {
                  lastTranslatedAt: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
              ),
            ]);
            console.log("Saved to cache and updated cooldown for:", sourceText);
          } catch (writeError) {
            console.error("Failed to save to cache or update cooldown:", writeError);
          }
        }
      },
    });

    return createReadableStreamFromAsyncGenerator(result.stream).pipeThrough(
      transformer
    );
  } catch (e: any) {
    // Check if it's a cooldown error, which is expected, so don't log it as a server error.
    if (e.message.includes("You must wait")) {
      return streamFromString(`Error: ${e.message}`);
    }
    
    // Try fallback translation for simple phrases
    const fallbackTranslation = getFallbackTranslation(sourceText);
    if (fallbackTranslation) {
      console.log(`Using fallback translation for: ${sourceText}`);
      return streamFromString(fallbackTranslation);
    }
    
    // Use enhanced error handling
    const errorMessage = handleApiError(e);
    return streamFromString(errorMessage);
  }
}