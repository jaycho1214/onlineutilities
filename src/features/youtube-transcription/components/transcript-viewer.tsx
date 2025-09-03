"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/shared/ui/select";
import { Switch } from "@/features/shared/ui/switch";
import { Label } from "@/features/shared/ui/label";
import { CopyButton } from "@/features/shared/components/copy-button";
import { Copy as CopyIcon, FileX } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/features/shared/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/features/shared/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/features/shared/ui/dialog";
import { ExportDialog } from "@/features/youtube-transcription/components/export-dialog";
import { useYouTubeTranscriptShortcuts } from "@/features/youtube-transcription/hooks/use-youtube-transcript-shortcuts";

export type TrackInfo = {
  language: string;
  languageCode: string;
  isGenerated: boolean;
};

export type TranscriptSnippet = {
  text: string;
  start: number;
  duration: number;
};

interface TranscriptViewerProps {
  videoId: string;
  tracks: TrackInfo[];
  initialLanguageCode: string;
  initialSnippets: TranscriptSnippet[];
}

export function TranscriptViewer({
  videoId,
  tracks,
  initialLanguageCode,
  initialSnippets,
}: TranscriptViewerProps) {
  const t = useTranslations("YouTubeTranscription");

  const [clientTracks, setClientTracks] = useState<TrackInfo[]>(tracks || []);
  const [selected, setSelected] = useState<string>(initialLanguageCode || "");
  const [snippets, setSnippets] = useState<TranscriptSnippet[]>(
    initialSnippets || [],
  );
  const [loading, setLoading] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [autoFollow, setAutoFollow] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [autoFollowIndicator, setAutoFollowIndicator] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [embedSrc, setEmbedSrc] = useState<string>(
    `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0`,
  );
  const listRootRef = useRef<HTMLDivElement | null>(null);

  const decodeEntities = useCallback((str: string) => {
    if (!str) return str;
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, n) =>
        String.fromCharCode(parseInt(n, 16)),
      );
  }, []);

  // Set origin param after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const origin = window.location.origin;
      setEmbedSrc(
        `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&origin=${encodeURIComponent(
          origin,
        )}&widgetid=1`,
      );
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch tracks on client-side if server-side failed (empty tracks and no initial snippets)
  useEffect(() => {
    if (clientTracks.length > 0) return; // Already have tracks
    if (initialSnippets.length > 0) return; // Already have server-side data

    let cancelled = false;
    async function fetchTracks() {
      setLoading(true);
      setError(null);
      try {
        const { YouTubeTranscriptApi } = await import(
          "@/lib/youtube-transcript"
        );
        const api = new YouTubeTranscriptApi({
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });
        const list = await api.list(videoId);
        if (cancelled) return;

        const fetchedTracks = Array.from(list).map(
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

        setClientTracks(fetchedTracks);

        // Auto-select English or first available language
        const englishTrack = fetchedTracks.find((x) =>
          x.languageCode?.startsWith("en"),
        );
        const defaultLanguage =
          englishTrack?.languageCode || fetchedTracks[0]?.languageCode || "";
        if (defaultLanguage && !selected) {
          setSelected(defaultLanguage);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          console.error("Failed to fetch transcript tracks:", e);
          // Show specific message for CORS/hosting provider blocking
          const errorMessage = (e as Error)?.message || "";
          if (errorMessage.includes("Failed to fetch") || errorMessage.includes("CORS") || errorMessage.includes("blocked")) {
            setError("YouTube transcripts are not available in production due to hosting provider restrictions. This feature works in development only.");
          } else {
            setError(errorMessage || t("viewer.error"));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTracks();
    return () => {
      cancelled = true;
    };
  }, [videoId, clientTracks.length, selected, t, initialSnippets.length]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    async function load() {
      if (initialSnippets?.length && selected === initialLanguageCode) return;
      setLoading(true);
      setError(null);
      try {
        const { YouTubeTranscriptApi } = await import(
          "@/lib/youtube-transcript"
        );
        const api = new YouTubeTranscriptApi({
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });
        const fetched = await api.fetch(videoId, [selected]);
        if (cancelled) return;
        setSnippets(fetched.toRawData());
        setSelectedIndex(0);
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error)?.message || t("viewer.error"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selected, videoId, initialLanguageCode, initialSnippets, t]);

  const transcriptText = useMemo(() => {
    if (!snippets.length) return "";
    if (!showTimestamps) return snippets.map((s) => s.text).join("\n");
    const fmt = (sec: number) => {
      const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
      const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
      return `${m}:${s}`;
    };
    return snippets
      .map((s) => `[${fmt(s.start)}] ${decodeEntities(s.text)}`)
      .join("\n");
  }, [snippets, showTimestamps, decodeEntities]);

  const handleCopy = useCallback(() => {
    if (!transcriptText) return;
    navigator.clipboard
      .writeText(transcriptText)
      .then(() => {
        toast.success("Transcript copied");
      })
      .catch(() => void 0);
  }, [transcriptText]);

  const formatHMS = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return h > 0 ? `${h.toString().padStart(2, "0")}:${m}:${s}` : `${m}:${s}`;
  };

  const postToPlayer = useCallback((func: string, args: unknown[] = []) => {
    const frame = iframeRef.current;
    if (!frame || !frame.contentWindow) return;
    try {
      const message = JSON.stringify({ event: "command", func, args });
      frame.contentWindow.postMessage(message, "https://www.youtube.com");
    } catch (e) {
      console.debug("Failed to post message to YouTube player:", e);
    }
  }, []);

  const seekTo = useCallback(
    (seconds: number, autoplay = true) => {
      postToPlayer("seekTo", [seconds, true]);
      if (autoplay) postToPlayer("playVideo", []);
    },
    [postToPlayer],
  );

  const toTimecode = (sec: number, withMs: boolean, separator: "," | ".") => {
    const hours = Math.floor(sec / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    const ms = Math.round((sec - Math.floor(sec)) * 1000)
      .toString()
      .padStart(3, "0");
    return withMs
      ? `${hours}:${minutes}:${seconds}${separator}${ms}`
      : `${hours}:${minutes}:${seconds}`;
  };

  const formatSrt = (items: TranscriptSnippet[]) =>
    items
      .map((s, i) => {
        const start = toTimecode(s.start || 0, true, ",");
        const end = toTimecode((s.start || 0) + (s.duration || 0), true, ",");
        return `${i + 1}\n${start} --> ${end}\n${decodeEntities(s.text)}\n`;
      })
      .join("\n");

  const formatVtt = (items: TranscriptSnippet[]) => {
    const body = items
      .map((s) => {
        const start = toTimecode(s.start || 0, true, ".");
        const end = toTimecode((s.start || 0) + (s.duration || 0), true, ".");
        return `${start} --> ${end}\n${decodeEntities(s.text)}`;
      })
      .join("\n\n");
    return `WEBVTT\n\n${body}`;
  };

  const downloadAs = (
    filename: string,
    content: string,
    type = "text/plain;charset=utf-8",
  ) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportSrt = () =>
    downloadAs(
      `${videoId}-${selected || "transcript"}.srt`,
      formatSrt(snippets),
    );
  const exportVtt = () =>
    downloadAs(
      `${videoId}-${selected || "transcript"}.vtt`,
      formatVtt(snippets),
    );

  const selectedTrack = useMemo(
    () => clientTracks.find((t) => t.languageCode === selected),
    [clientTracks, selected],
  );

  // Keyboard shortcuts (extracted hook)
  useYouTubeTranscriptShortcuts({
    snippets,
    selectedIndex,
    setSelectedIndex: (updater: (prev: number) => number) =>
      setSelectedIndex(updater),
    seekTo: (s: number) => seekTo(s),
    handleCopyAll: handleCopy,
    exportSrt: () => exportSrt(),
    exportVtt: () => exportVtt(),
    toggleTimestamps: () => setShowTimestamps((v) => !v),
    showShortcutDialog: () => setShowShortcuts(true),
  });

  // Auto-scroll selected snippet into view (always on)
  useEffect(() => {
    const el = document.getElementById(
      `snip-${selectedIndex}`,
    ) as HTMLElement | null;
    const viewport = listRootRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLElement | null;
    if (!el || !viewport) return;
    const id = requestAnimationFrame(() => {
      const elRect = el.getBoundingClientRect();
      const vpRect = viewport.getBoundingClientRect();
      const delta =
        elRect.top - (vpRect.top + vpRect.height / 2 - elRect.height / 2);
      viewport.scrollBy({ top: delta, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [selectedIndex]);

  // Auto-follow playback time to select current snippet
  useEffect(() => {
    if (!autoFollow) return;
    let currentTime = 0;
    let isPlaying = false;

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube.com") return;
      let data: unknown = e.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      // Handle different YouTube events
      const dataObj = data as {
        event?: string;
        info?: { currentTime?: number; playerState?: number };
      };
      if (
        dataObj?.event === "video-progress" &&
        typeof dataObj.info?.currentTime === "number"
      ) {
        currentTime = dataObj.info.currentTime;
      }
      if (dataObj?.event === "infoDelivery" && dataObj.info) {
        if (typeof dataObj.info.currentTime === "number") {
          currentTime = dataObj.info.currentTime;
        }
        if (typeof dataObj.info.playerState === "number") {
          isPlaying = dataObj.info.playerState === 1; // 1 = playing
        }
      }
      const stateChangeData = data as { event?: string; info?: number };
      if (
        stateChangeData?.event === "onStateChange" &&
        typeof stateChangeData.info === "number"
      ) {
        isPlaying = stateChangeData.info === 1; // 1 = playing
      }
    };

    window.addEventListener("message", onMessage);

    // Initialize YouTube iframe API communication
    const initializePlayer = () => {
      try {
        const frame = iframeRef.current;
        if (!frame?.contentWindow) return;

        // Send listening event
        frame.contentWindow.postMessage(
          '{"event":"listening","id":"player"}',
          "https://www.youtube.com",
        );

        // Add event listeners
        setTimeout(() => {
          postToPlayer("addEventListener", ["onStateChange"]);
          postToPlayer("addEventListener", ["onPlaybackRateChange"]);
          postToPlayer("getPlayerState", []);
          postToPlayer("getCurrentTime", []);
        }, 1000);
      } catch (e) {
        console.warn("Failed to initialize YouTube player communication:", e);
      }
    };

    // Wait for iframe to load then initialize
    const frame = iframeRef.current;
    if (frame) {
      if (frame.contentDocument?.readyState === "complete") {
        initializePlayer();
      } else {
        frame.onload = initializePlayer;
      }
    }

    // Polling loop to get current time and update selected index
    let intervalId: NodeJS.Timeout;
    const startPolling = () => {
      intervalId = setInterval(() => {
        try {
          postToPlayer("getCurrentTime", []);
          postToPlayer("getPlayerState", []);

          // Only update if we have valid time and snippets
          if (isPlaying && currentTime > 0 && snippets.length > 0) {
            const t = currentTime;
            let newIdx = selectedIndex;

            // Find the correct snippet based on current time
            for (let i = 0; i < snippets.length; i++) {
              const snippet = snippets[i];
              const snippetEnd = snippet.start + (snippet.duration || 0);

              if (t >= snippet.start && t < snippetEnd) {
                newIdx = i;
                break;
              }
            }

            // Update selected index if it changed
            if (newIdx !== selectedIndex) {
              setSelectedIndex(newIdx);
              setAutoFollowIndicator(true);
              setTimeout(() => setAutoFollowIndicator(false), 1000);
            }
          }
        } catch {
          // Ignore errors in polling
        }
      }, 500); // Poll every 500ms
    };

    startPolling();

    return () => {
      window.removeEventListener("message", onMessage);
      if (intervalId) clearInterval(intervalId);
      if (frame) frame.onload = null;
    };
  }, [
    autoFollow,
    snippets,
    selectedIndex,
    postToPlayer,
    setAutoFollowIndicator,
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <GlassSurface className="aspect-video w-full rounded-2xl overflow-hidden">
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            src={embedSrc}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </GlassSurface>

        {/* Info card directly under the video */}
        <GlassSurface className="rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("viewer.info.title")}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-foreground/60">{t("viewer.info.videoId")}</div>
            <button
              type="button"
              title="Copy video ID"
              onClick={() =>
                navigator.clipboard
                  .writeText(videoId)
                  .then(() => toast.success("Video ID copied"))
                  .catch(() => void 0)
              }
              className="text-foreground/90 text-left underline decoration-dotted underline-offset-2 hover:text-foreground"
            >
              {videoId}
            </button>

            <div className="text-foreground/60">
              {t("viewer.info.language")}
            </div>
            <div className="text-foreground/90">
              {selectedTrack
                ? `${selectedTrack.language} (${selectedTrack.languageCode})${
                    selectedTrack.isGenerated
                      ? ` • ${t("viewer.generated")}`
                      : ` • ${t("viewer.manual")}`
                  }`
                : "-"}
            </div>

            <div className="text-foreground/60">{t("viewer.info.lines")}</div>
            <div className="text-foreground/90">{snippets.length}</div>
          </div>
        </GlassSurface>
      </div>

      <GlassSurface className="rounded-2xl p-4 flex flex-col gap-3 min-h-[360px]">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-foreground/70">
              {t("viewer.languages")}
            </Label>
            <Select value={selected} onValueChange={(v) => setSelected(v)}>
              <SelectTrigger className="max-w-full md:max-w-[260px]">
                <SelectValue
                  className="truncate max-w-[200px]"
                  placeholder={t("viewer.selectLanguage")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {clientTracks.map((tr) => (
                    <SelectItem key={tr.languageCode} value={tr.languageCode}>
                      <span className="flex w-full min-w-0 items-center gap-2">
                        <span className="truncate flex-1" title={tr.language}>
                          {tr.language}
                        </span>
                        <span className="text-foreground/50 text-xs shrink-0">
                          {tr.languageCode}
                        </span>
                        <span className="text-foreground/50 text-xs shrink-0">
                          {tr.isGenerated ? "auto" : "manual"}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Label htmlFor="ts" className="text-sm text-foreground/70">
              {t("viewer.showTimestamps")}
            </Label>
            <Switch
              id="ts"
              checked={showTimestamps}
              onCheckedChange={setShowTimestamps}
            />
            <div className="flex items-center gap-1">
              <Label htmlFor="af" className="text-sm text-foreground/70">
                {t("viewer.autoFollow")}
              </Label>
              {autoFollowIndicator && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
            <Switch
              id="af"
              checked={autoFollow}
              onCheckedChange={setAutoFollow}
            />
            {/* Copy full transcript (icon-only) */}
            <CopyButton size="sm" variant="ghost" onClick={handleCopy} />
            {/* Copy SRT small button with label */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard
                      .writeText(formatSrt(snippets))
                      .then(() => toast.success("SRT copied"))
                      .catch(() => void 0)
                  }
                  className="inline-flex items-center gap-1 h-8 px-2 rounded-md border border-black/20 dark:border-white/[0.06] bg-transparent hover:bg-foreground/5 text-foreground/80 hover:text-foreground transition-colors"
                >
                  <CopyIcon className="size-4" />
                  <span className="text-xs font-medium">SRT</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Copy SRT</TooltipContent>
            </Tooltip>
            <ExportDialog
              videoId={videoId}
              languageLabel={
                selectedTrack
                  ? `${selectedTrack.language} (${selectedTrack.languageCode})`
                  : ""
              }
              snippets={snippets}
              selectedIndex={selectedIndex}
            />
          </div>
        </div>

        <div className="relative flex-1 min-h-0" ref={listRootRef}>
          <ScrollArea className="h-[420px] rounded-md border border-black/10 dark:border-white/[0.06] p-1">
            {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
            {loading ? (
              <div className="text-sm text-foreground/70">
                {t("viewer.fetching")}
              </div>
            ) : snippets.length ? (
              <div className="space-y-1">
                {snippets.map((s, i) => (
                  <div
                    key={i}
                    id={`snip-${i}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedIndex(i);
                        seekTo(Math.max(0, Math.floor(s.start)));
                      }
                    }}
                    onClick={() => {
                      setSelectedIndex(i);
                      seekTo(Math.max(0, Math.floor(s.start)));
                    }}
                    className={
                      "group w-full rounded-md px-3 py-2 transition-colors border-l-2 " +
                      (i === selectedIndex
                        ? "bg-accent/50 border-primary"
                        : "hover:bg-accent/30 border-transparent")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-xs text-foreground/60 tabular-nums w-14 shrink-0">
                        {formatHMS(Math.floor(s.start))}
                      </div>
                      <div className="text-sm whitespace-pre-wrap leading-6 flex-1">
                        {decodeEntities(s.text)}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyButton
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            const line = showTimestamps
                              ? `${formatHMS(
                                  Math.floor(s.start),
                                )} ${decodeEntities(s.text)}`
                              : decodeEntities(s.text);
                            navigator.clipboard
                              .writeText(line)
                              .then(() => toast.success("Line copied"))
                              .catch(() => void 0);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <FileX className="size-8 text-foreground/40" />
                <div className="text-sm text-foreground/70">
                  {t("viewer.noSubtitles")}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </GlassSurface>

      {/* Shortcut Helper Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to navigate transcripts faster
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <kbd className="text-xs bg-muted px-2 py-1 rounded">↑ / ↓</kbd>
              <span className="text-sm col-span-2">
                Navigate transcript lines
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <kbd className="text-xs bg-muted px-2 py-1 rounded">Enter</kbd>
              <span className="text-sm col-span-2">Jump to selected time</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <kbd className="text-xs bg-muted px-2 py-1 rounded">J / L</kbd>
              <span className="text-sm col-span-2">
                Previous/Next line + seek
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <kbd className="text-xs bg-muted px-2 py-1 rounded">T</kbd>
              <span className="text-sm col-span-2">Toggle timestamps</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <kbd className="text-xs bg-muted px-2 py-1 rounded">C</kbd>
              <span className="text-sm col-span-2">Copy all transcript</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <kbd className="text-xs bg-muted px-2 py-1 rounded">S</kbd>
              <span className="text-sm col-span-2">Export as SRT</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <kbd className="text-xs bg-muted px-2 py-1 rounded">V</kbd>
              <span className="text-sm col-span-2">Export as VTT</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <kbd className="text-xs bg-muted px-2 py-1 rounded">?</kbd>
              <span className="text-sm col-span-2">Show this help dialog</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
