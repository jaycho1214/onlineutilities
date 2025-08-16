"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
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
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTitleSubmit();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-green-400 hover:text-green-300"
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTitleCancel();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-foreground truncate">
                  {stopwatch.title}
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100"
                >
                  <Edit3 className="size-3" />
                </Button>
              </div>
            )}
          </div>
          {!isEditing && (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/stopwatch/${stopwatch.id}`);
                }}
                className="w-8 h-8 flex items-center justify-center text-blue-400 hover:text-blue-300 opacity-60 hover:opacity-100"
                title="Fullscreen"
              >
                <Maximize2 className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300 opacity-60 hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </Button>
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
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleStartPause();
            }}
            size="icon"
            className={cn(
              "w-10 h-10",
              stopwatch.isRunning
                ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30"
                : "bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30",
            )}
            variant="outline"
            title={stopwatch.isRunning ? "Pause" : "Start"}
          >
            {stopwatch.isRunning ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </Button>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleLap();
            }}
            disabled={!stopwatch.isRunning}
            size="icon"
            variant="outline"
            className="w-10 h-10 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Lap"
          >
            <Flag className="size-4" />
          </Button>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            size="icon"
            variant="outline"
            className="w-10 h-10 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border-orange-500/30"
            title="Reset"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>

        {/* Laps */}
        {stopwatch.laps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground/80">Laps</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {reversedLaps.map((lap, index) => (
                <div
                  key={lap.id}
                  className="flex justify-between items-center text-sm bg-white/5 rounded px-3 py-2"
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
