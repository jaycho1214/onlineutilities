"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { ActionButton } from "@/features/shared/ui/action-button";
import { Input } from "@/features/shared/ui/input";
import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Edit3,
  Check,
  X,
  Flag,
  Maximize2,
} from "lucide-react";
import { useStopwatch } from "../lib/stopwatch-context";
import { Stopwatch } from "../types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { formatElapsedTime, formatLapTime } from "@/lib/time";
import { useTranslations } from "next-intl";

interface StopwatchCardProps {
  stopwatch: Stopwatch;
  isActive?: boolean;
  onActivate?: () => void;
}

// Replaced by shared utilities

function StopwatchCardComponent({
  stopwatch,
  isActive,
  onActivate,
}: StopwatchCardProps) {
  const t = useTranslations("Stopwatch");
  const router = useRouter();
  const {
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    addLap,
    deleteStopwatch,
    updateStopwatchTitle,
    getCurrentTime,
  } = useStopwatch();

  const [currentTime, setCurrentTime] = useState(getCurrentTime(stopwatch));
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(stopwatch.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update displayed time when underlying stopwatch properties change OR global tick
  const { now } = useStopwatch();
  useEffect(() => {
    setCurrentTime(getCurrentTime(stopwatch));
  }, [
    stopwatch.startTime,
    stopwatch.pausedTime,
    stopwatch.isRunning,
    now,
    getCurrentTime,
    stopwatch,
  ]);

  // Memoize reversed laps to avoid recreating on every render
  const reversedLaps = useMemo(
    () => stopwatch.laps.slice().reverse(),
    [stopwatch.laps],
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartPause = useCallback(async () => {
    if (stopwatch.isRunning) {
      await pauseStopwatch(stopwatch.id);
    } else {
      await startStopwatch(stopwatch.id);
    }
  }, [stopwatch.isRunning, stopwatch.id, pauseStopwatch, startStopwatch]);

  const handleReset = useCallback(async () => {
    await resetStopwatch(stopwatch.id);
  }, [stopwatch.id, resetStopwatch]);

  const handleLap = useCallback(async () => {
    await addLap(stopwatch.id);
  }, [stopwatch.id, addLap]);

  const handleDelete = useCallback(async () => {
    await deleteStopwatch(stopwatch.id);
  }, [stopwatch.id, deleteStopwatch]);

  const handleTitleSubmit = useCallback(async () => {
    if (editTitle.trim() && editTitle !== stopwatch.title) {
      await updateStopwatchTitle(stopwatch.id, editTitle.trim());
    }
    setIsEditing(false);
  }, [editTitle, stopwatch.title, stopwatch.id, updateStopwatchTitle]);

  const handleTitleCancel = useCallback(() => {
    setEditTitle(stopwatch.title);
    setIsEditing(false);
  }, [stopwatch.title]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleTitleSubmit();
      } else if (e.key === "Escape") {
        handleTitleCancel();
      }
    },
    [handleTitleSubmit, handleTitleCancel],
  );

  return (
    <GlassSurface
      className={cn(
        "rounded-2xl",
        "w-full transition-all duration-300 cursor-pointer",
        isActive
          ? "shadow-xl ring-2 ring-blue-500/20"
          : "shadow-lg hover:shadow-xl",
      )}
      onClick={onActivate}
    >
      <div className="p-4 space-y-3 flex flex-col h-full w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-8 text-lg font-medium bg-transparent border-white/20"
                  onClick={(e) => e.stopPropagation()}
                />
                <ActionButton
                  icon={<Check className="size-4" />}
                  variant="success"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTitleSubmit();
                  }}
                  tooltip={t("actions.save")}
                />
                <ActionButton
                  icon={<X className="size-4" />}
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTitleCancel();
                  }}
                  tooltip={t("actions.cancel")}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-foreground truncate">
                  {stopwatch.title}
                </h3>
                <ActionButton
                  icon={<Edit3 className="size-3" />}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  tooltip={t("actions.editTitle")}
                />
              </div>
            )}
          </div>
          {!isEditing && (
            <div className="flex items-center gap-2">
              <ActionButton
                icon={<Maximize2 className="size-4" />}
                variant="info"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/stopwatch/${stopwatch.id}`);
                }}
                tooltip={t("actions.fullscreen")}
              />
              <ActionButton
                icon={<Trash2 className="size-4" />}
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                tooltip={t("actions.delete")}
              />
            </div>
          )}
        </div>

        {/* Time Display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-foreground">
            {formatLapTime(currentTime)}
          </div>
          <div className="text-sm text-muted-foreground">
            {stopwatch.laps.length} laps
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <ActionButton
            icon={
              stopwatch.isRunning ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )
            }
            onClick={(e) => {
              e.stopPropagation();
              handleStartPause();
            }}
            variant={stopwatch.isRunning ? "destructive" : "success"}
            size="lg"
            tooltip={
              stopwatch.isRunning ? t("actions.pause") : t("actions.start")
            }
            className="rounded-full"
          />

          <ActionButton
            icon={<Flag className="size-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleLap();
            }}
            disabled={!stopwatch.isRunning}
            variant="info"
            size="lg"
            tooltip={t("actions.lap")}
            className="rounded-full"
          />

          <ActionButton
            icon={<RotateCcw className="size-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            variant="warning"
            size="lg"
            tooltip={t("actions.reset")}
            className="rounded-full"
          />
        </div>

        {/* Laps */}
        {stopwatch.laps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground/80">Laps</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {reversedLaps.map((lap, index) => (
                <div
                  key={lap.id}
                  className="flex justify-between items-center text-sm bg-black/5 dark:bg-white/5 rounded px-3 py-2"
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
      </div>
    </GlassSurface>
  );
}

export const StopwatchCard = React.memo(
  StopwatchCardComponent,
  (prev, next) =>
    prev.stopwatch === next.stopwatch &&
    prev.isActive === next.isActive &&
    prev.onActivate === next.onActivate,
);

StopwatchCard.displayName = "StopwatchCard";
