/**
 * Calculator Service Module
 *
 * This module provides a clean interface for managing calculator operations.
 * It handles CRUD operations on calculation history using the base service pattern.
 */

import { BaseService } from "@/lib/base-service";
import { calculatorDb } from "./calculator-db";
import type { CalculationEntryModel } from "../types";

// ============================================================================
// CALCULATOR SERVICE CLASS
// ============================================================================

/**
 * Service class for managing calculation operations
 * Extends BaseService for common database operations
 */
export class CalculatorService extends BaseService<
  CalculationEntryModel,
  typeof calculatorDb
> {
  protected db = calculatorDb;
  protected tableName = "calculations";
  // ========================================================================
  // READ OPERATIONS
  // ========================================================================

  /**
   * Get all calculation history sorted by creation time (newest first)
   * @returns Promise<CalculationEntryModel[]> - Array of all calculations
   */
  async getAllCalculations(): Promise<CalculationEntryModel[]> {
    return this.getAll();
  }

  /**
   * Get recent calculations with a limit
   * @param limit - Maximum number of calculations to return
   * @returns Promise<CalculationEntryModel[]> - Array of recent calculations
   */
  async getRecentCalculations(
    limit: number = 50,
  ): Promise<CalculationEntryModel[]> {
    return this.getRecent(limit);
  }

  /**
   * Search calculations by expression or result
   * @param query - Search query
   * @param limit - Maximum results to return
   * @returns Promise<CalculationEntryModel[]>
   */
  async search(
    query: string,
    limit: number = 20,
  ): Promise<CalculationEntryModel[]> {
    if (!query.trim()) {
      return this.getRecent(limit);
    }

    try {
      const searchLower = query.toLowerCase();
      const allCalculations = await this.getAll();

      return allCalculations
        .filter(
          (calc) =>
            calc.expression.toLowerCase().includes(searchLower) ||
            calc.result.toLowerCase().includes(searchLower),
        )
        .slice(0, limit);
    } catch (error) {
      return this.handleError("search calculations", error, []);
    }
  }

  // ========================================================================
  // WRITE OPERATIONS
  // ========================================================================

  /**
   * Add a new calculation to history
   * @param expression - The calculation expression (e.g., "2 + 3")
   * @param result - The calculation result (e.g., "5")
   * @returns Promise<CalculationEntryModel> - The created calculation entry
   */
  async addCalculation(
    expression: string,
    result: string,
  ): Promise<CalculationEntryModel> {
    try {
      const newCalculation = this.createBaseModel({
        expression,
        result,
      });

      await this.getTable().add(newCalculation);
      this.dispatchEvent("calculationAdded", newCalculation);

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
    return this.clearAll();
  }

  /**
   * Delete a specific calculation by ID
   * @param id - The calculation ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async deleteCalculation(id: string): Promise<boolean> {
    return this.deleteById(id);
  }

  // ========================================================================
  // UTILITY OPERATIONS
  // ========================================================================

  /**
   * Get the count of total calculations
   * @returns Promise<number> - Total number of calculations
   */
  async getCalculationCount(): Promise<number> {
    return this.getCount();
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
