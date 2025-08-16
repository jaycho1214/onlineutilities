"use client";

import { memo } from "react";
import { Button } from "@/features/shared/ui/button";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Plus, Download, Trash2 } from "lucide-react";

interface NotepadActionsProps {
  onNewNote: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

function NotepadActionsComponent({
  onNewNote,
  onDownload,
  onDelete,
}: NotepadActionsProps) {
  return (
    <GlassSurface className="flex flex-row md:flex-col items-center px-2 py-1.5 md:px-3 md:py-2 gap-1 md:gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={onNewNote}
        title="New Note (Cmd/Ctrl+N)"
      >
        <Plus className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDownload}
        title="Download (Cmd/Ctrl+D)"
      >
        <Download className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
        title="Delete Note"
      >
        <Trash2 className="size-4" />
      </Button>
    </GlassSurface>
  );
}

// Memoize to prevent unnecessary re-renders
export const NotepadActions = memo(NotepadActionsComponent);
