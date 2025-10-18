// Test streaming with Ollama Cloud
import { Ollama } from "ollama";

const apiKey = "df73d7b35d55452c935eb003e56a8754.6_hGO83jrknS7OR5dCjFveBm";

console.log("Testing Ollama Cloud streaming...\n");

const ollama = new Ollama({
    host: "https://ollama.com",
    headers: {
        Authorization: `Bearer ${apiKey}`,
    },
});

try {
    console.log("Input: ငွေထုတ်လုပ်ငန်းစဉ် ဘယ်လောက်ကြာမလဲ");
    console.log("Streaming translation: ");

    const response = await ollama.chat({
        model: "deepseek-v3.1:671b-cloud",
        messages: [
            {
                role: "user",
                content: "Translate to Chinese: ငွေထုတ်လုပ်ငန်းစဉ် ဘယ်လောက်ကြာမလဲ",
            },
        ],
        stream: true,
    });

    for await (const part of response) {
        process.stdout.write(part.message.content);
    }

    console.log("\n\n✓ Streaming works!");
} catch (error) {
    console.log("\n✗ Error:", error.message);
}
