import { Component, inject } from "@angular/core";
import { TranslatePipe } from "../i18n/translate.pipe";
import { TranslateService } from "../i18n/translate.service";

@Component({
  selector: "wac-locale-toggle",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./locale-toggle.component.html",
  styleUrl: "./locale-toggle.component.scss",
})
export class LocaleToggleComponent {
  readonly i18n = inject(TranslateService);
}
