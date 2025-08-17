/**
 * Calculator Database Module
 *
 * This module handles all database operations for the calculator feature.
 * It provides a clean interface for managing calculation history with Dexie.js.
 */

import Dexie, { type EntityTable } from "dexie";
import { nanoid } from "nanoid";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Calculation history entry interface - represents a single calculation in the database
 */
export interface CalculationEntry {
  id: string;
  expression: string;
  result: string;
  createdAt: string;
}

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Calculator database class extending Dexie
 */
class CalculatorDatabase extends Dexie {
  calculations!: EntityTable<CalculationEntry, "id">;

  constructor() {
    super("calculatordb");

    this.version(1).stores({
      calculations: "id, createdAt",
    });

    this.calculations.mapToClass(CalculationModel);
    
    // Handle database errors
    this.on("blocked", () => {
      console.warn("Calculator database upgrade blocked by another connection");
    });
    
    this.on("versionchange", () => {
      console.log("Calculator database version changed in another tab");
    });
  }
}

/**
 * Calculation model class (optional, for adding methods to calculation instances)
 */
class CalculationModel implements CalculationEntry {
  id!: string;
  expression!: string;
  result!: string;
  createdAt!: string;
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the calculator database
 */
export const calculatorDb = new CalculatorDatabase();

// ============================================================================
// CALCULATOR SERVICE CLASS
// ============================================================================

/**
 * Service class for managing calculation operations
 * Provides a clean API for CRUD operations on calculation history
 */
export class CalculatorService {
  // ========================================================================
  // READ OPERATIONS
  // ========================================================================

  /**
   * Get all calculation history sorted by creation time (newest first)
   * @returns Promise<CalculationEntry[]> - Array of all calculations
   */
  async getAllCalculations(): Promise<CalculationEntry[]> {
    try {
      return await calculatorDb.calculations.orderBy("createdAt").reverse().toArray();
    } catch (error) {
      console.error("Failed to get all calculations:", error);
      return [];
    }
  }

  /**
   * Get recent calculations with a limit
   * @param limit - Maximum number of calculations to return
   * @returns Promise<CalculationEntry[]> - Array of recent calculations
   */
  async getRecentCalculations(limit: number = 50): Promise<CalculationEntry[]> {
    try {
      return await calculatorDb.calculations
        .orderBy("createdAt")
        .reverse()
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Failed to get recent calculations:", error);
      return [];
    }
  }

  // ========================================================================
  // WRITE OPERATIONS
  // ========================================================================

  /**
   * Add a new calculation to history
   * @param expression - The calculation expression (e.g., "2 + 3")
   * @param result - The calculation result (e.g., "5")
   * @returns Promise<CalculationEntry> - The created calculation entry
   */
  async addCalculation(expression: string, result: string): Promise<CalculationEntry> {
    try {
      const now = new Date().toISOString();
      const id = nanoid(10);

      const newCalculation: CalculationEntry = {
        id,
        expression,
        result,
        createdAt: now,
      };

      await calculatorDb.calculations.add(newCalculation);
      
      return newCalculation;
    } catch (error) {
      console.error("Failed to add calculation:", error);
      throw error;
    }
  }

  /**
   * Clear all calculation history
   * @returns Promise<number> - Number of calculations deleted
   */
  async clearHistory(): Promise<number> {
    try {
      const count = await calculatorDb.calculations.count();
      await calculatorDb.calculations.clear();
      
      return count;
    } catch (error) {
      console.error("Failed to clear calculation history:", error);
      return 0;
    }
  }

  /**
   * Delete a specific calculation by ID
   * @param id - The calculation ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async deleteCalculation(id: string): Promise<boolean> {
    try {
      const calculation = await calculatorDb.calculations.get(id);

      if (!calculation) return false;

      await calculatorDb.calculations.delete(id);

      return true;
    } catch (error) {
      console.error(`Failed to delete calculation ${id}:`, error);
      return false;
    }
  }

  // ========================================================================
  // UTILITY OPERATIONS
  // ========================================================================

  /**
   * Get the count of total calculations
   * @returns Promise<number> - Total number of calculations
   */
  async getCalculationCount(): Promise<number> {
    try {
      return await calculatorDb.calculations.count();
    } catch (error) {
      console.error("Failed to get calculation count:", error);
      return 0;
    }
  }

  /**
   * Cleanup and remove the database
   * @returns Promise<void>
   */
  async cleanup(): Promise<void> {
    await calculatorDb.delete();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of the calculator service
 * Use this instance throughout the app for consistency
 */
export const calculatorService = new CalculatorService();