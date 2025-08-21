/**
 * Pomodoro Database Module - Optimized for Dexie 4.2
 *
 * This module handles all database operations for the Pomodoro timer feature.
 * Optimized with modern Dexie patterns, efficient queries, and proper error handling.
 */

import Dexie, { type EntityTable } from "dexie";
import {
  type PomodoroSessionModel,
  type TodoItemModel,
  type TimerStateModel,
  type TimerActivityModel,
} from "../types";

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Pomodoro database class extending Dexie with optimized schema and error handling
 */
class PomodoroDatabase extends Dexie {
  sessions!: EntityTable<PomodoroSessionModel, "id">;
  todos!: EntityTable<TodoItemModel, "id">;
  timers!: EntityTable<TimerStateModel, "sessionId">;
  activities!: EntityTable<TimerActivityModel, "id">;

  constructor() {
    super("pomodorodb");

    this.version(1).stores({
      sessions: "id, isActive, updatedAt, createdAt",
      todos: "id, sessionId, completed, createdAt, updatedAt",
      timers: "sessionId",
      activities: "id, sessionId, type, completed, createdAt, startedAt",
    });

    // Enhanced error handling
    this.on("blocked", () => {
      console.warn("Pomodoro database blocked by another connection");
    });

    this.on("versionchange", () => {
      console.log("Pomodoro database version changed in another tab");
    });
  }
}

/**
 * Singleton instance of the pomodoro database
 */
export const pomodoroDb = new PomodoroDatabase();
