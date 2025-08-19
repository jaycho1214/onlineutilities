"use client";

import { memo } from "react";
import { ActionButton } from "@/features/shared/ui/action-button";
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
      <ActionButton
        icon={<Plus className="size-4" />}
        variant="ghost"
        size="default"
        onClick={onNewNote}
        tooltip="New Note"
      />
      <ActionButton
        icon={<Download className="size-4" />}
        variant="ghost"
        size="default"
        onClick={onDownload}
        tooltip="Download"
      />
      <ActionButton
        icon={<Trash2 className="size-4" />}
        variant="destructive"
        size="default"
        onClick={onDelete}
        tooltip="Delete Note"
      />
    </GlassSurface>
  );
}

// Memoize to prevent unnecessary re-renders
export const NotepadActions = memo(NotepadActionsComponent);
