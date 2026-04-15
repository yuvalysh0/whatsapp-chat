import { GoogleGenerativeAI } from "@google/generative-ai";
import { filterWhatsappDaytimeOnly } from "./whatsapp-daytime-filter.js";

/**
 * @param {import("@google/generative-ai").GenerativeModel} m
 * @param {string} prompt
 * @param {{ onRetry?: (attempt: number, waitMs: number) => void }} [opts]
 */
async function generateWithRetry(m, prompt, opts = {}) {
    const maxAttempts = 4;
    let lastError;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const result = await m.generateContent(prompt);
            return await result.response;
        } catch (err) {
            lastError = err;
            const status = /** @type {{ status?: number }} */ (err).status;
            if (status !== 429 || attempt === maxAttempts - 1) {
                throw err;
            }
            let waitMs = 15_000;
            const details = /** @type {{ errorDetails?: Array<{ retryDelay?: string }> }} */ (
                err
            ).errorDetails;
            const retryInfo = details?.find((d) => d?.retryDelay != null);
            const delay = retryInfo?.retryDelay;
            if (typeof delay === "string" && delay.endsWith("s")) {
                waitMs = Math.ceil(parseFloat(delay) * 1000) + 500;
            }
            opts.onRetry?.(attempt + 1, waitMs);
            await new Promise((r) => setTimeout(r, waitMs));
        }
    }
    throw lastError;
}

const DEFAULT_PROMPT = `אתה עוזר אישי שתפקידו לסכם שיחות וואטסאפ.
להלן צ'אט קבוצתי (חלק אחרון / עדכני). 
אנא ספק סיכום קצר (עד 5 נקודות) שכולל:
- נושאים מרכזיים שדובר עליהם.
- החלטות שהתקבלו (אם היו).
- דברים מצחיקים או חריגים שקרו.

הסיכום צריך להיות בעברית זורמת וקלילה.

הצ'אט:
`;

/**
 * @param {string} rawContent
 * @param {{
 *   apiKey?: string;
 *   modelName?: string;
 *   maxChatChars?: number;
 *   dayStartMinuteFromMidnight?: number;
 *   onRetry?: (attempt: number, waitMs: number) => void;
 * }} [options] dayStartMinuteFromMidnight: if set, only messages at/after that minute-of-day (local export time).
 * @returns {Promise<string>}
 */
export async function summarizeWhatsappText(rawContent, options = {}) {
    const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY");
    }
    const modelName =
        options.modelName ?? process.env.GEMINI_MODEL ?? "gemini-flash-latest";
    const maxChatChars =
        options.maxChatChars ??
        Number(process.env.MAX_CHAT_CHARS ?? "12000");

    let working = rawContent;
    const dayStart = options.dayStartMinuteFromMidnight;
    if (
        dayStart != null &&
        Number.isFinite(dayStart) &&
        dayStart >= 0 &&
        dayStart < 24 * 60
    ) {
        working = filterWhatsappDaytimeOnly(working, {
            startMinuteFromMidnight: dayStart,
        });
    }

    let cleanContent = working
        .split("\n")
        .filter((line) => line.includes(":"))
        .join("\n");
    if (!cleanContent.trim()) {
        throw new Error(
            "No messages left after filters — try turning off the daytime-only option or check the export format."
        );
    }
    if (cleanContent.length > maxChatChars) {
        cleanContent = cleanContent.slice(-maxChatChars);
    }

    const prompt = `${DEFAULT_PROMPT}${cleanContent}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const response = await generateWithRetry(model, prompt, {
        onRetry: options.onRetry,
    });
    const text = response.text();
    if (!text) {
        throw new Error("Empty model response");
    }
    return text;
}
