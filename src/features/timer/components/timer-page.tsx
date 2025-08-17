"use client";

import React, { useState, useCallback } from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { Button } from "@/features/shared/ui/button";
import { Input } from "@/features/shared/ui/input";
import { Plus, Clock, X } from "lucide-react";
import { useTimer } from "../lib/timer-context";
import { TimerCard } from "./timer-card";
import { Skeleton } from "@/features/shared/ui/skeleton";
import { useTranslations } from "next-intl";

export function TimerPage() {
  const t = useTranslations("Timer");
  const { timers, activeTimerId, createTimer, setActiveTimer, isLoaded } =
    useTimer();

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickHours, setQuickHours] = useState("0");
  const [quickMinutes, setQuickMinutes] = useState("5");
  const [quickSeconds, setQuickSeconds] = useState("0");

  const handleCreateTimer = useCallback(async () => {
    if (showQuickAdd) {
      const hours = parseInt(quickHours) || 0;
      const minutes = parseInt(quickMinutes) || 0;
      const seconds = parseInt(quickSeconds) || 0;

      const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;

      if (totalMilliseconds > 0) {
        const id = await createTimer(totalMilliseconds);
        setActiveTimer(id);
        setShowQuickAdd(false);
        // Reset to defaults
        setQuickHours("0");
        setQuickMinutes("5");
        setQuickSeconds("0");
      }
    } else {
      // Default 5 minute timer
      const id = await createTimer(5 * 60 * 1000);
      setActiveTimer(id);
    }
  }, [
    showQuickAdd,
    quickHours,
    quickMinutes,
    quickSeconds,
    createTimer,
    setActiveTimer,
  ]);

  const handleQuickTimer = useCallback(
    async (minutes: number) => {
      const id = await createTimer(minutes * 60 * 1000);
      setActiveTimer(id);
    },
    [createTimer, setActiveTimer],
  );

  const handleTestTimer = useCallback(async () => {
    const id = await createTimer(3000);
    setActiveTimer(id);
  }, [createTimer, setActiveTimer]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <GradientBackground />
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-4xl font-bold text-foreground font-[family-name:var(--font-eb-garamond)]">
            {t("title")}
          </h1>
          <div className="flex items-center gap-2">
            {/* Quick timer buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleTestTimer}
                size="sm"
                variant="outline"
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30"
                title={t("buttons.testTimer")}
              >
                3s
              </Button>
              <Button
                onClick={() => handleQuickTimer(1)}
                size="sm"
                variant="outline"
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30"
                title={t("buttons.oneMinute")}
              >
                1m
              </Button>
              <Button
                onClick={() => handleQuickTimer(5)}
                size="sm"
                variant="outline"
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30"
                title={t("buttons.fiveMinutes")}
              >
                5m
              </Button>
              <Button
                onClick={() => handleQuickTimer(10)}
                size="sm"
                variant="outline"
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30"
                title={t("buttons.tenMinutes")}
              >
                10m
              </Button>
              <Button
                onClick={() => handleQuickTimer(30)}
                size="sm"
                variant="outline"
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30"
                title={t("buttons.thirtyMinutes")}
              >
                30m
              </Button>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <Button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              size="icon"
              className="w-10 h-10 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30 flex items-center justify-center"
              variant="outline"
              title={t("buttons.customTimer")}
            >
              <Plus className="size-5" />
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          {t("description")}
        </p>
      </div>

      {/* Quick Add Panel */}
      {showQuickAdd && (
        <GlassSurface className="p-4 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Clock className="size-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={quickHours}
                onChange={(e) => setQuickHours(e.target.value)}
                className="w-16 text-center bg-transparent border-white/20"
                placeholder="00"
                min="0"
                max="99"
              />
              <span className="text-lg font-mono">:</span>
              <Input
                type="number"
                value={quickMinutes}
                onChange={(e) => setQuickMinutes(e.target.value)}
                className="w-16 text-center bg-transparent border-white/20"
                placeholder="00"
                min="0"
                max="59"
              />
              <span className="text-lg font-mono">:</span>
              <Input
                type="number"
                value={quickSeconds}
                onChange={(e) => setQuickSeconds(e.target.value)}
                className="w-16 text-center bg-transparent border-white/20"
                placeholder="00"
                min="0"
                max="59"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateTimer}
                variant="outline"
                className="h-8 w-8 bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30"
              >
                <Plus />
              </Button>
              <Button
                onClick={() => setShowQuickAdd(false)}
                variant="ghost"
                className="h-8 w-8 text-red-400 hover:text-red-300"
              >
                <X />
              </Button>
            </div>
          </div>
        </GlassSurface>
      )}

      {/* Timer Grid / Loading */}
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
              </div>
              <Skeleton className="h-2 w-full" />
            </GlassSurface>
          ))}
        </div>
      ) : timers.length === 0 ? (
        <div className="text-center py-12">
          <GlassSurface className="max-w-md mx-auto rounded-2xl">
            <div className="p-8 text-center space-y-4">
              <div className="text-6xl opacity-20">⏰</div>
              <h3 className="text-xl font-medium text-foreground/80">
                {t("states.noTimers")}
              </h3>
              <p className="text-muted-foreground">
                {t("states.createFirst")}
              </p>
            </div>
          </GlassSurface>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timers.map((timer) => (
            <TimerCard
              key={timer.id}
              timer={timer}
              isActive={timer.id === activeTimerId}
              onActivate={() => setActiveTimer(timer.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
