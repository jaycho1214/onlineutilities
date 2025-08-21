/**
 * Base Database Service Class
 *
 * This abstract base class provides common functionality for all database services.
 * It eliminates code duplication and standardizes patterns across the application.
 *
 * @template TModel - The database model interface
 * @template TDB - The Dexie database instance type
 */

import { nanoid } from "nanoid";
import type Dexie from "dexie";

export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Abstract base service class that provides common database operations
 */
export abstract class BaseService<TModel extends BaseModel, TDB extends Dexie> {
  protected abstract db: TDB;
  protected abstract tableName: string;

  // ========================================================================
  // COMMON UTILITY METHODS
  // ========================================================================

  /**
   * Generate a unique ID using nanoid
   * @param size - ID size (default: 10)
   * @returns Generated ID
   */
  protected generateId(size: number = 10): string {
    return nanoid(size);
  }

  /**
   * Get current ISO timestamp
   * @returns Current timestamp as ISO string
   */
  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Safe error handling with logging
   * @param operation - Operation name for logging
   * @param error - The error that occurred
   * @param fallback - Fallback value to return
   */
  protected handleError<T>(operation: string, error: unknown, fallback: T): T {
    console.error(`Failed to ${operation}:`, error);
    return fallback;
  }

  /**
   * Dispatch custom event for service operations
   * @param eventName - Name of the event
   * @param detail - Event detail data
   */
  protected dispatchEvent(eventName: string, detail?: unknown): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  }

  /**
   * Get table reference for database operations
   * @returns Dexie table reference
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected getTable(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.db as any)[this.tableName];
  }

  // ========================================================================
  // COMMON CRUD OPERATIONS
  // ========================================================================

  /**
   * Get all entries sorted by creation time (newest first)
   * @returns Promise<TModel[]>
   */
  async getAll(): Promise<TModel[]> {
    try {
      return await this.getTable().orderBy("createdAt").reverse().toArray();
    } catch (error) {
      return this.handleError("get all entries", error, []);
    }
  }

  /**
   * Get entry by ID
   * @param id - Entry ID
   * @returns Promise<TModel | undefined>
   */
  async getById(id: string): Promise<TModel | undefined> {
    try {
      return await this.getTable().get(id);
    } catch (error) {
      return this.handleError(`get entry ${id}`, error, undefined);
    }
  }

  /**
   * Get recent entries with limit
   * @param limit - Maximum entries to return (default: 50)
   * @returns Promise<TModel[]>
   */
  async getRecent(limit: number = 50): Promise<TModel[]> {
    try {
      return await this.getTable()
        .orderBy("createdAt")
        .reverse()
        .limit(limit)
        .toArray();
    } catch (error) {
      return this.handleError("get recent entries", error, []);
    }
  }

  /**
   * Get total count of entries
   * @returns Promise<number>
   */
  async getCount(): Promise<number> {
    try {
      return await this.getTable().count();
    } catch (error) {
      return this.handleError("get count", error, 0);
    }
  }

  /**
   * Delete entry by ID
   * @param id - Entry ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      const entry = await this.getById(id);
      if (!entry) return false;

      await this.getTable().delete(id);
      this.dispatchEvent(`${this.tableName}Deleted`, { id });
      return true;
    } catch (error) {
      return this.handleError(`delete entry ${id}`, error, false);
    }
  }

  /**
   * Clear all entries
   * @returns Promise<number> - Number of entries deleted
   */
  async clearAll(): Promise<number> {
    try {
      const count = await this.getCount();
      await this.getTable().clear();
      this.dispatchEvent(`all${this.capitalize(this.tableName)}Deleted`, {
        count,
      });
      return count;
    } catch (error) {
      return this.handleError("clear all entries", error, 0);
    }
  }

  /**
   * Delete old entries beyond a limit
   * @param limit - Number of entries to keep (newest)
   * @returns Promise<number> - Number of entries deleted
   */
  async deleteOldEntries(limit: number = 100): Promise<number> {
    try {
      const totalCount = await this.getCount();

      if (totalCount <= limit) {
        return 0;
      }

      const entriesToDelete = await this.getTable()
        .orderBy("createdAt")
        .offset(0)
        .limit(totalCount - limit)
        .primaryKeys();

      if (entriesToDelete.length > 0) {
        await this.getTable().bulkDelete(entriesToDelete);
      }

      return entriesToDelete.length;
    } catch (error) {
      return this.handleError("delete old entries", error, 0);
    }
  }

  /**
   * Cleanup and remove the database
   * @returns Promise<void>
   */
  async cleanup(): Promise<void> {
    try {
      await this.db.delete();
    } catch (error) {
      console.error("Failed to cleanup database:", error);
    }
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Capitalize first letter of string
   * @param str - String to capitalize
   * @returns Capitalized string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Create base model with timestamps
   * @param data - Partial model data
   * @param id - Optional ID (will generate if not provided)
   * @returns Model with id and timestamps
   */
  protected createBaseModel(
    data: Omit<TModel, "id" | "createdAt" | "updatedAt">,
    id?: string,
  ): TModel {
    const now = this.getCurrentTimestamp();
    return {
      ...data,
      id: id || this.generateId(),
      createdAt: now,
      updatedAt: now,
    } as TModel;
  }

  /**
   * Update model with new timestamp
   * @param existing - Existing model
   * @param updates - Updates to apply
   * @returns Updated model
   */
  protected updateModel(
    existing: TModel,
    updates: Partial<Omit<TModel, "id" | "createdAt">>,
  ): TModel {
    return {
      ...existing,
      ...updates,
      updatedAt: this.getCurrentTimestamp(),
    };
  }

  // ========================================================================
  // ABSTRACT METHODS (must be implemented by subclasses)
  // ========================================================================

  /**
   * Search entries based on query
   * Must be implemented by subclasses based on their specific search needs
   * @param query - Search query
   * @param limit - Maximum results to return
   * @returns Promise<TModel[]>
   */
  abstract search(query: string, limit?: number): Promise<TModel[]>;
}

/**
 * Utility type for creating service model types with required base fields
 */
export type ServiceModel<T = Record<string, never>> = BaseModel & T;

/**
 * Utility type for create operations (excludes id and timestamps)
 */
export type CreateInput<T extends BaseModel> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Utility type for update operations (excludes id and createdAt)
 */
export type UpdateInput<T extends BaseModel> = Partial<
  Omit<T, "id" | "createdAt">
>;
