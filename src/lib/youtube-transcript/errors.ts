import { WATCH_URL } from "./constants";

export class YouTubeTranscriptApiException extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class CouldNotRetrieveTranscript extends YouTubeTranscriptApiException {
  readonly videoId: string;
  constructor(videoId: string) {
    super();
    this.videoId = videoId;
  }
  protected causeMessage(): string | undefined {
    return undefined;
  }
  toString() {
    const videoUrl = WATCH_URL(this.videoId);
    const base = `\nCould not retrieve a transcript for the video ${videoUrl}!`;
    const cause = this.causeMessage?.();
    if (cause) {
      return (
        base +
        ` This is most likely caused by:\n\n${cause}` +
        "\n\nIf you are sure that the described cause is not responsible for this error and that a transcript should be retrievable, please create an issue."
      );
    }
    return base;
  }
}

export class YouTubeDataUnparsable extends CouldNotRetrieveTranscript {
  protected causeMessage() {
    return "The data required to fetch the transcript is not parsable.";
  }
}

export class YouTubeRequestFailed extends CouldNotRetrieveTranscript {
  constructor(
    videoId: string,
    readonly reason: string,
  ) {
    super(videoId);
  }
  protected causeMessage() {
    return `Request to YouTube failed: ${this.reason}`;
  }
}

export class VideoUnplayable extends CouldNotRetrieveTranscript {
  constructor(
    videoId: string,
    private reason?: string | null,
    private subReasons: string[] = [],
  ) {
    super(videoId);
  }
  protected causeMessage() {
    const r = this.reason ?? "No reason specified!";
    if (this.subReasons?.length) {
      const list = this.subReasons.map((s) => ` - ${s}`).join("\n");
      return `The video is unplayable for the following reason: ${r}\n\nAdditional Details:\n${list}`;
    }
    return `The video is unplayable for the following reason: ${r}`;
  }
}

export class VideoUnavailable extends CouldNotRetrieveTranscript {
  protected causeMessage() {
    return "The video is no longer available";
  }
}

export class InvalidVideoId extends CouldNotRetrieveTranscript {
  protected causeMessage() {
    return (
      "You provided an invalid video id. Make sure you are using the video id and NOT the url!\n\n" +
      'Do NOT run: `fetch("https://www.youtube.com/watch?v=1234")`\n' +
      'Instead run: `fetch("1234")`'
    );
  }
}

export class RequestBlocked extends CouldNotRetrieveTranscript {
  protected causeMessage() {
    return "YouTube is blocking your requests. This most likely happens because the IP address used for your requests is blocked.";
  }
}

export class IpBlocked extends RequestBlocked {}

export class TranscriptsDisabled extends CouldNotRetrieveTranscript {
  protected causeMessage() {
    return "Subtitles are disabled for this video";
  }
}

export class AgeRestricted extends CouldNotRetrieveTranscript {
  protected causeMessage() {
    return "This video is age-restricted. Therefore, you are unable to retrieve transcripts for it without authenticating yourself.";
  }
}

export class NotTranslatable extends CouldNotRetrieveTranscript {
  protected causeMessage() {
    return "The requested language is not translatable";
  }
}

export class TranslationLanguageNotAvailable extends CouldNotRetrieveTranscript {
  protected causeMessage() {
    return "The requested translation language is not available";
  }
}

export class FailedToCreateConsentCookie extends CouldNotRetrieveTranscript {
  protected causeMessage() {
    return "Failed to automatically give consent to saving cookies";
  }
}

export class NoTranscriptFound extends CouldNotRetrieveTranscript {
  constructor(
    videoId: string,
    private requestedLanguageCodes: Iterable<string>,
    private transcriptData: string,
  ) {
    super(videoId);
  }
  protected causeMessage() {
    return (
      `No transcripts were found for any of the requested language codes: ${Array.from(
        this.requestedLanguageCodes,
      ).join(", ")}` + `\n\n${this.transcriptData}`
    );
  }
}

export class PoTokenRequired extends CouldNotRetrieveTranscript {
  protected causeMessage() {
    return "The requested video cannot be retrieved without a PO Token.";
  }
}
