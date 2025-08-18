/**
 * Formatter Database Module
 *
 * This module handles all database operations for the formatter feature.
 * It provides a clean interface for managing formatting history with Dexie.js.
 */

import Dexie, { type EntityTable } from "dexie";
import { nanoid } from "nanoid";
import type { FormatterEntry } from "../types";

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Formatter database class extending Dexie
 */
class FormatterDatabase extends Dexie {
  entries!: EntityTable<FormatterEntry, "id">;

  constructor() {
    super("formatterdb");

    this.version(1).stores({
      entries: "id, type, timestamp, operation",
    });

    this.entries.mapToClass(FormatterEntryModel);
    
    // Handle database errors
    this.on("blocked", () => {
      
    });
    
    this.on("versionchange", () => {
      
    });
  }
}

/**
 * Formatter entry model class (optional, for adding methods to entry instances)
 */
class FormatterEntryModel implements FormatterEntry {
  id!: string;
  type!: FormatterEntry["type"];
  input!: string;
  output!: string;
  operation!: FormatterEntry["operation"];
  timestamp!: string;
  isValid!: boolean;
  delimiter?: FormatterEntry["delimiter"];
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the formatter database
 */
export const formatterDb = new FormatterDatabase();

// ============================================================================
// FORMATTER SERVICE CLASS
// ============================================================================

/**
 * Service class for managing formatter operations
 * Provides a clean API for CRUD operations on formatting history
 */
export class FormatterService {
  // ========================================================================
  // READ OPERATIONS
  // ========================================================================

  /**
   * Get all formatting history sorted by timestamp (newest first)
   * @returns Promise<FormatterEntry[]> - Array of all entries
   */
  async getAllEntries(): Promise<FormatterEntry[]> {
    try {
      return await formatterDb.entries.orderBy("timestamp").reverse().toArray();
    } catch {
      
      return [];
    }
  }

  /**
   * Get recent formatting entries with a limit
   * @param limit - Maximum number of entries to return
   * @returns Promise<FormatterEntry[]> - Array of recent entries
   */
  async getRecentEntries(limit: number = 50): Promise<FormatterEntry[]> {
    try {
      return await formatterDb.entries
        .orderBy("timestamp")
        .reverse()
        .limit(limit)
        .toArray();
    } catch {
      
      return [];
    }
  }

  /**
   * Get entries by type
   * @param type - The formatter type to filter by
   * @param limit - Maximum number of entries to return
   * @returns Promise<FormatterEntry[]> - Array of entries for the specified type
   */
  async getEntriesByType(
    type: FormatterEntry["type"],
    limit: number = 50
  ): Promise<FormatterEntry[]> {
    try {
      return await formatterDb.entries
        .where("type")
        .equals(type)
        .orderBy("timestamp")
        .reverse()
        .limit(limit)
        .toArray();
    } catch {
      
      return [];
    }
  }

  /**
   * Get entries by operation type
   * @param operation - The operation type to filter by
   * @param limit - Maximum number of entries to return
   * @returns Promise<FormatterEntry[]> - Array of entries for the specified operation
   */
  async getEntriesByOperation(
    operation: FormatterEntry["operation"],
    limit: number = 50
  ): Promise<FormatterEntry[]> {
    try {
      return await formatterDb.entries
        .where("operation")
        .equals(operation)
        .orderBy("timestamp")
        .reverse()
        .limit(limit)
        .toArray();
    } catch {
      
      return [];
    }
  }

  // ========================================================================
  // WRITE OPERATIONS
  // ========================================================================

  /**
   * Add a new formatting entry to history
   * @param entry - The formatter entry data (without id and timestamp)
   * @returns Promise<FormatterEntry> - The created entry
   */
  async addEntry(
    entry: Omit<FormatterEntry, "id" | "timestamp">
  ): Promise<FormatterEntry> {
    try {
      const now = new Date().toISOString();
      const id = nanoid(10);

      const newEntry: FormatterEntry = {
        id,
        timestamp: now,
        ...entry,
      };

      await formatterDb.entries.add(newEntry);
      
      return newEntry;
    } catch {
      
      throw error;
    }
  }

  /**
   * Update an existing formatting entry
   * @param id - The entry ID
   * @param updates - Partial entry data to update
   * @returns Promise<boolean> - True if updated successfully
   */
  async updateEntry(
    id: string,
    updates: Partial<Omit<FormatterEntry, "id" | "timestamp">>
  ): Promise<boolean> {
    try {
      const count = await formatterDb.entries.update(id, updates);
      return count > 0;
    } catch {
      
      return false;
    }
  }

  /**
   * Clear all formatting history
   * @returns Promise<number> - Number of entries deleted
   */
  async clearHistory(): Promise<number> {
    try {
      const count = await formatterDb.entries.count();
      await formatterDb.entries.clear();
      
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
      const entry = await formatterDb.entries.get(id);

      if (!entry) return false;

      await formatterDb.entries.delete(id);

      return true;
    } catch {
      
      return false;
    }
  }

  /**
   * Delete entries by type
   * @param type - The formatter type
   * @returns Promise<number> - Number of entries deleted
   */
  async deleteEntriesByType(type: FormatterEntry["type"]): Promise<number> {
    try {
      return await formatterDb.entries.where("type").equals(type).delete();
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
      const allEntries = await formatterDb.entries
        .orderBy("timestamp")
        .reverse()
        .toArray();

      if (allEntries.length <= limit) {
        return 0;
      }

      const entriesToDelete = allEntries.slice(limit);
      const idsToDelete = entriesToDelete.map(entry => entry.id);

      await formatterDb.entries.bulkDelete(idsToDelete);

      return entriesToDelete.length;
    } catch {
      
      return 0;
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
      return await formatterDb.entries.count();
    } catch {
      
      return 0;
    }
  }

  /**
   * Get count by type
   * @param type - The formatter type
   * @returns Promise<number> - Number of entries for the type
   */
  async getCountByType(type: FormatterEntry["type"]): Promise<number> {
    try {
      return await formatterDb.entries.where("type").equals(type).count();
    } catch {
      
      return 0;
    }
  }

  /**
   * Get statistics about the database
   * @returns Promise<object> - Database statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byType: Record<FormatterEntry["type"], number>;
    byOperation: Record<FormatterEntry["operation"], number>;
  }> {
    try {
      const [total, jsonCount, csvCount, xmlCount, formatCount, validateCount, minifyCount] = await Promise.all([
        this.getEntryCount(),
        this.getCountByType("json"),
        this.getCountByType("csv"),
        this.getCountByType("xml"),
        formatterDb.entries.where("operation").equals("format").count(),
        formatterDb.entries.where("operation").equals("validate").count(),
        formatterDb.entries.where("operation").equals("minify").count(),
      ]);

      return {
        total,
        byType: {
          json: jsonCount,
          csv: csvCount,
          xml: xmlCount,
        },
        byOperation: {
          format: formatCount,
          validate: validateCount,
          minify: minifyCount,
        },
      };
    } catch {
      
      return {
        total: 0,
        byType: { json: 0, csv: 0, xml: 0 },
        byOperation: { format: 0, validate: 0, minify: 0 },
      };
    }
  }

  /**
   * Cleanup and remove the database
   * @returns Promise<void>
   */
  async cleanup(): Promise<void> {
    await formatterDb.delete();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of the formatter service
 * Use this instance throughout the app for consistency
 */
export const formatterService = new FormatterService();