/**
 * Best-effort chat / group title from WhatsApp .txt export.
 * @param {string} raw Full file text
 * @param {string} fileName Original upload name
 * @returns {string | null}
 */
export function extractWhatsappChatName(raw, fileName) {
    return (
        extractFromFileName(fileName) ??
        extractFromSystemMessages(raw) ??
        extractFromBody(raw)
    );
}

/** @param {string} fileName */
function extractFromFileName(fileName) {
    const base = fileName.replace(/\.txt$/i, "").trim();
    if (!base) {
        return null;
    }
    const patterns = [
        /^WhatsApp Chat with\s+(.+)$/i,
        /^WhatsApp Chat\s*[-–]\s*(.+)$/i,
        /^WhatsApp צ'אט עם\s+(.+)$/i,
        /^צ'אט WhatsApp עם\s+(.+)$/i,
        /^Chat WhatsApp avec\s+(.+)$/i,
        /^WhatsApp-Chat mit\s+(.+)$/i,
    ];
    for (const re of patterns) {
        const m = base.match(re);
        if (m?.[1]) {
            return sanitizeTitle(m[1]);
        }
    }
    return null;
}

/**
 * Group / subject lines embedded in chat (works when filename is e.g. _chat.txt).
 * @param {string} raw
 */
function extractFromSystemMessages(raw) {
    const slice = raw.slice(0, 250_000);

    /** @type {Array<{ re: RegExp; pick: "last" | "first" }>} */
    const subjectChanged = [
        {
            re: /שם הקבוצה שונה[^.\n]{0,80}?[""«״]([^"»״\n]{2,120})[""»״]/g,
            pick: "last",
        },
        {
            re: /הקבוצה נקראת כעת[^.\n]{0,20}?[""«״]([^"»״\n]{2,120})[""»״]/g,
            pick: "last",
        },
        {
            re: /Group subject changed to:\s*["'“]([^"'\n]{2,120})["'”]?/gi,
            pick: "last",
        },
        {
            re: /subject (?:is|changed to)\s*[:\s]+["'“]([^"'\n]{2,120})["'”]?/gi,
            pick: "last",
        },
    ];

    for (const { re, pick } of subjectChanged) {
        const matches = [...slice.matchAll(re)];
        if (matches.length === 0) {
            continue;
        }
        const m =
            pick === "last" ? matches[matches.length - 1] : matches[0];
        const t = sanitizeTitle(/** @type {string} */ (m[1]));
        if (isPlausibleTitle(t)) {
            return t;
        }
    }

    const createdPatterns = [
        /created group\s+[""«״]([^"»״\n]{2,120})[""»״]/i,
        /You created group\s+[""«״]([^"»״\n]{2,120})[""»״]/i,
        /נוצרה קבוצה בשם\s*[""«״]([^"»״\n]{2,120})[""»״]/,
        /קבוצה חדשה:\s*[""«״]([^"»״\n]{2,120})[""»״]/,
    ];
    for (const re of createdPatterns) {
        const m = slice.match(re);
        if (m?.[1]) {
            const t = sanitizeTitle(m[1]);
            if (isPlausibleTitle(t)) {
                return t;
            }
        }
    }

    return null;
}

/** @param {string} t */
function isPlausibleTitle(t) {
    if (t.length < 2 || t.length > 130) {
        return false;
    }
    if (/^https?:\/\//i.test(t)) {
        return false;
    }
    return true;
}

/** @param {string} raw */
function extractFromBody(raw) {
    const normalized = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
    const lines = normalized.split("\n");
    const isSystem = (s) =>
        /end-to-end|e2e|הצפנה|הודעות ושיחות|Messages and calls|Tap for|נגיעה|omitted|media omitted/i.test(
            s
        );

    /** First line that looks like a WhatsApp message row */
    const isMessageLine = (s) => {
        const t = s.replace(/^\u200e|\u200f/g, "").trim();
        if (!t) {
            return false;
        }
        return /^\[.+\]\s*[^:]+:\s*/.test(t);
    };

    const preamble = [];
    for (const line of lines.slice(0, 35)) {
        const t = line.replace(/^\u200e|\u200f/g, "").trim();
        if (!t) {
            if (preamble.length > 0) {
                break;
            }
            continue;
        }
        if (isSystem(t)) {
            continue;
        }
        if (isMessageLine(t)) {
            break;
        }
        preamble.push(t);
        if (preamble.length >= 2) {
            break;
        }
    }
    if (preamble.length === 0) {
        return null;
    }
    const title = preamble[0];
    if (title.length < 2 || title.length > 150) {
        return null;
    }
    return sanitizeTitle(title);
}

/** @param {string} s */
function sanitizeTitle(s) {
    return s.replace(/\s+/g, " ").trim();
}
