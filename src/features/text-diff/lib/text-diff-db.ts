/**
 * Text Diff V2 Database Module
 *
 * This module handles all database operations for the text diff v2 feature.
 * It provides a clean interface for managing diff history with Dexie.js.
 */

import Dexie, { type EntityTable } from "dexie";
import { nanoid } from "nanoid";
import type { DiffOptions } from "../types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DiffEntry {
  id: string;
  originalText: string;
  modifiedText: string;
  viewMode: "side-by-side" | "unified";
  diffOptions: DiffOptions;
  timestamp: string;
  title?: string;
  mergedText?: string;
}

export interface DiffSettings {
  id: string;
  defaultViewMode: "side-by-side" | "unified";
  defaultOptions: DiffOptions;
  theme?: "light" | "dark" | "auto";
  lineNumbers?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
}

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Text Diff V2 database class extending Dexie
 */
class TextDiffDatabase extends Dexie {
  entries!: EntityTable<DiffEntry, "id">;
  settings!: EntityTable<DiffSettings, "id">;

  constructor() {
    super("textdiff2db");

    this.version(1).stores({
      entries: "id, timestamp, title",
      settings: "id",
    });

    this.entries.mapToClass(DiffEntryModel);
    this.settings.mapToClass(DiffSettingsModel);

    // Handle database errors
    this.on("blocked", () => {});
    this.on("versionchange", () => {});
  }
}

/**
 * Diff entry model class
 */
class DiffEntryModel implements DiffEntry {
  id!: string;
  originalText!: string;
  modifiedText!: string;
  viewMode!: "side-by-side" | "unified";
  diffOptions!: DiffOptions;
  timestamp!: string;
  title?: string;
  mergedText?: string;
}

/**
 * Diff settings model class
 */
class DiffSettingsModel implements DiffSettings {
  id!: string;
  defaultViewMode!: "side-by-side" | "unified";
  defaultOptions!: DiffOptions;
  theme?: "light" | "dark" | "auto";
  lineNumbers?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the text diff v2 database
 */
export const textDiff2Db = new TextDiffDatabase();

// ============================================================================
// TEXT DIFF V2 SERVICE CLASS
// ============================================================================

/**
 * Service class for managing text diff v2 operations
 * Provides a clean API for CRUD operations on diff history
 */
export class TextDiffService {
  // ========================================================================
  // READ OPERATIONS
  // ========================================================================

  /**
   * Get all diff entries sorted by timestamp (newest first)
   * @returns Promise<DiffEntry[]> - Array of all entries
   */
  async getAllEntries(): Promise<DiffEntry[]> {
    try {
      return await textDiff2Db.entries.orderBy("timestamp").reverse().toArray();
    } catch {
      return [];
    }
  }

  /**
   * Get recent diff entries with a limit
   * @param limit - Maximum number of entries to return
   * @returns Promise<DiffEntry[]> - Array of recent entries
   */
  async getRecentEntries(limit: number = 50): Promise<DiffEntry[]> {
    try {
      return await textDiff2Db.entries
        .orderBy("timestamp")
        .reverse()
        .limit(limit)
        .toArray();
    } catch {
      return [];
    }
  }

  /**
   * Get a single diff entry by ID
   * @param id - The entry ID
   * @returns Promise<DiffEntry | undefined> - The entry or undefined
   */
  async getEntry(id: string): Promise<DiffEntry | undefined> {
    try {
      return await textDiff2Db.entries.get(id);
    } catch {
      return undefined;
    }
  }

  /**
   * Get user settings
   * @returns Promise<DiffSettings | undefined> - The settings or undefined
   */
  async getSettings(): Promise<DiffSettings | undefined> {
    try {
      const settings = await textDiff2Db.settings.get("default");
      if (!settings) {
        // Return default settings if none exist
        return {
          id: "default",
          defaultViewMode: "side-by-side",
          defaultOptions: {
            ignoreCase: false,
            ignoreWhitespace: false,
            context: 3,
          },
          lineNumbers: true,
          wordWrap: false,
          fontSize: 14,
        };
      }
      return settings;
    } catch {
      return undefined;
    }
  }

  // ========================================================================
  // WRITE OPERATIONS
  // ========================================================================

  /**
   * Add a new diff entry to history
   * @param entry - The diff entry data (without id and timestamp)
   * @returns Promise<DiffEntry> - The created entry
   */
  async addEntry(
    entry: Omit<DiffEntry, "id" | "timestamp">,
  ): Promise<DiffEntry> {
    try {
      const now = new Date().toISOString();
      const id = nanoid(10);

      const newEntry: DiffEntry = {
        id,
        timestamp: now,
        ...entry,
      };

      await textDiff2Db.entries.add(newEntry);
      return newEntry;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing diff entry
   * @param id - The entry ID
   * @param updates - Partial entry data to update
   * @returns Promise<boolean> - True if updated successfully
   */
  async updateEntry(
    id: string,
    updates: Partial<Omit<DiffEntry, "id" | "timestamp">>,
  ): Promise<boolean> {
    try {
      const count = await textDiff2Db.entries.update(id, updates);
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Save user settings
   * @param settings - The settings to save
   * @returns Promise<boolean> - True if saved successfully
   */
  async saveSettings(settings: Omit<DiffSettings, "id">): Promise<boolean> {
    try {
      await textDiff2Db.settings.put({ id: "default", ...settings });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all diff history
   * @returns Promise<number> - Number of entries deleted
   */
  async clearHistory(): Promise<number> {
    try {
      const count = await textDiff2Db.entries.count();
      await textDiff2Db.entries.clear();
      return count;
    } catch {
      return 0;
    }
  }

  /**
   * Delete a specific entry by ID
   * @param id - The entry ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async deleteEntry(id: string): Promise<boolean> {
    try {
      const entry = await textDiff2Db.entries.get(id);
      if (!entry) return false;
      await textDiff2Db.entries.delete(id);
      return true;
    } catch {
      return false;
    }
  }

  // ========================================================================
  // UTILITY OPERATIONS
  // ========================================================================

  /**
   * Get the count of total entries
   * @returns Promise<number> - Total number of entries
   */
  async getEntryCount(): Promise<number> {
    try {
      return await textDiff2Db.entries.count();
    } catch {
      return 0;
    }
  }

  /**
   * Delete old entries beyond a certain limit
   * @param limit - Number of entries to keep (newest)
   * @returns Promise<number> - Number of entries deleted
   */
  async deleteOldEntries(limit: number = 100): Promise<number> {
    try {
      const allEntries = await textDiff2Db.entries
        .orderBy("timestamp")
        .reverse()
        .toArray();

      if (allEntries.length <= limit) {
        return 0;
      }

      const entriesToDelete = allEntries.slice(limit);
      const idsToDelete = entriesToDelete.map((entry) => entry.id);
      await textDiff2Db.entries.bulkDelete(idsToDelete);
      return entriesToDelete.length;
    } catch {
      return 0;
    }
  }

  /**
   * Cleanup and remove the database
   * @returns Promise<void>
   */
  async cleanup(): Promise<void> {
    await textDiff2Db.delete();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of the text diff v2 service
 * Use this instance throughout the app for consistency
 */
export const textDiffService = new TextDiffService();
