// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Timer states for the Pomodoro timer
 */
export type TimerStatus = "idle" | "running" | "paused" | "completed";

/**
 * Timer type for different phases
 */
export type TimerType = "pomodoro" | "shortBreak" | "longBreak";

/**
 * Todo item priority levels
 */
export type TodoPriority = "low" | "medium" | "high";

/**
 * Todo item status
 */
export type TodoStatus = "pending" | "completed" | "archived";

/**
 * Timer settings interface
 */
export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number; // After how many pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  notificationsEnabled: boolean;
}

/**
 * Todo item interface
 */
export interface TodoItemModel {
  id: string;
  sessionId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedPomodoros?: number;
  actualPomodoros?: number;
}

/**
 * Pomodoro session interface
 */
export interface PomodoroSessionModel {
  id: string;
  title: string;
  description?: string;
  settings: TimerSettings;
  backgroundImage?: string;
  currentTask?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  stats: {
    totalPomodoros: number;
    totalFocusTime: number; // in milliseconds
    totalBreakTime: number; // in milliseconds
    completedTodos: number;
    totalTodos: number;
  };
}

/**
 * Timer state interface for current active timer
 */
export interface TimerStateModel {
  sessionId: string;
  type: TimerType;
  status: TimerStatus;
  currentDuration: number; // Total duration in ms
  timeRemaining: number; // Remaining time in ms
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  cycle: number; // Current pomodoro cycle
}

/**
 * Timer activity entry - tracks individual timer completions
 */
export interface TimerActivityModel {
  id: string;
  sessionId: string;
  type: TimerType;
  duration: number; // Actual duration in ms
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  skippedAt?: string;
  label?: string; // Task/label associated with this timer
  createdAt: string;
}

/**
 * Database entities and backward compatibility exports
 */
export type SessionDocument = PomodoroSessionModel;
export type TodoDocument = TodoItemModel;
export type TimerDocument = TimerStateModel;

// Backward compatibility exports
export type TodoItem = TodoItemModel;
export type PomodoroSession = PomodoroSessionModel;
export type TimerState = TimerStateModel;

/**
 * Context state interface
 */
export interface PomodoroContextState {
  // Sessions
  sessions: PomodoroSessionModel[];
  activeSessionId: string | null;
  currentSession: PomodoroSessionModel | null;

  // Timer
  timer: TimerStateModel | null;
  isTimerRunning: boolean;

  // Todos
  todos: TodoItemModel[];
  activeTodos: TodoItemModel[];
  completedTodos: TodoItemModel[];

  // UI State
  isLoaded: boolean;
  error: string | null;
  showBreakSelection: boolean;
  pendingCycle?: number;
}

/**
 * Context actions interface
 */
export interface PomodoroContextActions {
  // Session management
  createSession: (
    title: string,
    settings?: Partial<TimerSettings>,
  ) => Promise<string>;
  updateSession: (
    sessionId: string,
    updates: Partial<PomodoroSessionModel>,
  ) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  setActiveSession: (sessionId: string) => Promise<void>;

  // Timer management
  startTimer: (type: TimerType) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  skipTimer: () => Promise<void>;
  debugSkipAsComplete: () => Promise<void>;

  // Todo management
  createTodo: (todo: Partial<TodoItemModel>) => Promise<string>;
  updateTodo: (
    todoId: string,
    updates: Partial<TodoItemModel>,
  ) => Promise<void>;
  deleteTodo: (todoId: string) => Promise<void>;
  toggleTodo: (todoId: string) => Promise<void>;

  // Settings
  updateSettings: (
    sessionId: string,
    settings: Partial<TimerSettings>,
  ) => Promise<void>;

  // Background
  updateBackground: (
    sessionId: string,
    backgroundImage: string | null,
  ) => Promise<void>;

  // Current Task
  updateCurrentTask: (sessionId: string, currentTask: string) => Promise<void>;

  // Stats
  incrementPomodoro: (sessionId: string) => Promise<void>;
  updateStats: (
    sessionId: string,
    stats: Partial<PomodoroSessionModel["stats"]>,
  ) => Promise<void>;

  // Break selection
  setShowBreakSelection: (show: boolean) => void;
  startBreak: (breakType: "shortBreak" | "longBreak") => Promise<void>;
}

/**
 * Combined context interface
 */
export interface PomodoroContext
  extends PomodoroContextState,
    PomodoroContextActions {}

/**
 * Default timer settings
 */
export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  soundVolume: 0.5,
  notificationsEnabled: true,
};

/**
 * Timer durations in milliseconds
 */
export const getTimerDuration = (
  type: TimerType,
  settings: TimerSettings,
): number => {
  switch (type) {
    case "pomodoro":
      return settings.pomodoroMinutes * 60 * 1000;
    case "shortBreak":
      return settings.shortBreakMinutes * 60 * 1000;
    case "longBreak":
      return settings.longBreakMinutes * 60 * 1000;
    default:
      return 0;
  }
};

/**
 * Get next timer type based on current cycle
 */
export const getNextTimerType = (
  currentType: TimerType,
  cycle: number,
  longBreakInterval: number,
): TimerType => {
  if (currentType === "pomodoro") {
    return cycle % longBreakInterval === 0 ? "longBreak" : "shortBreak";
  }
  return "pomodoro";
};
