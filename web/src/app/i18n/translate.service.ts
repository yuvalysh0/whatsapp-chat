import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject, signal } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MESSAGES, type AppLocale, type MessageKey } from "./messages";

const STORAGE_KEY = "wac-locale";

@Injectable({ providedIn: "root" })
export class TranslateService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly platformId = inject(PLATFORM_ID);

  readonly locale = signal<AppLocale>("he");

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY) as AppLocale | null;
    if (stored === "en" || stored === "he") {
      this.locale.set(stored);
    }
    this.applyDocumentLocale();
    this.title.setTitle(this.translate("app.documentTitle"));
  }

  translate(
    key: MessageKey,
    params?: Readonly<Record<string, string | number>>
  ): string {
    this.locale();
    const table = MESSAGES[this.locale()];
    let raw = table[key] ?? String(key);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        raw = raw.replaceAll(`{{${k}}}`, String(v));
      }
    }
    return raw;
  }

  setLocale(loc: AppLocale): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.locale.set(loc);
    localStorage.setItem(STORAGE_KEY, loc);
    this.applyDocumentLocale();
    this.title.setTitle(this.translate("app.documentTitle"));
  }

  toggleLocale(): void {
    this.setLocale(this.locale() === "he" ? "en" : "he");
  }

  /** `DatePipe` format pattern for list timestamps. */
  dateTimePattern(): string {
    return this.locale() === "he"
      ? "dd/MM/yyyy, HH:mm"
      : "MMM d, y, h:mm a";
  }

  /** Locale id for `DatePipe` 4th argument. */
  dateTimeLocaleId(): string {
    return this.locale() === "he" ? "he-IL" : "en-US";
  }

  private applyDocumentLocale(): void {
    const loc = this.locale();
    const html = this.document.documentElement;
    html.lang = loc === "he" ? "he" : "en";
    html.dir = loc === "he" ? "rtl" : "ltr";
  }
}
