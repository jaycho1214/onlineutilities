export interface Lap {
  id: string;
  time: number;
  lapTime: number;
  timestamp: number;
}

export interface Stopwatch {
  id: string;
  title: string;
  startTime: number | null;
  pausedTime: number;
  isRunning: boolean;
  laps: Lap[];
  createdAt: number;
  updatedAt: number;
}

export interface StopwatchState {
  stopwatches: Stopwatch[];
  activeStopwatchId: string | null;
}
