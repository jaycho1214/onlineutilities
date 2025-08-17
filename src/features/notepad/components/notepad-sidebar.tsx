"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/features/shared/ui/button";
import { Plus, FileText, Trash2, Edit, Download } from "lucide-react";
import { notepadDb, notesService } from "@/features/notepad/lib/notepad-db";
import {
  SidebarHeader,
  SidebarContent,
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
  const router = useRouter();
  const currentNoteId = pathname.split("/").pop();
  const [search, setSearch] = useState("");

  // Use live query to get notes directly from database
  const notesFromQuery = useLiveQuery(
    () => notepadDb.notes.orderBy("updatedAt").reverse().toArray(),
    [],
    [],
  );

  const notes = useMemo(() => notesFromQuery ?? [], [notesFromQuery]);

  const createNewNote = useCallback(async () => {
    router.push("/notepad");
  }, [router]);

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
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
    },
    [currentNoteId, router],
  );

  const downloadNote = useCallback((note: (typeof notes)[0]) => {
    if (!note) return;
    const blob = new Blob([note.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title || "Untitled"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Memoized date formatter
  const formatDate = useCallback((dateString: string) => {
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
  }, []);

  // Optimized search
  const filteredNotes = useMemo(() => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return notes;

    const searchLower = trimmedSearch.toLowerCase();
    return notes.filter((n) => {
      if (n.title.toLowerCase().includes(searchLower)) return true;
      return n.content.toLowerCase().includes(searchLower);
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full p-2 rounded-md bg-white/5 border border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 backdrop-blur-sm"
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
                      isActive={currentNoteId === note.id}
                      className="flex flex-col items-start h-auto py-2 transition-colors duration-150 cursor-pointer"
                    >
                      <Link href={`/notepad/${note.id}`} prefetch={true}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-sm truncate">
                            {note.title}
                          </span>
                        </div>
                        <div className="flex flex-col items-start w-full mt-1">
                          <p className="text-xs text-muted-foreground line-clamp-2 text-left">
                            {note.content || "Empty note"}
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
                  <ContextMenuItem onClick={() => downloadNote(note)}>
                    <Download className="w-3 h-3 mr-2" />
                    Download
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <Edit className="w-3 h-3 mr-2" />
                    Rename
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    variant="destructive"
                    onClick={() => handleDeleteNote(note.id)}
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
    </Sidebar>
  );
}

export const NotepadSidebar = memo(NotepadSidebarComponent);
