"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { TimerModel, TimerContextType } from "../types";
import { timerService } from "./timer-service";
import { timerDb } from "./timer-db";
import { useRafTicker } from "@/hooks/use-raf-ticker";
import { nanoid } from "nanoid";

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);

  // Use useLiveQuery to get real-time timers data
  const timers = useLiveQuery<TimerModel[]>(
    async (): Promise<TimerModel[]> => {
      try {
        return await timerDb.timers.orderBy("createdAt").reverse().toArray();
      } catch (error) {
        console.error("Failed to fetch timers:", error);
        return [];
      }
    },
    [], // No dependencies - always watch all timers
  );

  const isLoaded = timers !== undefined;

  // Determine if any timer is running to activate RAF ticker
  const anyRunning = useMemo(
    () => (timers ? timers.some((t) => t.isRunning) : false),
    [timers],
  );
  const now = useRafTicker(anyRunning, 16); // ~60fps throttled

  // Completion detection runs when ticker updates.

  const playAlarmSound = useCallback(async () => {
    try {
      // Play audio
      const audio = new Audio("/alarm-clock.mp3");
      audio.volume = 0.7;
      await audio.play();

      // Show browser notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Timer Complete!", {
          body: "Your timer has finished.",
          icon: "/favicon.ico",
          tag: "timer-complete",
        });
      }
    } catch (err) {
      console.error("Failed to play sound:", err);
      // Try to request permission and show notification instead
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("Timer Complete!", {
              body: "Your timer has finished.",
              icon: "/favicon.ico",
              tag: "timer-complete",
            });
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!anyRunning || !timers) return; // Only check completions while active

    // Check for timer completions and update database directly
    timers.forEach(async (timer) => {
      if (
        !timer.isRunning ||
        !timer.startedAt ||
        timer.remainingAtStart === null
      )
        return;

      const elapsed = now - timer.startedAt;
      const remaining = Math.max(0, timer.remainingAtStart - elapsed);

      if (remaining === 0 && !timer.completedAt) {
        if (timer.soundEnabled) playAlarmSound();

        const updates: Partial<TimerModel> = {
          remainingTime: 0,
          isRunning: false,
          completedAt: now,
          startedAt: null,
          remainingAtStart: null,
        };

        try {
          await timerService.updateTimer(timer.id, updates);
        } catch (error) {
          console.error("Failed to update completed timer:", error);
        }
      }
    });
  }, [now, anyRunning, timers, playAlarmSound]);

  const createTimer = useCallback(
    async (duration: number): Promise<string> => {
      const id = nanoid();
      const newTimer: TimerModel = {
        id,
        title: `Timer ${(timers?.length || 0) + 1}`,
        duration,
        remainingTime: duration,
        isRunning: false,
        startedAt: null,
        pausedAt: null,
        createdAt: Date.now(),
        completedAt: null,
        soundEnabled: true,
        remainingAtStart: null,
      };

      await timerService.createTimer(newTimer);
      return id;
    },
    [timers?.length],
  );

  const deleteTimer = useCallback(
    async (id: string) => {
      await timerService.deleteTimer(id);
      if (activeTimerId === id) {
        setActiveTimerId(null);
      }
    },
    [activeTimerId],
  );

  const clearAll = useCallback(async () => {
    await timerService.clearAll();
    setActiveTimerId(null);
  }, []);

  const startTimer = useCallback(
    async (id: string) => {
      const timer = timers?.find((t) => t.id === id);
      if (!timer) return;

      // Request notification permission on first timer start
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      const updates: Partial<TimerModel> = {
        isRunning: true,
        startedAt: Date.now(),
        pausedAt: null,
        remainingAtStart: timer.remainingTime,
      };

      await timerService.updateTimer(id, updates);
    },
    [timers],
  );

  const pauseTimer = useCallback(
    async (id: string) => {
      const timer = timers?.find((t) => t.id === id);
      if (!timer || !timer.startedAt || timer.remainingAtStart === null) return;

      const elapsed = Date.now() - timer.startedAt;
      const newRemainingTime = Math.max(0, timer.remainingAtStart - elapsed);

      const updates: Partial<TimerModel> = {
        isRunning: false,
        pausedAt: Date.now(),
        remainingTime: newRemainingTime,
        startedAt: null,
        remainingAtStart: null,
      };

      await timerService.updateTimer(id, updates);
    },
    [timers],
  );

  const resetTimer = useCallback(
    async (id: string) => {
      const timer = timers?.find((t) => t.id === id);
      if (!timer) return;

      const updates: Partial<TimerModel> = {
        remainingTime: timer.duration,
        isRunning: false,
        startedAt: null,
        pausedAt: null,
        completedAt: null,
        remainingAtStart: null,
      };

      await timerService.updateTimer(id, updates);
    },
    [timers],
  );

  const updateTimerTitle = useCallback(
    async (id: string, title: string) => {
      const timer = timers?.find((t) => t.id === id);
      if (!timer) return;

      await timerService.updateTimer(id, { title });
    },
    [timers],
  );

  const updateTimerDuration = useCallback(
    async (id: string, duration: number) => {
      const timer = timers?.find((t) => t.id === id);
      if (!timer || timer.isRunning) return;

      const updates: Partial<TimerModel> = {
        duration,
        remainingTime: duration,
      };

      await timerService.updateTimer(id, updates);
    },
    [timers],
  );

  const toggleSound = useCallback(
    async (id: string) => {
      const timer = timers?.find((t) => t.id === id);
      if (!timer) return;

      await timerService.updateTimer(id, { soundEnabled: !timer.soundEnabled });
    },
    [timers],
  );

  const setActiveTimer = useCallback((id: string | null) => {
    setActiveTimerId(id);
  }, []);

  const getRemainingTime = useCallback(
    (timer: TimerModel): number => {
      if (
        !timer.isRunning ||
        !timer.startedAt ||
        timer.remainingAtStart === null
      )
        return timer.remainingTime;
      const elapsed = now - timer.startedAt;
      return Math.max(0, timer.remainingAtStart - elapsed);
    },
    [now],
  );

  const value: TimerContextType = useMemo(
    () => ({
      timers: timers || [],
      activeTimerId,
      createTimer,
      deleteTimer,
      clearAll,
      startTimer,
      pauseTimer,
      resetTimer,
      updateTimerTitle,
      updateTimerDuration,
      toggleSound,
      setActiveTimer,
      getRemainingTime,
      isLoaded,
      now,
    }),
    [
      timers,
      activeTimerId,
      createTimer,
      deleteTimer,
      clearAll,
      startTimer,
      pauseTimer,
      resetTimer,
      updateTimerTitle,
      updateTimerDuration,
      toggleSound,
      setActiveTimer,
      getRemainingTime,
      isLoaded,
      now,
    ],
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
