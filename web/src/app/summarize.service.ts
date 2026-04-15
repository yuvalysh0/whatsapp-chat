import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

export interface SummarizeResponse {
  readonly summary: string;
  readonly chatName?: string;
}

@Injectable({ providedIn: "root" })
export class SummarizeService {
  private readonly http = inject(HttpClient);

  summarize(
    file: File,
    options?: {
      readonly maxChatChars?: number;
      readonly groupName?: string;
      readonly daytimeOnly?: boolean;
    }
  ): Observable<SummarizeResponse> {
    const body = new FormData();
    body.append("file", file);
    const maxChatChars = options?.maxChatChars;
    if (maxChatChars != null && Number.isFinite(maxChatChars)) {
      body.append("maxChatChars", String(maxChatChars));
    }
    const g = options?.groupName?.trim();
    if (g) {
      body.append("groupName", g);
    }
    if (options?.daytimeOnly === true) {
      body.append("dayStartHour", "5");
    } else if (options?.daytimeOnly === false) {
      body.append("dayStartHour", "off");
    }
    return this.http.post<SummarizeResponse>("/api/summarize", body);
  }
}
