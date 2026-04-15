import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from "@angular/core";
import { TranslatePipe } from "../i18n/translate.pipe";
import { LocaleToggleComponent } from "../locale-toggle/locale-toggle.component";
import { ThemeToggleComponent } from "../theme-toggle/theme-toggle.component";

@Component({
  selector: "wac-app-menu",
  standalone: true,
  imports: [LocaleToggleComponent, ThemeToggleComponent, TranslatePipe],
  templateUrl: "./app-menu.component.html",
  styleUrl: "./app-menu.component.scss",
})
export class AppMenuComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly open = signal(false);

  readonly menuPanelId = "wac-app-menu-panel";

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    const root = this.host.nativeElement;
    if (!root.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener("document:keydown", ["$event"])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.open()) {
      this.close();
    }
  }
}
