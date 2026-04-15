export type AppLocale = "he" | "en";

export const MESSAGES: Record<
  AppLocale,
  Record<string, string>
> = {
  he: {
    "app.title": "סיכום צ'אט וואטסאפ",
    "app.lead":
      "גררו לכאן את קובץ ה־txt שייצאתם (וואטסאפ → צ'אט → ⋮ → ייצוא צ'אט), או בחרו קובץ. ה־API key נשאר בשרת בלבד. אם שם הקובץ הוא משהו כמו",
    "app.leadAfterCode": "— כתבו את שם הקבוצה למטה.",
    "app.footerBuilt": "נבנה על ידי",
    "app.footerAuthor": "יובל שלום",
    "app.documentTitle": "סיכום צ'אט וואטסאפ",

    "app.menuAria": "הגדרות: שפה וערכת נושא",
    "app.menuLanguage": "שפה",
    "app.menuTheme": "ערכת נושא",

    "upload.hintBold": "גרירה לכאן",
    "upload.hintRest": "או לחיצה לבחירת קובץ",
    "upload.noFile": "לא נבחר קובץ",

    "settings.groupLabel": "שם הקבוצה (אופציונלי)",
    "settings.groupPlaceholder":
      "למשל כשהקובץ לא נקרא «WhatsApp Chat עם…»",
    "settings.maxCharsLabel": "מקס. תווים מהסוף (אופציונלי)",
    "settings.maxCharsPlaceholder": "ברירת מחדל מהשרת",
    "settings.generate": "צור סיכום",
    "settings.processing": "מעבד…",

    "history.title": "סיכומים אחרונים",
    "history.clearAll": "נקה הכל",
    "history.deleteAria": "מחק סיכום",
    "history.deleteAriaName": "מחק סיכום: {{name}}",

    "result.summary": "סיכום",
    "result.copy": "העתק",
    "result.copied": "הועתק",
    "result.copyError": "לא ניתן להעתיק",
    "result.copyAria": "העתקת הסיכום ללוח",

    "theme.hintLight": "מצב בהיר",
    "theme.hintDark": "מצב כהה",
    "theme.ariaToLight": "עבור למצב בהיר",
    "theme.ariaToDark": "עבור למצב כהה",

    "lang.aria": "החלפת שפה: עברית / English",
    "lang.he": "עב",
    "lang.en": "EN",

    "errors.noFileSelected": "בחרו או גררו קובץ txt מייצוא וואטסאפ.",
    "errors.notTxt": "נדרש קובץ .txt (ייצוא צ'אט מוואטסאפ).",
    "errors.unexpected": "שגיאה לא צפויה",
    "errors.network": "שגיאת רשת ({{status}})",
  },
  en: {
    "app.title": "WhatsApp chat summary",
    "app.lead":
      "Drag and drop your exported .txt here (WhatsApp → Chat → ⋮ → Export chat), or pick a file. The API key stays on the server only. If the filename looks like",
    "app.leadAfterCode": "— enter the group name below.",
    "app.footerBuilt": "Built by",
    "app.footerAuthor": "Yuval Shalom",
    "app.documentTitle": "WhatsApp chat summary",

    "app.menuAria": "Settings: language and theme",
    "app.menuLanguage": "Language",
    "app.menuTheme": "Theme",

    "upload.hintBold": "Drop here",
    "upload.hintRest": "or click to choose a file",
    "upload.noFile": "No file selected",

    "settings.groupLabel": "Group name (optional)",
    "settings.groupPlaceholder":
      'e.g. when the file is not named "WhatsApp Chat with…"',
    "settings.maxCharsLabel": "Max characters from the end (optional)",
    "settings.maxCharsPlaceholder": "Server default",
    "settings.generate": "Summarize",
    "settings.processing": "Working…",

    "history.title": "Recent summaries",
    "history.clearAll": "Clear all",
    "history.deleteAria": "Remove summary",
    "history.deleteAriaName": "Remove summary: {{name}}",

    "result.summary": "Summary",
    "result.copy": "Copy",
    "result.copied": "Copied",
    "result.copyError": "Could not copy",
    "result.copyAria": "Copy summary to clipboard",

    "theme.hintLight": "Light",
    "theme.hintDark": "Dark",
    "theme.ariaToLight": "Switch to light mode",
    "theme.ariaToDark": "Switch to dark mode",

    "lang.aria": "Switch language: Hebrew / English",
    "lang.he": "עב",
    "lang.en": "EN",

    "errors.noFileSelected":
      "Choose or drop a .txt file exported from WhatsApp.",
    "errors.notTxt": "A .txt export from WhatsApp is required.",
    "errors.unexpected": "Unexpected error",
    "errors.network": "Network error ({{status}})",
  },
} as const satisfies Record<AppLocale, Record<string, string>>;

export type MessageKey = keyof (typeof MESSAGES)["he"];
