import { Component, inject } from "@angular/core";
import { ChatSummaryPageService } from "../chat-summary-page.service";
import { TranslatePipe } from "../i18n/translate.pipe";

@Component({
  selector: "wac-chat-settings",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./chat-settings.component.html",
  styleUrl: "./chat-settings.component.scss",
})
export class ChatSettingsComponent {
  readonly page = inject(ChatSummaryPageService);
}
