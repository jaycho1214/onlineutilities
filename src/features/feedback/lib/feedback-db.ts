/**
 * Feedback Database Module
 *
 * This module handles all database operations for the feedback feature.
 * It provides a clean interface for managing feedback with Dexie.js.
 */

import Dexie, { type EntityTable } from "dexie";
import { nanoid } from "nanoid";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Feedback type enumeration
 */
export type FeedbackType = "bug" | "feature" | "improvement" | "general";

/**
 * Feedback document interface - represents a single feedback in the database
 */
export interface FeedbackDocument {
  id: string;
  type: FeedbackType;
  subject: string;
  message: string;
  email?: string;
  createdAt: string;
  submittedAt?: string; // When actually submitted to server (if applicable)
}

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Feedback database class extending Dexie
 */
class FeedbackDatabase extends Dexie {
  feedback!: EntityTable<FeedbackDocument, "id">;

  constructor() {
    super("feedbackdb");

    this.version(1).stores({
      feedback: "id, type, createdAt, submittedAt",
    });

    this.feedback.mapToClass(FeedbackModel);
    
    // Handle database errors
    this.on("blocked", () => {
      console.warn("Database upgrade blocked by another connection");
    });
    
    this.on("versionchange", () => {
      console.log("Database version changed in another tab");
    });
  }
}

/**
 * Feedback model class (optional, for adding methods to feedback instances)
 */
class FeedbackModel implements FeedbackDocument {
  id!: string;
  type!: FeedbackType;
  subject!: string;
  message!: string;
  email?: string;
  createdAt!: string;
  submittedAt?: string;
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the feedback database
 */
export const feedbackDb = new FeedbackDatabase();

// ============================================================================
// FEEDBACK SERVICE CLASS
// ============================================================================

/**
 * Service class for managing feedback operations
 * Provides a clean API for CRUD operations on feedback
 */
export class FeedbackService {
  // ========================================================================
  // READ OPERATIONS
  // ========================================================================

  /**
   * Get all feedback sorted by creation time (newest first)
   * @returns Promise<FeedbackDocument[]> - Array of all feedback
   */
  async getAllFeedback(): Promise<FeedbackDocument[]> {
    try {
      return await feedbackDb.feedback.orderBy("createdAt").reverse().toArray();
    } catch (error) {
      console.error("Failed to get all feedback:", error);
      return [];
    }
  }

  /**
   * Get a specific feedback by ID
   * @param id - The feedback ID
   * @returns Promise<FeedbackDocument | undefined> - The feedback or undefined if not found
   */
  async getFeedback(id: string): Promise<FeedbackDocument | undefined> {
    try {
      return await feedbackDb.feedback.get(id);
    } catch (error) {
      console.error(`Failed to get feedback ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Get feedback by type
   * @param type - The feedback type
   * @returns Promise<FeedbackDocument[]> - Array of matching feedback
   */
  async getFeedbackByType(type: FeedbackType): Promise<FeedbackDocument[]> {
    try {
      return await feedbackDb.feedback
        .where("type")
        .equals(type)
        .reverse()
        .sortBy("createdAt");
    } catch (error) {
      console.error(`Failed to get feedback by type ${type}:`, error);
      return [];
    }
  }

  // ========================================================================
  // WRITE OPERATIONS
  // ========================================================================

  /**
   * Create a new feedback with optimized ID generation
   * @param feedbackData - Feedback data without timestamps
   * @returns Promise<FeedbackDocument> - The created feedback
   */
  async createFeedback(
    feedbackData: Omit<FeedbackDocument, "id" | "createdAt">,
  ): Promise<FeedbackDocument> {
    try {
      const now = new Date().toISOString();

      // Use nanoid for better uniqueness and shorter IDs
      const id = nanoid(10);

      const newFeedback: FeedbackDocument = {
        ...feedbackData,
        id,
        createdAt: now,
      };

      await feedbackDb.feedback.add(newFeedback);

      // Dispatch custom event to notify other parts of the app
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("feedbackCreated", { detail: newFeedback }));
      }
      
      return newFeedback;
    } catch (error) {
      console.error("Failed to create feedback:", error);
      throw error;
    }
  }

  /**
   * Mark feedback as submitted
   * @param id - The feedback ID
   * @returns Promise<FeedbackDocument | null> - The updated feedback or null if not found
   */
  async markAsSubmitted(id: string): Promise<FeedbackDocument | null> {
    try {
      return await feedbackDb.transaction("rw", feedbackDb.feedback, async () => {
        const feedback = await feedbackDb.feedback.get(id);

        if (!feedback) return null;

        const updatedFeedback: FeedbackDocument = {
          ...feedback,
          submittedAt: new Date().toISOString(),
        };

        await feedbackDb.feedback.put(updatedFeedback);
        
        // Dispatch custom event
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("feedbackSubmitted", { detail: updatedFeedback }));
        }

        return updatedFeedback;
      });
    } catch (error) {
      console.error(`Failed to mark feedback ${id} as submitted:`, error);
      return null;
    }
  }

  /**
   * Delete a feedback by ID
   * @param id - The feedback ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async deleteFeedback(id: string): Promise<boolean> {
    try {
      const feedback = await feedbackDb.feedback.get(id);

      if (!feedback) return false;

      await feedbackDb.feedback.delete(id);
      
      // Dispatch custom event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("feedbackDeleted", { detail: { id } }));
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete feedback ${id}:`, error);
      return false;
    }
  }

  /**
   * Delete all feedback from the database
   * @returns Promise<number> - Number of feedback entries deleted
   */
  async deleteAllFeedback(): Promise<number> {
    try {
      const count = await feedbackDb.feedback.count();
      await feedbackDb.feedback.clear();
      
      // Dispatch custom event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("allFeedbackDeleted", { detail: { count } }));
      }
      
      return count;
    } catch (error) {
      console.error("Failed to delete all feedback:", error);
      return 0;
    }
  }

  // ========================================================================
  // UTILITY OPERATIONS
  // ========================================================================

  /**
   * Get feedback statistics
   * @returns Promise<{ total: number; byType: Record<FeedbackType, number> }>
   */
  async getStats(): Promise<{ total: number; byType: Record<FeedbackType, number> }> {
    try {
      const allFeedback = await this.getAllFeedback();
      const total = allFeedback.length;
      
      const byType: Record<FeedbackType, number> = {
        bug: 0,
        feature: 0,
        improvement: 0,
        general: 0,
      };

      allFeedback.forEach(feedback => {
        byType[feedback.type]++;
      });

      return { total, byType };
    } catch (error) {
      console.error("Failed to get feedback stats:", error);
      return {
        total: 0,
        byType: {
          bug: 0,
          feature: 0,
          improvement: 0,
          general: 0,
        },
      };
    }
  }

  /**
   * Cleanup and remove the database
   * @returns Promise<void>
   */
  async cleanup(): Promise<void> {
    await feedbackDb.delete();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of the feedback service
 * Use this instance throughout the app for consistency
 */
export const feedbackService = new FeedbackService();