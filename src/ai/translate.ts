'use server';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface TranslateCustomerQueryInput {
  query: string;
}

export async function translateCustomerQuery(input: TranslateCustomerQueryInput): Promise<string> {
  // 1. Input validation: အကယ်၍ စာသားမပါရင် API မခေါ်တော့ဘူး။
  if (!input.query || input.query.trim() === '') {
    return '';
  }

  // 2. Model ကို gemini-2.5-pro သို့ ပြောင်းသုံးကြည့်ပါ။
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // 
    // 3. Temperature ကိုလျှော့ချခြင်း
    generationConfig: {
      temperature: 0.5,
      responseMimeType: "application/json", // JSON output အတွက် သတ်မှတ်ခြင်း
    },
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  });

  // 4. အပေါ်မှာ ပြင်ဆင်ထားတဲ့ Prompt အသစ်ကို အသုံးပြုပါ။
  const prompt = `You are an expert translator specializing in customer service communications for online gaming and betting platforms, fluent in both Burmese and Chinese. Your task is to translate customer queries accurately, maintaining the specific tone and terminology of the industry.

    **Instructions:**
    1.  Detect the language of the user's query (Burmese or Chinese).
    2.  Translate it to the other language.
    3.  Use the provided glossary for key terms to ensure consistency.
    4.  The translation should be natural and professional, suitable for a customer service context.
    5.  Return the output as a JSON object with a single key: "translatedText".

    **Glossary (Terminology):**
    * Turnover / Rollover -> လည်ပတ်ငွေ / 流水
    * Bonus -> ဘောနပ်စ် / 红利 or 奖金
    * Withdrawal -> ငွေထုတ်ခြင်း / 提款
    * Deposit -> ငွေသွင်းခြင်း / 存款
    * Username -> အကောင့်အမည် / 用户名
    * Promotion -> ပရိုမိုးရှင်း / 优惠活动

    **Examples:**
    * **Chinese to Burmese:**
        * Input: "你好，请问我的流水还差多少？"
        * Output: "မင်္ဂလာပါ၊ ကျွန်ုပ်၏ လည်ပတ်ငွေ ဘယ်လောက် လိုသေးလဲ သိပါရစေ။"
    * **Burmese to Chinese:**
        * Input: "ပရိုမိုးရှင်း အသေးစိတ်ကို ဘယ်မှာကြည့်လို့ရမလဲဗျ။"
        * Output: "你好，请问在哪里可以查看优惠活动的详情？"

    **User Query:**
    "${input.query}"

    **JSON Output:**
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    // 5. JSON ကို parse လုပ်ပြီး ترجمه ကို ထုတ်ယူခြင်း
    const parsedResult = JSON.parse(jsonText);
    return parsedResult.translatedText || "Translation not available.";

  } catch (e) {
    console.error("AI Translation Error:", e);
    // User ကို ပြမယ့် error message ကို ပိုပြီး အဆင်ပြေအောင်ပြင်ပါ။
    return "Error: Unable to translate at the moment.";
  }
}