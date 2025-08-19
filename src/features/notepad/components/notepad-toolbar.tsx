"use client";

import { memo } from "react";
import { ActionButton } from "@/features/shared/ui/action-button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Heading1,
  Heading2,
  Table,
} from "lucide-react";
import { TooltipProvider } from "@/features/shared/ui/tooltip";

interface NotepadToolbarProps {
  onFormat: (format: string) => void;
}

function NotepadToolbarComponent({ onFormat }: NotepadToolbarProps) {
  const tools = [
    { icon: Bold, label: "Bold", format: "bold", shortcut: "⌘B" },
    { icon: Italic, label: "Italic", format: "italic", shortcut: "⌘I" },
    { icon: Heading1, label: "Heading 1", format: "h1", shortcut: "⌘1" },
    { icon: Heading2, label: "Heading 2", format: "h2", shortcut: "⌘2" },
    { icon: List, label: "Bullet List", format: "ul", shortcut: "⌘⇧8" },
    {
      icon: ListOrdered,
      label: "Numbered List",
      format: "ol",
      shortcut: "⌘⇧7",
    },
    { icon: Quote, label: "Quote", format: "quote", shortcut: "⌘⇧9" },
    { icon: Code, label: "Code", format: "code", shortcut: "⌘E" },
    { icon: Link2, label: "Link", format: "link", shortcut: "⌘K" },
    { icon: Table, label: "Table", format: "table", shortcut: "⌘⇧T" },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        {tools.map((tool) => (
          <ActionButton
            key={tool.format}
            icon={<tool.icon className="h-4 w-4" />}
            variant="ghost"
            size="default"
            onClick={() => onFormat(tool.format)}
            tooltip={
              <div>
                <p>{tool.label}</p>
                {tool.shortcut && (
                  <p className="text-xs text-muted-foreground">{tool.shortcut}</p>
                )}
              </div>
            }
          />
        ))}
      </div>
    </TooltipProvider>
  );
}

export const NotepadToolbar = memo(NotepadToolbarComponent);
