/**
 * Color Picker Service Module
 *
 * This module provides a clean interface for managing color picker operations.
 * It handles CRUD operations on recent colors using optimized patterns.
 */

import { colorDb } from "@/features/color-picker/lib/color-db";

// ============================================================================
// COLOR SERVICE CLASS
// ============================================================================

/**
 * Color Database Service - Optimized with modern Dexie patterns
 */
export class ColorService {
  private readonly MAX_COLORS = 24;

  /**
   * Generate current timestamp
   * @returns Current timestamp as number
   */
  private getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * Handle errors with consistent logging
   * @param operation - Operation name for logging
   * @param error - The error that occurred
   * @param fallback - Fallback value to return
   */
  private handleError<T>(operation: string, error: unknown, fallback: T): T {
    console.error(`Failed to ${operation}:`, error);
    return fallback;
  }

  /**
   * Add a recent color with optimized deduplication and cleanup
   */
  async addRecentColor(color: string): Promise<void> {
    try {
      if (!color || typeof color !== "string") {
        throw new Error("Invalid color value");
      }

      const normalizedColor = color.trim().toLowerCase();
      const timestamp = this.getCurrentTimestamp();

      await colorDb.transaction("rw", colorDb.recentColors, async () => {
        // Check if color already exists
        const existingColor = await colorDb.recentColors
          .where("color")
          .equals(normalizedColor)
          .first();

        if (existingColor?.id) {
          // Update timestamp if color already exists
          await colorDb.recentColors.update(existingColor.id, {
            timestamp,
          });
        } else {
          // Add new color
          await colorDb.recentColors.add({
            color: normalizedColor,
            timestamp,
          });
        }

        // Efficiently cleanup old colors
        const totalCount = await colorDb.recentColors.count();
        if (totalCount > this.MAX_COLORS) {
          const excessCount = totalCount - this.MAX_COLORS;
          const oldestColors = await colorDb.recentColors
            .orderBy("timestamp")
            .limit(excessCount)
            .primaryKeys();

          if (oldestColors.length > 0) {
            await colorDb.recentColors.bulkDelete(oldestColors);
          }
        }
      });
    } catch (error) {
      this.handleError("add recent color", error, undefined);
      throw error;
    }
  }

  /**
   * Get recent colors sorted by timestamp (newest first)
   */
  async getRecentColors(): Promise<string[]> {
    try {
      const colors = await colorDb.recentColors
        .orderBy("timestamp")
        .reverse()
        .limit(this.MAX_COLORS)
        .toArray();

      return colors.map((c) => c.color);
    } catch (error) {
      return this.handleError("get recent colors", error, []);
    }
  }

  /**
   * Clear all recent colors
   */
  async clearRecentColors(): Promise<void> {
    try {
      await colorDb.recentColors.clear();
    } catch (error) {
      this.handleError("clear recent colors", error, undefined);
      throw error;
    }
  }

  /**
   * Remove a specific color from recent colors
   */
  async removeRecentColor(color: string): Promise<boolean> {
    try {
      const normalizedColor = color.trim().toLowerCase();
      const count = await colorDb.recentColors
        .where("color")
        .equals(normalizedColor)
        .delete();
      return count > 0;
    } catch (error) {
      return this.handleError(`remove color ${color}`, error, false);
    }
  }

  /**
   * Get count of recent colors
   */
  async getRecentColorsCount(): Promise<number> {
    try {
      return await colorDb.recentColors.count();
    } catch (error) {
      return this.handleError("get recent colors count", error, 0);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of the color service
 * Use this instance throughout the app for consistency
 */
export const colorService = new ColorService();

// Legacy class for backward compatibility
export class ColorDB {
  private static service = new ColorService();

  static async addRecentColor(color: string): Promise<void> {
    return this.service.addRecentColor(color);
  }

  static async getRecentColors(): Promise<string[]> {
    return this.service.getRecentColors();
  }

  static async clearRecentColors(): Promise<void> {
    return this.service.clearRecentColors();
  }
}

// Backward compatibility export
export const ColorDBService = ColorService;
