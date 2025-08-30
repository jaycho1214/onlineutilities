/**
 * Dexie Database Configuration for llms.txt Maker
 * Handles storage of generation history and configurations
 */

import Dexie, { type EntityTable } from "dexie";
import type { LlmsTxtGenerationModel, LlmsTxtConfigModel } from "../types";

// ========================================================================
// DATABASE SCHEMA
// ========================================================================

export interface LlmsTxtMakerDB extends Dexie {
  generations: EntityTable<LlmsTxtGenerationModel, "id">;
  configs: EntityTable<LlmsTxtConfigModel, "id">;
}

export const llmsTxtMakerDb = new Dexie("LlmsTxtMakerDB") as LlmsTxtMakerDB;

// Define schemas
llmsTxtMakerDb.version(1).stores({
  generations:
    "++id, repositoryUrl, repositoryName, repositoryOwner, createdAt",
  configs: "++id, name, isDefault, createdAt",
});

// ========================================================================
// TIMESTAMP UTILITIES
// ========================================================================

// Manually handle timestamps in service layer for better type safety

// ========================================================================
// DATABASE INITIALIZATION
// ========================================================================

// Database will auto-initialize when first accessed
// Event handlers are optional and can cause SSR issues in Next.js
// Error handling is done at the service level instead

// ========================================================================
// EXPORT
// ========================================================================

export default llmsTxtMakerDb;
