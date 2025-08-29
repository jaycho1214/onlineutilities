"use client";

import { useEffect, useRef, useMemo, Suspense, useCallback, memo } from "react";
import { useNotepad } from "@/features/notepad/lib/notepad-context";
import { NotepadActions } from "@/features/notepad/components/notepad-actions";
import { NotepadStats } from "@/features/notepad/components/notepad-stats";
import { Check, Loader2 } from "lucide-react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import dynamic from "next/dynamic";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { useTranslations } from "next-intl";

const MarkdownEditor = dynamic(
  () => import("@/features/notepad/components/markdown-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    ),
  }
);

function NotepadComponent() {
  const t = useTranslations("Notepad");
  const {
    currentNoteId,
    title,
    content,
    saveStatus,
    updateTitle,
    updateContent,
    textStats,
    createNewNote,
    deleteNote,
    downloadCurrentNote,
  } = useNotepad();
  const mdxEditorRef = useRef<MDXEditorMethods>(null);

  // Sync markdown editor content
  useEffect(() => {
    mdxEditorRef.current?.setMarkdown(content);
  }, [content]);

  const handleDeleteCurrentNote = useCallback(async () => {
    if (!currentNoteId) return;
    const confirmDelete = window.confirm(t("confirmations.deleteNote"));
    if (confirmDelete) {
      await deleteNote(currentNoteId);
    }
  }, [currentNoteId, deleteNote, t]);

  const titlePlaceholder = useMemo(
    () =>
      currentNoteId
        ? t("placeholders.titleWithNote")
        : t("placeholders.titleWithoutNote"),
    [currentNoteId, t]
  );

  const contentPlaceholder = useMemo(
    () =>
      currentNoteId
        ? t("placeholders.contentWithNote")
        : t("placeholders.contentWithoutNote"),
    [currentNoteId, t]
  );

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Title Input */}
      <div className="flex-shrink-0 relative z-10">
        <input
          type="text"
          value={title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder={titlePlaceholder}
          className="w-full px-6 py-6 pb-4 pr-12 md:pr-24 bg-transparent border-0 outline-0 text-foreground placeholder:text-muted-foreground font-semibold text-2xl font-serif focus:ring-0 focus:border-transparent"
          style={{
            WebkitAppearance: "none",
            MozAppearance: "textfield",
            border: "none",
            outline: "none",
          }}
          autoComplete="off"
          spellCheck="true"
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
            onChange={updateContent}
            placeholder={contentPlaceholder}
          />
        </Suspense>
      </div>

      {/* Actions and Stats */}
      <div className="absolute bottom-3 right-3 md:top-6 md:right-6 z-20 flex flex-col md:flex-col gap-2 md:gap-3">
        <div className="flex flex-row md:flex-col gap-2 md:gap-3">
          <NotepadActions
            onNewNote={createNewNote}
            onDownload={downloadCurrentNote}
            onDelete={handleDeleteCurrentNote}
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

export const Notepad = memo(NotepadComponent);
