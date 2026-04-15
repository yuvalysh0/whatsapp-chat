import { Pipe, PipeTransform, inject } from "@angular/core";
import type { MessageKey } from "./messages";
import { TranslateService } from "./translate.service";

@Pipe({
  name: "translate",
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslateService);

  transform(
    key: MessageKey,
    params?: Readonly<Record<string, string | number>>
  ): string {
    this.i18n.locale();
    return this.i18n.translate(key, params);
  }
}
