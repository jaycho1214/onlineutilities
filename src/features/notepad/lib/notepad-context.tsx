"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { notesService, NoteDocument, notepadDb } from "./notepad-db";
import { handleNotepadError, showSuccessToast } from "./notepad-error-handler";
import { useTranslations } from "next-intl";

interface NotepadContextType {
  notes: NoteDocument[];
  currentNote: NoteDocument | null;
  currentNoteId: string | null;
  loading: boolean;
  // Form state
  title: string;
  content: string;
  saveStatus: "idle" | "saving" | "saved";
  textStats: {
    wordCount: number;
    charCount: number;
    charCountNoSpaces: number;
    readingTime: number;
  };
  // Actions
  createNewNote: () => void;
  selectNote: (noteId: string) => void;
  updateTitle: (title: string) => void;
  updateContent: (content: string) => void;
  deleteNote: (noteId: string) => Promise<void>;
  deleteAllNotes: () => Promise<void>;
  downloadCurrentNote: () => void;
}

const NotepadContext = createContext<NotepadContextType | null>(null);

interface NotepadProviderProps {
  children: ReactNode;
  initialNoteId?: string;
}

export function NotepadProvider({
  children,
  initialNoteId,
}: NotepadProviderProps) {
  const t = useTranslations("Notepad");
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(
    initialNoteId || null
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [hasInitialized, setHasInitialized] = useState(false);
  const [, startTransition] = useTransition();

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const creatingNoteRef = useRef<string | null>(null);
  const lastSavedContent = useRef({ title: "", content: "" });

  const textStats = useMemo(() => {
    const cleanContent = content?.trim() ?? "";
    const words = cleanContent
      ? cleanContent.split(/\s+/).filter((word) => word.length > 0) || []
      : [];
    const wordCount = words.length;
    const charCount = content.length;
    const charCountNoSpaces = content.replace(/\s/g, "").length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return { wordCount, charCount, charCountNoSpaces, readingTime };
  }, [content]);

  // Use Dexie's reactive query for real-time updates
  const notes =
    useLiveQuery(async () => {
      try {
        return await notepadDb.notes.orderBy("updatedAt").reverse().toArray();
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        return [];
      }
    }, []) ?? [];

  // Use reactive query for current note
  const currentNote =
    useLiveQuery(async () => {
      if (!currentNoteId) return null;
      try {
        return await notepadDb.notes.get(currentNoteId);
      } catch (error) {
        console.error("Failed to fetch current note:", error);
        return null;
      }
    }, [currentNoteId]) ?? null;

  const loading = notes === undefined || false;

  // Initialize with the provided note ID
  useEffect(() => {
    if (initialNoteId && initialNoteId !== currentNoteId) {
      setCurrentNoteId(initialNoteId);
    }
  }, [initialNoteId, currentNoteId]);

  // Sync form state with current note
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      lastSavedContent.current = {
        title: currentNote.title,
        content: currentNote.content,
      };
      setHasInitialized(true);
    } else if (!currentNoteId) {
      // Clear form when no note is selected
      setTitle("");
      setContent("");
      lastSavedContent.current = { title: "", content: "" };
      setHasInitialized(false);
    }
  }, [currentNote, currentNoteId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (saveIndicatorTimeoutRef.current)
        clearTimeout(saveIndicatorTimeoutRef.current);
    };
  }, []);

  const createNewNote = useCallback(() => {
    // Clear form fields immediately
    setTitle("");
    setContent("");
    setCurrentNoteId(null);
    setHasInitialized(false);
    setSaveStatus("idle");
    creatingNoteRef.current = null;

    // Navigate to /notepad
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/notepad");
    }
  }, []);

  const selectNote = useCallback((noteId: string) => {
    setCurrentNoteId(noteId);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/notepad/${noteId}`);
    }
  }, []);

  const updateTitle = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // If no note exists and we haven't started creating one, create one when content is added
      if (
        !currentNoteId &&
        !hasInitialized &&
        !creatingNoteRef.current &&
        newTitle.trim()
      ) {
        setHasInitialized(true);
        const newId = Date.now().toString();
        creatingNoteRef.current = newId;

        // Create note immediately and wait for it to be created
        startTransition(() => {
          (async () => {
            try {
              await notesService.createNote({
                id: newId,
                title: newTitle,
                content: content || "",
              });

              // Only set the ID after successful creation
              setCurrentNoteId(newId);
              creatingNoteRef.current = null;
              lastSavedContent.current = {
                title: newTitle,
                content: content || "",
              };

              if (typeof window !== "undefined") {
                window.history.replaceState({}, "", `/notepad/${newId}`);
              }
            } catch (error) {
              handleNotepadError(error, "Create note");
              // Reset state on error
              setHasInitialized(false);
              creatingNoteRef.current = null;
            }
          })();
        });

        return;
      }

      // Debounce updates for existing notes or currently being created notes
      if (currentNoteId || creatingNoteRef.current) {
        const noteIdToUpdate = currentNoteId || creatingNoteRef.current;
        if (noteIdToUpdate) {
          // Only save if content has actually changed
          if (
            newTitle === lastSavedContent.current.title &&
            content === lastSavedContent.current.content
          ) {
            return;
          }

          setSaveStatus("saving");
          saveTimeoutRef.current = setTimeout(async () => {
            try {
              await notesService.updateNote(noteIdToUpdate, {
                title: newTitle,
                content,
              });
              lastSavedContent.current = { title: newTitle, content };
              setSaveStatus("saved");

              if (saveIndicatorTimeoutRef.current) {
                clearTimeout(saveIndicatorTimeoutRef.current);
              }
              saveIndicatorTimeoutRef.current = setTimeout(() => {
                setSaveStatus("idle");
              }, 2000);
            } catch (error) {
              handleNotepadError(error, "Update note");
              setSaveStatus("idle");
            }
          }, 500);
        }
      }
    },
    [currentNoteId, content, hasInitialized, startTransition]
  );

  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // If no note exists and we haven't started creating one, create one when content is added
      if (
        !currentNoteId &&
        !hasInitialized &&
        !creatingNoteRef.current &&
        newContent.trim()
      ) {
        setHasInitialized(true);
        const newId = Date.now().toString();
        creatingNoteRef.current = newId;

        // Create note immediately and wait for it to be created
        startTransition(() => {
          (async () => {
            try {
              await notesService.createNote({
                id: newId,
                title: title || t("defaultTitle"),
                content: newContent,
              });

              // Only set the ID after successful creation
              setCurrentNoteId(newId);
              creatingNoteRef.current = null;
              lastSavedContent.current = {
                title: title || t("defaultTitle"),
                content: newContent,
              };

              if (typeof window !== "undefined") {
                window.history.replaceState({}, "", `/notepad/${newId}`);
              }
            } catch (error) {
              handleNotepadError(error, "Create note");
              // Reset state on error
              setHasInitialized(false);
              creatingNoteRef.current = null;
            }
          })();
        });

        return;
      }

      // Debounce updates for existing notes or currently being created notes
      if (currentNoteId || creatingNoteRef.current) {
        const noteIdToUpdate = currentNoteId || creatingNoteRef.current;
        if (noteIdToUpdate) {
          // Only save if content has actually changed
          const currentTitle = title || t("defaultTitle");
          if (
            currentTitle === lastSavedContent.current.title &&
            newContent === lastSavedContent.current.content
          ) {
            return;
          }

          setSaveStatus("saving");
          saveTimeoutRef.current = setTimeout(async () => {
            try {
              await notesService.updateNote(noteIdToUpdate, {
                title: currentTitle,
                content: newContent,
              });
              lastSavedContent.current = {
                title: currentTitle,
                content: newContent,
              };
              setSaveStatus("saved");

              if (saveIndicatorTimeoutRef.current) {
                clearTimeout(saveIndicatorTimeoutRef.current);
              }
              saveIndicatorTimeoutRef.current = setTimeout(() => {
                setSaveStatus("idle");
              }, 2000);
            } catch (error) {
              handleNotepadError(error, "Update note");
              setSaveStatus("idle");
            }
          }, 500);
        }
      }
    },
    [currentNoteId, title, hasInitialized, startTransition, t]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      try {
        const success = await notesService.deleteNote(noteId);
        if (success) {
          showSuccessToast(t("notifications.deleted"));
          if (currentNoteId === noteId) {
            // Navigate to base notepad page
            setCurrentNoteId(null);
            if (typeof window !== "undefined") {
              window.history.pushState({}, "", "/notepad");
            }
          }
        }
      } catch (error) {
        handleNotepadError(error, "Delete note");
      }
    },
    [currentNoteId, t]
  );

  const deleteAllNotes = useCallback(async () => {
    if (notes.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete all ${notes.length} notes? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await notesService.deleteAllNotes();
        showSuccessToast(`All ${notes.length} notes deleted`);
        setCurrentNoteId(null);
        if (typeof window !== "undefined") {
          window.history.pushState({}, "", "/notepad");
        }
      } catch (error) {
        handleNotepadError(error, "Delete all notes");
      }
    }
  }, [notes.length]);

  const downloadCurrentNote = useCallback(() => {
    if (!title && !content) return;

    const filename = title.trim() || t("defaultTitle");
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }, [title, content, t]);

  return (
    <NotepadContext.Provider
      value={{
        notes,
        currentNote,
        currentNoteId,
        loading,
        title,
        textStats,
        content,
        saveStatus,
        createNewNote,
        selectNote,
        updateTitle,
        updateContent,
        deleteNote,
        deleteAllNotes,
        downloadCurrentNote,
      }}
    >
      {children}
    </NotepadContext.Provider>
  );
}

export function useNotepad() {
  const context = useContext(NotepadContext);
  if (!context) {
    throw new Error("useNotepad must be used within a NotepadProvider");
  }
  return context;
}
