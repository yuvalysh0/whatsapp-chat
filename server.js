import "dotenv/config";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { extractWhatsappChatName } from "./lib/whatsapp-chat-name.js";
import { summarizeWhatsappText } from "./lib/summarize.js";

/**
 * @param {import("express").Request} req
 * @returns {number | undefined} minutes from midnight, or undefined = no time-of-day filter
 */
function resolveDayStartMinute(req) {
    const b = req.body?.dayStartHour;
    if (b === "off") {
        return undefined;
    }
    if (b !== undefined && b !== null && String(b).trim() !== "") {
        const h = Number.parseInt(String(b), 10);
        if (Number.isFinite(h) && h >= 0 && h <= 23) {
            return h * 60;
        }
    }
    const envH = process.env.SUMMARY_DAY_START_HOUR;
    if (envH !== undefined && String(envH).trim() !== "") {
        const h = Number.parseInt(String(envH), 10);
        if (Number.isFinite(h) && h >= 0 && h <= 23) {
            return h * 60;
        }
    }
    return undefined;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const angularDir = path.join(__dirname, "web", "dist", "web", "browser");
const angularIndex = path.join(angularDir, "index.html");

const app = express();

app.get("/health", (_req, res) => {
    res.status(200).type("text/plain").send("ok");
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
});

app.post("/api/summarize", upload.single("file"), async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            res.status(500).json({
                error: "Server missing GEMINI_API_KEY in .env",
            });
            return;
        }
        if (!req.file?.buffer) {
            res.status(400).json({ error: "Upload a .txt export (field name: file)" });
            return;
        }
        const raw = req.file.buffer.toString("utf-8");
        if (!raw.trim()) {
            res.status(400).json({ error: "File is empty" });
            return;
        }

        const maxChatChars = req.body.maxChatChars
            ? Number.parseInt(String(req.body.maxChatChars), 10)
            : undefined;
        const dayStartMinute = resolveDayStartMinute(req);
        const summary = await summarizeWhatsappText(raw, {
            ...(Number.isFinite(maxChatChars) && maxChatChars > 0
                ? { maxChatChars }
                : {}),
            ...(dayStartMinute != null
                ? { dayStartMinuteFromMidnight: dayStartMinute }
                : {}),
        });
        let manualName = String(
            req.body.groupName ?? req.body.chatName ?? ""
        ).trim();
        if (manualName.length > 200) {
            manualName = manualName.slice(0, 200);
        }
        const extracted = extractWhatsappChatName(raw, req.file.originalname);
        const chatName = manualName || extracted || "";
        res.json({
            summary,
            ...(chatName ? { chatName } : {}),
        });
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const status = message.includes("API key") ? 500 : 502;
        res.status(status).json({ error: message });
    }
});

if (fs.existsSync(angularIndex)) {
    app.use(express.static(angularDir));
    app.get(/.*/, (req, res, next) => {
        if (req.path.startsWith("/api")) {
            next();
            return;
        }
        res.sendFile(angularIndex);
    });
}

const port = Number(process.env.PORT ?? "3000");
app.listen(port, () => {
    const hasAngular = fs.existsSync(angularIndex);
    console.log(
        hasAngular
            ? `WhatsApp summary: Angular UI + API → http://localhost:${port}`
            : `API only (no web/dist) — run "npm run dev" for Angular on :4200, or "npm run start:prod" for UI on :${port}`
    );
});
