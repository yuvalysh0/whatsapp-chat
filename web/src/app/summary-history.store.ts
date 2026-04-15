import { isPlatformBrowser } from "@angular/common";
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from "@angular/core";

const STORAGE_KEY = "whatsapp-summary-history-v2";
const STORAGE_KEY_LEGACY = "whatsapp-summary-history-v1";
const MAX_ITEMS = 40;

export interface SavedSummary {
  readonly id: string;
  readonly createdAt: string;
  readonly fileName: string;
  /** Group / chat name when detected on the server */
  readonly chatName?: string;
  readonly text: string;
}

@Injectable({ providedIn: "root" })
export class SummaryHistoryStore {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _items = signal<readonly SavedSummary[]>([]);

  readonly items = this._items.asReadonly();

  readonly count = computed(() => this._items().length);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.hydrate();
    }
  }

  add(entry: {
    readonly fileName: string;
    readonly text: string;
    readonly chatName?: string;
  }): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const item: SavedSummary = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      fileName: entry.fileName,
      ...(entry.chatName ? { chatName: entry.chatName } : {}),
      text: entry.text,
    };
    this._items.update((list) => [item, ...list].slice(0, MAX_ITEMS));
    this.persist();
  }

  remove(id: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this._items.update((list) => list.filter((x) => x.id !== id));
    this.persist();
  }

  clear(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this._items.set([]);
    this.persist();
  }

  private hydrate(): void {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      let fromLegacy = false;
      if (!raw) {
        raw = localStorage.getItem(STORAGE_KEY_LEGACY);
        fromLegacy = Boolean(raw);
      }
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return;
      }
      const items = parsed.filter(isSavedSummary);
      this._items.set(items.slice(0, MAX_ITEMS));
      if (fromLegacy) {
        this.persist();
        localStorage.removeItem(STORAGE_KEY_LEGACY);
      }
    } catch {
      this._items.set([]);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
    } catch {
      this._items.update((list) => list.slice(0, Math.min(10, list.length)));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
      } catch {
        /* ignore */
      }
    }
  }
}

function isSavedSummary(x: unknown): x is SavedSummary {
  if (!x || typeof x !== "object") {
    return false;
  }
  const o = x as Record<string, unknown>;
  if (
    typeof o["id"] !== "string" ||
    typeof o["createdAt"] !== "string" ||
    typeof o["fileName"] !== "string" ||
    typeof o["text"] !== "string"
  ) {
    return false;
  }
  if (o["chatName"] !== undefined && typeof o["chatName"] !== "string") {
    return false;
  }
  return true;
}
