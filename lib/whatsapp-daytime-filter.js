/**
 * Keeps only WhatsApp messages whose **local** timestamp falls in
 * [startMinuteFromMidnight, 24:00) — i.e. from that clock time until end of calendar day.
 * Continuation lines (no new timestamp) inherit the previous message’s decision.
 *
 * Supported header shapes (best-effort, locale-dependent):
 * - `31/12/2023, 15:45 - Name: …`
 * - `12/31/23, 3:45 PM - Name: …`
 * - `[12/31/23, 3:45:01 PM] Name: …`
 * - `2024-12-31, 15:45 - Name: …`
 *
 * @param {string} raw
 * @param {{ startMinuteFromMidnight: number }} opts 0–1439; e.g. 300 = 05:00
 * @returns {string}
 */
export function filterWhatsappDaytimeOnly(raw, opts) {
    const startMin = clampMinute(opts.startMinuteFromMidnight);
    const lines = raw.split(/\r?\n/);
    /** @type {string[]} */
    const out = [];
    let sawHeader = false;
    /** @type {boolean | null} */
    let includeBlock = null;

    for (const line of lines) {
        const mins = tryParseMessageHeaderMinutes(line);
        if (mins != null) {
            sawHeader = true;
            includeBlock = mins >= startMin && mins < 24 * 60;
            if (includeBlock) {
                out.push(line);
            }
            continue;
        }
        if (!sawHeader) {
            continue;
        }
        if (includeBlock) {
            out.push(line);
        }
    }

    return out.join("\n");
}

/** @param {number} m */
function clampMinute(m) {
    const x = Math.floor(Number(m));
    if (!Number.isFinite(x)) {
        return 0;
    }
    return Math.min(Math.max(x, 0), 24 * 60 - 1);
}

/**
 * @param {string} line
 * @returns {number | null} minutes from midnight, or null if not a message header
 */
function tryParseMessageHeaderMinutes(line) {
    const s = line.trimStart();
    let m;

    // [DD/MM/YYYY, HH:MM(:SS)? (AM|PM)?] …
    m = s.match(
        /^\[(\d{1,2})[./](\d{1,2})[./](\d{2,4}),\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?\]/i
    );
    if (m) {
        return toMinutesFrom12hOr24h(
            parseInt(m[4], 10),
            parseInt(m[5], 10),
            m[7] ?? ""
        );
    }

    // YYYY-MM-DD, HH:MM
    m = s.match(
        /^(\d{4})-(\d{2})-(\d{2}),\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*[-–]/
    );
    if (m) {
        return parseInt(m[4], 10) * 60 + parseInt(m[5], 10);
    }

    // DD/MM/YY(YY), HH:MM(:SS)? AM|PM - …
    m = s.match(
        /^(\d{1,2})[./](\d{1,2})[./](\d{2,4}),\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)\s*[-–]/i
    );
    if (m) {
        return toMinutesFrom12hOr24h(
            parseInt(m[4], 10),
            parseInt(m[5], 10),
            m[7]
        );
    }

    // DD/MM/YY(YY), HH:MM(:SS)? - …  (24h; also picks up times without seconds)
    m = s.match(
        /^(\d{1,2})[./](\d{1,2})[./](\d{2,4}),\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*[-–]/
    );
    if (m) {
        const hour = parseInt(m[4], 10);
        const minute = parseInt(m[5], 10);
        return hour * 60 + minute;
    }

    return null;
}

/**
 * @param {number} hour1to12or24
 * @param {number} minute
 * @param {string} ampm
 */
function toMinutesFrom12hOr24h(hour1to12or24, minute, ampm) {
    const a = ampm.trim().toUpperCase();
    if (a === "AM" || a === "PM") {
        let h = hour1to12or24;
        if (a === "PM") {
            if (h < 12) {
                h += 12;
            }
        } else {
            if (h === 12) {
                h = 0;
            }
        }
        return h * 60 + minute;
    }
    return hour1to12or24 * 60 + minute;
}
