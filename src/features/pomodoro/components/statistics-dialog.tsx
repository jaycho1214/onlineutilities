"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/shared/ui/dialog";
import { Button } from "@/features/shared/ui/button";
import { Badge } from "@/features/shared/ui/badge";
import { Input } from "@/features/shared/ui/input";
import {
  BarChart3,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Award,
  Trash2,
  Plus,
  Tag,
  Star,
  Zap,
  Heart,
  Coffee,
} from "lucide-react";
import { usePomodoro } from "../lib/pomodoro-context";
import { pomodoroDb } from "../lib/pomodoro-db";
import {
  getTodaysActivities,
  deleteTimerActivity,
  updateTimerActivityLabel,
} from "../lib/pomodoro-service";
import type { TimerActivityModel } from "../types";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { cn } from "@/lib/utils";

interface StatisticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DailyStats {
  date: string;
  totalPomodoros: number;
  totalFocusTime: number;
  totalBreakTime: number;
  completedTodos: number;
}

// Use TimerActivityModel as TodayEntry type
type TodayEntry = TimerActivityModel;

export function StatisticsDialog({
  open,
  onOpenChange,
}: StatisticsDialogProps) {
  const t = useTranslations("Pomodoro.stats");
  const tTimer = useTranslations("Pomodoro.timer");
  const tDurations = useTranslations("Pomodoro.durations");
  const { currentSession, timer } = usePomodoro();

  const [viewMode, setViewMode] = useState<"today" | "daily" | "weekly">(
    "today",
  );
  const [userName, setUserName] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [editingEntry, setEditingEntry] = useState<string | null>(null);

  // Use useLiveQuery to get real-time sessions data
  const allSessions = useLiveQuery(
    async () => {
      try {
        return await pomodoroDb.sessions.toArray();
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        return [];
      }
    },
    [], // No dependencies - always watch all sessions
    [], // Default value
  );

  // Use useLiveQuery to get real-time todos data
  const allTodos = useLiveQuery(
    async () => {
      try {
        return await pomodoroDb.todos.toArray();
      } catch (error) {
        console.error("Failed to fetch todos:", error);
        return [];
      }
    },
    [], // No dependencies - always watch all todos
    [], // Default value
  );

  // Use useLiveQuery to get real-time timer states (for future use)
  const allTimerStates = useLiveQuery(
    async () => {
      try {
        return await pomodoroDb.timers.toArray();
      } catch (error) {
        console.error("Failed to fetch timer states:", error);
        return [];
      }
    },
    [], // No dependencies - always watch all timer states
    [], // Default value
  );

  // Prevent unused variable warning
  void allTimerStates;

  // Get user name from cookie
  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }, []);

  // Load user name from cookie
  React.useEffect(() => {
    const savedName = getCookie("personalName");
    if (savedName) {
      setUserName(savedName);
    }
  }, [getCookie]);

  // Calculate daily stats from live data
  const dailyStats: DailyStats[] = useMemo(() => {
    if (!currentSession || !allSessions || !allTodos) return [];

    const today = new Date().toISOString().split("T")[0];

    // For now, we'll create stats based on current session
    // In a real implementation, you'd track daily completions in the database
    if (
      currentSession.stats.totalPomodoros > 0 ||
      currentSession.stats.totalFocusTime > 0
    ) {
      return [
        {
          date: today,
          totalPomodoros: currentSession.stats.totalPomodoros,
          totalFocusTime: currentSession.stats.totalFocusTime,
          totalBreakTime: currentSession.stats.totalBreakTime,
          completedTodos: currentSession.stats.completedTodos,
        },
      ];
    }

    return [];
  }, [currentSession, allSessions, allTodos]);

  // Get today's entries from database with running timer included
  const todayEntries: TimerActivityModel[] = useLiveQuery(
    async (): Promise<TodayEntry[]> => {
      try {
        const activities = await getTodaysActivities();
        const entries: TodayEntry[] = [...activities];

        // Add currently running timer if there is one
        if (timer && currentSession) {
          const runningEntry: TodayEntry = {
            id: `running-${timer.type}`,
            sessionId: currentSession.id,
            type: timer.type,
            duration: timer.currentDuration,
            completed: false,
            startedAt: timer.startedAt || new Date().toISOString(),
            label:
              currentSession.currentTask &&
              currentSession.currentTask !== "What are you working on?"
                ? currentSession.currentTask
                : undefined,
            createdAt: new Date().toISOString(),
          };
          entries.push(runningEntry);
        }

        // Sort by startedAt (newest first), but always put running timers first
        entries.sort((a, b) => {
          // Running timers always come first
          if (a.id.startsWith("running-") && !b.id.startsWith("running-"))
            return -1;
          if (!a.id.startsWith("running-") && b.id.startsWith("running-"))
            return 1;

          // For non-running entries, sort by startedAt (newest first)
          return (
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
          );
        });

        return entries;
      } catch (error) {
        console.error("Failed to fetch today's entries:", error);
        return [];
      }
    },
    [timer, currentSession], // Dependencies - re-run when timer or session changes
    [], // Default value
  );

  // Motivational quotes
  const getMotivationalQuote = (pomodoroCount: number, name: string) => {
    const quotes = [
      t("motivationalMessages.0", { name }),
      t("motivationalMessages.1", { name }),
      t("motivationalMessages.2", { name }),
      t("motivationalMessages.3", { name }),
      t("motivationalMessages.4", { name }),
      t("motivationalMessages.5", { name }),
      t("motivationalMessages.6", { name }),
      t("motivationalMessages.7", { name }),
    ];

    if (pomodoroCount === 0) {
      return t("motivationalMessages.welcome", { name });
    } else if (pomodoroCount >= 20) {
      return t("motivationalMessages.mastery", { name, pomodoroCount });
    } else if (pomodoroCount >= 10) {
      return t("motivationalMessages.onRoll", { name, pomodoroCount });
    } else if (pomodoroCount >= 5) {
      return t("motivationalMessages.greatProgress", { name, pomodoroCount });
    } else {
      return quotes[pomodoroCount % quotes.length];
    }
  };

  const deleteEntry = async (entryId: string) => {
    // Don't delete running entries
    if (entryId.startsWith("running-")) return;

    try {
      await deleteTimerActivity(entryId);
    } catch (error) {
      console.error("Failed to delete activity entry:", error);
    }
  };

  const addLabel = async (entryId: string, label: string) => {
    // Don't add labels to running entries
    if (entryId.startsWith("running-")) return;

    if (!label.trim()) return;

    try {
      await updateTimerActivityLabel(entryId, label.trim());
      setEditingEntry(null);
      setNewLabel("");
    } catch (error) {
      console.error("Failed to add label to activity:", error);
    }
  };

  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return tDurations("hoursAndMinutes", { hours, minutes });
    }
    return tDurations("minutesShort", { minutes });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  // Calculate total stats from real activity data
  const totalStats = useMemo(() => {
    if (!todayEntries)
      return {
        totalPomodoros: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
        completedTodos: allTodos?.filter((todo) => todo.completed).length || 0,
      };

    return todayEntries.reduce(
      (acc, activity) => ({
        totalPomodoros:
          acc.totalPomodoros +
          (activity.type === "pomodoro" && activity.completed ? 1 : 0),
        totalFocusTime:
          acc.totalFocusTime +
          (activity.type === "pomodoro" && activity.completed
            ? activity.duration
            : 0),
        totalBreakTime:
          acc.totalBreakTime +
          (activity.type !== "pomodoro" && activity.completed
            ? activity.duration
            : 0),
        completedTodos: acc.completedTodos,
      }),
      {
        totalPomodoros: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
        completedTodos: allTodos?.filter((todo) => todo.completed).length || 0,
      },
    );
  }, [todayEntries, allTodos]);

  const averageDailyFocus = useMemo(() => {
    return dailyStats.length > 0
      ? totalStats.totalFocusTime / dailyStats.length
      : 0;
  }, [dailyStats.length, totalStats.totalFocusTime]);

  const bestDay = useMemo(() => {
    return dailyStats.reduce(
      (best, day) => (day.totalFocusTime > best.totalFocusTime ? day : best),
      dailyStats[0] || { date: "", totalFocusTime: 0 },
    );
  }, [dailyStats]);

  const todayStats = useMemo(() => {
    if (!todayEntries)
      return { totalPomodoros: 0, totalFocusTime: 0, totalBreakTime: 0 };

    return todayEntries.reduce(
      (acc, activity) => ({
        totalPomodoros:
          acc.totalPomodoros +
          (activity.type === "pomodoro" && activity.completed ? 1 : 0),
        totalFocusTime:
          acc.totalFocusTime +
          (activity.type === "pomodoro" && activity.completed
            ? activity.duration
            : 0),
        totalBreakTime:
          acc.totalBreakTime +
          (activity.type !== "pomodoro" && activity.completed
            ? activity.duration
            : 0),
      }),
      { totalPomodoros: 0, totalFocusTime: 0, totalBreakTime: 0 },
    );
  }, [todayEntries]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full max-h-[calc(90vh-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              <span className="text-foreground">Your Focus Journey</span>
              {currentSession && (
                <Badge variant="secondary" className="ml-2">
                  {currentSession.title}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 my-4 px-1 min-h-0">
            {/* Motivational Header */}
            <GlassSurface className="text-center p-6 rounded-xl">
              <div className="text-2xl font-bold mb-2 text-foreground">
                {getMotivationalQuote(totalStats.totalPomodoros, userName)}
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="size-4 text-yellow-500" />
                  <span>{totalStats.totalPomodoros} total sessions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="size-4 text-blue-500" />
                  <span>
                    {formatDuration(totalStats.totalFocusTime)} focused
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="size-4 text-red-500" />
                  <span>Building great habits</span>
                </div>
              </div>
            </GlassSurface>

            {/* View Mode Selector */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "today" ? "default" : "outline"}
                onClick={() => setViewMode("today")}
                size="sm"
              >
                <Clock className="size-4 mr-2" />
                {t("today")}
              </Button>
              <Button
                variant={viewMode === "daily" ? "default" : "outline"}
                onClick={() => setViewMode("daily")}
                size="sm"
              >
                <Calendar className="size-4 mr-2" />
                {t("dailyView")}
              </Button>
              <Button
                variant={viewMode === "weekly" ? "default" : "outline"}
                onClick={() => setViewMode("weekly")}
                size="sm"
              >
                <TrendingUp className="size-4 mr-2" />
                {t("weeklyView")}
              </Button>
            </div>

            {/* Content based on view mode */}
            {viewMode === "today" && (
              <>
                {/* Today's Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <Target className="size-4" />
                      <span className="text-sm font-medium">
                        {t("todaysPomodoros")}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-red-500">
                      {todayStats.totalPomodoros}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <Clock className="size-4" />
                      <span className="text-sm font-medium">Focus Time</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-500">
                      {formatDuration(todayStats.totalFocusTime)}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <Coffee className="size-4" />
                      <span className="text-sm font-medium">Break Time</span>
                    </div>
                    <div className="text-3xl font-bold text-green-500">
                      {formatDuration(todayStats.totalBreakTime)}
                    </div>
                  </div>
                </div>

                {/* Today's Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="size-5 text-primary" />
                      {t("todaysTimeline")}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {t("entries", { count: todayEntries.length })}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {todayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-4 rounded-lg border transition-all ${
                          entry.completed
                            ? "bg-muted/30 border-border/40"
                            : "bg-orange-500/10 border-orange-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                entry.type === "pomodoro"
                                  ? "bg-red-500"
                                  : entry.type === "shortBreak"
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                              }`}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium capitalize">
                                  {entry.type === "shortBreak"
                                    ? tTimer("shortBreak")
                                    : entry.type === "longBreak"
                                      ? tTimer("longBreak")
                                      : tTimer("focus")}
                                </span>
                                {!entry.completed && (
                                  <Badge
                                    variant={
                                      entry.id.startsWith("running-")
                                        ? "default"
                                        : "outline"
                                    }
                                    className={cn(
                                      "text-xs",
                                      entry.id.startsWith("running-") &&
                                        "bg-green-600 hover:bg-green-700 animate-pulse",
                                    )}
                                  >
                                    {entry.id.startsWith("running-")
                                      ? t("running")
                                      : t("skipped")}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(entry.startedAt).toLocaleTimeString()}{" "}
                                • {formatDuration(entry.duration)}
                              </div>
                              {entry.label && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Tag className="size-3" />
                                  <span className="text-xs text-primary">
                                    {entry.label}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {editingEntry !== entry.id &&
                              !entry.id.startsWith("running-") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingEntry(entry.id);
                                    setNewLabel(entry.label || "");
                                  }}
                                  className="h-8 w-8 p-0"
                                  title={
                                    entry.label ? "Edit label" : "Add label"
                                  }
                                >
                                  <Plus className="size-4" />
                                </Button>
                              )}

                            {editingEntry === entry.id && (
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder={
                                    newLabel ? "Edit label..." : "Add label..."
                                  }
                                  value={newLabel}
                                  onChange={(e) => setNewLabel(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      addLabel(entry.id, newLabel);
                                    if (e.key === "Escape") {
                                      setEditingEntry(null);
                                      setNewLabel("");
                                    }
                                  }}
                                  className="h-7 w-32 text-xs"
                                  autoFocus
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addLabel(entry.id, newLabel)}
                                  disabled={!newLabel.trim()}
                                  className="h-8 w-8 p-0"
                                >
                                  <Target className="size-4" />
                                </Button>
                              </div>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteEntry(entry.id)}
                              disabled={entry.id.startsWith("running-")}
                              className={cn(
                                "h-8 w-8 p-0",
                                entry.id.startsWith("running-")
                                  ? "cursor-not-allowed opacity-50"
                                  : "text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20",
                              )}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {todayEntries.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="size-12 mx-auto mb-3 opacity-30" />
                        <p>No sessions recorded today yet.</p>
                        <p className="text-sm">
                          Start a pomodoro to track your progress!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Daily and Weekly stats with 2x2 responsive grid */}
            {(viewMode === "daily" || viewMode === "weekly") && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="size-4" />
                      <span className="text-sm">Total Focus</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatDuration(totalStats.totalFocusTime)}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Target className="size-4" />
                      <span className="text-sm">Pomodoros</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {totalStats.totalPomodoros}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Calendar className="size-4" />
                      <span className="text-sm">Avg/Day</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatDuration(averageDailyFocus)}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Award className="size-4" />
                      <span className="text-sm">Best Day</span>
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {bestDay ? formatDate(bestDay.date) : t("none")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {bestDay ? formatDuration(bestDay.totalFocusTime) : ""}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
