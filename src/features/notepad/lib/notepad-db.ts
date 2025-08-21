/**
 * Notepad Database Module - Optimized for Dexie 4.2
 *
 * This module handles all database operations for the notepad feature.
 * Optimized with modern Dexie patterns, efficient queries, and enhanced error handling.
 */

import Dexie, { type EntityTable } from "dexie";
import type { NoteModel } from "../types";

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Notepad database class extending Dexie
 */
class NotepadDatabase extends Dexie {
  notes!: EntityTable<NoteModel, "id">;

  constructor() {
    super("notepaddb");

    this.version(1).stores({
      notes: "id, updatedAt",
    });

    // Version 2: Add more indexes for better performance
    this.version(2).stores({
      notes: "id, updatedAt, createdAt, title",
    });

    // Enhanced database error handling
    this.on("blocked", () => {
      console.warn("Notepad database upgrade blocked by another connection");
    });

    this.on("versionchange", () => {
      console.log("Notepad database version changed in another tab");
    });

    this.on("close", () => {
      console.log("Notepad database connection closed");
    });
  }
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the notepad database
 */
export const notepadDb = new NotepadDatabase();
