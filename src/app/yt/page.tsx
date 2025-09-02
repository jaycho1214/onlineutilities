"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Input } from "@/features/shared/ui/input";
import { Button } from "@/features/shared/ui/button";
import { useTranslations } from "next-intl";

function parseYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // If it's already an 11-char ID-like string
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    // Standard watch URL
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      // Shorts URL format: /shorts/{id}
      const parts = url.pathname.split("/").filter(Boolean);
      if (
        parts[0] === "shorts" &&
        parts[1] &&
        /^[a-zA-Z0-9_-]{11}$/.test(parts[1])
      )
        return parts[1];
    }
    // youtu.be short URL
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace("/", "");
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
  } catch {}
  return null;
}

export default function YtLandingPage() {
  const t = useTranslations("YouTubeTranscription");
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpen = useCallback(() => {
    const id = parseYouTubeId(value);
    if (!id) {
      setError(t("input.invalid"));
      return;
    }
    setError(null);
    router.push(`/yt/${id}`);
  }, [value, router]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleOpen();
      }
    },
    [handleOpen]
  );

  return (
    <div className="h-[calc(100vh-3rem)] flex items-center justify-center p-6 overflow-hidden">
      <GradientBackground />
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-left space-y-2">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-foreground/70">{t("description")}</p>
        </div>

        <GlassSurface className="w-full p-6 rounded-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-sm mb-2 text-foreground/70">
                {t("input.label")}
              </label>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t("input.placeholder")}
                aria-invalid={!!error}
              />
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
            <Button onClick={handleOpen} className="py-2 px-4" variant="action">
              {t("input.open")}
            </Button>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}
