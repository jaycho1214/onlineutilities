/**
 * Calculator Types Module
 *
 * This module defines all TypeScript interfaces and types for the calculator feature.
 */

// ============================================================================
// DATABASE MODEL INTERFACES
// ============================================================================

/**
 * Calculation history entry model interface - represents a single calculation in the database
 */
export interface CalculationEntryModel {
  id: string;
  expression: string;
  result: string;
  createdAt: string;
}

// Re-export for backward compatibility
export type CalculationEntry = CalculationEntryModel;
