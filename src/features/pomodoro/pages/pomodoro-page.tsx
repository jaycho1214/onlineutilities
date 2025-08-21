"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { Badge } from "@/features/shared/ui/badge";
import { Input } from "@/features/shared/ui/input";
import {
  Settings,
  CheckSquare,
  Play,
  Pause,
  Square,
  RotateCcw,
  SkipForward,
  Plus,
  BarChart3,
  Clock,
  Edit3,
  Check,
  X,
  Zap,
} from "lucide-react";
import { PomodoroProvider, usePomodoro } from "../lib/pomodoro-context";
import { PomodoroTimer } from "../components/pomodoro-timer";
import { TodoDialog } from "../components/todo-dialog";
import { SettingsDialog } from "../components/settings-dialog";
import { SessionDialog } from "../components/session-dialog";
import { StatisticsDialog } from "../components/statistics-dialog";
import { PomodoroLoading } from "@/features/pomodoro/components/pomodoro-loading";
import { cn } from "@/lib/utils";

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

function PomodoroPageContent() {
  const t = useTranslations("Pomodoro");
  const {
    currentSession,
    timer,
    isTimerRunning,
    activeTodos,
    isLoaded,
    error,
    showBreakSelection,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    skipTimer,
    debugSkipAsComplete,
    createSession,
    setShowBreakSelection,
    startBreak,
    updateCurrentTask,
  } = usePomodoro();

  const [showTodoDialog, setShowTodoDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showStatisticsDialog, setShowStatisticsDialog] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [currentTask, setCurrentTask] = useState("What are you working on?");

  // Initialize currentTask from session data
  useEffect(() => {
    if (currentSession?.currentTask) {
      setCurrentTask(currentSession.currentTask);
    }
  }, [currentSession?.currentTask]);
  const [tempTask, setTempTask] = useState("");

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleStartEdit = () => {
    setTempTask(currentTask === "What are you working on?" ? "" : currentTask);
    setIsEditingTask(true);
  };

  const handleSaveTask = async () => {
    const task = tempTask.trim() || "What are you working on?";
    setCurrentTask(task);
    setIsEditingTask(false);

    // Update the current task in the session
    if (currentSession) {
      try {
        await updateCurrentTask(currentSession.id, task);
      } catch (error) {
        console.error("Failed to update current task:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setTempTask("");
    setIsEditingTask(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when no modifiers are pressed and not in input fields
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
        return;
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;

      switch (event.key) {
        case " ": // Spacebar to start/pause
          event.preventDefault();
          if (!timer) {
            startTimer("pomodoro");
          } else if (isTimerRunning) {
            pauseTimer();
          } else {
            resumeTimer();
          }
          break;
        case "r": // R to reset
          event.preventDefault();
          resetTimer();
          break;
        case "s": // S to skip
          event.preventDefault();
          skipTimer();
          break;
        case "t": // T to open todos
          event.preventDefault();
          setShowTodoDialog(true);
          break;
        case "Escape": // Escape to close dialogs
          setShowTodoDialog(false);
          setShowSettingsDialog(false);
          setShowSessionDialog(false);
          setShowStatisticsDialog(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    timer,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    debugSkipAsComplete,
  ]);

  if (!isLoaded) {
    return (
      <PomodoroLoading
        variant="detailed"
        message="Loading your Pomodoro session..."
      />
    );
  }

  if (error) {
    return <PomodoroErrorScreen error={error} />;
  }

  if (!currentSession) {
    return (
      <PomodoroWelcomeScreen
        onCreateSession={() => setShowSessionDialog(true)}
        createSession={createSession}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-2.25rem)] flex flex-col max-w-6xl mx-auto px-6 pt-6 pb-8 sm:pb-6">
      {/* Custom background or gradient background */}
      {currentSession.backgroundImage ? (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${currentSession.backgroundImage})` }}
        />
      ) : (
        <GradientBackground />
      )}

      {/* Session Title with Selector */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setShowSessionDialog(true)}
        >
          <h1 className="text-4xl font-bold text-foreground font-[family-name:var(--font-eb-garamond)] group-hover:text-primary transition-colors">
            {currentSession.title}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowStatisticsDialog(true)}
            variant="ghost"
            size="icon"
          >
            <BarChart3 className="size-4" />
          </Button>
          <Button
            onClick={() => setShowSettingsDialog(true)}
            variant="ghost"
            size="icon"
          >
            <Settings className="size-4" />
          </Button>
          <Button
            onClick={() => setShowTodoDialog(true)}
            variant="ghost"
            size="icon"
            className="relative overflow-visible"
          >
            <CheckSquare className="size-4" />
            {activeTodos && activeTodos.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium shadow-lg z-50"
              >
                {activeTodos.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Main Timer Section */}
      <div className="text-center flex-1 flex flex-col justify-center relative gap-2">
        {/* Timer Display Container */}
        <div className="flex-1 flex flex-col justify-center items-center relative -space-y-2">
          {/* Current Task - Always visible */}
          <div className="w-full max-w-md">
            {isEditingTask ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={tempTask}
                  onChange={(e) => setTempTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTask();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  placeholder="What are you working on?"
                  className="text-center flex-1"
                  autoFocus
                />
                <Button
                  onClick={handleSaveTask}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <div
                className="flex items-center justify-center gap-2 cursor-pointer group"
                onClick={handleStartEdit}
              >
                <span className="text-4xl text-center text-foreground font-semibold tracking-wide">
                  {currentTask}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit();
                  }}
                >
                  <Edit3 className="size-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Timer Display */}
          <div className="-my-10">
            <PomodoroTimer />
          </div>

          {/* Cycle Indicator - Below timer */}
          {timer && (
            <GlassSurface className="inline-flex items-center gap-2 text-sm text-muted-foreground capitalize bg-secondary/50 px-4 py-2 rounded-full transition-all duration-500 animate-in fade-in slide-in-from-top-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  timer.type === "pomodoro"
                    ? "bg-red-400 shadow-lg shadow-red-400/50"
                    : timer.type === "shortBreak"
                      ? "bg-green-400 shadow-lg shadow-green-400/50"
                      : "bg-blue-400 shadow-lg shadow-blue-400/50",
                  isTimerRunning && "animate-pulse",
                )}
              />
              <span className="transition-all duration-300">
                {timer.type === "pomodoro"
                  ? t("timer.focus")
                  : timer.type === "shortBreak"
                    ? t("timer.shortBreak")
                    : t("timer.longBreak")}{" "}
                • {t("timer.cycle", { cycle: timer.cycle })}
              </span>
            </GlassSurface>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {!timer && !showBreakSelection ? (
            <Button
              onClick={() => startTimer("pomodoro")}
              size="lg"
              className="h-12 px-6"
            >
              <Play className="size-4 mr-2" />
              {t("actions.start")}
            </Button>
          ) : timer && !showBreakSelection ? (
            <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-3">
              <Button
                onClick={isTimerRunning ? pauseTimer : resumeTimer}
                size="lg"
                className="sm:px-6"
              >
                {isTimerRunning ? (
                  <Pause className="size-4 sm:mr-2" />
                ) : (
                  <Play className="size-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">
                  {isTimerRunning ? t("actions.pause") : t("actions.resume")}
                </span>
              </Button>

              <Button
                onClick={resetTimer}
                size="lg"
                variant="outline"
                className="sm:px-6"
              >
                <RotateCcw className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("actions.reset")}</span>
              </Button>

              <Button
                onClick={stopTimer}
                size="lg"
                variant="destructive"
                className="sm:px-6"
              >
                <Square className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("actions.stop")}</span>
              </Button>

              <Button
                onClick={skipTimer}
                size="lg"
                variant="outline"
                className="sm:px-6"
              >
                <SkipForward className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("actions.skip")}</span>
              </Button>

              {/* Debug button - only show in development */}
              {process.env.NODE_ENV === "development" && (
                <Button
                  onClick={debugSkipAsComplete}
                  size="lg"
                  variant="outline"
                  className="sm:px-6 border-green-500/50 text-green-600 hover:bg-green-500/10"
                  title="Debug: Set timer to 3 seconds for quick testing"
                >
                  <Zap className="size-4 sm:mr-2" />
                  <span className="hidden sm:inline">Fast</span>
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {/* Break Selection UI */}
        {showBreakSelection && (
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold text-foreground">
              {t("notifications.chooseBreak")}
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => startBreak("shortBreak")}
                size="lg"
                variant="outline"
                className="bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-teal-500/10 border-green-400/30 text-green-200 hover:from-green-500/30 hover:via-emerald-500/25 hover:to-teal-500/20 hover:border-green-400/50 backdrop-blur-sm shadow-lg shadow-green-500/10 transition-all duration-300"
              >
                <Clock className="size-4 mr-2" />
                {t("breakSelection.shortBreak", {
                  minutes: currentSession?.settings.shortBreakMinutes || 5,
                })}
              </Button>
              <Button
                onClick={() => startBreak("longBreak")}
                size="lg"
                variant="outline"
                className="bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-indigo-500/10 border-blue-400/30 text-blue-200 hover:from-blue-500/30 hover:via-cyan-500/25 hover:to-indigo-500/20 hover:border-blue-400/50 backdrop-blur-sm shadow-lg shadow-blue-500/10 transition-all duration-300"
              >
                <Clock className="size-4 mr-2" />
                {t("breakSelection.longBreak", {
                  minutes: currentSession?.settings.longBreakMinutes || 15,
                })}
              </Button>
            </div>
            <Button
              onClick={() => setShowBreakSelection(false)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              Skip break and continue working
            </Button>
          </div>
        )}

        {/* Quick Actions - Only show when no timer and no break selection */}
        {!timer && !showBreakSelection && (
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => startTimer("shortBreak")}
              variant="outline"
              size="sm"
              className="bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-teal-500/10 border-green-400/30 text-green-200 hover:from-green-500/30 hover:via-emerald-500/25 hover:to-teal-500/20 hover:border-green-400/50 backdrop-blur-sm shadow-lg shadow-green-500/10 transition-all duration-300"
            >
              {t("quickActions.shortBreak")}
            </Button>
            <Button
              onClick={() => startTimer("longBreak")}
              variant="outline"
              size="sm"
              className="bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-indigo-500/10 border-blue-400/30 text-blue-200 hover:from-blue-500/30 hover:via-cyan-500/25 hover:to-indigo-500/20 hover:border-blue-400/50 backdrop-blur-sm shadow-lg shadow-blue-500/10 transition-all duration-300"
            >
              {t("quickActions.longBreak")}
            </Button>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        <div className="text-xs text-muted-foreground space-y-1 mt-8 pb-8 sm:pb-4 hidden sm:block">
          <div>{t("shortcuts.space")}</div>
          <div>{t("shortcuts.keys")}</div>
        </div>
      </div>

      {/* Dialogs */}
      <TodoDialog open={showTodoDialog} onOpenChange={setShowTodoDialog} />
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
      />
      <SessionDialog
        open={showSessionDialog}
        onOpenChange={setShowSessionDialog}
      />
      <StatisticsDialog
        open={showStatisticsDialog}
        onOpenChange={setShowStatisticsDialog}
      />
    </div>
  );
}

// ============================================================================
// ERROR SCREEN
// ============================================================================

function PomodoroErrorScreen({ error }: { error: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <GradientBackground />
      <GlassSurface className="p-8 max-w-md mx-4">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h2 className="text-xl font-semibold text-white">
            Something went wrong
          </h2>
          <p className="text-white/70">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            variant="outline"
          >
            Reload Page
          </Button>
        </div>
      </GlassSurface>
    </div>
  );
}

// ============================================================================
// WELCOME SCREEN
// ============================================================================

function PomodoroWelcomeScreen({
  onCreateSession,
  createSession,
}: {
  onCreateSession: () => void;
  createSession: (title: string) => Promise<string>;
}) {
  const t = useTranslations("Pomodoro");

  const handleButtonClick = async () => {
    try {
      // Create a default session directly
      await createSession("My First Session");
    } catch (error) {
      console.error("Failed to create session:", error);
      // Fallback to opening dialog
      onCreateSession();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <GradientBackground />
      <GlassSurface className="p-8 max-w-lg mx-4">
        <div className="text-center space-y-6">
          <div className="text-6xl">🍅</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              {t("welcome.title")}
            </h1>
            <p className="text-white/70">{t("welcome.description")}</p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleButtonClick}
              size="lg"
              className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 border-blue-500/40 w-full"
              variant="outline"
            >
              <Plus className="size-5 mr-2" />
              {t("welcome.createSession")}
            </Button>
          </div>
        </div>
      </GlassSurface>
    </div>
  );
}

// ============================================================================
// EXPORTED COMPONENT WITH PROVIDER
// ============================================================================

export function PomodoroPage() {
  return (
    <PomodoroProvider>
      <PomodoroPageContent />
    </PomodoroProvider>
  );
}
