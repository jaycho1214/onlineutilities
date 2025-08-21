/**
 * Feedback Types Module
 *
 * This module defines all TypeScript interfaces and types for the feedback feature.
 */

// ============================================================================
// DATABASE MODEL INTERFACES
// ============================================================================

/**
 * Feedback type enumeration
 */
export type FeedbackType = "bug" | "feature" | "improvement" | "general";

/**
 * Feedback document model interface - represents a single feedback in the database
 */
export interface FeedbackDocumentModel {
  id: string;
  type: FeedbackType;
  subject: string;
  message: string;
  email?: string;
  createdAt: string;
  submittedAt?: string; // When actually submitted to server (if applicable)
}

// Re-export for backward compatibility
export type FeedbackDocument = FeedbackDocumentModel;
