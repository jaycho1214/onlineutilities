/**
 * Encoder/Decoder Database Module - Optimized for Dexie 4.2
 *
 * This module handles all database operations for the encoder/decoder feature.
 * Optimized with modern Dexie patterns, efficient queries, and enhanced error handling.
 */

import Dexie, { type EntityTable } from "dexie";
import type { EncoderDecoderEntryModel } from "../types";

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Encoder/Decoder database class extending Dexie
 */
class EncoderDecoderDatabase extends Dexie {
  entries!: EntityTable<EncoderDecoderEntryModel, "id">;

  constructor() {
    super("encoderDecoderDb");

    // Version 1: Original schema with timestamp
    this.version(1).stores({
      entries: "id, type, operation, timestamp, isValid",
    });

    // Version 2: Updated schema with createdAt and updatedAt
    this.version(2)
      .stores({
        entries: "id, type, operation, createdAt, updatedAt, isValid",
      })
      .upgrade((trans) => {
        // Migrate existing data from timestamp to createdAt
        return trans
          .table("entries")
          .toCollection()
          .modify((entry: Record<string, unknown>) => {
            if (entry.timestamp && !entry.createdAt) {
              entry.createdAt = entry.timestamp;
              entry.updatedAt = entry.timestamp;
              delete entry.timestamp;
            }
          });
      });

    // Enhanced error handling
    this.on("blocked", () => {
      console.warn("Encoder/Decoder database blocked by another connection");
    });

    this.on("versionchange", () => {
      console.log("Encoder/Decoder database version changed in another tab");
    });
  }
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the encoder/decoder database
 */
export const encoderDecoderDb = new EncoderDecoderDatabase();
