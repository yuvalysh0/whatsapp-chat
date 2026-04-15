import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultChatPath = path.join(__dirname, "whatsapp_chat.txt");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("חסר GEMINI_API_KEY ב-.env");
    process.exit(1);
}

const modelName = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
const maxChatChars = Number(process.env.MAX_CHAT_CHARS ?? "12000");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: modelName });

async function generateWithRetry(m, prompt) {
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
            console.warn(
                `מגיעים למכסה (429), ממתין ${Math.round(waitMs / 1000)} שניות לפני ניסיון ${attempt + 2}/${maxAttempts}...`
            );
            await new Promise((r) => setTimeout(r, waitMs));
        }
    }
    throw lastError;
}

async function summarizeChat(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(
                `לא נמצא קובץ: ${filePath}\n` +
                    `ייצא את הצ'אט מוואטסאפ (More → Export chat) ושמור כ-whatsapp_chat.txt בתיקיית הפרויקט, או העבר נתיב מלא כארגומנט:\n` +
                    `  node index.js /path/to/chat.txt`
            );
            process.exitCode = 1;
            return;
        }
        // 1. קריאת הקובץ
        let rawContent = fs.readFileSync(filePath, "utf-8");

        // 2. ניקוי בסיסי — רק שורות הודעה; לוקחים את הסוף (הכי עדכני) כדי לא לפוצץ מכסת טוקנים/דקה
        let cleanContent = rawContent
            .split("\n")
            .filter((line) => line.includes(":"))
            .join("\n");
        if (cleanContent.length > maxChatChars) {
            cleanContent = cleanContent.slice(-maxChatChars);
        }

        // 3. יצירת הפרומפט
        const prompt = `
        אתה עוזר אישי שתפקידו לסכם שיחות וואטסאפ. 
        להלן צ'אט קבוצתי מהיום האחרון. 
        אנא ספק סיכום קצר (עד 5 נקודות) שכולל:
        - נושאים מרכזיים שדובר עליהם.
        - החלטות שהתקבלו (אם היו).
        - דברים מצחיקים או חריגים שקרו.
        
        הסיכום צריך להיות בעברית זורמת וקלילה.
        
        הצ'אט:
        ${cleanContent}`;

        // 4. שליחה ל-Gemini
        console.log("מעבד את השיחה... זה יכול לקחת כמה שניות.");
        const response = await generateWithRetry(model, prompt);
        
        console.log("\n--- סיכום הקבוצה ---");
        console.log(response.text());

    } catch (error) {
        console.error("אופס, משהו השתבש:", error);
    }
}

// נתיב: ארגומנט ראשון, או whatsapp_chat.txt ליד index.js
const chatPath = process.argv[2] ?? defaultChatPath;
summarizeChat(chatPath);