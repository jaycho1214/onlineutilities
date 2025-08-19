"use client";

import { useState, useMemo, useCallback, memo, useTransition } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/features/shared/ui/button";
import {
  Plus,
  FileText,
  Trash2,
  Edit,
  Download,
  AlertTriangle,
} from "lucide-react";
import { useNotepad } from "@/features/notepad/lib/notepad-context";
import { formatDate } from "@/features/notepad/lib/notepad-utils";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  Sidebar,
} from "@/features/shared/ui/sidebar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/features/shared/ui/context-menu-glass";

function NotepadSidebarComponent() {
  const pathname = usePathname();
  const currentNoteIdFromUrl = useMemo(
    () => pathname.split("/").pop(),
    [pathname],
  );
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const { notes, createNewNote, selectNote, deleteNote, deleteAllNotes } =
    useNotepad();

  const handleDownloadNote = useCallback((note: (typeof notes)[0]) => {
    const filename = note.title.trim() || "Untitled";
    const blob = new Blob([note.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Optimized search with debouncing
  const filteredNotes = useMemo(() => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return notes;

    const searchLower = trimmedSearch.toLowerCase();
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);

    return notes.filter((n) => {
      const titleLower = n.title.toLowerCase();
      const contentLower = n.content.toLowerCase();

      // Match all search terms
      return searchTerms.every(
        (term) => titleLower.includes(term) || contentLower.includes(term),
      );
    });
  }, [notes, search]);

  return (
    <Sidebar className="h-full">
      <SidebarHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Notes</h2>
          <Button
            onClick={createNewNote}
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            title="Create new note"
          >
            <Plus />
          </Button>
        </div>
        <div className="mb-2">
          <input
            value={search}
            onChange={(e) => {
              startTransition(() => {
                setSearch(e.target.value);
              });
            }}
            placeholder="Search notes..."
            className="w-full p-2 rounded-md bg-white/5 border border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 backdrop-blur-sm transition-all duration-200"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            {notes.length === 0 ? (
              <>
                <p className="text-sm">No notes yet</p>
                <p className="text-xs">Create your first note</p>
              </>
            ) : (
              <>
                <p className="text-sm">No matches</p>
                <p className="text-xs">Try another search</p>
              </>
            )}
          </div>
        ) : (
          <SidebarMenu>
            {filteredNotes.map((note) => (
              <ContextMenu key={note.id}>
                <ContextMenuTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={currentNoteIdFromUrl === note.id}
                      className="flex flex-col items-start h-auto py-2 transition-all duration-150 cursor-pointer hover:bg-accent/50"
                    >
                      <Link
                        href={`/notepad/${note.id}`}
                        prefetch={false}
                        onClick={(e) => {
                          e.preventDefault();
                          startTransition(() => {
                            selectNote(note.id);
                          });
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-sm truncate">
                            {note.title}
                          </span>
                        </div>
                        <div className="flex flex-col items-start w-full mt-1">
                          <p className="text-xs text-muted-foreground line-clamp-2 text-left">
                            {note.content.substring(0, 100) || "Empty note"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(note.updatedAt)}
                          </p>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-48">
                  <ContextMenuItem onClick={() => handleDownloadNote(note)}>
                    <Download className="w-3 h-3 mr-2" />
                    Download
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <Edit className="w-3 h-3 mr-2" />
                    Rename
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    className="text-red-400 focus:text-red-300"
                    onClick={() => {
                      const confirmDelete = window.confirm(
                        `Delete "${note.title || "Untitled"}"?`,
                      );
                      if (confirmDelete) {
                        deleteNote(note.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>

      {/* Footer with Delete All button */}
      {notes.length > 0 && (
        <SidebarFooter className="mt-auto">
          <Button
            onClick={deleteAllNotes}
            variant="destructive"
            size="sm"
            className="w-full text-xs h-10 relative group overflow-hidden"
            title={`Delete all ${notes.length} notes`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <AlertTriangle className="w-3 h-3 mr-2 z-10" />
            <span className="z-10">Delete All ({notes.length})</span>
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

export const NotepadSidebar = memo(NotepadSidebarComponent);
