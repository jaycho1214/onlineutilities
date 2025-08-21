/**
 * Color Picker Database Module - Optimized for Dexie 4.2
 *
 * This module handles all database operations for the color picker feature.
 * Optimized with modern Dexie patterns, proper TypeScript types, and enhanced error handling.
 */

import Dexie, { type EntityTable } from "dexie";
import type { RecentColorModel } from "../types";

/**
 * Color Picker database class extending Dexie with enhanced error handling
 */
class ColorPickerDatabase extends Dexie {
  recentColors!: EntityTable<RecentColorModel, "id">;

  constructor() {
    super("ColorPickerDB");

    this.version(1).stores({
      recentColors: "++id, color, timestamp",
    });

    // Remove model class mapping

    // Enhanced error handling
    this.on("blocked", () => {
      console.warn("Color picker database blocked by another connection");
    });

    this.on("versionchange", () => {
      console.log("Color picker database version changed in another tab");
    });
  }
}

// Export database instance
export const colorDb = new ColorPickerDatabase();

// Backward compatibility - no longer needed but kept for legacy support
export { colorDb as default };
