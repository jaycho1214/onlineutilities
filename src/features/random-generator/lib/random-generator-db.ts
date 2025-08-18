/**
 * Random Generator Database Module
 *
 * This module handles all database operations for the random generator feature.
 * It provides a clean interface for managing generation history, presets, and settings with Dexie.js.
 */

import Dexie, { type EntityTable } from "dexie";
import { nanoid } from "nanoid";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Random generator types supported by the application
 */
export type GeneratorType = 
  | "password" 
  | "number" 
  | "uuid" 
  | "nanoid"
  | "cuid"
  | "string" 
  | "boolean" 
  | "color" 
  | "date";

/**
 * Generation history entry interface - represents a single generation in the database
 */
export interface GenerationEntry {
  id: string;
  type: GeneratorType;
  config: Record<string, unknown>;
  results: string[];
  createdAt: string;
}

/**
 * Preset configuration interface - represents saved generator configurations
 */
export interface GeneratorPreset {
  id: string;
  name: string;
  type: GeneratorType;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * User settings interface - represents generator preferences
 */
export interface GeneratorSettings {
  id: string;
  autoCopy: boolean;
  showStrength: boolean;
  saveHistory: boolean;
  updatedAt: string;
}

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Random Generator database class extending Dexie
 */
class RandomGeneratorDatabase extends Dexie {
  history!: EntityTable<GenerationEntry, "id">;
  presets!: EntityTable<GeneratorPreset, "id">;
  settings!: EntityTable<GeneratorSettings, "id">;

  constructor() {
    super("randomgeneratordb");

    this.version(1).stores({
      history: "id, type, createdAt",
      presets: "id, name, type, createdAt, updatedAt",
      settings: "id, updatedAt",
    });

    this.history.mapToClass(GenerationEntryModel);
    this.presets.mapToClass(GeneratorPresetModel);
    this.settings.mapToClass(GeneratorSettingsModel);

    // Handle database errors
    this.on("blocked", () => {
      console.warn("Random generator database upgrade blocked by another connection");
    });

    this.on("versionchange", () => {
      console.log("Random generator database version changed in another tab");
    });
  }
}

/**
 * Generation entry model class
 */
class GenerationEntryModel implements GenerationEntry {
  id!: string;
  type!: GeneratorType;
  config!: Record<string, unknown>;
  results!: string[];
  createdAt!: string;
}

/**
 * Generator preset model class
 */
class GeneratorPresetModel implements GeneratorPreset {
  id!: string;
  name!: string;
  type!: GeneratorType;
  config!: Record<string, unknown>;
  createdAt!: string;
  updatedAt!: string;
}

/**
 * Generator settings model class
 */
class GeneratorSettingsModel implements GeneratorSettings {
  id!: string;
  autoCopy!: boolean;
  showStrength!: boolean;
  saveHistory!: boolean;
  updatedAt!: string;
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the random generator database
 */
export const randomGeneratorDb = new RandomGeneratorDatabase();

// ============================================================================
// RANDOM GENERATOR SERVICE CLASS
// ============================================================================

/**
 * Service class for managing random generator operations
 * Provides a clean API for CRUD operations on generation history, presets, and settings
 */
export class RandomGeneratorService {
  // ========================================================================
  // HISTORY OPERATIONS
  // ========================================================================

  /**
   * Get all generation history sorted by creation time (newest first)
   * @returns Promise<GenerationEntry[]> - Array of all generation entries
   */
  async getAllHistory(): Promise<GenerationEntry[]> {
    try {
      return await randomGeneratorDb.history
        .orderBy("createdAt")
        .reverse()
        .toArray();
    } catch (error) {
      console.error("Failed to get all history:", error);
      return [];
    }
  }

  /**
   * Get recent generation history with a limit
   * @param limit - Maximum number of entries to return
   * @returns Promise<GenerationEntry[]> - Array of recent generation entries
   */
  async getRecentHistory(limit: number = 50): Promise<GenerationEntry[]> {
    try {
      return await randomGeneratorDb.history
        .orderBy("createdAt")
        .reverse()
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Failed to get recent history:", error);
      return [];
    }
  }

  /**
   * Get history by generator type
   * @param type - Generator type to filter by
   * @param limit - Maximum number of entries to return
   * @returns Promise<GenerationEntry[]> - Array of generation entries for the type
   */
  async getHistoryByType(type: GeneratorType, limit: number = 20): Promise<GenerationEntry[]> {
    try {
      return await randomGeneratorDb.history
        .where("type")
        .equals(type)
        .reverse()
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error(`Failed to get ${type} history:`, error);
      return [];
    }
  }

  /**
   * Add a new generation to history
   * @param type - Generator type
   * @param config - Generation configuration
   * @param results - Generated results
   * @returns Promise<GenerationEntry> - The created generation entry
   */
  async addToHistory(
    type: GeneratorType,
    config: Record<string, unknown>,
    results: string[]
  ): Promise<GenerationEntry> {
    try {
      const now = new Date().toISOString();
      const id = nanoid(10);

      const newEntry: GenerationEntry = {
        id,
        type,
        config,
        results,
        createdAt: now,
      };

      await randomGeneratorDb.history.add(newEntry);
      return newEntry;
    } catch (error) {
      console.error("Failed to add to history:", error);
      throw error;
    }
  }

  /**
   * Clear all generation history
   * @returns Promise<number> - Number of entries deleted
   */
  async clearHistory(): Promise<number> {
    try {
      const count = await randomGeneratorDb.history.count();
      await randomGeneratorDb.history.clear();
      return count;
    } catch (error) {
      console.error("Failed to clear history:", error);
      return 0;
    }
  }

  /**
   * Delete a specific generation entry by ID
   * @param id - The generation entry ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async deleteHistoryEntry(id: string): Promise<boolean> {
    try {
      const entry = await randomGeneratorDb.history.get(id);
      if (!entry) return false;

      await randomGeneratorDb.history.delete(id);
      return true;
    } catch (error) {
      console.error(`Failed to delete history entry ${id}:`, error);
      return false;
    }
  }

  // ========================================================================
  // PRESET OPERATIONS
  // ========================================================================

  /**
   * Get all presets sorted by creation time (newest first)
   * @returns Promise<GeneratorPreset[]> - Array of all presets
   */
  async getAllPresets(): Promise<GeneratorPreset[]> {
    try {
      return await randomGeneratorDb.presets
        .orderBy("createdAt")
        .reverse()
        .toArray();
    } catch (error) {
      console.error("Failed to get all presets:", error);
      return [];
    }
  }

  /**
   * Get presets by generator type
   * @param type - Generator type to filter by
   * @returns Promise<GeneratorPreset[]> - Array of presets for the type
   */
  async getPresetsByType(type: GeneratorType): Promise<GeneratorPreset[]> {
    try {
      return await randomGeneratorDb.presets
        .where("type")
        .equals(type)
        .reverse()
        .toArray();
    } catch (error) {
      console.error(`Failed to get ${type} presets:`, error);
      return [];
    }
  }

  /**
   * Save a new preset
   * @param name - Preset name
   * @param type - Generator type
   * @param config - Generator configuration
   * @returns Promise<GeneratorPreset> - The created preset
   */
  async savePreset(
    name: string,
    type: GeneratorType,
    config: Record<string, unknown>
  ): Promise<GeneratorPreset> {
    try {
      const now = new Date().toISOString();
      const id = nanoid(10);

      const newPreset: GeneratorPreset = {
        id,
        name,
        type,
        config,
        createdAt: now,
        updatedAt: now,
      };

      await randomGeneratorDb.presets.add(newPreset);
      return newPreset;
    } catch (error) {
      console.error("Failed to save preset:", error);
      throw error;
    }
  }

  /**
   * Update an existing preset
   * @param id - Preset ID
   * @param updates - Partial preset updates
   * @returns Promise<boolean> - True if updated, false if not found
   */
  async updatePreset(
    id: string,
    updates: Partial<Omit<GeneratorPreset, "id" | "createdAt">>
  ): Promise<boolean> {
    try {
      const preset = await randomGeneratorDb.presets.get(id);
      if (!preset) return false;

      const updatedPreset = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await randomGeneratorDb.presets.update(id, updatedPreset);
      return true;
    } catch (error) {
      console.error(`Failed to update preset ${id}:`, error);
      return false;
    }
  }

  /**
   * Delete a preset by ID
   * @param id - Preset ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async deletePreset(id: string): Promise<boolean> {
    try {
      const preset = await randomGeneratorDb.presets.get(id);
      if (!preset) return false;

      await randomGeneratorDb.presets.delete(id);
      return true;
    } catch (error) {
      console.error(`Failed to delete preset ${id}:`, error);
      return false;
    }
  }

  /**
   * Check if a preset name already exists for a generator type
   * @param name - Preset name
   * @param type - Generator type
   * @param excludeId - Preset ID to exclude from check (for updates)
   * @returns Promise<boolean> - True if name exists, false otherwise
   */
  async presetNameExists(
    name: string,
    type: GeneratorType,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const existing = await randomGeneratorDb.presets
        .where("type")
        .equals(type)
        .and((preset) => preset.name === name && preset.id !== excludeId)
        .first();

      return !!existing;
    } catch (error) {
      console.error("Failed to check preset name:", error);
      return false;
    }
  }

  // ========================================================================
  // SETTINGS OPERATIONS
  // ========================================================================

  /**
   * Get user settings
   * @returns Promise<GeneratorSettings> - User settings
   */
  async getSettings(): Promise<GeneratorSettings> {
    try {
      let settings = await randomGeneratorDb.settings.get("user");

      if (!settings) {
        // Create default settings
        settings = {
          id: "user",
          autoCopy: false,
          showStrength: true,
          saveHistory: true,
          updatedAt: new Date().toISOString(),
        };

        await randomGeneratorDb.settings.add(settings);
      }

      return settings;
    } catch (error) {
      console.error("Failed to get settings:", error);
      // Return default settings on error
      return {
        id: "user",
        autoCopy: false,
        showStrength: true,
        saveHistory: true,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Update user settings
   * @param updates - Partial settings updates
   * @returns Promise<GeneratorSettings> - Updated settings
   */
  async updateSettings(
    updates: Partial<Omit<GeneratorSettings, "id">>
  ): Promise<GeneratorSettings> {
    try {
      const currentSettings = await this.getSettings();

      const updatedSettings: GeneratorSettings = {
        ...currentSettings,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await randomGeneratorDb.settings.put(updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  }

  // ========================================================================
  // UTILITY OPERATIONS
  // ========================================================================

  /**
   * Get the count of total history entries
   * @returns Promise<number> - Total number of history entries
   */
  async getHistoryCount(): Promise<number> {
    try {
      return await randomGeneratorDb.history.count();
    } catch (error) {
      console.error("Failed to get history count:", error);
      return 0;
    }
  }

  /**
   * Get the count of total presets
   * @returns Promise<number> - Total number of presets
   */
  async getPresetCount(): Promise<number> {
    try {
      return await randomGeneratorDb.presets.count();
    } catch (error) {
      console.error("Failed to get preset count:", error);
      return 0;
    }
  }

  /**
   * Cleanup and remove the database
   * @returns Promise<void>
   */
  async cleanup(): Promise<void> {
    await randomGeneratorDb.delete();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of the random generator service
 * Use this instance throughout the app for consistency
 */
export const randomGeneratorService = new RandomGeneratorService();