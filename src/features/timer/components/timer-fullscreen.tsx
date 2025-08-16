"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { Button } from "@/features/shared/ui/button";
import { Play, Pause, RotateCcw, Minimize2, Bell, BellOff } from "lucide-react";
import { useTimer } from "../lib/timer-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time";

interface TimerFullscreenProps {
  timerId: string;
}

const formatTime = formatDuration;

export function TimerFullscreen({ timerId }: TimerFullscreenProps) {
  const router = useRouter();
  const {
    timers,
    startTimer,
    pauseTimer,
    resetTimer,
    toggleSound,
    getRemainingTime,
  } = useTimer();

  const timer = useMemo(
    () => timers.find((t) => t.id === timerId),
    [timers, timerId],
  );
  const [remainingTime, setRemainingTime] = useState(
    timer ? getRemainingTime(timer) : 0,
  );

  useEffect(() => {
    if (!timer) {
      router.push("/timer");
      return;
    }

    // Calculate and update remaining time whenever timer changes
    const newRemainingTime = getRemainingTime(timer);
    setRemainingTime(newRemainingTime);
  }, [timer, getRemainingTime, router]);

  const handleStartPause = useCallback(async () => {
    if (!timer) return;
    if (timer.isRunning) {
      await pauseTimer(timer.id);
    } else {
      await startTimer(timer.id);
    }
  }, [timer, pauseTimer, startTimer]);

  const handleReset = useCallback(async () => {
    if (!timer) return;
    await resetTimer(timer.id);
  }, [timer, resetTimer]);

  const handleMinimize = useCallback(() => {
    router.push("/timer");
  }, [router]);

  const handleToggleSound = useCallback(async () => {
    if (!timer) return;
    await toggleSound(timer.id);
  }, [timer, toggleSound]);

  const progressPercentage = useMemo(() => {
    return timer ? (remainingTime / timer.duration) * 100 : 0;
  }, [remainingTime, timer]);

  const isCompleted = useMemo(() => {
    return remainingTime === 0 && timer?.completedAt !== null;
  }, [remainingTime, timer?.completedAt]);

  if (!timer) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-8">
      <GradientBackground />

      {/* Controls at top - positioned below navbar */}
      <div className="absolute top-20 right-8 flex items-center gap-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleMinimize}
          className="w-12 h-12"
          title="Exit fullscreen"
        >
          <Minimize2 className="size-6" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleToggleSound}
          className={cn(
            "w-12 h-12",
            timer.soundEnabled
              ? "text-blue-400 hover:text-blue-300"
              : "text-muted-foreground hover:text-foreground opacity-60",
          )}
          title={timer.soundEnabled ? "Sound enabled" : "Sound disabled"}
        >
          {timer.soundEnabled ? (
            <Bell className="size-6" />
          ) : (
            <BellOff className="size-6" />
          )}
        </Button>
      </div>

      {/* Timer Display */}
      <div className="flex flex-col items-center justify-center space-y-12 max-w-4xl w-full">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground/80">
          {timer.title}
        </h1>

        {/* Time */}
        <div
          className={cn(
            "text-5xl sm:text-6xl md:text-7xl font-mono font-bold",
            isCompleted ? "text-green-400 animate-pulse" : "text-foreground",
          )}
        >
          {formatTime(remainingTime)}
        </div>

        {/* Progress Ring */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-white/10"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}%`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}%`}
              className={cn(
                isCompleted
                  ? "text-green-500"
                  : timer.isRunning
                    ? "text-blue-500 transition-none"
                    : "text-orange-500 transition-all duration-300",
              )}
              style={{
                transition: timer.isRunning ? "none" : undefined,
              }}
            />
          </svg>
        </div>

        {/* Status */}
        {isCompleted && (
          <div className="text-2xl sm:text-3xl text-green-400 font-medium animate-pulse">
            Timer Complete!
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-6">
          <Button
            onClick={handleStartPause}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center p-0",
              timer.isRunning
                ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30"
                : "bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30",
            )}
            variant="outline"
            disabled={isCompleted && remainingTime === 0}
          >
            {timer.isRunning ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6" />
            )}
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
