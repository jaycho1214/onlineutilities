"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Timer, TimerContextType } from "../types";
import { timerDB } from "./timer-db";
import { useRafTicker } from "@/hooks/use-raf-ticker";

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  // Determine if any timer is running to activate RAF ticker
  const anyRunning = useMemo(() => timers.some((t) => t.isRunning), [timers]);
  const now = useRafTicker(anyRunning, 16); // ~60fps throttled

  const loadTimers = useCallback(async () => {
    try {
      const loadedTimers = await timerDB.getAllTimers();
      setTimers(loadedTimers);
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to load timers:", error);
      setIsLoaded(true);
    }
  }, []);

  // Load timers from IndexedDB on mount
  useEffect(() => {
    loadTimers();
  }, [loadTimers]);

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
    if (!anyRunning) return; // Only check completions while active
    setTimers((prev) =>
      prev.map((timer) => {
        if (
          !timer.isRunning ||
          !timer.startedAt ||
          timer.remainingAtStart === null
        )
          return timer;
        const elapsed = now - timer.startedAt;
        const remaining = Math.max(0, timer.remainingAtStart - elapsed);
        if (remaining === 0 && !timer.completedAt) {
          if (timer.soundEnabled) playAlarmSound();
          const updated: Timer = {
            ...timer,
            remainingTime: 0,
            isRunning: false,
            completedAt: now,
            startedAt: null,
            remainingAtStart: null,
          };
          timerDB.saveTimer(updated);
          return updated;
        }
        return timer;
      }),
    );
  }, [now, anyRunning, playAlarmSound]);

  const createTimer = useCallback(
    async (duration: number): Promise<string> => {
      const id = `timer-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newTimer: Timer = {
        id,
        title: `Timer ${timers.length + 1}`,
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

      await timerDB.saveTimer(newTimer);
      setTimers((prev) => [newTimer, ...prev]);
      return id;
    },
    [timers.length],
  );

  const deleteTimer = useCallback(
    async (id: string) => {
      await timerDB.deleteTimer(id);
      setTimers((prev) => prev.filter((t) => t.id !== id));
      if (activeTimerId === id) {
        setActiveTimerId(null);
      }
    },
    [activeTimerId],
  );

  const startTimer = useCallback(
    async (id: string) => {
      const timer = timers.find((t) => t.id === id);
      if (!timer) return;

      // Request notification permission on first timer start
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      const updatedTimer: Timer = {
        ...timer,
        isRunning: true,
        startedAt: Date.now(),
        pausedAt: null,
        remainingAtStart: timer.remainingTime,
      };

      await timerDB.saveTimer(updatedTimer);
      setTimers((prev) => prev.map((t) => (t.id === id ? updatedTimer : t)));
    },
    [timers],
  );

  const pauseTimer = useCallback(
    async (id: string) => {
      const timer = timers.find((t) => t.id === id);
      if (!timer || !timer.startedAt || timer.remainingAtStart === null) return;

      const elapsed = Date.now() - timer.startedAt;
      const newRemainingTime = Math.max(0, timer.remainingAtStart - elapsed);

      const updatedTimer: Timer = {
        ...timer,
        isRunning: false,
        pausedAt: Date.now(),
        remainingTime: newRemainingTime,
        startedAt: null,
        remainingAtStart: null,
      };

      await timerDB.saveTimer(updatedTimer);
      setTimers((prev) => prev.map((t) => (t.id === id ? updatedTimer : t)));
    },
    [timers],
  );

  const resetTimer = useCallback(
    async (id: string) => {
      const timer = timers.find((t) => t.id === id);
      if (!timer) return;

      const updatedTimer: Timer = {
        ...timer,
        remainingTime: timer.duration,
        isRunning: false,
        startedAt: null,
        pausedAt: null,
        completedAt: null,
        remainingAtStart: null,
      };

      await timerDB.saveTimer(updatedTimer);
      setTimers((prev) => prev.map((t) => (t.id === id ? updatedTimer : t)));
    },
    [timers],
  );

  const updateTimerTitle = useCallback(
    async (id: string, title: string) => {
      const timer = timers.find((t) => t.id === id);
      if (!timer) return;

      const updatedTimer: Timer = {
        ...timer,
        title,
      };

      await timerDB.saveTimer(updatedTimer);
      setTimers((prev) => prev.map((t) => (t.id === id ? updatedTimer : t)));
    },
    [timers],
  );

  const updateTimerDuration = useCallback(
    async (id: string, duration: number) => {
      const timer = timers.find((t) => t.id === id);
      if (!timer || timer.isRunning) return;

      const updatedTimer: Timer = {
        ...timer,
        duration,
        remainingTime: duration,
      };

      await timerDB.saveTimer(updatedTimer);
      setTimers((prev) => prev.map((t) => (t.id === id ? updatedTimer : t)));
    },
    [timers],
  );

  const toggleSound = useCallback(
    async (id: string) => {
      const timer = timers.find((t) => t.id === id);
      if (!timer) return;

      const updatedTimer: Timer = {
        ...timer,
        soundEnabled: !timer.soundEnabled,
      };

      await timerDB.saveTimer(updatedTimer);
      setTimers((prev) => prev.map((t) => (t.id === id ? updatedTimer : t)));
    },
    [timers],
  );

  const setActiveTimer = useCallback((id: string | null) => {
    setActiveTimerId(id);
  }, []);

  const getRemainingTime = useCallback(
    (timer: Timer): number => {
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
      timers,
      activeTimerId,
      createTimer,
      deleteTimer,
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
