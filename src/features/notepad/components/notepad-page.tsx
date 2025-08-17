"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  Suspense,
} from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { notepadDb, notesService } from "@/features/notepad/lib/notepad-db";
import { NotepadActions } from "./notepad-actions";
import { NotepadStats } from "./notepad-stats";
import { Check, Loader2 } from "lucide-react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import dynamic from "next/dynamic";
import type { MDXEditorMethods } from "@mdxeditor/editor";

const MarkdownEditor = dynamic(() => import("./markdown-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin" />
    </div>
  ),
});

interface NotepadPageProps {
  notepadId?: string;
}

export function NotepadPage({ notepadId: initialNotepadId }: NotepadPageProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [currentNoteId, setCurrentNoteId] = useState(initialNotepadId);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const hasInitialized = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mdxEditorRef = useRef<MDXEditorMethods>(null);

  // Use currentNoteId instead of notepadId prop
  const notepadId = currentNoteId;

  // Use live query to get current note - read-only
  const currentNote = useLiveQuery(async () => {
    if (!notepadId) return null;
    return await notepadDb.notes.get(notepadId);
  }, [notepadId]);

  // Auto-create note if it doesn't exist (removed to prevent unnecessary creation)

  // Update current note ID when prop changes (from navigation)
  useEffect(() => {
    setCurrentNoteId(initialNotepadId);
  }, [initialNotepadId]);

  // Initialize content from database
  useEffect(() => {
    if (currentNote) {
      setContent(currentNote.content);
      setTitle(currentNote.title);
      hasInitialized.current = true;
    }
    // Reset initialization flag when navigating to base /notepad
    if (!notepadId) {
      hasInitialized.current = false;
      setContent("");
      setTitle("");
    }
  }, [currentNote, notepadId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (saveIndicatorTimeoutRef.current)
        clearTimeout(saveIndicatorTimeoutRef.current);
    };
  }, []);

  // Handle content change with debouncing
  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // If on base /notepad, create note and update URL without navigation
      if (!notepadId && value.trim() && !hasInitialized.current) {
        hasInitialized.current = true;
        const newId = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 11)}`;

        // Create the note
        notesService.createNote({
          id: newId,
          title: title || "Untitled",
          content: value,
        });

        // Update internal state and URL without navigation
        setCurrentNoteId(newId);
        window.history.replaceState({}, "", `/notepad/${newId}`);
        return;
      }

      // Debounce updates for existing notes
      if (notepadId) {
        setSaveStatus("saving");
        saveTimeoutRef.current = setTimeout(async () => {
          await notesService.updateNote(notepadId, {
            content: value,
            title: title || "Untitled",
          });
          setSaveStatus("saved");

          // Clear saved indicator after 2 seconds
          if (saveIndicatorTimeoutRef.current) {
            clearTimeout(saveIndicatorTimeoutRef.current);
          }
          saveIndicatorTimeoutRef.current = setTimeout(() => {
            setSaveStatus("idle");
            saveIndicatorTimeoutRef.current = null;
          }, 2000);
        }, 300);
      }
    },
    [notepadId, title],
  );

  // Handle title change with debouncing
  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // If on base /notepad, create note and update URL without navigation
      if (!notepadId && value.trim() && !hasInitialized.current) {
        hasInitialized.current = true;
        const newId = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 11)}`;

        // Create the note
        notesService.createNote({
          id: newId,
          title: value,
          content: content || "",
        });

        // Update internal state and URL without navigation
        setCurrentNoteId(newId);
        window.history.replaceState({}, "", `/notepad/${newId}`);
        return;
      }

      // Debounce updates for existing notes
      if (notepadId) {
        setSaveStatus("saving");
        saveTimeoutRef.current = setTimeout(async () => {
          await notesService.updateNote(notepadId, {
            title: value,
            content: content,
          });
          setSaveStatus("saved");

          // Clear saved indicator after 2 seconds
          if (saveIndicatorTimeoutRef.current) {
            clearTimeout(saveIndicatorTimeoutRef.current);
          }
          saveIndicatorTimeoutRef.current = setTimeout(() => {
            setSaveStatus("idle");
            saveIndicatorTimeoutRef.current = null;
          }, 2000);
        }, 300);
      }
    },
    [notepadId, content],
  );

  const createNewNoteAndRedirect = useCallback(() => {
    // Just navigate to /notepad for a new note
    router.push("/notepad");
  }, [router]);

  const deleteCurrentNote = useCallback(async () => {
    if (!notepadId) return;

    await notesService.deleteNote(notepadId);

    // Navigate to most recent note or base path
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
  }, [notepadId, router]);

  const downloadAsFile = useCallback(() => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "Untitled"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, title]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const key = e.key.toLowerCase();
        if (key === "n") {
          e.preventDefault();
          void createNewNoteAndRedirect();
        } else if (key === "d") {
          e.preventDefault();
          downloadAsFile();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [downloadAsFile, createNewNoteAndRedirect]);

  // Memoized text statistics
  const textStats = useMemo(() => {
    const words = content.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;
    const charCount = content.length;
    const readingTime = Math.ceil(wordCount / 200);

    return { wordCount, charCount, readingTime };
  }, [content]);

  const titlePlaceholder = notepadId ? "Untitled" : "Start with a title...";
  const contentPlaceholder = notepadId
    ? "Start writing..."
    : "Start writing to create a new note...";

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Title Input */}
      <div className="flex-shrink-0 relative z-10">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={titlePlaceholder}
          className="w-full px-6 py-6 pb-4 pr-12 md:pr-24 bg-transparent border-0 outline-0 text-foreground placeholder:text-muted-foreground font-semibold text-2xl font-serif"
          style={{
            WebkitAppearance: "none",
            MozAppearance: "textfield",
            border: "none",
            outline: "none",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          }
        >
          <MarkdownEditor
            ref={mdxEditorRef}
            value={content}
            onChange={handleContentChange}
            placeholder={contentPlaceholder}
          />
        </Suspense>
      </div>

      {/* Actions and Stats */}
      <div className="absolute bottom-3 right-3 md:top-6 md:right-6 z-20 flex flex-col md:flex-col gap-2 md:gap-3">
        <div className="flex flex-row md:flex-col gap-2 md:gap-3">
          <NotepadActions
            onNewNote={createNewNoteAndRedirect}
            onDownload={downloadAsFile}
            onDelete={deleteCurrentNote}
          />
          <GlassSurface className="flex items-center justify-center px-2 py-1.5 md:px-3 md:py-2">
            {saveStatus === "saving" ? (
              <Loader2 className="size-3.5 md:size-4 animate-spin text-muted-foreground" />
            ) : (
              <Check className="size-3.5 md:size-4 text-green-500" />
            )}
          </GlassSurface>
        </div>
        <NotepadStats
          wordCount={textStats.wordCount}
          charCount={textStats.charCount}
          readingTime={textStats.readingTime}
        />
      </div>
    </div>
  );
}
