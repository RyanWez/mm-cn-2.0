"use server";

import { Ollama } from "ollama";
import { kv } from "@vercel/kv";

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
const CACHE_EXPIRY = 24 * 60 * 60; // 24 hours in seconds (for KV)
const COOLDOWN_SECONDS = 5;

// Input validation constants
const MAX_INPUT_LENGTH = 2000;
const MIN_INPUT_LENGTH = 1;

// Fallback to in-memory cache if KV is not available (local development)
const memoryCache = new Map<string, { translation: string; timestamp: number }>();
const memoryCooldowns = new Map<string, number>();

interface TranslateCustomerQueryInput {
    query: string;
    uid: string;
}

// Helper to check if KV is available
const isKVAvailable = () => {
    return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
};

// Cache helpers with KV fallback
async function getCachedTranslation(key: string): Promise<string | null> {
    try {
        if (isKVAvailable()) {
            return await kv.get<string>(`translation:${key}`);
        } else {
            const cached = memoryCache.get(key);
            if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY * 1000) {
                return cached.translation;
            }
            return null;
        }
    } catch (error) {
        console.error("[Cache] Error reading cache:", error);
        return null;
    }
}

async function setCachedTranslation(key: string, value: string): Promise<void> {
    try {
        if (isKVAvailable()) {
            await kv.set(`translation:${key}`, value, { ex: CACHE_EXPIRY });
        } else {
            memoryCache.set(key, { translation: value, timestamp: Date.now() });
        }
    } catch (error) {
        console.error("[Cache] Error writing cache:", error);
    }
}

async function checkCooldown(uid: string): Promise<number> {
    try {
        if (isKVAvailable()) {
            const lastTime = await kv.get<number>(`cooldown:${uid}`);
            if (lastTime) {
                const elapsed = (Date.now() - lastTime) / 1000;
                return Math.max(0, COOLDOWN_SECONDS - elapsed);
            }
            return 0;
        } else {
            const lastTime = memoryCooldowns.get(uid);
            if (lastTime) {
                const elapsed = (Date.now() - lastTime) / 1000;
                return Math.max(0, COOLDOWN_SECONDS - elapsed);
            }
            return 0;
        }
    } catch (error) {
        console.error("[Cooldown] Error checking cooldown:", error);
        return 0;
    }
}

async function updateCooldown(uid: string): Promise<void> {
    try {
        if (isKVAvailable()) {
            await kv.set(`cooldown:${uid}`, Date.now(), { ex: COOLDOWN_SECONDS + 1 });
        } else {
            memoryCooldowns.set(uid, Date.now());
        }
    } catch (error) {
        console.error("[Cooldown] Error updating cooldown:", error);
    }
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

            if (process.env.NODE_ENV === "development") {
                console.log(
                    `[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${Math.round(delay)}ms...`
                );
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

function handleApiError(error: any): string {
    console.error("[Error] Translation failed:", error.message || error.status);

    // Model-specific errors
    if (error.message?.includes("model") || error.message?.includes("not found")) {
        return "AI Model ပြဿနာရှိနေပါသည်။ ခဏစောင့်ပြီးပြန်လည်ကြိုးစားပေးပါ။ / AI模型出现问题，请稍后重试。";
    }

    // Timeout errors
    if (error.message?.includes("timeout") || error.message?.includes("ETIMEDOUT")) {
        return "အချိန်ကုန်သွားပါပြီ။ ပြန်စမ်းကြည့်ပါ။ / 请求超时，请重试。";
    }

    // Quota/limit errors
    if (
        error.message?.includes("quota") ||
        error.message?.includes("limit") ||
        error.status === 429
    ) {
        return "API ကန့်သတ်ချက်ပြည့်သွားပါပြီ။ ခဏစောင့်ပေးပါ။ / API配额已用完，请稍后重试。";
    }

    // Service unavailable
    if (
        error.status === 503 ||
        error.statusText === "Service Unavailable" ||
        error.message?.includes("overloaded") ||
        error.message?.includes("Service Unavailable")
    ) {
        return "ဝန်ဆောင်မှုယာယီမရရှိနိုင်ပါ။ ခဏစောင့်ပြီးပြန်လည်ကြိုးစားပေးပါ။ / 服务暂时不可用，请稍后重试。";
    }

    // Authentication errors
    if (error.status === 401 || error.status === 403) {
        return "ခွင့်ပြုချက်ပြဿနာရှိနေပါသည်။ / 权限验证失败。";
    }

    // Bad request
    if (error.status === 400) {
        return "တောင်းဆိုမှုမှားယွင်းနေပါသည်။ / 请求格式错误。";
    }

    // Network errors
    if (
        error.message?.includes("network") ||
        error.message?.includes("ECONNREFUSED") ||
        error.message?.includes("ENOTFOUND")
    ) {
        return "ကွန်ရက်ပြဿနာရှိနေပါသည်။ / 网络连接出现问题。";
    }

    // Generic error
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

function validateInput(text: string): { valid: boolean; error?: string } {
    if (text.length < MIN_INPUT_LENGTH) {
        return {
            valid: false,
            error: "စာသားတိုလွန်းပါသည်။ / 文本太短。",
        };
    }

    if (text.length > MAX_INPUT_LENGTH) {
        return {
            valid: false,
            error: `စာသားရှည်လွန်းပါသည်။ (အများဆုံး ${MAX_INPUT_LENGTH} လုံး) / 文本太长（最多${MAX_INPUT_LENGTH}字符）。`,
        };
    }

    // Check for suspicious patterns (basic XSS prevention)
    const suspiciousPatterns = [/<script/i, /javascript:/i, /onerror=/i, /onclick=/i];
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(text)) {
            return {
                valid: false,
                error: "တားမြစ်ထားသော စာသားပါဝင်နေပါသည်။ / 包含禁止的内容。",
            };
        }
    }

    return { valid: true };
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
        // Validate input
        const validation = validateInput(sourceText);
        if (!validation.valid) {
            return streamFromString(`Error: ${validation.error}`);
        }

        // Check cooldown
        const remainingCooldown = await checkCooldown(uid);
        if (remainingCooldown > 0) {
            const remaining = Math.ceil(remainingCooldown);
            return streamFromString(
                `Error: You must wait ${remaining} more seconds before translating again.`
            );
        }

        // Check cache
        const cached = await getCachedTranslation(sourceText);
        if (cached) {
            if (process.env.NODE_ENV === "development") {
                console.log("[Cache] Hit - length:", cached.length);
            }
            return streamFromString(cached);
        }

        if (process.env.NODE_ENV === "development") {
            console.log("[Cache] Miss - fetching translation");
        }

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

                    // Save to cache and update cooldown
                    if (fullTranslation) {
                        await Promise.all([
                            setCachedTranslation(sourceText, fullTranslation),
                            updateCooldown(uid),
                        ]);

                        if (process.env.NODE_ENV === "development") {
                            console.log("[Cache] Saved - length:", fullTranslation.length);
                        }
                    }

                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });
    } catch (e: any) {
        // Handle cooldown errors
        if (e.message.includes("You must wait")) {
            return streamFromString(`Error: ${e.message}`);
        }

        // Try fallback translation
        const fallbackTranslation = getFallbackTranslation(sourceText);
        if (fallbackTranslation) {
            if (process.env.NODE_ENV === "development") {
                console.log("[Fallback] Using fallback translation");
            }
            return streamFromString(fallbackTranslation);
        }

        // Return error message
        const errorMessage = handleApiError(e);
        return streamFromString(errorMessage);
    }
}
