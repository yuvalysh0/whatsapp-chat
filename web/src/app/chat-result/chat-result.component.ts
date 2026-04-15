import { Component, inject, signal } from "@angular/core";
import { ChatSummaryPageService } from "../chat-summary-page.service";
import { TranslatePipe } from "../i18n/translate.pipe";

type CopyFeedback = "idle" | "copied" | "error";

@Component({
  selector: "wac-chat-result",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./chat-result.component.html",
  styleUrl: "./chat-result.component.scss",
})
export class ChatResultComponent {
  readonly page = inject(ChatSummaryPageService);

  readonly copyFeedback = signal<CopyFeedback>("idle");

  async copySummary(): Promise<void> {
    const text = this.page.summary();
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      this.copyFeedback.set("copied");
      setTimeout(() => this.copyFeedback.set("idle"), 2000);
    } catch {
      this.copyFeedback.set("error");
      setTimeout(() => this.copyFeedback.set("idle"), 2500);
    }
  }
}
