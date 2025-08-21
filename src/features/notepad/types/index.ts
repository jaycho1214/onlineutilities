/**
 * Notepad Types
 *
 * Type definitions for the notepad feature.
 */

/**
 * Note document interface - represents a single note in the database
 */
export interface NoteModel {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
