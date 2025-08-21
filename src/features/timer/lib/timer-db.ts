/**
 * Timer Database Module - Optimized for Dexie 4.2
 *
 * This module handles all database operations for the timer feature.
 * Optimized with modern Dexie patterns, efficient queries, and enhanced error handling.
 */

import Dexie, { type EntityTable } from "dexie";
import type { TimerModel } from "../types";

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Timer database class extending Dexie with enhanced error handling
 */
class TimerDatabase extends Dexie {
  timers!: EntityTable<TimerModel, "id">;

  constructor() {
    super("TimerDatabase");

    this.version(1).stores({
      timers: "id, isRunning, createdAt, completedAt",
    });

    // Enhanced error handling
    this.on("blocked", () => {
      console.warn("Timer database blocked by another connection");
    });

    this.on("versionchange", () => {
      console.log("Timer database version changed in another tab");
    });
  }
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the timer database
 */
export const timerDb = new TimerDatabase();
