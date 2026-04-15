import { DatePipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ChatSummaryPageService } from "../chat-summary-page.service";
import { TranslatePipe } from "../i18n/translate.pipe";
import { TranslateService } from "../i18n/translate.service";
import { SummaryHistoryStore } from "../summary-history.store";

@Component({
  selector: "wac-chat-history",
  standalone: true,
  imports: [DatePipe, TranslatePipe],
  templateUrl: "./chat-history.component.html",
  styleUrl: "./chat-history.component.scss",
})
export class ChatHistoryComponent {
  readonly page = inject(ChatSummaryPageService);
  readonly history = inject(SummaryHistoryStore);
  readonly i18n = inject(TranslateService);
}
