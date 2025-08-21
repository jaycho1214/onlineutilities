/**
 * Encoder/Decoder Service Module - Optimized for Dexie 4.2
 *
 * This module provides service operations for the encoder/decoder feature.
 * Uses base service pattern for consistent database operations.
 */

import { BaseService } from "@/lib/base-service";
import type { EncoderDecoderEntryModel } from "@/features/encoder-decoder/types";
import { encoderDecoderDb } from "@/features/encoder-decoder/lib/encoder-decoder-db";

// ============================================================================
// ENCODER/DECODER SERVICE CLASS
// ============================================================================

/**
 * Service class for managing encoder/decoder operations
 * Extends BaseService for common database operations
 */
export class EncoderDecoderService extends BaseService<
  EncoderDecoderEntryModel,
  typeof encoderDecoderDb
> {
  protected db = encoderDecoderDb;
  protected tableName = "entries";
  // ========================================================================
  // READ OPERATIONS
  // ========================================================================

  /**
   * Get all encoding/decoding history sorted by timestamp (newest first)
   * @returns Promise<EncoderDecoderEntryModel[]> - Array of all entries
   */
  async getAllEntries(): Promise<EncoderDecoderEntryModel[]> {
    return this.getAll();
  }

  /**
   * Get recent encoding/decoding entries with a limit
   * @param limit - Maximum number of entries to return
   * @returns Promise<EncoderDecoderEntryModel[]> - Array of recent entries
   */
  async getRecentEntries(
    limit: number = 50,
  ): Promise<EncoderDecoderEntryModel[]> {
    return this.getRecent(limit);
  }

  /**
   * Get entries by encoding type - optimized with indexed query
   * @param type - The encoding type to filter by
   * @param limit - Maximum number of entries to return
   * @returns Promise<EncoderDecoderEntryModel[]> - Array of entries for the specified type
   */
  async getEntriesByType(
    type: EncoderDecoderEntryModel["type"],
    limit: number = 50,
  ): Promise<EncoderDecoderEntryModel[]> {
    try {
      return await encoderDecoderDb.entries
        .where("type")
        .equals(type)
        .reverse()
        .sortBy("timestamp")
        .then((entries) => entries.slice(0, limit));
    } catch (error) {
      console.error(`Failed to get entries by type ${type}:`, error);
      return [];
    }
  }

  /**
   * Get entries by operation type - optimized with indexed query
   * @param operation - The operation type to filter by
   * @param limit - Maximum number of entries to return
   * @returns Promise<EncoderDecoderEntryModel[]> - Array of entries for the specified operation
   */
  async getEntriesByOperation(
    operation: EncoderDecoderEntryModel["operation"],
    limit: number = 50,
  ): Promise<EncoderDecoderEntryModel[]> {
    try {
      return await encoderDecoderDb.entries
        .where("operation")
        .equals(operation)
        .reverse()
        .sortBy("timestamp")
        .then((entries) => entries.slice(0, limit));
    } catch (error) {
      console.error(`Failed to get entries by operation ${operation}:`, error);
      return [];
    }
  }

  /**
   * Get entries by type and operation
   * @param type - The encoding type to filter by
   * @param operation - The operation type to filter by
   * @param limit - Maximum number of entries to return
   * @returns Promise<EncoderDecoderEntryModel[]> - Array of entries matching both filters
   */
  async getEntriesByTypeAndOperation(
    type: EncoderDecoderEntryModel["type"],
    operation: EncoderDecoderEntryModel["operation"],
    limit: number = 50,
  ): Promise<EncoderDecoderEntryModel[]> {
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
   * Add a new encoding/decoding entry to history - optimized with validation
   * @param entry - The encoder/decoder entry data (without id and timestamp)
   * @returns Promise<EncoderDecoderEntryModel> - The created entry
   */
  async addEntry(
    entry: Omit<EncoderDecoderEntryModel, "id" | "createdAt">,
  ): Promise<EncoderDecoderEntryModel> {
    try {
      // Validate entry data
      if (!entry.input && !entry.output) {
        throw new Error("Entry must have either input or output data");
      }

      const newEntry = this.createBaseModel({
        ...entry,
        input: entry.input?.trim() || "",
        output: entry.output?.trim() || "",
      });

      await this.getTable().add(newEntry);
      this.dispatchEvent("encoderDecoderEntryAdded", newEntry);

      return newEntry;
    } catch (error) {
      console.error("Failed to add entry:", error);
      throw error;
    }
  }

  /**
   * Update an existing encoding/decoding entry - optimized with validation
   * @param id - The entry ID
   * @param updates - Partial entry data to update
   * @returns Promise<boolean> - True if updated successfully
   */
  async updateEntry(
    id: string,
    updates: Partial<Omit<EncoderDecoderEntryModel, "id" | "createdAt">>,
  ): Promise<boolean> {
    try {
      // Validate updates
      if (Object.keys(updates).length === 0) {
        return false;
      }

      const existing = await this.getById(id);
      if (!existing) return false;

      const updatedEntry = this.updateModel(existing, updates);
      await this.getTable().put(updatedEntry);
      this.dispatchEvent("encoderDecoderEntryUpdated", updatedEntry);

      return true;
    } catch (error) {
      return this.handleError(`update entry ${id}`, error, false);
    }
  }

  /**
   * Clear all encoding/decoding history
   * @returns Promise<number> - Number of entries deleted
   */
  async clearHistory(): Promise<number> {
    return this.clearAll();
  }

  /**
   * Delete a specific entry by ID
   * @param id - The entry ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async deleteEntry(id: string): Promise<boolean> {
    return this.deleteById(id);
  }

  /**
   * Delete entries by encoding type
   * @param type - The encoding type
   * @returns Promise<number> - Number of entries deleted
   */
  async deleteEntriesByType(
    type: EncoderDecoderEntryModel["type"],
  ): Promise<number> {
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
  async deleteEntriesByOperation(
    operation: EncoderDecoderEntryModel["operation"],
  ): Promise<number> {
    try {
      return await encoderDecoderDb.entries
        .where("operation")
        .equals(operation)
        .delete();
    } catch {
      return 0;
    }
  }

  /**
   * Delete old entries beyond a certain limit - uses base service implementation
   * @param limit - Number of entries to keep (newest)
   * @returns Promise<number> - Number of entries deleted
   */
  async deleteOldEntries(limit: number = 100): Promise<number> {
    return super.deleteOldEntries(limit);
  }

  // ========================================================================
  // UTILITY OPERATIONS
  // ========================================================================

  /**
   * Get the count of total entries
   * @returns Promise<number> - Total number of entries
   */
  async getEntryCount(): Promise<number> {
    return this.getCount();
  }

  /**
   * Get count by encoding type
   * @param type - The encoding type
   * @returns Promise<number> - Number of entries for the type
   */
  async getCountByType(
    type: EncoderDecoderEntryModel["type"],
  ): Promise<number> {
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
  async getCountByOperation(
    operation: EncoderDecoderEntryModel["operation"],
  ): Promise<number> {
    try {
      return await encoderDecoderDb.entries
        .where("operation")
        .equals(operation)
        .count();
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
        "base64",
        "url",
        "html-entity",
        "hex",
        "base32",
        "ascii",
        "binary",
        "unicode-escape",
        "punycode",
        "base58",
        "rot13",
        "morse-code",
        "uri-component",
        "form-data",
        "cookie",
      ];

      const byType: Record<string, number> = {};
      for (const type of types) {
        byType[type] = await this.getCountByType(
          type as EncoderDecoderEntryModel["type"],
        );
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
   * Search entries by input or output content - implements base service search method
   * @param query - Search query
   * @param limit - Maximum number of entries to return
   * @returns Promise<EncoderDecoderEntryModel[]> - Array of matching entries
   */
  async search(
    query: string,
    limit: number = 20,
  ): Promise<EncoderDecoderEntryModel[]> {
    try {
      if (!query.trim()) {
        return this.getRecentEntries(limit);
      }

      const lowercaseQuery = query.toLowerCase();
      const searchTerms = lowercaseQuery.split(/\s+/).filter(Boolean);
      const allEntries = await this.getAll();

      return allEntries
        .filter((entry) => {
          const inputLower = entry.input.toLowerCase();
          const outputLower = entry.output.toLowerCase();

          // Match all search terms in either input or output
          return searchTerms.every(
            (term) => inputLower.includes(term) || outputLower.includes(term),
          );
        })
        .slice(0, limit);
    } catch (error) {
      return this.handleError("search entries", error, []);
    }
  }

  /**
   * Backward compatibility method
   * @param query - Search query
   * @param limit - Maximum number of entries to return
   * @returns Promise<EncoderDecoderEntryModel[]> - Array of matching entries
   */
  async searchEntries(
    query: string,
    limit: number = 20,
  ): Promise<EncoderDecoderEntryModel[]> {
    return this.search(query, limit);
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
