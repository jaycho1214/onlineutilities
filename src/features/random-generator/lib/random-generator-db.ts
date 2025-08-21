/**
 * Random Generator Database Module
 *
 * This module handles all database operations for the random generator feature.
 * It provides a clean interface for managing generation history, presets, and settings with Dexie.js.
 */

import Dexie, { type EntityTable } from "dexie";
import type {
  GenerationEntryModel,
  GeneratorPresetModel,
  GeneratorSettingsModel,
} from "../types";

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Random Generator database class extending Dexie
 */
class RandomGeneratorDatabase extends Dexie {
  history!: EntityTable<GenerationEntryModel, "id">;
  presets!: EntityTable<GeneratorPresetModel, "id">;
  settings!: EntityTable<GeneratorSettingsModel, "id">;

  constructor() {
    super("randomgeneratordb");

    this.version(1).stores({
      history: "id, type, createdAt",
      presets: "id, name, type, createdAt, updatedAt",
      settings: "id, updatedAt",
    });

    // Remove model class mapping

    // Handle database errors
    this.on("blocked", () => {
      console.warn(
        "Random generator database upgrade blocked by another connection",
      );
    });

    this.on("versionchange", () => {
      console.log("Random generator database version changed in another tab");
    });
  }
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the random generator database
 */
export const randomGeneratorDb = new RandomGeneratorDatabase();

// Export database instance as default
export default randomGeneratorDb;
