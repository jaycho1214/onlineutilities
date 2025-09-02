"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/features/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/shared/ui/select";
import { Switch } from "@/features/shared/ui/switch";
import { Button } from "@/features/shared/ui/button";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { toast } from "sonner";

export type TranscriptSnippet = {
  text: string;
  start: number;
  duration: number;
};

interface ExportDialogProps {
  videoId: string;
  languageLabel?: string;
  snippets: TranscriptSnippet[];
  selectedIndex: number;
}

function toTimecode(sec: number, withMs: boolean, separator: "," | ".") {
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
}

function decodeEntities(str: string) {
  if (!str) return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) =>
      String.fromCharCode(parseInt(n, 16))
    );
}

export function ExportDialog({
  videoId,
  languageLabel,
  snippets,
  selectedIndex,
}: ExportDialogProps) {
  const t = useTranslations("YouTubeTranscription");
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"txt" | "srt" | "vtt">("txt");
  const [range, setRange] = useState<"all" | "selected">("all");
  const [includeTs, setIncludeTs] = useState(true);

  const buildExport = useCallback(() => {
    const items =
      range === "selected" && snippets[selectedIndex]
        ? [snippets[selectedIndex]]
        : snippets;
    if (format === "srt") {
      return items
        .map((s, i) => {
          const start = toTimecode(s.start || 0, true, ",");
          const end = toTimecode((s.start || 0) + (s.duration || 0), true, ",");
          return `${i + 1}\n${start} --> ${end}\n${decodeEntities(s.text)}\n`;
        })
        .join("\n");
    }
    if (format === "vtt") {
      const body = items
        .map((s) => {
          const start = toTimecode(s.start || 0, true, ".");
          const end = toTimecode((s.start || 0) + (s.duration || 0), true, ".");
          return `${start} --> ${end}\n${decodeEntities(s.text)}`;
        })
        .join("\n\n");
      return `WEBVTT\n\n${body}`;
    }
    // txt
    if (includeTs) {
      const fmtTime = (sec: number) => {
        const m = Math.floor(sec / 60)
          .toString()
          .padStart(2, "0");
        const s = Math.floor(sec % 60)
          .toString()
          .padStart(2, "0");
        return `${m}:${s}`;
      };
      return items
        .map((s) => `${fmtTime(Math.floor(s.start))} ${decodeEntities(s.text)}`)
        .join("\n");
    }
    return items.map((s) => decodeEntities(s.text)).join("\n");
  }, [format, includeTs, range, selectedIndex, snippets]);

  const handleCopy = useCallback(() => {
    const content = buildExport();
    navigator.clipboard.writeText(content).then(() => toast.success("Copied"));
    setOpen(false);
  }, [buildExport]);

  const handleDownload = useCallback(() => {
    const content = buildExport();
    const ext = format;
    const type = format === "vtt" ? "text/vtt" : "text/plain;charset=utf-8";
    const filename = `${videoId}-transcript.${ext}`;
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setOpen(false);
  }, [buildExport, format, videoId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 px-3" variant="ghost">
          {t("viewer.exportButton")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {t("viewer.exportDialog.title")}
          </DialogTitle>
          <DialogDescription className="text-foreground/80">
            {languageLabel || ""}
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4">
          <GlassSurface className="p-4 bg-foreground/5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="text-sm text-foreground">
                  {t("viewer.exportDialog.format")}
                </div>
                <Select
                  value={format}
                  onValueChange={(v) => setFormat(v as any)}
                >
                  <SelectTrigger className="min-w-[160px]">
                    <SelectValue placeholder="TXT" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="txt">TXT</SelectItem>
                    <SelectItem value="srt">SRT</SelectItem>
                    <SelectItem value="vtt">VTT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 items-center gap-4">
                <div className="text-sm text-foreground">
                  {t("viewer.exportDialog.range")}
                </div>
                <Select value={range} onValueChange={(v) => setRange(v as any)}>
                  <SelectTrigger className="min-w-[160px]">
                    <SelectValue
                      placeholder={t("viewer.exportDialog.rangeAll")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("viewer.exportDialog.rangeAll")}
                    </SelectItem>
                    <SelectItem value="selected">
                      {t("viewer.exportDialog.rangeSelected")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {format === "txt" && (
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <Switch checked={includeTs} onCheckedChange={setIncludeTs} />
                  <span>{t("viewer.exportDialog.includeTimestamps")}</span>
                </label>
              )}
            </div>
          </GlassSurface>
        </div>

        <DialogFooter className="pt-4 gap-3">
          <Button className="h-10 px-4" variant="ghost" onClick={handleCopy}>
            {t("viewer.exportDialog.actions.copy")}
          </Button>
          <Button
            className="h-10 px-4"
            onClick={handleDownload}
            variant="action"
          >
            {t("viewer.exportDialog.actions.download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
