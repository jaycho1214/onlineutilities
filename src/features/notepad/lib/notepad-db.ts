/**
 * Notepad Database Module
 *
 * This module handles all database operations for the notepad feature.
 * It provides a clean interface for managing notes with Dexie.js.
 */

import Dexie, { type EntityTable } from "dexie";
import { nanoid } from "nanoid";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Note document interface - represents a single note in the database
 */
export interface NoteDocument {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DATABASE DEFINITION
// ============================================================================

/**
 * Notepad database class extending Dexie
 */
class NotepadDatabase extends Dexie {
  notes!: EntityTable<NoteDocument, "id">;

  constructor() {
    super("notepaddb");

    this.version(1).stores({
      notes: "id, updatedAt",
    });
    
    // Version 2: Add more indexes for better performance
    this.version(2).stores({
      notes: "id, updatedAt, createdAt, title",
    });

    this.notes.mapToClass(NoteModel);
    
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
 * Note model class (optional, for adding methods to note instances)
 */
class NoteModel implements NoteDocument {
  id!: string;
  title!: string;
  content!: string;
  createdAt!: string;
  updatedAt!: string;
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

/**
 * Singleton instance of the notepad database
 */
export const notepadDb = new NotepadDatabase();

// ============================================================================
// NOTES SERVICE CLASS
// ============================================================================

/**
 * Service class for managing note operations
 * Provides a clean API for CRUD operations on notes
 */
export class NotesService {
  // ========================================================================
  // READ OPERATIONS
  // ========================================================================

  /**
   * Get all notes sorted by update time (newest first)
   * @returns Promise<NoteDocument[]> - Array of all notes
   */
  async getAllNotes(): Promise<NoteDocument[]> {
    try {
      return await notepadDb.notes.orderBy("updatedAt").reverse().toArray();
    } catch (error) {
      console.error("Failed to get all notes:", error);
      return [];
    }
  }

  /**
   * Get a specific note by ID
   * @param id - The note ID
   * @returns Promise<NoteDocument | undefined> - The note or undefined if not found
   */
  async getNote(id: string): Promise<NoteDocument | undefined> {
    try {
      return await notepadDb.notes.get(id);
    } catch (error) {
      console.error(`Failed to get note ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Search notes by title or content with optimized algorithm
   * @param query - Search query string
   * @returns Promise<NoteDocument[]> - Array of matching notes
   */
  async searchNotes(query: string): Promise<NoteDocument[]> {
    if (!query || query.trim().length === 0) {
      return this.getAllNotes();
    }

    try {
      const searchLower = query.toLowerCase();
      const searchTerms = searchLower.split(/\s+/).filter(Boolean);

      // Use indexed query first, then filter in memory for better performance
      const allNotes = await notepadDb.notes
        .orderBy("updatedAt")
        .reverse()
        .toArray();

      return allNotes.filter((note) => {
        const titleLower = note.title.toLowerCase();
        const contentLower = note.content.toLowerCase();
        
        // Match all search terms
        return searchTerms.every(term => 
          titleLower.includes(term) || contentLower.includes(term)
        );
      });
    } catch (error) {
      console.error("Failed to search notes:", error);
      return [];
    }
  }

  // ========================================================================
  // WRITE OPERATIONS
  // ========================================================================

  /**
   * Create a new note with optimized ID generation
   * @param noteData - Note data without timestamps
   * @returns Promise<NoteDocument> - The created note
   */
  async createNote(
    noteData: Omit<NoteDocument, "createdAt" | "updatedAt">,
  ): Promise<NoteDocument> {
    try {
      const now = new Date().toISOString();

      // Use nanoid for better uniqueness and shorter IDs
      const id = noteData.id || nanoid(10);

      const newNote: NoteDocument = {
        ...noteData,
        id,
        title: noteData.title || "Untitled",
        content: noteData.content || "",
        createdAt: now,
        updatedAt: now,
      };

      await notepadDb.notes.add(newNote);

      // Dispatch custom event to notify other parts of the app
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("noteCreated", { detail: newNote }));
      }
      
      return newNote;
    } catch (error) {
      console.error("Failed to create note:", error);
      throw error;
    }
  }

  /**
   * Update an existing note with optimized change detection
   * @param id - The note ID
   * @param updates - Partial note data to update
   * @returns Promise<NoteDocument | null> - The updated note or null if not found
   */
  async updateNote(
    id: string,
    updates: Partial<Pick<NoteDocument, "title" | "content">>,
  ): Promise<NoteDocument | null> {
    try {
      // Use transaction for atomic update
      return await notepadDb.transaction("rw", notepadDb.notes, async () => {
        const note = await notepadDb.notes.get(id);

        if (!note) return null;

        // Check if there are actual changes to the content or title
        const hasContentChanged =
          updates.content !== undefined && updates.content !== note.content;
        const hasTitleChanged =
          updates.title !== undefined && updates.title !== note.title;

        // Only update if there are actual changes
        if (!hasContentChanged && !hasTitleChanged) {
          return note;
        }

        const updatedNote: NoteDocument = {
          ...note,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await notepadDb.notes.put(updatedNote);
        
        // Dispatch custom event
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("noteUpdated", { detail: updatedNote }));
        }

        return updatedNote;
      });
    } catch (error) {
      console.error(`Failed to update note ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete a note by ID
   * @param id - The note ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async deleteNote(id: string): Promise<boolean> {
    try {
      const note = await notepadDb.notes.get(id);

      if (!note) return false;

      await notepadDb.notes.delete(id);
      
      // Dispatch custom event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("noteDeleted", { detail: { id } }));
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete note ${id}:`, error);
      return false;
    }
  }

  /**
   * Delete all notes from the database
   * @returns Promise<number> - Number of notes deleted
   */
  async deleteAllNotes(): Promise<number> {
    try {
      const count = await notepadDb.notes.count();
      await notepadDb.notes.clear();
      
      // Dispatch custom event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("allNotesDeleted", { detail: { count } }));
      }
      
      return count;
    } catch (error) {
      console.error("Failed to delete all notes:", error);
      return 0;
    }
  }

  // ========================================================================
  // UTILITY OPERATIONS
  // ========================================================================

  /**
   * Cleanup and remove the database
   * @returns Promise<void>
   */
  async cleanup(): Promise<void> {
    await notepadDb.delete();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of the notes service
 * Use this instance throughout the app for consistency
 */
export const notesService = new NotesService();
