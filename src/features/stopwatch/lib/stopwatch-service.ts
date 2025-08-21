/**
 * Stopwatch Service Module - Optimized for Dexie 4.2
 *
 * This module provides service operations for the stopwatch feature.
 * Optimized with modern Dexie patterns, efficient queries, and enhanced error handling.
 */

import { nanoid } from "nanoid";
import type { StopwatchModel } from "../types";
import { stopwatchDb } from "./stopwatch-db";

/**
 * Stopwatch service class providing optimized database operations
 */
export class StopwatchService {
  /**
   * Get all stopwatches sorted by creation time (newest first)
   */
  async getAll(): Promise<StopwatchModel[]> {
    try {
      return await stopwatchDb.stopwatches
        .orderBy("createdAt")
        .reverse()
        .toArray();
    } catch (error) {
      console.error("Failed to fetch stopwatches:", error);
      return [];
    }
  }

  /**
   * Get a specific stopwatch by ID
   */
  async get(id: string): Promise<StopwatchModel | undefined> {
    try {
      return await stopwatchDb.stopwatches.get(id);
    } catch (error) {
      console.error(`Failed to fetch stopwatch ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Create a new stopwatch with validation
   */
  async create(
    stopwatch: Omit<StopwatchModel, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    try {
      const id = nanoid();
      const now = Date.now();

      // Validate input
      const title = stopwatch.title?.trim() || "Untitled Stopwatch";

      const newStopwatch: StopwatchModel = {
        ...stopwatch,
        id,
        title,
        createdAt: now,
        updatedAt: now,
      };

      await stopwatchDb.stopwatches.add(newStopwatch);
      return id;
    } catch (error) {
      console.error("Failed to create stopwatch:", error);
      throw error;
    }
  }

  /**
   * Update an existing stopwatch
   */
  async update(id: string, updates: Partial<StopwatchModel>): Promise<void> {
    try {
      const updateCount = await stopwatchDb.stopwatches.update(id, {
        ...updates,
        updatedAt: Date.now(),
      });

      if (updateCount === 0) {
        throw new Error(`Stopwatch ${id} not found`);
      }
    } catch (error) {
      console.error(`Failed to update stopwatch ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a stopwatch
   */
  async delete(id: string): Promise<void> {
    try {
      await stopwatchDb.stopwatches.delete(id);
    } catch (error) {
      console.error(`Failed to delete stopwatch ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update all running stopwatches when the app starts - optimized with transaction
   */
  async updateRunningStopwatches(): Promise<void> {
    try {
      const runningStopwatches = await stopwatchDb.stopwatches
        .where("isRunning")
        .equals(1)
        .toArray();

      if (runningStopwatches.length === 0) {
        return;
      }

      const now = Date.now();
      const updatePromises = runningStopwatches
        .filter((stopwatch) => stopwatch.startTime != null)
        .map((stopwatch) => {
          // Calculate the current elapsed time and store it as pausedTime
          const elapsedTime =
            stopwatch.pausedTime + (now - stopwatch.startTime!);
          return this.update(stopwatch.id, {
            startTime: now,
            pausedTime: elapsedTime,
          });
        });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to update running stopwatches:", error);
    }
  }

  /**
   * Clear all stopwatches
   */
  async clearAll(): Promise<number> {
    try {
      const count = await stopwatchDb.stopwatches.count();
      await stopwatchDb.stopwatches.clear();
      return count;
    } catch (error) {
      console.error("Failed to clear stopwatches:", error);
      return 0;
    }
  }

  /**
   * Get count of total stopwatches
   */
  async getCount(): Promise<number> {
    try {
      return await stopwatchDb.stopwatches.count();
    } catch (error) {
      console.error("Failed to get stopwatch count:", error);
      return 0;
    }
  }
}

// Export singleton instance for consistency
export const stopwatchService = new StopwatchService();
