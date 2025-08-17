"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/features/shared/ui/button";
import { Plus, FileText, Trash2, Edit, Download, AlertTriangle } from "lucide-react";
import { notepadDb, notesService } from "@/features/notepad/lib/notepad-db";
import { downloadNote, deleteNoteAndNavigate, formatDate } from "@/features/notepad/lib/notepad-utils";
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
    router.push("/notepad?new=true");
  }, [router]);

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      await deleteNoteAndNavigate(noteId, router, currentNoteId);
    },
    [currentNoteId, router],
  );

  const handleDownloadNote = useCallback((note: (typeof notes)[0]) => {
    downloadNote(note);
  }, []);

  const handleDeleteAllNotes = useCallback(async () => {
    if (notes.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete all ${notes.length} notes? This action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        await notesService.deleteAllNotes();
        // Navigate to base notepad page if currently viewing a note
        if (currentNoteId && currentNoteId !== "notepad") {
          router.push("/notepad");
        }
      } catch (error) {
        console.error("Failed to delete all notes:", error);
      }
    }
  }, [notes.length, currentNoteId, router]);


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

      {/* Footer with Delete All button */}
      {notes.length > 0 && (
        <SidebarFooter className="mt-auto">
          <Button
            onClick={handleDeleteAllNotes}
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
