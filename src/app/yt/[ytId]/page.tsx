import { getTranslations } from "next-intl/server";
import { YouTubeTranscriptApi } from "@/lib/youtube-transcript";
import {
  TranscriptViewer,
  type TrackInfo,
  type TranscriptSnippet,
} from "@/features/youtube-transcription/components/transcript-viewer";
import { GradientBackground } from "@/features/shared/ui/gradient-background";

export default async function YtTranscriptPage({
  params,
}: {
  params: Promise<{ ytId: string }>;
}) {
  const { ytId: videoId } = await params;
  const t = await getTranslations("YouTubeTranscription");

  let tracks: TrackInfo[] = [];
  let initialLanguageCode = "";
  let initialSnippets: TranscriptSnippet[] = [];
  try {
    const api = new YouTubeTranscriptApi();
    const list = await api.list(videoId);
    tracks = Array.from(list).map(
      (tr: {
        language: string;
        languageCode: string;
        isGenerated: boolean;
      }) => ({
        language: tr.language,
        languageCode: tr.languageCode,
        isGenerated: tr.isGenerated,
      }),
    );
    initialLanguageCode =
      tracks.find((x) => x.languageCode?.startsWith("en"))?.languageCode ||
      tracks[0]?.languageCode ||
      "";
    if (initialLanguageCode) {
      const transcript = list.findTranscript([initialLanguageCode]);
      const fetched = await transcript.fetch(false);
      initialSnippets = fetched.toRawData();
    }
  } catch {
    // Ignore; client will handle errors when fetching interactively
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-28 space-y-6">
      <GradientBackground />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{t("title")}</h1>
          <p className="text-foreground/70 text-sm">{t("description")}</p>
        </div>
      </div>

      <TranscriptViewer
        videoId={videoId}
        tracks={tracks}
        initialLanguageCode={initialLanguageCode}
        initialSnippets={initialSnippets}
      />
    </div>
  );
}
