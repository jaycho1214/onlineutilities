export interface LapModel {
  id: string;
  time: number;
  lapTime: number;
  timestamp: number;
}

export interface StopwatchModel {
  id: string;
  title: string;
  startTime: number | null;
  pausedTime: number;
  isRunning: boolean;
  laps: LapModel[];
  createdAt: number;
  updatedAt: number;
}

export interface StopwatchState {
  stopwatches: StopwatchModel[];
  activeStopwatchId: string | null;
}
