/**
 * Color Picker Types Module
 *
 * This module defines all TypeScript interfaces and types for the color picker feature.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Recent color model interface - represents a single color in the database
 */
export interface RecentColorModel {
  id?: number;
  color: string;
  timestamp: number;
}
