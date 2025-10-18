"use server";

import { Ollama } from "ollama";

if (!process.env.OLLAMA_API_KEY) {
    throw new Error("OLLAMA_API_KEY is not set in environment variables");
}

const ollama = new Ollama({
    host: "https://ollama.com",
    headers: {
        Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
    },
});

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const MAX_DELAY = 10000;

// In-memory cache for server-side caching
const serverCache = new Map<
    string,
    { translation: string; timestamp: number }
>();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// In-memory cooldown tracking
const userCooldowns = new Map<string, number>();
const COOLDOWN_SECONDS = 5;

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

            if (
                error.message?.includes("API key") ||
                error.message?.includes("authentication") ||
                error.message?.includes("permission") ||
                error.status === 401 ||
                error.status === 403 ||
                error.status === 400
            ) {
                throw error;
            }

            if (attempt === maxRetries) {
                break;
            }

            const isServiceUnavailable =
                error.status === 503 ||
                error.statusText === "Service Unavailable" ||
                error.message?.includes("overloaded");

            const multiplier = isServiceUnavailable ? 3 : 2;

            const delay = Math.min(
                baseDelay * Math.pow(multiplier, attempt) + Math.random() * 1000,
                MAX_DELAY
            );

            console.log(
                `API call failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message || error.status}, retrying in ${Math.round(delay)}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

function handleApiError(error: any): string {
    console.error("AI Translation Error:", error);

    if (
        error.status === 503 ||
        error.statusText === "Service Unavailable" ||
        error.message?.includes("overloaded") ||
        error.message?.includes("Service Unavailable")
    ) {
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

    return "ယာယီဘာသာပြန်ဆောင်ရွက်၍မရပါ။ ခဏစောင့်ပြီးပြန်လည်ကြိုးစားပေးပါ။ / 翻译服务暂时不可用，请稍后重试。";
}

function getFallbackTranslation(text: string): string | null {
    const fallbackMap: { [key: string]: string } = {
        ငွေထုတ်: "提款 / Withdrawal",
        ငွေသွင်း: "存款 / Deposit",
        လက်ကျန်ငွေ: "余额 / Balance",
        အကောင့်: "账户 / Account",
        ပြဿနာ: "问题 / Problem",
        အကူအညီ: "帮助 / Help",
        စောင့်ဆိုင်းနေ: "等待中 / Waiting",
        လုပ်ဆောင်နေ: "处理中 / Processing",
        提款: "ငွေထုတ် / Withdrawal",
        存款: "ငွေသွင်း / Deposit",
        余额: "လက်ကျန်ငွေ / Balance",
        账户: "အကောင့် / Account",
        问题: "ပြဿနာ / Problem",
        帮助: "အကူအညီ / Help",
        等待: "စောင့်ဆိုင်း / Wait",
        处理: "လုပ်ဆောင် / Process",
    };

    const lowerText = text.toLowerCase().trim();

    if (fallbackMap[text.trim()]) {
        return fallbackMap[text.trim()];
    }

    for (const [key, value] of Object.entries(fallbackMap)) {
        if (text.includes(key) || lowerText.includes(key.toLowerCase())) {
            return `${value} (အခြေခံဘာသာပြန်ချက် / 基础翻译)`;
        }
    }

    return null;
}

function streamFromString(text: string): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(text));
            controller.close();
        },
    });
}

export async function translateCustomerQueryOllama(
    input: TranslateCustomerQueryInput
): Promise<ReadableStream<Uint8Array>> {
    if (!input.query || input.query.trim() === "" || !input.uid) {
        return new ReadableStream({
            start(controller) {
                controller.close();
            },
        });
    }

    const { query, uid } = input;
    const sourceText = query.trim();

    try {
        // Check cooldown
        const lastTranslation = userCooldowns.get(uid);
        if (lastTranslation) {
            const secondsSinceLastTranslation = (Date.now() - lastTranslation) / 1000;
            if (secondsSinceLastTranslation < COOLDOWN_SECONDS) {
                const remaining = Math.ceil(
                    COOLDOWN_SECONDS - secondsSinceLastTranslation
                );
                throw new Error(
                    `You must wait ${remaining} more seconds before translating again.`
                );
            }
        }

        // Check server cache
        const cached = serverCache.get(sourceText);
        if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
            console.log("Server cache hit for:", sourceText);
            return streamFromString(cached.translation);
        }

        console.log("Cache miss for:", sourceText);

        const prompt = `Translate naturally between Burmese (Myanmar) and Chinese for customer service communication.

**Translation Rules:**
- Auto-detect source language (Burmese → Chinese or Chinese → Burmese)
- Preserve the original tone, emotion, and intent
- Use natural, conversational language appropriate for customer service
- Handle mixed languages smoothly
- Keep numbers, dates, and usernames unchanged
- Return ONLY the translation without explanations or labels

**Common Terms Reference:**
• Withdrawal: ငွေထုတ် / 提款
• Deposit: ငွေသွင်း / 存款
• Balance: လက်ကျန်ငွေ / 余额
• Account: အကောင့် / 账户
• Processing: လုပ်ဆောင်နေ / 处理中
• Pending: စောင့်ဆိုင်းနေ / 待处理
• Bonus: ဘောနပ်စ် / 红利
• Problem/Issue: ပြဿနာ / 问题
• Help/Support: အကူအညီ / 帮助
• Customer Service: ဖောက်သည်ဝန်ဆောင်မှု / 客服
• Verification: အတည်ပြု / 验证
• Transaction: ငွေလွှဲ / 交易

Translate: "${sourceText}"`;

        const response = await retryWithBackoff(async () => {
            return await ollama.chat({
                model: "deepseek-v3.1:671b-cloud",
                messages: [{ role: "user", content: prompt }],
                stream: true,
            });
        });

        let fullTranslation = "";
        const encoder = new TextEncoder();

        return new ReadableStream({
            async start(controller) {
                try {
                    for await (const part of response) {
                        const content = part.message.content;
                        if (content) {
                            fullTranslation += content;
                            controller.enqueue(encoder.encode(content));
                        }
                    }

                    // Save to cache after streaming completes
                    if (fullTranslation) {
                        serverCache.set(sourceText, {
                            translation: fullTranslation,
                            timestamp: Date.now(),
                        });
                        userCooldowns.set(uid, Date.now());
                        console.log(
                            "Saved to server cache and updated cooldown for:",
                            sourceText
                        );
                    }

                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });
    } catch (e: any) {
        if (e.message.includes("You must wait")) {
            return streamFromString(`Error: ${e.message}`);
        }

        const fallbackTranslation = getFallbackTranslation(sourceText);
        if (fallbackTranslation) {
            console.log(`Using fallback translation for: ${sourceText}`);
            return streamFromString(fallbackTranslation);
        }

        const errorMessage = handleApiError(e);
        return streamFromString(errorMessage);
    }
}
