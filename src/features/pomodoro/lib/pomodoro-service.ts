/**
 * Pomodoro Service Module - Optimized for Dexie 4.2
 *
 * This module provides service operations for the Pomodoro timer feature.
 * Optimized with modern Dexie patterns, efficient queries, and enhanced error handling.
 */

import Dexie from "dexie";
import { nanoid } from "nanoid";
import {
  type PomodoroSessionModel,
  type TodoItemModel,
  type TimerStateModel,
  type TimerActivityModel,
  DEFAULT_TIMER_SETTINGS,
} from "../types";
import { pomodoroDb } from "./pomodoro-db";

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

/**
 * Create a new Pomodoro session
 */
export async function createSession(
  title: string,
  description?: string,
  settings = DEFAULT_TIMER_SETTINGS,
): Promise<string> {
  const id = nanoid();

  // Get all sessions and manually update them to avoid IndexedDB issues
  const allSessions = await pomodoroDb.sessions.toArray();

  // Set all existing sessions to inactive
  for (const session of allSessions) {
    if (session.isActive) {
      await pomodoroDb.sessions.update(session.id, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Create new session
  const session: PomodoroSessionModel = {
    id,
    title,
    description,
    settings,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      totalPomodoros: 0,
      totalFocusTime: 0,
      totalBreakTime: 0,
      completedTodos: 0,
      totalTodos: 0,
    },
  };

  await pomodoroDb.sessions.put(session);
  return id;
}

/**
 * Get all sessions
 */
export async function getAllSessions(): Promise<PomodoroSessionModel[]> {
  const sessions = await pomodoroDb.sessions.toArray();
  return sessions.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

/**
 * Get active session
 */
export async function getActiveSession(): Promise<PomodoroSessionModel | null> {
  const sessions = await pomodoroDb.sessions.toArray();
  return sessions.find((session) => session.isActive) || null;
}

/**
 * Get session by ID
 */
export async function getSession(
  id: string,
): Promise<PomodoroSessionModel | null> {
  const session = await pomodoroDb.sessions.get(id);
  return session || null;
}

/**
 * Update session
 */
export async function updateSession(
  id: string,
  updates: Partial<PomodoroSessionModel>,
): Promise<void> {
  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await pomodoroDb.sessions.update(id, updatedData);
}

/**
 * Delete session and all associated todos
 */
export async function deleteSession(id: string): Promise<void> {
  // Get todos for this session
  const todos = await pomodoroDb.todos.toArray();
  const sessionTodos = todos.filter((todo) => todo.sessionId === id);

  // Delete all todos for this session
  for (const todo of sessionTodos) {
    await pomodoroDb.todos.delete(todo.id);
  }

  // Delete timer state for this session
  await pomodoroDb.timers.delete(id);

  // Delete the session
  await pomodoroDb.sessions.delete(id);
}

/**
 * Set active session
 */
export async function setActiveSession(id: string): Promise<void> {
  const allSessions = await pomodoroDb.sessions.toArray();

  // Set all sessions to inactive
  for (const session of allSessions) {
    if (session.isActive) {
      await pomodoroDb.sessions.update(session.id, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Set the specified session to active
  await pomodoroDb.sessions.update(id, {
    isActive: true,
    updatedAt: new Date().toISOString(),
  });
}

// ============================================================================
// TODO OPERATIONS
// ============================================================================

/**
 * Create a new todo item
 */
export async function createTodo(
  sessionId: string,
  todo: Partial<TodoItemModel>,
): Promise<string> {
  const id = nanoid();
  const newTodo: TodoItemModel = {
    id,
    sessionId,
    title: todo.title || "",
    description: todo.description,
    completed: false,
    priority: todo.priority || "medium",
    status: todo.status || "pending",
    estimatedPomodoros: todo.estimatedPomodoros,
    actualPomodoros: todo.actualPomodoros || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await pomodoroDb.todos.put(newTodo);

  // Update session stats
  await updateSessionStats(sessionId);

  return id;
}

/**
 * Get all todos for a session
 */
export async function getTodosForSession(
  sessionId: string,
): Promise<TodoItemModel[]> {
  const allTodos = await pomodoroDb.todos.toArray();
  const sessionTodos = allTodos.filter((todo) => todo.sessionId === sessionId);
  return sessionTodos.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

/**
 * Update todo item
 */
export async function updateTodo(
  id: string,
  updates: Partial<TodoItemModel>,
): Promise<void> {
  const todo = await pomodoroDb.todos.get(id);
  if (!todo) return;

  // If completing a todo, set completedAt
  const finalUpdates: Partial<TodoItemModel> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (updates.completed === true && !todo.completed) {
    finalUpdates.completedAt = new Date().toISOString();
  } else if (updates.completed === false && todo.completed) {
    finalUpdates.completedAt = undefined;
  }

  await pomodoroDb.todos.update(id, finalUpdates);

  // Update session stats
  await updateSessionStats(todo.sessionId);
}

/**
 * Delete todo item
 */
export async function deleteTodo(id: string): Promise<void> {
  const todo = await pomodoroDb.todos.get(id);
  if (!todo) return;

  await pomodoroDb.todos.delete(id);

  // Update session stats
  await updateSessionStats(todo.sessionId);
}

/**
 * Toggle todo completion status
 */
export async function toggleTodo(id: string): Promise<void> {
  const todo = await pomodoroDb.todos.get(id);
  if (!todo) return;

  const updates: Partial<TodoItemModel> = {
    completed: !todo.completed,
    updatedAt: new Date().toISOString(),
  };

  if (!todo.completed) {
    updates.completedAt = new Date().toISOString();
  } else {
    updates.completedAt = undefined;
  }

  await pomodoroDb.todos.update(id, updates);

  // Update session stats
  await updateSessionStats(todo.sessionId);
}

// ============================================================================
// TIMER STATE OPERATIONS
// ============================================================================

/**
 * Save timer state
 */
export async function saveTimerState(
  timerState: TimerStateModel,
): Promise<void> {
  await pomodoroDb.timers.put(timerState);
}

/**
 * Get timer state for session
 */
export async function getTimerState(
  sessionId: string,
): Promise<TimerStateModel | null> {
  const timer = await pomodoroDb.timers.get(sessionId);
  return timer || null;
}

/**
 * Delete timer state
 */
export async function deleteTimerState(sessionId: string): Promise<void> {
  await pomodoroDb.timers.delete(sessionId);
}

// ============================================================================
// STATISTICS OPERATIONS
// ============================================================================

/**
 * Update session statistics
 */
async function updateSessionStats(sessionId: string): Promise<void> {
  const todos = await getTodosForSession(sessionId);
  const completed = todos.filter((t) => t.completed).length;
  const total = todos.length;

  const session = await pomodoroDb.sessions.get(sessionId);
  if (session) {
    await pomodoroDb.sessions.update(sessionId, {
      stats: {
        ...session.stats,
        completedTodos: completed,
        totalTodos: total,
      },
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Increment pomodoro count for session
 */
export async function incrementPomodoroCount(sessionId: string): Promise<void> {
  const session = await pomodoroDb.sessions.get(sessionId);
  if (session) {
    await pomodoroDb.sessions.update(sessionId, {
      stats: {
        ...session.stats,
        totalPomodoros: session.stats.totalPomodoros + 1,
      },
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Update focus time for session
 */
export async function updateFocusTime(
  sessionId: string,
  additionalTime: number,
): Promise<void> {
  const session = await pomodoroDb.sessions.get(sessionId);
  if (session) {
    await pomodoroDb.sessions.update(sessionId, {
      stats: {
        ...session.stats,
        totalFocusTime: session.stats.totalFocusTime + additionalTime,
      },
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Update break time for session
 */
export async function updateBreakTime(
  sessionId: string,
  additionalTime: number,
): Promise<void> {
  const session = await pomodoroDb.sessions.get(sessionId);
  if (session) {
    await pomodoroDb.sessions.update(sessionId, {
      stats: {
        ...session.stats,
        totalBreakTime: session.stats.totalBreakTime + additionalTime,
      },
      updatedAt: new Date().toISOString(),
    });
  }
}

// ============================================================================
// TIMER ACTIVITY OPERATIONS
// ============================================================================

/**
 * Records a timer start event
 */
export async function createTimerActivity(
  sessionId: string,
  type: TimerActivityModel["type"],
  duration: number,
  label?: string,
): Promise<string> {
  try {
    const activity: TimerActivityModel = {
      id: crypto.randomUUID(),
      sessionId,
      type,
      duration,
      completed: false,
      startedAt: new Date().toISOString(),
      label,
      createdAt: new Date().toISOString(),
    };

    await pomodoroDb.activities.add(activity);
    return activity.id;
  } catch (error) {
    console.error("Failed to create timer activity:", error);
    throw error;
  }
}

/**
 * Marks a timer activity as completed
 */
export async function completeTimerActivity(activityId: string): Promise<void> {
  try {
    await pomodoroDb.activities.update(activityId, {
      completed: true,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to complete timer activity:", error);
    throw error;
  }
}

/**
 * Marks a timer activity as skipped
 */
export async function skipTimerActivity(activityId: string): Promise<void> {
  try {
    await pomodoroDb.activities.update(activityId, {
      completed: false,
      skippedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to skip timer activity:", error);
    throw error;
  }
}

/**
 * Deletes a timer activity entry
 */
export async function deleteTimerActivity(activityId: string): Promise<void> {
  try {
    await pomodoroDb.activities.delete(activityId);
  } catch (error) {
    console.error("Failed to delete timer activity:", error);
    throw error;
  }
}

/**
 * Updates a timer activity label
 */
export async function updateTimerActivityLabel(
  activityId: string,
  label: string,
): Promise<void> {
  try {
    await pomodoroDb.activities.update(activityId, { label });
  } catch (error) {
    console.error("Failed to update timer activity label:", error);
    throw error;
  }
}

/**
 * Gets activities for a specific session and date
 */
export async function getSessionActivitiesForDate(
  sessionId: string,
  date: string,
): Promise<TimerActivityModel[]> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await pomodoroDb.activities
      .where("sessionId")
      .equals(sessionId)
      .filter((activity) => {
        const activityDate = new Date(activity.startedAt);
        return activityDate >= startOfDay && activityDate <= endOfDay;
      })
      .sortBy("startedAt");
  } catch (error) {
    console.error("Failed to get session activities for date:", error);
    return [];
  }
}

/**
 * Gets all activities for today across all sessions
 */
export async function getTodaysActivities(): Promise<TimerActivityModel[]> {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return await pomodoroDb.activities
      .filter((activity) => {
        const activityDate = new Date(activity.startedAt);
        return activityDate >= startOfDay && activityDate <= endOfDay;
      })
      .sortBy("startedAt");
  } catch (error) {
    console.error("Failed to get today's activities:", error);
    return [];
  }
}

/**
 * Gets the current pomodoro cycle count for a session based on completed activities
 */
export async function getCurrentCycleCount(sessionId: string): Promise<number> {
  try {
    const completedPomodoros = await pomodoroDb.activities
      .where("sessionId")
      .equals(sessionId)
      .filter((activity) => activity.type === "pomodoro" && activity.completed)
      .count();

    return completedPomodoros;
  } catch (error) {
    console.error("Failed to get current cycle count:", error);
    return 0;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize database - clear old corrupted data
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Delete old databases to avoid conflicts
    await Promise.all([
      Dexie.delete("pomodoroDb"),
      Dexie.delete("PomodoroTimerApp"),
    ]);
  } catch {
    // Ignore errors if databases don't exist
  }
}

/**
 * Clear all data (for testing purposes)
 */
export async function clearAllData(): Promise<void> {
  await pomodoroDb.sessions.clear();
  await pomodoroDb.todos.clear();
  await pomodoroDb.timers.clear();
  await pomodoroDb.activities.clear();
}

/**
 * Export data for backup
 */
export async function exportData(): Promise<{
  sessions: PomodoroSessionModel[];
  todos: TodoItemModel[];
  timers: TimerStateModel[];
}> {
  const [sessions, todos, timers] = await Promise.all([
    pomodoroDb.sessions.toArray(),
    pomodoroDb.todos.toArray(),
    pomodoroDb.timers.toArray(),
  ]);

  return { sessions, todos, timers };
}

/**
 * Import data from backup
 */
export async function importData(data: {
  sessions: PomodoroSessionModel[];
  todos: TodoItemModel[];
  timers: TimerStateModel[];
}): Promise<void> {
  // Clear existing data
  await pomodoroDb.sessions.clear();
  await pomodoroDb.todos.clear();
  await pomodoroDb.timers.clear();

  // Import new data
  for (const session of data.sessions) {
    await pomodoroDb.sessions.put(session);
  }
  for (const todo of data.todos) {
    await pomodoroDb.todos.put(todo);
  }
  for (const timer of data.timers) {
    await pomodoroDb.timers.put(timer);
  }
}

// ============================================================================
// STATISTICS FUNCTIONS
// ============================================================================

interface DailyStats {
  date: string;
  totalPomodoros: number;
  totalFocusTime: number;
  totalBreakTime: number;
  completedTodos: number;
}

interface WeeklyStats {
  week: string;
  totalPomodoros: number;
  totalFocusTime: number;
  averageFocusPerDay: number;
  bestDay: string;
}

/**
 * Get daily statistics for a session
 */
export async function getDailyStats(sessionId: string): Promise<DailyStats[]> {
  const session = await pomodoroDb.sessions.get(sessionId);
  if (!session) return [];

  const today = new Date().toISOString().split("T")[0];

  // Only return today's stats from the actual session data
  const dailyStats: DailyStats[] = [];

  if (session.stats.totalPomodoros > 0 || session.stats.totalFocusTime > 0) {
    dailyStats.push({
      date: today,
      totalPomodoros: session.stats.totalPomodoros,
      totalFocusTime: session.stats.totalFocusTime,
      totalBreakTime: session.stats.totalBreakTime,
      completedTodos: session.stats.completedTodos,
    });
  }

  return dailyStats;
}

/**
 * Get weekly statistics for a session
 */
export async function getWeeklyStats(
  sessionId: string,
): Promise<WeeklyStats[]> {
  const session = await pomodoroDb.sessions.get(sessionId);
  if (!session) return [];

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStr = weekStart.toISOString().split("T")[0];

  // Only return current week's stats from the actual session data
  const weeklyStats: WeeklyStats[] = [];

  if (session.stats.totalPomodoros > 0 || session.stats.totalFocusTime > 0) {
    weeklyStats.push({
      week: weekStr,
      totalPomodoros: session.stats.totalPomodoros,
      totalFocusTime: session.stats.totalFocusTime,
      averageFocusPerDay: session.stats.totalFocusTime / 7,
      bestDay: "Today",
    });
  }

  return weeklyStats;
}
