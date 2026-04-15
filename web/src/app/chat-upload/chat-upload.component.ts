import { Component, inject } from "@angular/core";
import { ChatSummaryPageService } from "../chat-summary-page.service";
import { TranslatePipe } from "../i18n/translate.pipe";

@Component({
  selector: "wac-chat-upload",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./chat-upload.component.html",
  styleUrl: "./chat-upload.component.scss",
})
export class ChatUploadComponent {
  readonly page = inject(ChatSummaryPageService);
}
