/**
 * Text Diff V2 Database Module
 *
 * This module handles all database operations for the text diff v2 feature.
 * It provides a clean interface for managing diff history with Dexie.js.
 */

import Dexie, { type EntityTable } from "dexie";
import type { DiffEntryModel, DiffSettingsModel } from "../types";

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Text Diff V2 database class extending Dexie
 */
class TextDiffDatabase extends Dexie {
  entries!: EntityTable<DiffEntryModel, "id">;
  settings!: EntityTable<DiffSettingsModel, "id">;

  constructor() {
    super("textdiff2db");

    // Version 1: Original schema with timestamp
    this.version(1).stores({
      entries: "id, timestamp, title",
      settings: "id",
    });

    // Version 2: Updated schema with createdAt and updatedAt
    this.version(2)
      .stores({
        entries: "id, createdAt, updatedAt, title",
        settings: "id",
      })
      .upgrade((trans) => {
        // Migrate existing data from timestamp to createdAt
        return trans
          .table("entries")
          .toCollection()
          .modify((entry: Record<string, unknown>) => {
            if (entry.timestamp && !entry.createdAt) {
              entry.createdAt = entry.timestamp;
              entry.updatedAt = entry.timestamp;
              delete entry.timestamp;
            }
          });
      });

    // Handle database errors
    this.on("blocked", () => {
      console.warn("Text Diff database blocked by another connection");
    });

    this.on("versionchange", () => {
      console.log("Text Diff database version changed in another tab");
    });
  }
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the text diff v2 database
 */
export const textDiff2Db = new TextDiffDatabase();

// Export database instance as default
export default textDiff2Db;
