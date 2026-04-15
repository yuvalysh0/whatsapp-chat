import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { TranslateService } from "./i18n/translate.service";
import { SummarizeService } from "./summarize.service";
import {
  SummaryHistoryStore,
  type SavedSummary,
} from "./summary-history.store";

@Injectable({ providedIn: "root" })
export class ChatSummaryPageService {
  private readonly api = inject(SummarizeService);
  private readonly history = inject(SummaryHistoryStore);
  private readonly i18n = inject(TranslateService);

  readonly selectedFile = signal<File | null>(null);
  readonly fileLabel = signal<string>("");
  readonly loading = signal(false);
  readonly summary = signal<string | null>(null);
  readonly chatName = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly maxChars = signal<number | undefined>(undefined);
  readonly groupNameOverride = signal("");

  onGroupNameInput(event: Event): void {
    this.groupNameOverride.set((event.target as HTMLInputElement).value);
  }

  onFilePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.applyFile(file);
    input.value = "";
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0] ?? null;
    this.applyFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onMaxCharsInput(event: Event): void {
    const v = (event.target as HTMLInputElement).valueAsNumber;
    this.maxChars.set(Number.isNaN(v) ? undefined : v);
  }

  async generate(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      this.error.set(this.i18n.translate("errors.noFileSelected"));
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.summary.set(null);
    this.chatName.set(null);
    try {
      const res = await firstValueFrom(
        this.api.summarize(file, {
          maxChatChars: this.maxChars(),
          groupName: this.groupNameOverride().trim() || undefined,
        })
      );
      this.summary.set(res.summary);
      this.chatName.set(res.chatName ?? null);
      this.history.add({
        fileName: file.name,
        text: res.summary,
        ...(res.chatName ? { chatName: res.chatName } : {}),
      });
    } catch (e: unknown) {
      this.error.set(this.formatError(e));
    } finally {
      this.loading.set(false);
    }
  }

  openSavedSummary(entry: SavedSummary): void {
    this.summary.set(entry.text);
    this.chatName.set(entry.chatName ?? null);
    this.error.set(null);
  }

  private applyFile(file: File | null): void {
    if (!file) {
      return;
    }
    if (!file.name.toLowerCase().endsWith(".txt")) {
      this.error.set(this.i18n.translate("errors.notTxt"));
      this.selectedFile.set(null);
      this.fileLabel.set("");
      return;
    }
    this.error.set(null);
    this.selectedFile.set(file);
    this.fileLabel.set(file.name);
  }

  private formatError(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const body = e.error as { error?: string } | string | null;
      if (body && typeof body === "object" && typeof body.error === "string") {
        return body.error;
      }
      if (typeof body === "string" && body.length > 0) {
        return body;
      }
      return (
        e.message ||
        this.i18n.translate("errors.network", { status: e.status })
      );
    }
    return e instanceof Error
      ? e.message
      : this.i18n.translate("errors.unexpected");
  }
}
