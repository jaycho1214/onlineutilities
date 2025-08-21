/**
 * Formatter Service Module
 *
 * This module provides a clean interface for managing formatter operations.
 * It uses the base service pattern for consistent database operations.
 */

import { BaseService } from "@/lib/base-service";
import { formatterDb } from "@/features/formatter/lib/formatter-db";
import type { FormatterEntryModel } from "@/features/formatter/types";

// ============================================================================
// FORMATTER SERVICE CLASS
// ============================================================================

/**
 * Service class for managing formatter operations
 * Extends BaseService for common database operations
 */
export class FormatterService extends BaseService<
  FormatterEntryModel,
  typeof formatterDb
> {
  protected db = formatterDb;
  protected tableName = "entries";
  // ========================================================================
  // READ OPERATIONS
  // ========================================================================

  /**
   * Get all formatting history sorted by timestamp (newest first)
   * @returns Promise<FormatterEntryModel[]> - Array of all entries
   */
  async getAllEntries(): Promise<FormatterEntryModel[]> {
    return this.getAll();
  }

  /**
   * Get recent formatting entries with a limit
   * @param limit - Maximum number of entries to return
   * @returns Promise<FormatterEntryModel[]> - Array of recent entries
   */
  async getRecentEntries(limit: number = 50): Promise<FormatterEntryModel[]> {
    return this.getRecent(limit);
  }

  /**
   * Get entries by type
   * @param type - The formatter type to filter by
   * @param limit - Maximum number of entries to return
   * @returns Promise<FormatterEntryModel[]> - Array of entries for the specified type
   */
  async getEntriesByType(
    type: FormatterEntryModel["type"],
    limit: number = 50,
  ): Promise<FormatterEntryModel[]> {
    try {
      return await formatterDb.entries
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
   * @returns Promise<FormatterEntryModel[]> - Array of entries for the specified operation
   */
  async getEntriesByOperation(
    operation: FormatterEntryModel["operation"],
    limit: number = 50,
  ): Promise<FormatterEntryModel[]> {
    try {
      return await formatterDb.entries
        .orderBy("timestamp")
        .reverse()
        .filter((entry) => entry.operation === operation)
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
   * @returns Promise<FormatterEntryModel> - The created entry
   */
  async addEntry(
    entry: Omit<FormatterEntryModel, "id" | "createdAt" | "updatedAt">,
  ): Promise<FormatterEntryModel> {
    try {
      const newEntry = this.createBaseModel(entry);
      await this.getTable().add(newEntry);
      this.dispatchEvent("formatterEntryAdded", newEntry);
      return newEntry;
    } catch (error) {
      console.error("Failed to add formatter entry:", error);
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
    updates: Partial<Omit<FormatterEntryModel, "id" | "createdAt">>,
  ): Promise<boolean> {
    try {
      const existing = await this.getById(id);
      if (!existing) return false;

      const updatedEntry = this.updateModel(existing, updates);
      await this.getTable().put(updatedEntry);
      this.dispatchEvent("formatterEntryUpdated", updatedEntry);

      return true;
    } catch (error) {
      return this.handleError(`update entry ${id}`, error, false);
    }
  }

  /**
   * Clear all formatting history
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
   * Delete entries by type
   * @param type - The formatter type
   * @returns Promise<number> - Number of entries deleted
   */
  async deleteEntriesByType(
    type: FormatterEntryModel["type"],
  ): Promise<number> {
    try {
      return await formatterDb.entries.where("type").equals(type).delete();
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
   * Search entries by content - implements base service search method
   * @param query - Search query
   * @param limit - Maximum results to return
   * @returns Promise<FormatterEntryModel[]>
   */
  async search(
    query: string,
    limit: number = 20,
  ): Promise<FormatterEntryModel[]> {
    if (!query.trim()) {
      return this.getRecent(limit);
    }

    try {
      const searchLower = query.toLowerCase();
      const allEntries = await this.getAll();

      return allEntries
        .filter(
          (entry) =>
            entry.input.toLowerCase().includes(searchLower) ||
            entry.output.toLowerCase().includes(searchLower) ||
            entry.type.toLowerCase().includes(searchLower),
        )
        .slice(0, limit);
    } catch (error) {
      return this.handleError("search entries", error, []);
    }
  }

  /**
   * Get count by type
   * @param type - The formatter type
   * @returns Promise<number> - Number of entries for the type
   */
  async getCountByType(type: FormatterEntryModel["type"]): Promise<number> {
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
    byType: Record<FormatterEntryModel["type"], number>;
    byOperation: Record<FormatterEntryModel["operation"], number>;
  }> {
    try {
      const [
        total,
        jsonCount,
        csvCount,
        xmlCount,
        javascriptCount,
        htmlCount,
        yamlCount,
        cssCount,
        sqlCount,
        formatCount,
        validateCount,
        minifyCount,
      ] = await Promise.all([
        this.getEntryCount(),
        this.getCountByType("json"),
        this.getCountByType("csv"),
        this.getCountByType("xml"),
        this.getCountByType("javascript"),
        this.getCountByType("html"),
        this.getCountByType("yaml"),
        this.getCountByType("css"),
        this.getCountByType("sql"),
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
          javascript: javascriptCount,
          html: htmlCount,
          yaml: yamlCount,
          css: cssCount,
          sql: sqlCount,
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
        byType: {
          json: 0,
          csv: 0,
          xml: 0,
          javascript: 0,
          html: 0,
          yaml: 0,
          css: 0,
          sql: 0,
        },
        byOperation: { format: 0, validate: 0, minify: 0 },
      };
    }
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
