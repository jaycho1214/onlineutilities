export interface TimerModel {
  id: string;
  title: string;
  duration: number; // Total duration in milliseconds
  remainingTime: number; // Remaining time in milliseconds when not running
  isRunning: boolean;
  startedAt: number | null; // Timestamp when timer was started/resumed
  pausedAt: number | null; // Timestamp when timer was paused
  createdAt: number;
  completedAt: number | null;
  soundEnabled: boolean;
  remainingAtStart: number | null; // Remaining time when timer was started/resumed
}

export interface TimerContextType {
  timers: TimerModel[];
  activeTimerId: string | null;
  createTimer: (duration: number) => Promise<string>;
  deleteTimer: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  startTimer: (id: string) => Promise<void>;
  pauseTimer: (id: string) => Promise<void>;
  resetTimer: (id: string) => Promise<void>;
  updateTimerTitle: (id: string, title: string) => Promise<void>;
  updateTimerDuration: (id: string, duration: number) => Promise<void>;
  toggleSound: (id: string) => Promise<void>;
  setActiveTimer: (id: string | null) => void;
  getRemainingTime: (timer: TimerModel) => number;
  // Shared ticking timestamp (ms) used for rendering smooth countdowns
  now?: number;
}
