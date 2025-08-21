"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRafTicker } from "@/hooks/use-raf-ticker";
import { StopwatchModel, StopwatchState, LapModel } from "../types";
import { stopwatchService } from "./stopwatch-service";
import { nanoid } from "nanoid";

interface StopwatchContextType extends StopwatchState {
  createStopwatch: (title?: string) => Promise<string>;
  deleteStopwatch: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  updateStopwatchTitle: (id: string, title: string) => Promise<void>;
  startStopwatch: (id: string) => Promise<void>;
  pauseStopwatch: (id: string) => Promise<void>;
  resetStopwatch: (id: string) => Promise<void>;
  addLap: (id: string) => Promise<void>;
  setActiveStopwatch: (id: string | null) => void;
  getCurrentTime: (stopwatch: StopwatchModel) => number;
  now: number; // shared ticking time reference
  isLoaded: boolean; // whether initial load from DB completed
}

const StopwatchContext = createContext<StopwatchContextType | null>(null);

export function StopwatchProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StopwatchState>({
    stopwatches: [],
    activeStopwatchId: null,
  });
  // active flag for ticker (memo to avoid unnecessary re-runs)
  const anyRunning = useMemo(
    () => state.stopwatches.some((s) => s.isRunning),
    [state.stopwatches],
  );
  const now = useRafTicker(anyRunning, 16);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadStopwatches = useCallback(async () => {
    try {
      const stopwatches = await stopwatchService.getAll();
      setState((prev) => ({ ...prev, stopwatches }));
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to load stopwatches:", error);
      setIsLoaded(true); // prevent perpetual loading state on error
    }
  }, []);

  const getCurrentTime = useCallback((stopwatch: StopwatchModel): number => {
    if (!stopwatch.isRunning || !stopwatch.startTime) {
      return stopwatch.pausedTime;
    }
    return stopwatch.pausedTime + (Date.now() - stopwatch.startTime);
  }, []);

  const createStopwatch = useCallback(
    async (title = "New Stopwatch"): Promise<string> => {
      try {
        const id = await stopwatchService.create({
          title,
          startTime: null,
          pausedTime: 0,
          isRunning: false,
          laps: [],
        });
        await loadStopwatches();
        return id;
      } catch (error) {
        console.error("Failed to create stopwatch:", error);
        throw error;
      }
    },
    [loadStopwatches],
  );

  const deleteStopwatch = useCallback(async (id: string): Promise<void> => {
    try {
      await stopwatchService.delete(id);
      setState((prev) => ({
        stopwatches: prev.stopwatches.filter((s) => s.id !== id),
        activeStopwatchId:
          prev.activeStopwatchId === id ? null : prev.activeStopwatchId,
      }));
    } catch (error) {
      console.error("Failed to delete stopwatch:", error);
      throw error;
    }
  }, []);

  const clearAll = useCallback(async (): Promise<void> => {
    try {
      await stopwatchService.clearAll();
      setState({
        stopwatches: [],
        activeStopwatchId: null,
      });
    } catch (error) {
      console.error("Failed to clear all stopwatches:", error);
      throw error;
    }
  }, []);

  const updateStopwatchTitle = useCallback(
    async (id: string, title: string): Promise<void> => {
      try {
        await stopwatchService.update(id, { title });
        setState((prev) => ({
          ...prev,
          stopwatches: prev.stopwatches.map((s) =>
            s.id === id ? { ...s, title } : s,
          ),
        }));
      } catch (error) {
        console.error("Failed to update stopwatch title:", error);
        throw error;
      }
    },
    [],
  );

  const startStopwatch = useCallback(async (id: string): Promise<void> => {
    try {
      const now = Date.now();
      await stopwatchService.update(id, {
        startTime: now,
        isRunning: true,
      });

      setState((prev) => ({
        ...prev,
        stopwatches: prev.stopwatches.map((s) =>
          s.id === id ? { ...s, startTime: now, isRunning: true } : s,
        ),
      }));
    } catch (error) {
      console.error("Failed to start stopwatch:", error);
      throw error;
    }
  }, []);

  const pauseStopwatch = useCallback(
    async (id: string): Promise<void> => {
      try {
        const stopwatch = state.stopwatches.find((s) => s.id === id);
        if (!stopwatch || !stopwatch.isRunning) return;

        const currentTime = getCurrentTime(stopwatch);
        await stopwatchService.update(id, {
          pausedTime: currentTime,
          startTime: null,
          isRunning: false,
        });

        setState((prev) => ({
          ...prev,
          stopwatches: prev.stopwatches.map((s) =>
            s.id === id
              ? {
                  ...s,
                  pausedTime: currentTime,
                  startTime: null,
                  isRunning: false,
                }
              : s,
          ),
        }));
      } catch (error) {
        console.error("Failed to pause stopwatch:", error);
        throw error;
      }
    },
    [state.stopwatches, getCurrentTime],
  );

  const resetStopwatch = useCallback(async (id: string): Promise<void> => {
    try {
      await stopwatchService.update(id, {
        startTime: null,
        pausedTime: 0,
        isRunning: false,
        laps: [],
      });

      setState((prev) => ({
        ...prev,
        stopwatches: prev.stopwatches.map((s) =>
          s.id === id
            ? {
                ...s,
                startTime: null,
                pausedTime: 0,
                isRunning: false,
                laps: [],
              }
            : s,
        ),
      }));
    } catch (error) {
      console.error("Failed to reset stopwatch:", error);
      throw error;
    }
  }, []);

  const addLap = useCallback(
    async (id: string): Promise<void> => {
      try {
        const stopwatch = state.stopwatches.find((s) => s.id === id);
        if (!stopwatch || !stopwatch.isRunning) return;

        const currentTime = getCurrentTime(stopwatch);
        const lastLapTime =
          stopwatch.laps.length > 0
            ? stopwatch.laps[stopwatch.laps.length - 1].time
            : 0;

        const newLap: LapModel = {
          id: nanoid(),
          time: currentTime,
          lapTime: currentTime - lastLapTime,
          timestamp: Date.now(),
        };

        const updatedLaps = [...stopwatch.laps, newLap];
        await stopwatchService.update(id, { laps: updatedLaps });

        setState((prev) => ({
          ...prev,
          stopwatches: prev.stopwatches.map((s) =>
            s.id === id ? { ...s, laps: updatedLaps } : s,
          ),
        }));
      } catch (error) {
        console.error("Failed to add lap:", error);
        throw error;
      }
    },
    [state.stopwatches, getCurrentTime],
  );

  const setActiveStopwatch = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, activeStopwatchId: id }));
  }, []);

  useEffect(() => {
    const initializeStopwatches = async () => {
      try {
        await stopwatchService.updateRunningStopwatches();
        await loadStopwatches();
      } catch (error) {
        console.error("Failed to initialize stopwatches:", error);
      }
    };

    initializeStopwatches();
  }, [loadStopwatches]);

  // Single global ticker using requestAnimationFrame while any stopwatch runs
  // Visibility change triggers indirect update via hook next frame; no manual sync needed now

  const value: StopwatchContextType = {
    ...state,
    createStopwatch,
    deleteStopwatch,
    clearAll,
    updateStopwatchTitle,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    addLap,
    setActiveStopwatch,
    getCurrentTime,
    now,
    isLoaded,
  };

  return (
    <StopwatchContext.Provider value={value}>
      {children}
    </StopwatchContext.Provider>
  );
}

export function useStopwatch() {
  const context = useContext(StopwatchContext);
  if (!context) {
    throw new Error("useStopwatch must be used within a StopwatchProvider");
  }
  return context;
}
