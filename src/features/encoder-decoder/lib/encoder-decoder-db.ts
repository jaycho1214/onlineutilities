/**
 * Encoder/Decoder Database Module
 * 
 * This module handles all database operations for the encoder/decoder feature.
 * It provides a clean interface for managing encoding/decoding history with Dexie.js.
 */

import Dexie, { type EntityTable } from "dexie";
import { nanoid } from "nanoid";
import type { EncoderDecoderEntry } from "../types";

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Encoder/Decoder database class extending Dexie
 */
class EncoderDecoderDatabase extends Dexie {
  entries!: EntityTable<EncoderDecoderEntry, "id">;

  constructor() {
    super("encoderDecoderDb");

    this.version(1).stores({
      entries: "id, type, operation, timestamp",
    });

    this.entries.mapToClass(EncoderDecoderEntryModel);

    // Handle database errors
    this.on("blocked", () => {});

    this.on("versionchange", () => {});
  }
}

/**
 * Encoder/Decoder entry model class (optional, for adding methods to entry instances)
 */
class EncoderDecoderEntryModel implements EncoderDecoderEntry {
  id!: string;
  type!: EncoderDecoderEntry["type"];
  input!: string;
  output!: string;
  operation!: EncoderDecoderEntry["operation"];
  timestamp!: string;
  isValid!: boolean;
  error?: string;
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the encoder/decoder database
 */
export const encoderDecoderDb = new EncoderDecoderDatabase();

// ============================================================================
// ENCODER/DECODER SERVICE CLASS
// ============================================================================

/**
 * Service class for managing encoder/decoder operations
 * Provides a clean API for CRUD operations on encoding/decoding history
 */
export class EncoderDecoderService {
  // ========================================================================
  // READ OPERATIONS
  // ========================================================================

  /**
   * Get all encoding/decoding history sorted by timestamp (newest first)
   * @returns Promise<EncoderDecoderEntry[]> - Array of all entries
   */
  async getAllEntries(): Promise<EncoderDecoderEntry[]> {
    try {
      return await encoderDecoderDb.entries.orderBy("timestamp").reverse().toArray();
    } catch {
      return [];
    }
  }

  /**
   * Get recent encoding/decoding entries with a limit
   * @param limit - Maximum number of entries to return
   * @returns Promise<EncoderDecoderEntry[]> - Array of recent entries
   */
  async getRecentEntries(limit: number = 50): Promise<EncoderDecoderEntry[]> {
    try {
      return await encoderDecoderDb.entries
        .orderBy("timestamp")
        .reverse()
        .limit(limit)
        .toArray();
    } catch {
      return [];
    }
  }

  /**
   * Get entries by encoding type
   * @param type - The encoding type to filter by
   * @param limit - Maximum number of entries to return
   * @returns Promise<EncoderDecoderEntry[]> - Array of entries for the specified type
   */
  async getEntriesByType(
    type: EncoderDecoderEntry["type"],
    limit: number = 50,
  ): Promise<EncoderDecoderEntry[]> {
    try {
      return await encoderDecoderDb.entries
        .orderBy("timestamp")
        .reverse()
        .filter((entry) => entry.type === type)
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
   * @returns Promise<EncoderDecoderEntry[]> - Array of entries for the specified operation
   */
  async getEntriesByOperation(
    operation: EncoderDecoderEntry["operation"],
    limit: number = 50,
  ): Promise<EncoderDecoderEntry[]> {
    try {
      return await encoderDecoderDb.entries
        .orderBy("timestamp")
        .reverse()
        .filter((entry) => entry.operation === operation)
        .limit(limit)
        .toArray();
    } catch {
      return [];
    }
  }

  /**
   * Get entries by type and operation
   * @param type - The encoding type to filter by
   * @param operation - The operation type to filter by
   * @param limit - Maximum number of entries to return
   * @returns Promise<EncoderDecoderEntry[]> - Array of entries matching both filters
   */
  async getEntriesByTypeAndOperation(
    type: EncoderDecoderEntry["type"],
    operation: EncoderDecoderEntry["operation"],
    limit: number = 50,
  ): Promise<EncoderDecoderEntry[]> {
    try {
      return await encoderDecoderDb.entries
        .orderBy("timestamp")
        .reverse()
        .filter((entry) => entry.type === type && entry.operation === operation)
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
   * Add a new encoding/decoding entry to history
   * @param entry - The encoder/decoder entry data (without id and timestamp)
   * @returns Promise<EncoderDecoderEntry> - The created entry
   */
  async addEntry(
    entry: Omit<EncoderDecoderEntry, "id" | "timestamp">,
  ): Promise<EncoderDecoderEntry> {
    try {
      const now = new Date().toISOString();
      const id = nanoid(10);

      const newEntry: EncoderDecoderEntry = {
        id,
        timestamp: now,
        ...entry,
      };

      await encoderDecoderDb.entries.add(newEntry);

      return newEntry;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing encoding/decoding entry
   * @param id - The entry ID
   * @param updates - Partial entry data to update
   * @returns Promise<boolean> - True if updated successfully
   */
  async updateEntry(
    id: string,
    updates: Partial<Omit<EncoderDecoderEntry, "id" | "timestamp">>,
  ): Promise<boolean> {
    try {
      const count = await encoderDecoderDb.entries.update(id, updates);
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Clear all encoding/decoding history
   * @returns Promise<number> - Number of entries deleted
   */
  async clearHistory(): Promise<number> {
    try {
      const count = await encoderDecoderDb.entries.count();
      await encoderDecoderDb.entries.clear();

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
      const entry = await encoderDecoderDb.entries.get(id);

      if (!entry) return false;

      await encoderDecoderDb.entries.delete(id);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete entries by encoding type
   * @param type - The encoding type
   * @returns Promise<number> - Number of entries deleted
   */
  async deleteEntriesByType(type: EncoderDecoderEntry["type"]): Promise<number> {
    try {
      return await encoderDecoderDb.entries.where("type").equals(type).delete();
    } catch {
      return 0;
    }
  }

  /**
   * Delete entries by operation
   * @param operation - The operation type
   * @returns Promise<number> - Number of entries deleted
   */
  async deleteEntriesByOperation(operation: EncoderDecoderEntry["operation"]): Promise<number> {
    try {
      return await encoderDecoderDb.entries.where("operation").equals(operation).delete();
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
      const allEntries = await encoderDecoderDb.entries
        .orderBy("timestamp")
        .reverse()
        .toArray();

      if (allEntries.length <= limit) {
        return 0;
      }

      const entriesToDelete = allEntries.slice(limit);
      const idsToDelete = entriesToDelete.map((entry) => entry.id);

      await encoderDecoderDb.entries.bulkDelete(idsToDelete);

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
      return await encoderDecoderDb.entries.count();
    } catch {
      return 0;
    }
  }

  /**
   * Get count by encoding type
   * @param type - The encoding type
   * @returns Promise<number> - Number of entries for the type
   */
  async getCountByType(type: EncoderDecoderEntry["type"]): Promise<number> {
    try {
      return await encoderDecoderDb.entries.where("type").equals(type).count();
    } catch {
      return 0;
    }
  }

  /**
   * Get count by operation
   * @param operation - The operation type
   * @returns Promise<number> - Number of entries for the operation
   */
  async getCountByOperation(operation: EncoderDecoderEntry["operation"]): Promise<number> {
    try {
      return await encoderDecoderDb.entries.where("operation").equals(operation).count();
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
    byType: Record<string, number>;
    byOperation: Record<string, number>;
  }> {
    try {
      const total = await this.getEntryCount();
      const encodeCount = await this.getCountByOperation("encode");
      const decodeCount = await this.getCountByOperation("decode");

      // Get counts by type
      const types = [
        "base64", "url", "html-entity", "hex", "base32", "ascii", "binary",
        "unicode-escape", "punycode", "base58", "rot13", "morse-code",
        "uri-component", "form-data", "cookie"
      ];

      const byType: Record<string, number> = {};
      for (const type of types) {
        byType[type] = await this.getCountByType(type as EncoderDecoderEntry["type"]);
      }

      return {
        total,
        byType,
        byOperation: {
          encode: encodeCount,
          decode: decodeCount,
        },
      };
    } catch {
      return {
        total: 0,
        byType: {},
        byOperation: { encode: 0, decode: 0 },
      };
    }
  }

  /**
   * Search entries by input or output content
   * @param query - Search query
   * @param limit - Maximum number of entries to return
   * @returns Promise<EncoderDecoderEntry[]> - Array of matching entries
   */
  async searchEntries(query: string, limit: number = 20): Promise<EncoderDecoderEntry[]> {
    try {
      const lowercaseQuery = query.toLowerCase();
      return await encoderDecoderDb.entries
        .orderBy("timestamp")
        .reverse()
        .filter((entry) =>
          entry.input.toLowerCase().includes(lowercaseQuery) ||
          entry.output.toLowerCase().includes(lowercaseQuery)
        )
        .limit(limit)
        .toArray();
    } catch {
      return [];
    }
  }

  /**
   * Cleanup and remove the database
   * @returns Promise<void>
   */
  async cleanup(): Promise<void> {
    await encoderDecoderDb.delete();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of the encoder/decoder service
 * Use this instance throughout the app for consistency
 */
export const encoderDecoderService = new EncoderDecoderService();