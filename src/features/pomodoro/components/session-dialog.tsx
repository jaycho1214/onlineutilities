"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/shared/ui/dialog";
import { Button } from "@/features/shared/ui/button";
import { Input } from "@/features/shared/ui/input";
import { Textarea } from "@/features/shared/ui/textarea";
import { Badge } from "@/features/shared/ui/badge";
import {
  Plus,
  Users,
  Trash2,
  Clock,
  Target,
  Calendar,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { usePomodoro } from "../lib/pomodoro-context";
import { formatDistanceToNow } from "date-fns";

interface SessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionDialog({ open, onOpenChange }: SessionDialogProps) {
  const t = useTranslations("Pomodoro.sessions");
  const {
    sessions,
    activeSessionId,
    createSession,
    deleteSession,
    setActiveSession,
    updateSession,
  } = usePomodoro();

  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleCreateSession = async () => {
    if (!newSession.title.trim()) return;

    try {
      await createSession(newSession.title);
      setNewSession({ title: "", description: "" });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this session? All todos will be lost.",
      )
    ) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error("Failed to delete session:", error);
      }
    }
  };

  const startEditing = (
    sessionId: string,
    title: string,
    description?: string,
  ) => {
    setEditingId(sessionId);
    setEditTitle(title);
    setEditDescription(description || "");
  };

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return;

    try {
      await updateSession(editingId, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update session:", error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <div className="flex flex-col h-full max-h-[calc(85vh-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5" />
              {t("title")}
              <Badge variant="secondary" className="ml-2">
                {sessions?.length || 0} sessions
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 my-4 px-1 min-h-0">
            {/* Create New Session */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Plus className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t("create.title")}
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Input
                    placeholder={t("create.placeholders.title")}
                    value={newSession.title}
                    onChange={(e) =>
                      setNewSession({ ...newSession, title: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateSession();
                    }}
                  />
                </div>

                <div>
                  <Textarea
                    placeholder={t("create.placeholders.description")}
                    value={newSession.description}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        description: e.target.value,
                      })
                    }
                    className="min-h-[80px]"
                  />
                </div>

                <Button
                  onClick={handleCreateSession}
                  disabled={!newSession.title.trim()}
                  className="w-full"
                  size="default"
                >
                  <Plus className="size-4 mr-2" />
                  {t("create.button")}
                </Button>
              </div>
            </div>

            {/* Session List */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Users className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t("list.title")}
                </h3>
              </div>

              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      p-4 rounded-lg border transition-all duration-200 cursor-pointer
                      ${
                        session.id === activeSessionId
                          ? "bg-primary/5 border-primary/20"
                          : "bg-muted/30 border-border/40 hover:bg-muted/50"
                      }
                    `}
                    onClick={() => setActiveSession(session.id)}
                  >
                    <div className="space-y-3">
                      {editingId === session.id ? (
                        // Edit mode
                        <div className="space-y-3">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            autoFocus
                          />
                          <Textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button onClick={saveEdit} size="default">
                              <Check className="size-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={cancelEdit}
                              size="default"
                            >
                              <X className="size-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground truncate">
                                  {session.title}
                                </h4>
                                {session.id === activeSessionId && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Active
                                  </Badge>
                                )}
                              </div>
                              {session.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {session.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(
                                    session.id,
                                    session.title,
                                    session.description,
                                  );
                                }}
                                size="default"
                              >
                                <Edit3 className="size-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSession(session.id);
                                }}
                                className="text-destructive hover:text-destructive/80"
                                size="default"
                              >
                                <Trash2 className="size-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>

                          {/* Session Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3 pt-3 border-t border-border/30">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="size-4" />
                              <div>
                                <div className="font-medium text-foreground">
                                  {session.stats.totalPomodoros}
                                </div>
                                <div className="text-xs">Pomodoros</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Target className="size-4" />
                              <div>
                                <div className="font-medium text-foreground">
                                  {session.stats.completedTodos}/
                                  {session.stats.totalTodos}
                                </div>
                                <div className="text-xs">Tasks</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="size-4" />
                              <div>
                                <div className="font-medium text-foreground">
                                  {Math.round(
                                    session.stats.totalFocusTime / (1000 * 60),
                                  )}
                                  m
                                </div>
                                <div className="text-xs">Focus Time</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="size-4" />
                              <div>
                                <div className="font-medium text-foreground text-xs">
                                  {formatDistanceToNow(
                                    new Date(session.updatedAt),
                                    { addSuffix: true },
                                  )}
                                </div>
                                <div className="text-xs">Updated</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {(!sessions || sessions.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="size-12 mx-auto mb-3 opacity-30" />
                    <p>{t("list.empty.message")}</p>
                    <p className="text-sm">{t("list.empty.hint")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
