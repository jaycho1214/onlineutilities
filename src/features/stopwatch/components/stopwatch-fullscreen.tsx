"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { Button } from "@/features/shared/ui/button";
import { Play, Pause, RotateCcw, Minimize2, Flag } from "lucide-react";
import { useStopwatch } from "../lib/stopwatch-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatElapsedTime, formatLapTime } from "@/lib/time";

interface StopwatchFullscreenProps {
  stopwatchId: string;
}

// formatElapsedTime & formatLapTime now imported from shared util

export function StopwatchFullscreen({ stopwatchId }: StopwatchFullscreenProps) {
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
        <Button
          size="icon"
          variant="ghost"
          onClick={handleMinimize}
          className="w-12 h-12"
          title="Exit fullscreen"
        >
          <Minimize2 className="size-6" />
        </Button>
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
                  className="flex justify-between items-center bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10"
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
          <Button
            onClick={handleStartPause}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center p-0",
              stopwatch.isRunning
                ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30"
                : "bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30",
            )}
            variant="outline"
          >
            {stopwatch.isRunning ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6" />
            )}
          </Button>

          <Button
            onClick={handleLap}
            disabled={!stopwatch.isRunning}
            variant="outline"
            className="w-16 h-16 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-0"
          >
            <Flag className="size-6" />
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="w-16 h-16 rounded-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border-orange-500/30 flex items-center justify-center p-0"
          >
            <RotateCcw className="size-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
