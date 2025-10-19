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

// Constants
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const MAX_DELAY = 10000;
const CACHE_EXPIRY = 24 * 60 * 60; // seconds
const COOLDOWN_SECONDS = 5;
const MAX_INPUT_LENGTH = 2000;
const MIN_INPUT_LENGTH = 1;

// Cache storage
const memoryCache = new Map<string, { translation: string; timestamp: number }>();
const memoryCooldowns = new Map<string, number>();

interface TranslateCustomerQueryInput {
    query: string;
    uid: string;
}

interface CacheEntry {
    translation: string;
    timestamp: number;
}

// ✅ Unified Cache Manager
class CacheManager {
    private isKVAvailable = () => 
        !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

    async get<T>(key: string): Promise<T | null> {
        try {
            if (this.isKVAvailable()) {
                return await kv.get<T>(key);
            }
            return null;
        } catch (error) {
            console.error("[Cache] Read error:", error);
            return null;
        }
    }

    async set<T>(key: string, value: T, exSeconds?: number): Promise<void> {
        try {
            if (this.isKVAvailable()) {
                await kv.set(key, value, exSeconds ? { ex: exSeconds } : undefined);
            }
        } catch (error) {
            console.error("[Cache] Write error:", error);
        }
    }
}

// ✅ Unified Storage Manager (KV + Memory)
class StorageManager {
    private cache = new CacheManager();
    private memoryStore = new Map<string, { value: any; expiry: number }>();

    async get(key: string): Promise<any | null> {
        // Try KV first
        const kvValue = await this.cache.get(key);
        if (kvValue !== null) return kvValue;

        // Fallback to memory
        const memValue = this.memoryStore.get(key);
        if (memValue && memValue.expiry > Date.now()) {
            return memValue.value;
        }
        return null;
    }

    async set(key: string, value: any, exSeconds: number): Promise<void> {
        await this.cache.set(key, value, exSeconds);
        this.memoryStore.set(key, {
            value,
            expiry: Date.now() + exSeconds * 1000,
        });
    }
}

const storage = new StorageManager();

// ✅ Retry with exponential backoff
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = MAX_RETRIES,
    baseDelay = BASE_DELAY
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Don't retry on auth/validation errors
            if (isAuthError(error) || isBadRequest(error)) {
                throw error;
            }

            if (attempt === maxRetries) break;

            const delay = calculateBackoffDelay(error, attempt, baseDelay);
            if (process.env.NODE_ENV === "development") {
                console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries + 1}, waiting ${Math.round(delay)}ms`);
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

// ✅ Helper functions
function isAuthError(error: any): boolean {
    return (
        error.status === 401 ||
        error.status === 403 ||
        error.message?.includes("API key") ||
        error.message?.includes("authentication")
    );
}

function isBadRequest(error: any): boolean {
    return error.status === 400 || error.message?.includes("permission");
}

function isServiceUnavailable(error: any): boolean {
    return (
        error.status === 503 ||
        error.statusText === "Service Unavailable" ||
        error.message?.includes("overloaded")
    );
}

function calculateBackoffDelay(error: any, attempt: number, baseDelay: number): number {
    const multiplier = isServiceUnavailable(error) ? 3 : 2;
    return Math.min(
        baseDelay * Math.pow(multiplier, attempt) + Math.random() * 1000,
        MAX_DELAY
    );
}

// ✅ Simplified error handling
function handleApiError(error: any): string {
    const errorMap: Record<string, string> = {
        model: "AI Model ပြဿနာရှိနေပါသည်။ ခဏစောင့်ပြီးပြန်လည်ကြိုးစားပေးပါ။",
        timeout: "အချိန်ကုန်သွားပါပြီ။ ပြန်စမ်းကြည့်ပါ။",
        quota: "API ကန့်သတ်ချက်ပြည့်သွားပါပြီ။ ခဏစောင့်ပေးပါ။",
        network: "ကွန်ရက်ပြဿနာရှိနေပါသည်။",
    };

    console.error("[Error]", error.message || error.status);

    for (const [key, message] of Object.entries(errorMap)) {
        if (error.message?.toLowerCase().includes(key) || error.status === 429) {
            return message;
        }
    }

    if (isAuthError(error)) {
        return "ခွင့်ပြုချက်ပြဿနာရှိနေပါသည်။";
    }

    if (isServiceUnavailable(error)) {
        return "ဝန်ဆောင်မှုယာယီမရရှိနိုင်ပါ။ ခဏစောင့်ပြီးပြန်လည်ကြိုးစားပေးပါ။";
    }

    return "ယာယီဘာသာပြန်ဆောင်ရွက်၍မရပါ။ ခဏစောင့်ပြီးပြန်လည်ကြိုးစားပေးပါ။";
}

// ✅ Input validation
function validateInput(text: string): { valid: boolean; error?: string } {
    if (text.length < MIN_INPUT_LENGTH || text.length > MAX_INPUT_LENGTH) {
        return {
            valid: false,
            error: `စာသားအရှည်မှားနေပါသည်။ (${MIN_INPUT_LENGTH}-${MAX_INPUT_LENGTH} လုံး)`,
        };
    }

    const suspiciousPatterns = [/<script/i, /javascript:/i, /onerror=/i, /onclick=/i];
    if (suspiciousPatterns.some((p) => p.test(text))) {
        return { valid: false, error: "တားမြစ်ထားသော စာသားပါဝင်နေပါသည်။" };
    }

    return { valid: true };
}

// ✅ Fallback translations
const FALLBACK_MAP: Record<string, string> = {
    ငွေထုတ်: "提款 / Withdrawal",
    ငွေသွင်း: "存款 / Deposit",
    လက်ကျန်ငွေ: "余额 / Balance",
    အကောင့်: "账户 / Account",
    ပြဿနာ: "问题 / Problem",
    အကူအညီ: "帮助 / Help",
};

function getFallbackTranslation(text: string): string | null {
    const trimmed = text.trim();
    if (FALLBACK_MAP[trimmed]) return FALLBACK_MAP[trimmed];

    for (const [key, value] of Object.entries(FALLBACK_MAP)) {
        if (text.includes(key)) {
            return `${value} (အခြေခံ)`;
        }
    }
    return null;
}

// ✅ Stream helper
function streamFromString(text: string): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(text));
            controller.close();
        },
    });
}

// ✅ Main translation function
export async function translateCustomerQueryOllama(
    input: TranslateCustomerQueryInput
): Promise<ReadableStream<Uint8Array>> {
    const { query, uid } = input;

    if (!query?.trim() || !uid) {
        return new ReadableStream({ start: (c) => c.close() });
    }

    const sourceText = query.trim();

    try {
        // Validate
        const validation = validateInput(sourceText);
        if (!validation.valid) {
            return streamFromString(`Error: ${validation.error}`);
        }

        // Check cooldown
        const lastTime = await storage.get(`cooldown:${uid}`);
        if (lastTime) {
            const elapsed = (Date.now() - lastTime) / 1000;
            if (elapsed < COOLDOWN_SECONDS) {
                const remaining = Math.ceil(COOLDOWN_SECONDS - elapsed);
                return streamFromString(`Error: Wait ${remaining}s before retrying.`);
            }
        }

        // Check cache
        const cached = await storage.get(`translation:${sourceText}`);
        if (cached) {
            console.log("[Cache] Hit");
            return streamFromString(cached);
        }

        console.log("[Cache] Miss");

        const prompt = `Translate naturally between Burmese and Chinese for customer service.
Auto-detect source language. Return ONLY the translation.

Common Terms:
• Withdrawal: ငွေထုတ် / 提款
• Deposit: ငွေသွင်း / 存款
• Balance: လက်ကျန်ငွေ / 余额
• Account: အကောင့် / 账户

Translate: "${sourceText}"`;

        const response = await retryWithBackoff(() =>
            ollama.chat({
                model: "deepseek-v3.1:671b-cloud",
                messages: [{ role: "user", content: prompt }],
                stream: true,
            })
        );

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

                    if (fullTranslation) {
                        await Promise.all([
                            storage.set(`translation:${sourceText}`, fullTranslation, CACHE_EXPIRY),
                            storage.set(`cooldown:${uid}`, Date.now(), COOLDOWN_SECONDS + 1),
                        ]);
                    }

                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });
    } catch (error: any) {
        const fallback = getFallbackTranslation(sourceText);
        if (fallback) {
            console.log("[Fallback] Used");
            return streamFromString(fallback);
        }

        return streamFromString(`Error: ${handleApiError(error)}`);
    }
}