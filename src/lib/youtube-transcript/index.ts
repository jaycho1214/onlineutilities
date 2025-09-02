import { HttpClient, FetchLike } from "./http";
import {
  TranscriptListFetcher,
  TranscriptList,
  FetchedTranscript,
} from "./transcripts";

export {
  TranscriptList,
  FetchedTranscript,
  type FetchedTranscriptSnippet,
} from "./transcripts";
export { Transcript } from "./transcripts";
export * as Errors from "./errors";

export interface YouTubeTranscriptApiOptions {
  fetch?: FetchLike;
  headers?: Record<string, string>;
}

export class YouTubeTranscriptApi {
  private fetcher: TranscriptListFetcher;
  constructor(options: YouTubeTranscriptApiOptions = {}) {
    const http = new HttpClient(options.fetch, options.headers);
    this.fetcher = new TranscriptListFetcher(http);
  }

  async fetch(
    videoId: string,
    languages: Iterable<string> = ["en"],
    preserveFormatting = false,
  ): Promise<FetchedTranscript> {
    const list = await this.list(videoId);
    const transcript = list.findTranscript(languages);
    return await transcript.fetch(preserveFormatting);
  }

  async list(videoId: string): Promise<TranscriptList> {
    return await this.fetcher.fetch(videoId);
  }
}
