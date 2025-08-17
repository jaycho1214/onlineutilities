"use client";

import React, { useCallback } from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { Button } from "@/features/shared/ui/button";
import { Plus } from "lucide-react";
import { useStopwatch } from "@/features/stopwatch/lib/stopwatch-context";
import { StopwatchCard } from "@/features/stopwatch/components/stopwatch-card";
import { Skeleton } from "@/features/shared/ui/skeleton";
import { useTranslations } from "next-intl";

export function Stopwatch() {
  const t = useTranslations("Stopwatch");
  const {
    stopwatches,
    activeStopwatchId,
    createStopwatch,
    setActiveStopwatch,
    isLoaded,
  } = useStopwatch();

  const handleCreateStopwatch = useCallback(async () => {
    const id = await createStopwatch();
    setActiveStopwatch(id);
  }, [createStopwatch, setActiveStopwatch]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <GradientBackground />
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-4xl font-bold text-foreground font-[family-name:var(--font-eb-garamond)]">
            {t("title")}
          </h1>
          <Button
            onClick={handleCreateStopwatch}
            size="icon"
            className="w-10 h-10 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30 flex items-center justify-center"
            variant="outline"
            title={t("actions.newStopwatch")}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          {t("description")}
        </p>
      </div>

      {/* Stopwatch Grid / Loading */}
      {!isLoaded ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
          {Array.from({ length: 3 }).map((_, i) => (
            <GlassSurface key={i} className="rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-10" />
              </div>
              <Skeleton className="h-10 w-48 mx-auto" />
              <div className="flex justify-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((__, j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </GlassSurface>
          ))}
        </div>
      ) : stopwatches.length === 0 ? (
        <div className="text-center py-12">
          <GlassSurface className="max-w-md mx-auto rounded-2xl">
            <div className="p-8 text-center space-y-4">
              <div className="text-6xl opacity-20">⏱️</div>
              <h3 className="text-xl font-medium text-foreground/80">
                {t("states.noStopwatches")}
              </h3>
              <p className="text-muted-foreground">
                {t("states.createFirst")}
              </p>
            </div>
          </GlassSurface>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stopwatches.map((stopwatch) => (
            <StopwatchCard
              key={stopwatch.id}
              stopwatch={stopwatch}
              isActive={stopwatch.id === activeStopwatchId}
              onActivate={() => setActiveStopwatch(stopwatch.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
