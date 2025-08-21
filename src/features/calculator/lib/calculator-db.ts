/**
 * Calculator Database Module
 *
 * This module handles all database operations for the calculator feature.
 * It provides a clean interface for managing calculation history with Dexie.js.
 */

import Dexie, { type EntityTable } from "dexie";
import type { CalculationEntryModel } from "../types";

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Calculator database class extending Dexie
 */
class CalculatorDatabase extends Dexie {
  calculations!: EntityTable<CalculationEntryModel, "id">;

  constructor() {
    super("calculatordb");

    this.version(1).stores({
      calculations: "id, createdAt",
    });

    // Remove model class mapping

    // Handle database errors
    this.on("blocked", () => {
      console.warn("Calculator database upgrade blocked by another connection");
    });

    this.on("versionchange", () => {
      console.log("Calculator database version changed in another tab");
    });
  }
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the calculator database
 */
export const calculatorDb = new CalculatorDatabase();

// Export database instance as default
export default calculatorDb;
