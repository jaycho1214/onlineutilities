"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  type PomodoroContext,
  type PomodoroSessionModel,
  type TodoItemModel,
  type TimerState,
  type TimerType,
  type TimerSettings,
  DEFAULT_TIMER_SETTINGS,
  getTimerDuration,
} from "../types";
import { pomodoroDb } from "./pomodoro-db";
import {
  createSession as dbCreateSession,
  updateSession as dbUpdateSession,
  deleteSession as dbDeleteSession,
  setActiveSession as dbSetActiveSession,
  createTodo as dbCreateTodo,
  updateTodo as dbUpdateTodo,
  deleteTodo as dbDeleteTodo,
  toggleTodo as dbToggleTodo,
  saveTimerState,
  getTimerState,
  deleteTimerState,
  incrementPomodoroCount,
  updateFocusTime,
  updateBreakTime,
  createTimerActivity,
  completeTimerActivity,
  skipTimerActivity,
  getCurrentCycleCount,
} from "./pomodoro-service";
import { PomodoroErrorType, handlePomodoroError } from "./error-handler";

// ============================================================================
// CONTEXT SETUP
// ============================================================================

const PomodoroContext = createContext<PomodoroContext | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface PomodoroProviderProps {
  children: React.ReactNode;
}

export function PomodoroProvider({ children }: PomodoroProviderProps) {
  // Local state for UI and timer management
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBreakSelection, setShowBreakSelection] = useState(false);
  const [pendingCycle, setPendingCycle] = useState<number | undefined>();
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(
    null,
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Refs for timer management
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Use useLiveQuery to get real-time sessions data
  const sessions = useLiveQuery(
    async () => {
      try {
        const allSessions = await pomodoroDb.sessions.toArray();
        return allSessions.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        return [];
      }
    },
    [], // No dependencies - always watch all sessions
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
  );

  // Derive active session from live data
  const activeSession = useMemo(() => {
    return sessions?.find((session) => session.isActive) || null;
  }, [sessions]);

  const activeSessionId = activeSession?.id || null;
  const currentSession = activeSession;

  // Filter todos for active session
  const todos = useMemo(() => {
    if (!activeSessionId || !allTodos) return [];
    return allTodos.filter((todo) => todo.sessionId === activeSessionId);
  }, [allTodos, activeSessionId]);

  const activeTodos = useMemo(() => {
    if (!todos) return [];
    return todos.filter((todo) => !todo.completed && todo.status === "pending");
  }, [todos]);

  const completedTodos = useMemo(() => {
    if (!todos) return [];
    return todos.filter((todo) => todo.completed);
  }, [todos]);

  // Loading state - ensure minimum loading time for better UX
  const isDataLoaded = sessions !== undefined && allTodos !== undefined;
  const isLoaded = isDataLoaded && !isInitialLoad;

  // Add minimum loading delay for better UX
  useEffect(() => {
    if (isDataLoaded) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 800); // Show loading for at least 800ms

      return () => clearTimeout(timer);
    }
  }, [isDataLoaded]);

  // Initialize database and load timer state when active session changes
  useEffect(() => {
    let isMounted = true;

    const initializeAndLoadTimer = async () => {
      try {
        await pomodoroDb.open();

        if (activeSessionId && isMounted) {
          const timerState = await getTimerState(activeSessionId);
          if (timerState && isMounted) {
            // Check if timer should still be running
            if (timerState.status === "running" && timerState.startedAt) {
              const now = Date.now();
              const elapsed = now - new Date(timerState.startedAt).getTime();
              const remaining = Math.max(
                0,
                timerState.currentDuration - elapsed,
              );

              if (remaining > 0) {
                setTimer({ ...timerState, timeRemaining: remaining });
                setIsTimerRunning(true);
              } else {
                // Timer expired while away - mark as completed
                const completedTimer = {
                  ...timerState,
                  status: "completed" as const,
                  timeRemaining: 0,
                  completedAt: new Date().toISOString(),
                };
                setTimer(completedTimer);
                await saveTimerState(completedTimer);
              }
            } else {
              setTimer(timerState);
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize database:", error);
        if (isMounted) {
          setError("Failed to initialize database");
        }
      }
    };

    initializeAndLoadTimer();

    return () => {
      isMounted = false;
    };
  }, [activeSessionId]);

  // Timer tick effect
  useEffect(() => {
    if (isTimerRunning && timer) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - new Date(timer.startedAt!).getTime();
        const remaining = Math.max(0, timer.currentDuration - elapsed);

        setTimer((prev) =>
          prev ? { ...prev, timeRemaining: remaining } : null,
        );

        if (remaining === 0) {
          setIsTimerRunning(false);
          setTimer((prev) =>
            prev
              ? {
                  ...prev,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                }
              : null,
          );

          // Complete the activity record
          if (currentActivityId) {
            (async () => {
              try {
                await completeTimerActivity(currentActivityId);
                setCurrentActivityId(null);

                // Show browser notification for completion (original behavior)
                if (
                  "Notification" in window &&
                  Notification.permission === "granted"
                ) {
                  const messages = {
                    pomodoro: "🎉 Great work! Pomodoro session completed!",
                    shortBreak:
                      "☕ Break time over! Ready for another session?",
                    longBreak:
                      "🌟 Long break complete! You've earned this rest!",
                  };

                  new Notification("Pomodoro Timer", {
                    body: messages[timer.type] || messages.pomodoro,
                    icon: "/favicon.ico",
                    tag: "pomodoro-completion",
                  });
                }
              } catch (error) {
                console.error("Failed to complete timer activity:", error);
              }
            })();
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning, timer, currentActivityId]);

  // Handle timer completion state - cleanup when timer status is "completed"
  useEffect(() => {
    if (timer?.status === "completed" && !isTimerRunning) {
      // Auto-cleanup completed timer after a short delay to show completion UI
      const cleanupTimer = setTimeout(() => {
        setTimer(null);
        if (activeSessionId) {
          deleteTimerState(activeSessionId).catch((error) =>
            console.error("Failed to cleanup timer state:", error),
          );
        }
      }, 3000); // 3 second delay to show completion celebration

      return () => clearTimeout(cleanupTimer);
    }
  }, [timer?.status, isTimerRunning, activeSessionId]);

  // Session management functions
  const createSession = useCallback(
    async (
      title: string,
      settings?: Partial<TimerSettings>,
    ): Promise<string> => {
      try {
        const sessionId = await dbCreateSession(
          title,
          undefined, // description
          { ...DEFAULT_TIMER_SETTINGS, ...settings },
        );

        // Set as active if it's the first session
        if (!sessions || sessions.length === 0) {
          await dbSetActiveSession(sessionId);
        }

        return sessionId;
      } catch (error) {
        const pomodoroError = handlePomodoroError(
          error,
          PomodoroErrorType.SESSION_ERROR,
        );
        setError(pomodoroError.message);
        throw error;
      }
    },
    [sessions],
  );

  const updateSession = useCallback(
    async (
      sessionId: string,
      updates: Partial<PomodoroSessionModel>,
    ): Promise<void> => {
      try {
        await dbUpdateSession(sessionId, updates);
      } catch (error) {
        const pomodoroError = handlePomodoroError(
          error,
          PomodoroErrorType.SESSION_ERROR,
        );
        setError(pomodoroError.message);
        throw error;
      }
    },
    [],
  );

  const deleteSession = useCallback(
    async (sessionId: string): Promise<void> => {
      try {
        await dbDeleteSession(sessionId);

        // If this was the active session, set another one as active
        if (activeSessionId === sessionId) {
          const remainingSessions =
            sessions?.filter((s) => s.id !== sessionId) || [];
          if (remainingSessions.length > 0) {
            await dbSetActiveSession(remainingSessions[0].id);
          } else {
            // No sessions left - clear timer state
            setTimer(null);
            setIsTimerRunning(false);
          }
        }
      } catch (error) {
        const pomodoroError = handlePomodoroError(
          error,
          PomodoroErrorType.SESSION_ERROR,
        );
        setError(pomodoroError.message);
        throw error;
      }
    },
    [activeSessionId, sessions],
  );

  const setActiveSession = useCallback(
    async (sessionId: string): Promise<void> => {
      try {
        await dbSetActiveSession(sessionId);

        // Load timer state for new session
        const timerState = await getTimerState(sessionId);
        if (timerState) {
          setTimer(timerState);
          setIsTimerRunning(timerState.status === "running");
        } else {
          setTimer(null);
          setIsTimerRunning(false);
        }
      } catch (error) {
        const pomodoroError = handlePomodoroError(
          error,
          PomodoroErrorType.SESSION_ERROR,
        );
        setError(pomodoroError.message);
        throw error;
      }
    },
    [],
  );

  // Todo management functions
  const createTodo = useCallback(
    async (todo: Partial<TodoItemModel>): Promise<string> => {
      if (!activeSessionId) throw new Error("No active session");

      try {
        return await dbCreateTodo(activeSessionId, todo);
      } catch (error) {
        const pomodoroError = handlePomodoroError(
          error,
          PomodoroErrorType.SESSION_ERROR,
        );
        setError(pomodoroError.message);
        throw error;
      }
    },
    [activeSessionId],
  );

  const updateTodo = useCallback(
    async (todoId: string, updates: Partial<TodoItemModel>): Promise<void> => {
      try {
        await dbUpdateTodo(todoId, updates);
      } catch (error) {
        const pomodoroError = handlePomodoroError(
          error,
          PomodoroErrorType.SESSION_ERROR,
        );
        setError(pomodoroError.message);
        throw error;
      }
    },
    [],
  );

  const deleteTodo = useCallback(async (todoId: string): Promise<void> => {
    try {
      await dbDeleteTodo(todoId);
    } catch (error) {
      const pomodoroError = handlePomodoroError(
        error,
        PomodoroErrorType.SESSION_ERROR,
      );
      setError(pomodoroError.message);
      throw error;
    }
  }, []);

  const toggleTodo = useCallback(async (todoId: string): Promise<void> => {
    try {
      await dbToggleTodo(todoId);
    } catch (error) {
      const pomodoroError = handlePomodoroError(
        error,
        PomodoroErrorType.SESSION_ERROR,
      );
      setError(pomodoroError.message);
      throw error;
    }
  }, []);

  // Timer management functions
  const startTimer = useCallback(
    async (type: TimerType): Promise<void> => {
      if (!currentSession) return;

      try {
        const duration = getTimerDuration(type, currentSession.settings);

        // Get current cycle count from actual activities
        const currentCycle = await getCurrentCycleCount(currentSession.id);
        const nextCycle = type === "pomodoro" ? currentCycle + 1 : currentCycle;

        const newTimer: TimerState = {
          sessionId: currentSession.id,
          type,
          status: "running",
          currentDuration: duration,
          timeRemaining: duration,
          cycle: nextCycle,
          startedAt: new Date().toISOString(),
          pausedAt: undefined,
        };

        // Create activity record
        const activityId = await createTimerActivity(
          currentSession.id,
          type,
          duration,
          currentSession.currentTask &&
            currentSession.currentTask !== "What are you working on?"
            ? currentSession.currentTask
            : undefined,
        );

        setCurrentActivityId(activityId);
        setTimer(newTimer);
        setIsTimerRunning(true);
        await saveTimerState(newTimer);
      } catch (error) {
        const pomodoroError = handlePomodoroError(
          error,
          PomodoroErrorType.SESSION_ERROR,
        );
        setError(pomodoroError.message);
        throw error;
      }
    },
    [currentSession],
  );

  const pauseTimer = useCallback(async (): Promise<void> => {
    if (!timer) return;

    try {
      const pausedTimer: TimerState = {
        ...timer,
        status: "paused",
        pausedAt: new Date().toISOString(),
      };

      setTimer(pausedTimer);
      setIsTimerRunning(false);
      await saveTimerState(pausedTimer);
    } catch (error) {
      const pomodoroError = handlePomodoroError(
        error,
        PomodoroErrorType.SESSION_ERROR,
      );
      setError(pomodoroError.message);
      throw error;
    }
  }, [timer]);

  const resumeTimer = useCallback(async (): Promise<void> => {
    if (!timer) return;

    try {
      const resumedTimer: TimerState = {
        ...timer,
        status: "running",
        startedAt: new Date().toISOString(),
        pausedAt: undefined,
      };

      setTimer(resumedTimer);
      setIsTimerRunning(true);
    } catch (error) {
      const pomodoroError = handlePomodoroError(
        error,
        PomodoroErrorType.SESSION_ERROR,
      );
      setError(pomodoroError.message);
      throw error;
    }
  }, [timer]);

  const stopTimer = useCallback(async (): Promise<void> => {
    try {
      setIsTimerRunning(false);
      setTimer(null);

      // Clear current activity ID
      setCurrentActivityId(null);

      if (activeSessionId) {
        await deleteTimerState(activeSessionId);
      }
    } catch (error) {
      const pomodoroError = handlePomodoroError(
        error,
        PomodoroErrorType.SESSION_ERROR,
      );
      setError(pomodoroError.message);
      throw error;
    }
  }, [activeSessionId]);

  const resetTimer = useCallback(async (): Promise<void> => {
    if (!timer) return;

    try {
      const resetTimer: TimerState = {
        ...timer,
        status: "idle",
        timeRemaining: timer.currentDuration,
        startedAt: undefined,
        pausedAt: undefined,
        completedAt: undefined,
      };

      setTimer(resetTimer);
      setIsTimerRunning(false);
    } catch (error) {
      const pomodoroError = handlePomodoroError(
        error,
        PomodoroErrorType.SESSION_ERROR,
      );
      setError(pomodoroError.message);
      throw error;
    }
  }, [timer]);

  const skipTimer = useCallback(async (): Promise<void> => {
    if (!timer || !currentSession) return;

    try {
      setIsTimerRunning(false);

      // Mark activity as skipped
      if (currentActivityId) {
        try {
          await skipTimerActivity(currentActivityId);
          setCurrentActivityId(null);
        } catch (error) {
          console.error("Failed to skip timer activity:", error);
        }
      }

      // Update stats without playing sound or notifications (skip silent)
      if (timer.type === "pomodoro") {
        await incrementPomodoroCount(currentSession.id);
        await updateFocusTime(
          currentSession.id,
          timer.currentDuration - timer.timeRemaining,
        );
      } else {
        await updateBreakTime(
          currentSession.id,
          timer.currentDuration - timer.timeRemaining,
        );
      }

      // Calculate next cycle number from actual activities
      const currentCycle = await getCurrentCycleCount(currentSession.id);
      const newCycle =
        timer.type === "pomodoro" ? currentCycle + 1 : currentCycle;

      // Show break selection for pomodoros that complete a cycle
      if (timer.type === "pomodoro" && newCycle % 4 === 0) {
        setShowBreakSelection(true);
        setPendingCycle(newCycle);
      } else {
        setShowBreakSelection(false);
        setPendingCycle(undefined);
      }

      setTimer(null);
      if (activeSessionId) {
        await deleteTimerState(activeSessionId);
      }
    } catch (error) {
      const pomodoroError = handlePomodoroError(
        error,
        PomodoroErrorType.SESSION_ERROR,
      );
      setError(pomodoroError.message);
      throw error;
    }
  }, [timer, currentSession, activeSessionId, currentActivityId]);

  // Debug function: Set timer to 3 seconds for quick testing
  const debugSkipAsComplete = useCallback(async (): Promise<void> => {
    if (!timer) return;

    // Simply set timer to 3 seconds remaining - let it complete naturally
    setTimer((prev) =>
      prev
        ? {
            ...prev,
            timeRemaining: 3000, // 3 seconds in milliseconds
            startedAt: new Date(
              Date.now() - (prev.currentDuration - 3000),
            ).toISOString(), // Adjust start time
          }
        : null,
    );
  }, [timer]);

  // Additional context functions to match the interface
  const updateSettings = useCallback(
    async (
      sessionId: string,
      settings: Partial<TimerSettings>,
    ): Promise<void> => {
      await updateSession(sessionId, {
        settings: { ...DEFAULT_TIMER_SETTINGS, ...settings },
      });
    },
    [updateSession],
  );

  const updateBackground = useCallback(
    async (
      sessionId: string,
      backgroundImage: string | null,
    ): Promise<void> => {
      await updateSession(sessionId, {
        backgroundImage: backgroundImage || undefined,
      });
    },
    [updateSession],
  );

  const updateCurrentTask = useCallback(
    async (sessionId: string, currentTask: string): Promise<void> => {
      await updateSession(sessionId, { currentTask });
    },
    [updateSession],
  );

  const incrementPomodoro = useCallback(
    async (sessionId: string): Promise<void> => {
      await incrementPomodoroCount(sessionId);
    },
    [],
  );

  const updateStats = useCallback(
    async (
      sessionId: string,
      stats: Partial<PomodoroSessionModel["stats"]>,
    ): Promise<void> => {
      const session = sessions?.find((s) => s.id === sessionId);
      if (session) {
        await updateSession(sessionId, {
          stats: { ...session.stats, ...stats },
        });
      }
    },
    [sessions, updateSession],
  );

  const setShowBreakSelectionFn = useCallback((show: boolean) => {
    setShowBreakSelection(show);
  }, []);

  const startBreak = useCallback(
    async (breakType: "shortBreak" | "longBreak"): Promise<void> => {
      await startTimer(breakType);
      setShowBreakSelection(false);
      setPendingCycle(undefined);
    },
    [startTimer],
  );

  // Context value
  const contextValue: PomodoroContext = {
    // State from live queries and derived state
    sessions: sessions || [],
    activeSessionId,
    currentSession,
    timer,
    isTimerRunning,
    todos,
    activeTodos,
    completedTodos,
    isLoaded,
    error,
    showBreakSelection,
    pendingCycle,

    // Actions
    createSession,
    updateSession,
    deleteSession,
    setActiveSession,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    skipTimer,
    debugSkipAsComplete,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    updateSettings,
    updateBackground,
    updateCurrentTask,
    incrementPomodoro,
    updateStats,
    setShowBreakSelection: setShowBreakSelectionFn,
    startBreak,
  };

  return (
    <PomodoroContext.Provider value={contextValue}>
      {children}
    </PomodoroContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
}
