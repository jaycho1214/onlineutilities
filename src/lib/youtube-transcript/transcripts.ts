import { INNERTUBE_API_URL, INNERTUBE_CONTEXT, WATCH_URL } from "./constants";
import {
  AgeRestricted,
  FailedToCreateConsentCookie,
  InvalidVideoId,
  IpBlocked,
  NoTranscriptFound,
  NotTranslatable,
  PoTokenRequired,
  RequestBlocked,
  TranscriptsDisabled,
  TranslationLanguageNotAvailable,
  VideoUnavailable,
  VideoUnplayable,
  YouTubeDataUnparsable,
} from "./errors";
import { HttpClient } from "./http";

export interface FetchedTranscriptSnippet {
  text: string;
  start: number; // seconds
  duration: number; // seconds the snippet stays on screen
}

export class FetchedTranscript implements Iterable<FetchedTranscriptSnippet> {
  constructor(
    public readonly snippets: FetchedTranscriptSnippet[],
    public readonly videoId: string,
    public readonly language: string,
    public readonly languageCode: string,
    public readonly isGenerated: boolean,
  ) {}

  [Symbol.iterator](): Iterator<FetchedTranscriptSnippet> {
    return this.snippets[Symbol.iterator]();
  }

  get length(): number {
    return this.snippets.length;
  }

  toRawData(): FetchedTranscriptSnippet[] {
    return [...this.snippets];
  }
}

type TranslationLanguage = { language: string; languageCode: string };

export class Transcript {
  private _translationLanguagesMap: Record<string, string>;
  constructor(
    private readonly http: HttpClient,
    public readonly videoId: string,
    private readonly url: string,
    public readonly language: string,
    public readonly languageCode: string,
    public readonly isGenerated: boolean,
    public readonly translationLanguages: TranslationLanguage[],
  ) {
    this._translationLanguagesMap = Object.fromEntries(
      translationLanguages.map((l) => [l.languageCode, l.language]),
    );
  }

  async fetch(preserveFormatting = false): Promise<FetchedTranscript> {
    if (this.url.includes("&exp=xpe")) {
      throw new PoTokenRequired(this.videoId);
    }
    const res = await this.http.get(this.url, undefined, this.videoId);
    const text = await res.text();
    const snippets = new TranscriptParser(preserveFormatting).parse(text);
    return new FetchedTranscript(
      snippets,
      this.videoId,
      this.language,
      this.languageCode,
      this.isGenerated,
    );
  }

  toString(): string {
    const translation = this.isTranslatable ? "[TRANSLATABLE]" : "";
    return `${this.languageCode} ("${this.language}")${translation}`;
  }

  get isTranslatable(): boolean {
    return this.translationLanguages.length > 0;
  }

  translate(languageCode: string): Transcript {
    if (!this.isTranslatable) throw new NotTranslatable(this.videoId);
    if (!(languageCode in this._translationLanguagesMap))
      throw new TranslationLanguageNotAvailable(this.videoId);
    const name = this._translationLanguagesMap[languageCode];
    return new Transcript(
      this.http,
      this.videoId,
      `${this.url}&tlang=${languageCode}`,
      name,
      languageCode,
      true,
      [],
    );
  }
}

export class TranscriptList implements Iterable<Transcript> {
  private constructor(
    public readonly videoId: string,
    private readonly manuallyCreated: Record<string, Transcript>,
    private readonly generated: Record<string, Transcript>,
    private readonly translationLanguages: TranslationLanguage[],
  ) {}

  static build(
    http: HttpClient,
    videoId: string,
    captionsJson: {
      translationLanguages?: Array<{
        languageName?: { runs?: Array<{ text: string }> };
        languageCode: string;
      }>;
      captionTracks: Array<{
        kind: string;
        baseUrl: string;
        name?: { runs?: Array<{ text: string }> };
        languageCode: string;
        isTranslatable?: boolean;
      }>;
    },
  ): TranscriptList {
    const translationLanguages: TranslationLanguage[] = (
      captionsJson.translationLanguages || []
    ).map((lang) => ({
      language: lang.languageName?.runs?.[0]?.text || "",
      languageCode: lang.languageCode,
    }));

    const manuallyCreated: Record<string, Transcript> = {};
    const generated: Record<string, Transcript> = {};

    for (const caption of captionsJson.captionTracks) {
      const isGenerated = caption.kind === "asr";
      const dict = isGenerated ? generated : manuallyCreated;
      const url = String(caption.baseUrl).replace("&fmt=srv3", "");
      const language = caption.name?.runs?.[0]?.text || "";
      const languageCode = caption.languageCode;
      const isTranslatable = !!caption.isTranslatable;
      const transcript = new Transcript(
        http,
        videoId,
        url,
        language,
        languageCode,
        isGenerated,
        isTranslatable ? translationLanguages : [],
      );
      dict[languageCode] = transcript;
    }

    return new TranscriptList(
      videoId,
      manuallyCreated,
      generated,
      translationLanguages,
    );
  }

  [Symbol.iterator](): Iterator<Transcript> {
    const all = [
      ...Object.values(this.manuallyCreated),
      ...Object.values(this.generated),
    ];
    return all[Symbol.iterator]();
  }

  findTranscript(languageCodes: Iterable<string>): Transcript {
    return this.findInternal(languageCodes, [
      this.manuallyCreated,
      this.generated,
    ]);
  }

  findGeneratedTranscript(languageCodes: Iterable<string>): Transcript {
    return this.findInternal(languageCodes, [this.generated]);
  }

  findManuallyCreatedTranscript(languageCodes: Iterable<string>): Transcript {
    return this.findInternal(languageCodes, [this.manuallyCreated]);
  }

  private findInternal(
    languageCodes: Iterable<string>,
    dicts: Array<Record<string, Transcript>>,
  ): Transcript {
    for (const code of languageCodes) {
      for (const dict of dicts) {
        if (code in dict) return dict[code];
      }
    }
    throw new NoTranscriptFound(this.videoId, languageCodes, this.toString());
  }

  toString(): string {
    const describe = (items: string[]) =>
      items.length ? items.map((t) => ` - ${t}`).join("\n") : "None";
    const manual = describe(
      Object.values(this.manuallyCreated).map((t) => t.toString()),
    );
    const generated = describe(
      Object.values(this.generated).map((t) => t.toString()),
    );
    const translation = describe(
      this.translationLanguages.map(
        (t) => `${t.languageCode} ("${t.language}")`,
      ),
    );
    return (
      `For this video (${this.videoId}) transcripts are available in the following languages:\n\n` +
      `(MANUALLY CREATED)\n${manual}\n\n` +
      `(GENERATED)\n${generated}\n\n` +
      `(TRANSLATION LANGUAGES)\n${translation}`
    );
  }
}

export class TranscriptListFetcher {
  constructor(private readonly http: HttpClient) {}

  async fetch(videoId: string): Promise<TranscriptList> {
    const captions = await this.fetchCaptionsJson(videoId);
    return TranscriptList.build(this.http, videoId, captions);
  }

  private async fetchCaptionsJson(videoId: string): Promise<{
    translationLanguages?: Array<{
      languageName?: { runs?: Array<{ text: string }> };
      languageCode: string;
    }>;
    captionTracks: Array<{
      kind: string;
      baseUrl: string;
      name?: { runs?: Array<{ text: string }> };
      languageCode: string;
      isTranslatable?: boolean;
    }>;
  }> {
    try {
      const html = await this.fetchVideoHtml(videoId);
      const apiKey = this.extractInnertubeApiKey(html, videoId);
      const data = await this.fetchInnertubeData(videoId, apiKey);
      return this.extractCaptionsJson(data, videoId);
    } catch (e) {
      if (e instanceof RequestBlocked) {
        // No automatic retries without external proxy rotation; rethrow
        throw e;
      }
      throw e;
    }
  }

  private extractInnertubeApiKey(html: string, videoId: string): string {
    const pattern = /"INNERTUBE_API_KEY"\s*:\s*"([a-zA-Z0-9_-]+)"/;
    const match = html.match(pattern);
    if (match && match[1]) return match[1];
    if (html.includes('class="g-recaptcha"')) throw new IpBlocked(videoId);
    throw new YouTubeDataUnparsable(videoId);
  }

  private extractCaptionsJson(
    innertubeData: {
      playabilityStatus?: {
        status?: string;
        reason?: string;
        errorScreen?: {
          playerErrorMessageRenderer?: {
            subreason?: {
              runs?: Array<{ text?: string }>;
            };
          };
        };
      };
      captions?: {
        playerCaptionsTracklistRenderer?: {
          translationLanguages?: Array<{
            languageName?: { runs?: Array<{ text: string }> };
            languageCode: string;
          }>;
          captionTracks?: Array<{
            kind: string;
            baseUrl: string;
            name?: { runs?: Array<{ text: string }> };
            languageCode: string;
            isTranslatable?: boolean;
          }>;
        };
      };
    },
    videoId: string,
  ): {
    translationLanguages?: Array<{
      languageName?: { runs?: Array<{ text: string }> };
      languageCode: string;
    }>;
    captionTracks: Array<{
      kind: string;
      baseUrl: string;
      name?: { runs?: Array<{ text: string }> };
      languageCode: string;
      isTranslatable?: boolean;
    }>;
  } {
    this.assertPlayability(innertubeData?.playabilityStatus, videoId);
    const captions = innertubeData?.captions?.playerCaptionsTracklistRenderer;
    if (!captions || !captions.captionTracks)
      throw new TranscriptsDisabled(videoId);
    return {
      translationLanguages: captions.translationLanguages,
      captionTracks: captions.captionTracks,
    };
  }

  private assertPlayability(
    playability:
      | {
          status?: string;
          reason?: string;
          errorScreen?: {
            playerErrorMessageRenderer?: {
              subreason?: {
                runs?: Array<{ text?: string }>;
              };
            };
          };
        }
      | undefined,
    videoId: string,
  ) {
    const status = playability?.status;
    if (status && status !== "OK") {
      const reason: string | undefined = playability?.reason;
      if (status === "LOGIN_REQUIRED") {
        if (reason === "Sign in to confirm you're not a bot")
          throw new RequestBlocked(videoId);
        if (reason === "This video may be inappropriate for some users.")
          throw new AgeRestricted(videoId);
      }
      if (status === "ERROR" && reason === "This video is unavailable") {
        if (videoId.startsWith("http://") || videoId.startsWith("https://"))
          throw new InvalidVideoId(videoId);
        throw new VideoUnavailable(videoId);
      }
      const subRuns =
        playability?.errorScreen?.playerErrorMessageRenderer?.subreason?.runs ??
        [];
      const subReasons = subRuns.map((r) => r?.text || "");
      throw new VideoUnplayable(videoId, reason, subReasons);
    }
  }

  private async createConsentCookie(html: string, videoId: string) {
    const match = html.match(/name="v" value="(.*?)"/);
    if (!match) throw new FailedToCreateConsentCookie(videoId);
    this.http.setConsentCookie(match[1]);
  }

  private async fetchVideoHtml(videoId: string): Promise<string> {
    let html = await this.fetchHtml(videoId);
    if (html.includes('action="https://consent.youtube.com/s"')) {
      await this.createConsentCookie(html, videoId);
      html = await this.fetchHtml(videoId);
      if (html.includes('action="https://consent.youtube.com/s"'))
        throw new FailedToCreateConsentCookie(videoId);
    }
    return html;
  }

  private async fetchHtml(videoId: string): Promise<string> {
    const res = await this.http.get(WATCH_URL(videoId), undefined, videoId);
    const text = await res.text();
    return htmlUnescape(text);
  }

  private async fetchInnertubeData(
    videoId: string,
    apiKey: string,
  ): Promise<{
    playabilityStatus?: {
      status?: string;
      reason?: string;
      errorScreen?: {
        playerErrorMessageRenderer?: {
          subreason?: {
            runs?: Array<{ text?: string }>;
          };
        };
      };
    };
    captions?: {
      playerCaptionsTracklistRenderer?: {
        translationLanguages?: Array<{
          languageName?: { runs?: Array<{ text: string }> };
          languageCode: string;
        }>;
        captionTracks?: Array<{
          kind: string;
          baseUrl: string;
          name?: { runs?: Array<{ text: string }> };
          languageCode: string;
          isTranslatable?: boolean;
        }>;
      };
    };
  }> {
    const res = await this.http.postJson(
      INNERTUBE_API_URL(apiKey),
      {
        context: INNERTUBE_CONTEXT,
        videoId,
      },
      undefined,
      videoId,
    );
    return (await res.json()) as {
      playabilityStatus?: {
        status?: string;
        reason?: string;
        errorScreen?: {
          playerErrorMessageRenderer?: {
            subreason?: {
              runs?: Array<{ text?: string }>;
            };
          };
        };
      };
      captions?: {
        playerCaptionsTracklistRenderer?: {
          translationLanguages?: Array<{
            languageName?: { runs?: Array<{ text: string }> };
            languageCode: string;
          }>;
          captionTracks?: Array<{
            kind: string;
            baseUrl: string;
            name?: { runs?: Array<{ text: string }> };
            languageCode: string;
            isTranslatable?: boolean;
          }>;
        };
      };
    };
  }
}

class TranscriptParser {
  private static FORMATTING_TAGS = [
    "strong",
    "em",
    "b",
    "i",
    "mark",
    "small",
    "del",
    "ins",
    "sub",
    "sup",
  ];

  private htmlRegex: RegExp;

  constructor(preserveFormatting: boolean) {
    this.htmlRegex = this.getHtmlRegex(preserveFormatting);
  }

  private getHtmlRegex(preserveFormatting: boolean): RegExp {
    if (preserveFormatting) {
      const formats = TranscriptParser.FORMATTING_TAGS.join("|");
      return new RegExp(`<\\/?(?!\\/?(${formats})\\b).*?\\b>`, "gi");
    }
    return /<[^>]*>/gi;
  }

  parse(rawData: string): FetchedTranscriptSnippet[] {
    const result: FetchedTranscriptSnippet[] = [];
    // Parse simple YouTube timedtext XML by regex to avoid adding XML deps
    const re = /<text([^>]*)>([\s\S]*?)<\/text>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(rawData)) !== null) {
      const attrs = m[1];
      const content = m[2];
      const start = parseFloat(getAttr(attrs, "start") || "0");
      const dur = parseFloat(getAttr(attrs, "dur") || "0");
      if (isNaN(start)) continue;
      const text = stripTags(htmlUnescape(content), this.htmlRegex);
      if (text.trim().length === 0) continue;
      result.push({ text, start, duration: isNaN(dur) ? 0 : dur });
    }
    return result;
  }
}

function getAttr(attrString: string, name: string): string | undefined {
  const m = attrString.match(new RegExp(`${name}="([^"]+)"`));
  return m?.[1];
}

function stripTags(input: string, regex: RegExp): string {
  return input.replace(regex, "");
}

function htmlUnescape(str: string): string {
  // Decode numeric entities
  str = str.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 10)),
  );
  str = str.replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16)),
  );
  // Decode common named entities
  const map: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
  };
  return str.replace(/&([a-zA-Z]+);/g, (m, name) =>
    name in map ? map[name] : m,
  );
}
