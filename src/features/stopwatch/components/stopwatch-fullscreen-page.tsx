"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { ActionButton } from "@/features/shared/ui/action-button";
import { Play, Pause, RotateCcw, Minimize2, Flag } from "lucide-react";
import { useStopwatch } from "../lib/stopwatch-context";
import { useRouter } from "next/navigation";
import { formatElapsedTime, formatLapTime } from "@/lib/time";

interface StopwatchFullscreenProps {
  stopwatchId: string;
}

export function StopwatchFullscreenPage({
  stopwatchId,
}: StopwatchFullscreenProps) {
  const t = useTranslations();
  const router = useRouter();
  const {
    stopwatches,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    addLap,
    getCurrentTime,
  } = useStopwatch();

  const stopwatch = useMemo(
    () => stopwatches.find((s) => s.id === stopwatchId),
    [stopwatches, stopwatchId],
  );
  const [currentTime, setCurrentTime] = useState(
    stopwatch ? getCurrentTime(stopwatch) : 0,
  );

  const { now } = useStopwatch();
  useEffect(() => {
    if (!stopwatch) {
      router.push("/stopwatch");
      return;
    }
    setCurrentTime(getCurrentTime(stopwatch));
  }, [stopwatch, getCurrentTime, router, now]);

  const handleStartPause = useCallback(async () => {
    if (!stopwatch) return;
    if (stopwatch.isRunning) {
      await pauseStopwatch(stopwatch.id);
    } else {
      await startStopwatch(stopwatch.id);
    }
  }, [stopwatch, pauseStopwatch, startStopwatch]);

  const handleReset = useCallback(async () => {
    if (!stopwatch) return;
    await resetStopwatch(stopwatch.id);
  }, [stopwatch, resetStopwatch]);

  const handleLap = useCallback(async () => {
    if (!stopwatch) return;
    await addLap(stopwatch.id);
  }, [stopwatch, addLap]);

  const handleMinimize = useCallback(() => {
    router.push("/stopwatch");
  }, [router]);

  // Keyboard event handler for space key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        handleStartPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleStartPause]);

  // Get last 5 laps for display
  const recentLaps = useMemo(
    () => stopwatch?.laps.slice(-5).reverse() || [],
    [stopwatch?.laps],
  );

  if (!stopwatch) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-8">
      <GradientBackground />

      {/* Controls at top - positioned below navbar */}
      <div className="absolute top-20 right-8">
        <ActionButton
          icon={<Minimize2 className="size-6" />}
          variant="ghost"
          size="lg"
          onClick={handleMinimize}
          tooltip={t("Common.tooltips.exitFullscreen")}
        />
      </div>

      {/* Stopwatch Display */}
      <div className="flex flex-col items-center justify-center space-y-12 max-w-4xl w-full">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground/80">
          {stopwatch.title}
        </h1>

        {/* Time */}
        <div className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold text-foreground">
          {formatElapsedTime(currentTime)}
        </div>

        {/* Laps Display */}
        {recentLaps.length > 0 && (
          <div className="w-full max-w-2xl space-y-2">
            <h3 className="text-lg font-medium text-foreground/60 text-center mb-4">
              Recent Laps
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recentLaps.map((lap, index) => (
                <div
                  key={lap.id}
                  className="flex justify-between items-center bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10"
                >
                  <span className="text-muted-foreground">
                    Lap {stopwatch.laps.length - index}
                  </span>
                  <div className="text-right">
                    <div className="font-mono text-foreground">
                      {formatLapTime(lap.lapTime)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatElapsedTime(lap.time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-6">
          <ActionButton
            icon={
              stopwatch.isRunning ? (
                <Pause className="size-6" />
              ) : (
                <Play className="size-6" />
              )
            }
            onClick={handleStartPause}
            variant={stopwatch.isRunning ? "destructive" : "success"}
            size="xl"
            tooltip={
              stopwatch.isRunning
                ? t("Common.actions.pause")
                : t("Common.actions.start")
            }
            className="rounded-full"
          />

          <ActionButton
            icon={<Flag className="size-6" />}
            onClick={handleLap}
            disabled={!stopwatch.isRunning}
            variant="info"
            size="xl"
            tooltip={t("Common.tooltips.lap")}
            className="rounded-full"
          />

          <ActionButton
            icon={<RotateCcw className="size-6" />}
            onClick={handleReset}
            variant="warning"
            size="xl"
            tooltip={t("Common.actions.reset")}
            className="rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
