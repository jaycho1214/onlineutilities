/**
 * Timer Service Module - Optimized for Dexie 4.2
 *
 * This module provides service operations for the timer feature.
 * Optimized with modern Dexie patterns, efficient queries, and enhanced error handling.
 */

import { nanoid } from "nanoid";
import type { TimerModel } from "../types";
import { timerDb } from "./timer-db";

// ============================================================================
// TIMER SERVICE CLASS
// ============================================================================

/**
 * Timer service class providing optimized database operations
 */
export class TimerService {
  /**
   * Get all timers sorted by creation time (newest first)
   */
  async getAllTimers(): Promise<TimerModel[]> {
    try {
      return await timerDb.timers.orderBy("createdAt").reverse().toArray();
    } catch (error) {
      console.error("Failed to fetch timers:", error);
      return [];
    }
  }

  /**
   * Get a specific timer by ID
   */
  async getTimer(id: string): Promise<TimerModel | null> {
    try {
      return (await timerDb.timers.get(id)) || null;
    } catch (error) {
      console.error(`Failed to fetch timer ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new timer with validation
   */
  async createTimer(
    timer: Omit<TimerModel, "id" | "createdAt">,
  ): Promise<string> {
    try {
      const id = nanoid();
      const now = Date.now();

      // Validate input
      const title = timer.title?.trim() || "Untitled Timer";

      const newTimer: TimerModel = {
        ...timer,
        id,
        title,
        createdAt: now,
      };

      await timerDb.timers.add(newTimer);
      return id;
    } catch (error) {
      console.error("Failed to create timer:", error);
      throw error;
    }
  }

  /**
   * Update an existing timer
   */
  async updateTimer(id: string, updates: Partial<TimerModel>): Promise<void> {
    try {
      const updateCount = await timerDb.timers.update(id, updates);

      if (updateCount === 0) {
        throw new Error(`Timer ${id} not found`);
      }
    } catch (error) {
      console.error(`Failed to update timer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a timer
   */
  async deleteTimer(id: string): Promise<void> {
    try {
      await timerDb.timers.delete(id);
    } catch (error) {
      console.error(`Failed to delete timer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update all running timers when the app starts - optimized with transaction
   */
  async updateRunningTimers(): Promise<void> {
    try {
      const runningTimers = await timerDb.timers
        .where("isRunning")
        .equals(1)
        .toArray();

      if (runningTimers.length === 0) {
        return;
      }

      const now = Date.now();
      const updatePromises = runningTimers
        .filter((timer) => timer.startedAt != null)
        .map((timer) => {
          // Calculate elapsed time since last start
          const elapsedSinceStart = now - timer.startedAt!;
          const newRemainingTime = Math.max(
            0,
            timer.remainingTime - elapsedSinceStart,
          );

          return this.updateTimer(timer.id, {
            remainingTime: newRemainingTime,
            startedAt: now,
            completedAt: newRemainingTime === 0 ? now : null,
            isRunning: newRemainingTime > 0,
          });
        });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to update running timers:", error);
    }
  }

  /**
   * Clear all timers
   */
  async clearAll(): Promise<number> {
    try {
      const count = await timerDb.timers.count();
      await timerDb.timers.clear();
      return count;
    } catch (error) {
      console.error("Failed to clear timers:", error);
      return 0;
    }
  }

  /**
   * Get count of total timers
   */
  async getCount(): Promise<number> {
    try {
      return await timerDb.timers.count();
    } catch (error) {
      console.error("Failed to get timer count:", error);
      return 0;
    }
  }
}

// Export singleton instance for consistency
export const timerService = new TimerService();
