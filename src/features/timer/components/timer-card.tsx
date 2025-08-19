"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
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
  Bell,
  BellOff,
  Clock,
  Maximize2,
} from "lucide-react";
import { useTimer } from "../lib/timer-context";
import { Timer } from "../types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { formatDuration } from "@/lib/time";
import { useTranslations } from "next-intl";

interface TimerCardProps {
  timer: Timer;
  isActive?: boolean;
  onActivate?: () => void;
}

// Reuse shared duration formatter (HH:MM:SS | MM:SS)
const formatTime = formatDuration;

export function TimerCard({ timer, isActive, onActivate }: TimerCardProps) {
  const t = useTranslations("Timer");
  const router = useRouter();
  const {
    startTimer,
    pauseTimer,
    resetTimer,
    deleteTimer,
    updateTimerTitle,
    updateTimerDuration,
    toggleSound,
    getRemainingTime,
  } = useTimer();

  const [remainingTime, setRemainingTime] = useState(getRemainingTime(timer));
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(timer.title);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editHours, setEditHours] = useState("0");
  const [editMinutes, setEditMinutes] = useState("5");
  const [editSeconds, setEditSeconds] = useState("0");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Calculate and update remaining time whenever timer changes
    const newRemainingTime = getRemainingTime(timer);
    setRemainingTime(newRemainingTime);
  }, [timer, getRemainingTime]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    // Parse current duration when editing starts
    if (isEditingTime) {
      const totalSeconds = Math.floor(timer.duration / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setEditHours(hours.toString());
      setEditMinutes(minutes.toString());
      setEditSeconds(seconds.toString());
    }
  }, [isEditingTime, timer.duration]);

  const handleStartPause = useCallback(async () => {
    if (timer.isRunning) {
      await pauseTimer(timer.id);
    } else {
      await startTimer(timer.id);
    }
  }, [timer.isRunning, timer.id, pauseTimer, startTimer]);

  const handleReset = useCallback(async () => {
    await resetTimer(timer.id);
  }, [timer.id, resetTimer]);

  const handleDelete = useCallback(async () => {
    await deleteTimer(timer.id);
  }, [timer.id, deleteTimer]);

  const handleTitleSubmit = useCallback(async () => {
    if (editTitle.trim() && editTitle !== timer.title) {
      await updateTimerTitle(timer.id, editTitle.trim());
    }
    setIsEditing(false);
  }, [editTitle, timer.title, timer.id, updateTimerTitle]);

  const handleTitleCancel = useCallback(() => {
    setEditTitle(timer.title);
    setIsEditing(false);
  }, [timer.title]);

  const handleTimeSubmit = useCallback(async () => {
    const hours = parseInt(editHours) || 0;
    const minutes = parseInt(editMinutes) || 0;
    const seconds = parseInt(editSeconds) || 0;

    const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;

    if (totalMilliseconds > 0) {
      await updateTimerDuration(timer.id, totalMilliseconds);
    }
    setIsEditingTime(false);
  }, [editHours, editMinutes, editSeconds, timer.id, updateTimerDuration]);

  const handleTimeCancel = useCallback(() => {
    setIsEditingTime(false);
  }, []);

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

  const progressPercentage = Math.max(
    0,
    Math.min(100, (remainingTime / timer.duration) * 100),
  );
  const isCompleted = remainingTime === 0 && timer.completedAt !== null;

  return (
    <GlassSurface
      className={cn(
        "rounded-2xl w-full transition-all duration-300 cursor-pointer",
        isActive
          ? "shadow-xl ring-2 ring-blue-500/20"
          : "shadow-lg hover:shadow-xl",
        isCompleted && "ring-2 ring-green-500/30",
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
                  {timer.title}
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
                  router.push(`/timer/${timer.id}`);
                }}
                tooltip={t("actions.fullscreen")}
              />
              <ActionButton
                icon={timer.soundEnabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}
                variant={timer.soundEnabled ? "info" : "ghost"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSound(timer.id);
                }}
                tooltip={timer.soundEnabled ? t("actions.soundEnabled") : t("actions.soundDisabled")}
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
          {isEditingTime && !timer.isRunning ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="number"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  className="w-16 text-center bg-transparent border-white/20"
                  placeholder="00"
                  min="0"
                  max="99"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-2xl font-mono">:</span>
                <Input
                  type="number"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                  className="w-16 text-center bg-transparent border-white/20"
                  placeholder="00"
                  min="0"
                  max="59"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-2xl font-mono">:</span>
                <Input
                  type="number"
                  value={editSeconds}
                  onChange={(e) => setEditSeconds(e.target.value)}
                  className="w-16 text-center bg-transparent border-white/20"
                  placeholder="00"
                  min="0"
                  max="59"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTimeSubmit();
                  }}
                  className="text-green-400 hover:text-green-300"
                >
                  <Check className="size-4 mr-1" />
                  {t("actions.set")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTimeCancel();
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="size-4 mr-1" />
                  {t("actions.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "text-3xl font-mono font-bold cursor-pointer",
                  isCompleted ? "text-green-400" : "text-foreground",
                )}
                onClick={(e) => {
                  if (!timer.isRunning) {
                    e.stopPropagation();
                    setIsEditingTime(true);
                  }
                }}
              >
                {formatTime(remainingTime)}
              </div>
              {!timer.isRunning && !isCompleted && (
                <div className="text-xs text-muted-foreground">
                  <Clock className="inline size-3 mr-1" />
                  {t("states.clickToEdit")}
                </div>
              )}
              {isCompleted && (
                <div className="text-sm text-green-400 font-medium">
                  {t("states.timerComplete")}
                </div>
              )}
            </>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full",
              isCompleted
                ? "bg-green-500/50"
                : timer.isRunning
                  ? "bg-blue-500/50 transition-none"
                  : "bg-orange-500/30 transition-all duration-300",
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <ActionButton
            icon={timer.isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleStartPause();
            }}
            variant={timer.isRunning ? "destructive" : "success"}
            size="lg"
            disabled={isCompleted && remainingTime === 0}
            tooltip={timer.isRunning ? t("actions.pause") : t("actions.start")}
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
      </div>
    </GlassSurface>
  );
}
