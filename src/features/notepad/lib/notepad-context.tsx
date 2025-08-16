"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { notesService, NoteDocument, notepadDb } from "./notepad-db";

interface NotepadContextType {
  notes: NoteDocument[];
  currentNote: NoteDocument | null;
  loading: boolean;
  createNote: () => Promise<NoteDocument>;
  selectNote: (noteId: string) => Promise<void>;
  updateCurrentNote: (
    updates: Partial<Pick<NoteDocument, "title" | "content">>,
  ) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
}

const NotepadContext = createContext<NotepadContextType | null>(null);

export function NotepadProvider({ children }: { children: ReactNode }) {
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  // Use Dexie's reactive query for real-time updates with better error handling
  const notesFromQuery = useLiveQuery(async () => {
    try {
      return await notepadDb.notes.orderBy("updatedAt").reverse().toArray();
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      return [];
    }
  }, []);

  const notes = useMemo(() => notesFromQuery ?? [], [notesFromQuery]);

  // Use reactive query for current note with error handling
  const currentNote =
    useLiveQuery(async () => {
      if (!currentNoteId) return undefined;
      try {
        return await notepadDb.notes.get(currentNoteId);
      } catch (error) {
        console.error("Failed to fetch current note:", error);
        return undefined;
      }
    }, [currentNoteId]) ?? null;

  const loading = notes === undefined;

  // Don't auto-select or auto-create - let the page handle it

  const createNote = useCallback(async (): Promise<NoteDocument> => {
    try {
      const newNote = await notesService.createNote({
        id: Date.now().toString(),
        title: "New Note",
        content: "",
      });
      setCurrentNoteId(newNote.id);
      return newNote;
    } catch (error) {
      console.error("Failed to create note:", error);
      throw error;
    }
  }, []);

  const selectNote = useCallback(async (noteId: string) => {
    // Simply set the current note ID
    setCurrentNoteId(noteId);
  }, []);

  const updateCurrentNote = useCallback(
    async (updates: Partial<Pick<NoteDocument, "title" | "content">>) => {
      if (!currentNoteId) return;

      try {
        // Use requestIdleCallback for non-critical updates
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(() => {
            notesService.updateNote(currentNoteId, updates);
          });
        } else {
          await notesService.updateNote(currentNoteId, updates);
        }
      } catch (error) {
        console.error("Failed to update note:", error);
      }
    },
    [currentNoteId],
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      try {
        const success = await notesService.deleteNote(noteId);
        if (success && currentNoteId === noteId) {
          // Just clear the current note ID
          // Let the component handle navigation
          setCurrentNoteId(null);
        }
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    },
    [currentNoteId],
  );

  const refreshNotes = useCallback(async () => {
    // With Dexie's reactive queries, manual refresh is not needed
    // The UI will automatically update when the database changes
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value: NotepadContextType = useMemo(
    () => ({
      notes,
      currentNote: currentNote || null,
      loading,
      createNote,
      selectNote,
      updateCurrentNote,
      deleteNote,
      refreshNotes,
    }),
    [
      notes,
      currentNote,
      loading,
      createNote,
      selectNote,
      updateCurrentNote,
      deleteNote,
      refreshNotes,
    ],
  );

  return (
    <NotepadContext.Provider value={value}>{children}</NotepadContext.Provider>
  );
}

export function useNotepad() {
  const context = useContext(NotepadContext);
  if (!context) {
    throw new Error("useNotepad must be used within a NotepadProvider");
  }
  return context;
}
