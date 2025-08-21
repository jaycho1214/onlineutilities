/**
 * Stopwatch Database Module - Optimized for Dexie 4.2
 *
 * This module handles all database operations for the stopwatch feature.
 * Optimized with modern Dexie patterns, proper TypeScript types, and enhanced error handling.
 */

"use client";

import Dexie, { type EntityTable } from "dexie";
import { StopwatchModel } from "../types";

/**
 * Stopwatch database class extending Dexie with enhanced error handling
 */
export class StopwatchDatabase extends Dexie {
  stopwatches!: EntityTable<StopwatchModel, "id">;

  constructor() {
    super("StopwatchDatabase");

    this.version(1).stores({
      stopwatches: "id, title, isRunning, createdAt, updatedAt",
    });

    // Enhanced error handling
    this.on("blocked", () => {
      console.warn("Stopwatch database blocked by another connection");
    });

    this.on("versionchange", () => {
      console.log("Stopwatch database version changed in another tab");
    });
  }
}

export const stopwatchDb = new StopwatchDatabase();
