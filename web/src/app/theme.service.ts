import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject, signal } from "@angular/core";

const STORAGE_KEY = "wac-theme";

export type AppTheme = "light" | "dark";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  /** Current UI theme (persisted in localStorage when in browser). */
  readonly theme = signal<AppTheme>("dark");

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initial: AppTheme =
      stored === "light" || stored === "dark"
        ? stored
        : prefersDark
          ? "dark"
          : "light";
    this.theme.set(initial);
    this.applyToDocument(initial);
  }

  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const next: AppTheme = this.theme() === "dark" ? "light" : "dark";
    this.theme.set(next);
    this.applyToDocument(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  private applyToDocument(t: AppTheme): void {
    const el = this.document.documentElement;
    el.setAttribute("data-theme", t);
    el.style.colorScheme = t === "dark" ? "dark" : "light";
  }
}
