import { Component, inject } from "@angular/core";
import { ChatHistoryComponent } from "./chat-history/chat-history.component";
import { ChatResultComponent } from "./chat-result/chat-result.component";
import { ChatSettingsComponent } from "./chat-settings/chat-settings.component";
import { ChatUploadComponent } from "./chat-upload/chat-upload.component";
import { AppMenuComponent } from "./app-menu/app-menu.component";
import { TranslateService } from "./i18n/translate.service";
import { TranslatePipe } from "./i18n/translate.pipe";
import { ThemeService } from "./theme.service";

@Component({
  selector: "app-root",
  imports: [
    ChatUploadComponent,
    ChatSettingsComponent,
    ChatHistoryComponent,
    ChatResultComponent,
    AppMenuComponent,
    TranslatePipe,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  readonly year = new Date().getFullYear();

  constructor() {
    inject(ThemeService);
    inject(TranslateService);
  }
}
