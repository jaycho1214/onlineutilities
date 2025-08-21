/**
 * Formatter Database Module
 *
 * This module handles all database operations for the formatter feature.
 * It provides a clean interface for managing formatting history with Dexie.js.
 */

import Dexie, { type EntityTable } from "dexie";
import type { FormatterEntryModel } from "../types";

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Formatter database class extending Dexie
 */
class FormatterDatabase extends Dexie {
  entries!: EntityTable<FormatterEntryModel, "id">;

  constructor() {
    super("formatterdb");

    // Version 1: Original schema with timestamp
    this.version(1).stores({
      entries: "id, type, timestamp, operation",
    });

    // Version 2: Updated schema with createdAt and updatedAt
    this.version(2)
      .stores({
        entries: "id, type, createdAt, updatedAt, operation",
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
      console.warn("Formatter database blocked by another connection");
    });

    this.on("versionchange", () => {
      console.log("Formatter database version changed in another tab");
    });
  }
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the formatter database
 */
export const formatterDb = new FormatterDatabase();

// Export database instance as default
export default formatterDb;
