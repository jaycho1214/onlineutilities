import { notepadDb, notesService } from "./notepad-db";
import { nanoid } from "nanoid";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Download a note as a markdown file
 */
export function downloadNote(note: Note) {
  if (!note) return;

  const blob = new Blob([note.content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title || "Untitled"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download content as a markdown file with custom title
 */
export function downloadContent(content: string, title: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title || "Untitled"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Delete a note and navigate to the most recent remaining note
 */
export async function deleteNoteAndNavigate(
  noteId: string,
  router: { push: (path: string) => void },
  currentNoteId?: string,
) {
  if (!noteId) return;

  await notesService.deleteNote(noteId);

  // If we deleted the current note, navigate to most recent note
  if (currentNoteId === noteId) {
    const remaining = await notepadDb.notes
      .orderBy("updatedAt")
      .reverse()
      .limit(1)
      .toArray();
    if (remaining.length > 0) {
      router.push(`/notepad/${remaining[0].id}`);
    } else {
      router.push("/notepad");
    }
  }
}

/**
 * Format a date string for display in the UI
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Generate a unique ID for a new note
 */
export function generateNoteId(): string {
  return nanoid();
}
