import { Component, inject } from "@angular/core";
import { TranslatePipe } from "../i18n/translate.pipe";
import { ThemeService } from "../theme.service";

@Component({
  selector: "wac-theme-toggle",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./theme-toggle.component.html",
  styleUrl: "./theme-toggle.component.scss",
})
export class ThemeToggleComponent {
  readonly themes = inject(ThemeService);
}
