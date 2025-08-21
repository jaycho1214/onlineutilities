/**
 * Random Generator Service Module
 *
 * This module provides a clean interface for managing random generator operations.
 * It handles CRUD operations on generation history, presets, and settings with Dexie.js.
 */

import { nanoid } from "nanoid";
import { randomGeneratorDb } from "./random-generator-db";
import type {
  GeneratorType,
  GenerationEntryModel,
  GeneratorPresetModel,
  GeneratorSettingsModel,
} from "../types";

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
   * @returns Promise<GenerationEntryModel[]> - Array of all generation entries
   */
  async getAllHistory(): Promise<GenerationEntryModel[]> {
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
   * @returns Promise<GenerationEntryModel[]> - Array of recent generation entries
   */
  async getRecentHistory(limit: number = 50): Promise<GenerationEntryModel[]> {
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
   * @returns Promise<GenerationEntryModel[]> - Array of generation entries for the type
   */
  async getHistoryByType(
    type: GeneratorType,
    limit: number = 20,
  ): Promise<GenerationEntryModel[]> {
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
   * @returns Promise<GenerationEntryModel> - The created generation entry
   */
  async addToHistory(
    type: GeneratorType,
    config: Record<string, unknown>,
    results: string[],
  ): Promise<GenerationEntryModel> {
    try {
      const now = new Date().toISOString();
      const id = nanoid(10);

      const newEntry: GenerationEntryModel = {
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
   * @returns Promise<GeneratorPresetModel[]> - Array of all presets
   */
  async getAllPresets(): Promise<GeneratorPresetModel[]> {
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
   * @returns Promise<GeneratorPresetModel[]> - Array of presets for the type
   */
  async getPresetsByType(type: GeneratorType): Promise<GeneratorPresetModel[]> {
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
   * @returns Promise<GeneratorPresetModel> - The created preset
   */
  async savePreset(
    name: string,
    type: GeneratorType,
    config: Record<string, unknown>,
  ): Promise<GeneratorPresetModel> {
    try {
      const now = new Date().toISOString();
      const id = nanoid(10);

      const newPreset: GeneratorPresetModel = {
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
    updates: Partial<Omit<GeneratorPresetModel, "id" | "createdAt">>,
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
    excludeId?: string,
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
   * @returns Promise<GeneratorSettingsModel> - User settings
   */
  async getSettings(): Promise<GeneratorSettingsModel> {
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
   * @returns Promise<GeneratorSettingsModel> - Updated settings
   */
  async updateSettings(
    updates: Partial<Omit<GeneratorSettingsModel, "id">>,
  ): Promise<GeneratorSettingsModel> {
    try {
      const currentSettings = await this.getSettings();

      const updatedSettings: GeneratorSettingsModel = {
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
