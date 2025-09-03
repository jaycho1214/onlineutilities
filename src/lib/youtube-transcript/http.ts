import { IpBlocked, YouTubeRequestFailed } from "./errors";

export type HeadersInitLike = Record<string, string>;

export interface ResponseLike {
  status: number;
  text(): Promise<string>;
  json(): Promise<unknown>;
}

export type FetchLike = (
  url: string,
  init?: { method?: string; headers?: HeadersInitLike; body?: string },
) => Promise<ResponseLike>;

export class HttpClient {
  private cookieHeader?: string;
  private defaultHeaders: HeadersInitLike;
  private fetchImpl: FetchLike;

  constructor(fetchImpl?: FetchLike, headers?: HeadersInitLike) {
    this.fetchImpl = fetchImpl || (fetch as unknown as FetchLike);
    this.defaultHeaders = {
      "Accept-Language": "en-US",
      ...headers,
    };
  }

  setConsentCookie(consent: string) {
    this.cookieHeader = `CONSENT=YES+${consent}`;
  }

  clearConsentCookie() {
    this.cookieHeader = undefined;
  }

  async get(
    url: string,
    headers?: HeadersInitLike,
    videoIdForErrors?: string,
  ): Promise<ResponseLike> {
    const h = this.buildHeaders(headers);
    const res = await this.fetchImpl(url, { method: "GET", headers: h });
    return this.raiseHttpErrors(res, videoIdForErrors);
  }

  async postJson(
    url: string,
    body: unknown,
    headers?: HeadersInitLike,
    videoIdForErrors?: string,
  ): Promise<ResponseLike> {
    const h = this.buildHeaders({
      "Content-Type": "application/json",
      ...headers,
    });
    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: h,
      body: JSON.stringify(body),
    });
    return this.raiseHttpErrors(res, videoIdForErrors);
  }

  private buildHeaders(headers?: HeadersInitLike): HeadersInitLike {
    return {
      ...this.defaultHeaders,
      ...(this.cookieHeader ? { Cookie: this.cookieHeader } : {}),
      ...(headers || {}),
    };
  }

  private async raiseHttpErrors(
    response: ResponseLike,
    videoIdForErrors?: string,
  ): Promise<ResponseLike> {
    if (response.status === 429) {
      throw new IpBlocked(videoIdForErrors || "unknown");
    }
    if (response.status >= 200 && response.status < 300) return response;
    // Try to read some body for diagnostics
    let reason = `${response.status}`;
    try {
      const text = await response.text();
      reason = `${response.status} ${text.slice(0, 200)}`;
    } catch {}
    throw new YouTubeRequestFailed(videoIdForErrors || "unknown", reason);
  }
}
