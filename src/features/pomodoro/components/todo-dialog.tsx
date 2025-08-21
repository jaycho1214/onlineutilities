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
import { Checkbox } from "@/features/shared/ui/checkbox";
import { Badge } from "@/features/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/shared/ui/select";
import {
  Plus,
  CheckSquare,
  Square,
  Trash2,
  Clock,
  AlertCircle,
  Circle,
  Minus,
  Edit3,
} from "lucide-react";
import { usePomodoro } from "../lib/pomodoro-context";
import { type TodoItem, type TodoPriority } from "../types";

interface TodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodoDialog({ open, onOpenChange }: TodoDialogProps) {
  const t = useTranslations("Pomodoro.todos");
  const {
    todos,
    activeTodos,
    completedTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  } = usePomodoro();

  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium" as TodoPriority,
    estimatedPomodoros: 1,
  });

  const [showCompleted, setShowCompleted] = useState(false);

  const handleCreateTodo = async () => {
    if (!newTodo.title.trim()) return;

    try {
      await createTodo(newTodo);
      setNewTodo({
        title: "",
        description: "",
        priority: "medium",
        estimatedPomodoros: 1,
      });
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleCreateTodo();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-x-hidden">
        <div className="flex flex-col h-full max-h-[calc(85vh-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="size-5" />
              {t("title")}
              <Badge variant="secondary" className="ml-2">
                {activeTodos?.length || 0} active
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 my-4 px-1 min-h-0">
            {/* Add New Todo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Plus className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Add New Todo
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Select
                    value={newTodo.priority}
                    onValueChange={(value: TodoPriority) =>
                      setNewTodo({ ...newTodo, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="size-4 text-red-400" />
                          {t("priority.high")}
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Circle className="size-4 text-yellow-400" />
                          {t("priority.medium")}
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Minus className="size-4 text-green-400" />
                          {t("priority.low")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newTodo.estimatedPomodoros}
                      onChange={(e) =>
                        setNewTodo({
                          ...newTodo,
                          estimatedPomodoros: Math.max(
                            1,
                            parseInt(e.target.value) || 1,
                          ),
                        })
                      }
                      className="w-16"
                    />
                    <span className="text-xs text-muted-foreground">
                      est. pomodoros
                    </span>
                  </div>
                </div>

                <Input
                  placeholder={t("placeholders.title")}
                  value={newTodo.title}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, title: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  className="min-w-0"
                />

                <Textarea
                  placeholder={t("placeholders.description")}
                  value={newTodo.description}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, description: e.target.value })
                  }
                  className="min-h-[80px] min-w-0"
                />

                <Button
                  onClick={handleCreateTodo}
                  disabled={!newTodo.title.trim()}
                  className="w-full"
                  size="default"
                >
                  <Plus className="size-4 mr-2" />
                  {t("actions.add")}
                </Button>
              </div>
            </div>

            {/* Todo Lists */}
            <div className="space-y-4">
              {/* Active Todos */}
              {activeTodos && activeTodos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Square className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {t("sections.active")} ({activeTodos?.length || 0})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {activeTodos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={() => toggleTodo(todo.id)}
                        onDelete={() => deleteTodo(todo.id)}
                        onUpdate={(updates) => updateTodo(todo.id, updates)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Todos */}
              {completedTodos && completedTodos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <CheckSquare className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {t("sections.completed")} ({completedTodos?.length || 0})
                    </h3>
                    <Button
                      variant="ghost"
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="ml-auto h-auto p-1 text-xs"
                    >
                      {showCompleted ? "Hide" : "Show"}
                    </Button>
                  </div>
                  {showCompleted && (
                    <div className="space-y-2">
                      {completedTodos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onToggle={() => toggleTodo(todo.id)}
                          onDelete={() => deleteTodo(todo.id)}
                          onUpdate={(updates) => updateTodo(todo.id, updates)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {(!todos || todos.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="size-12 mx-auto mb-3 opacity-30" />
                  <p>{t("empty.message")}</p>
                  <p className="text-sm">{t("empty.hint")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// TODO ITEM COMPONENT
// ============================================================================

interface TodoItemProps {
  todo: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<TodoItem>) => void;
}

function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description || "",
  );

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdate({
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setIsEditing(false);
  };

  const getPriorityIcon = (priority: TodoPriority) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="size-4 text-red-400" />;
      case "medium":
        return <Circle className="size-4 text-yellow-400" />;
      case "low":
        return <Minus className="size-4 text-green-400" />;
      default:
        return <Circle className="size-4 text-gray-400" />;
    }
  };

  return (
    <div
      className={`
      p-4 rounded-lg border transition-all duration-200
      ${
        todo.completed
          ? "bg-green-500/5 border-green-500/20"
          : "bg-muted/30 border-border/40 hover:bg-muted/50"
      }
    `}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={onToggle}
          className="mt-1"
        />

        <div className="flex-1 space-y-2 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="min-w-0"
                autoFocus
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                className="min-h-[60px] min-w-0"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} size="default">
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  size="default"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getPriorityIcon(todo.priority)}
                <span
                  className={`
                  font-medium text-foreground break-words
                  ${todo.completed ? "line-through text-muted-foreground" : ""}
                `}
                >
                  {todo.title}
                </span>
                {todo.estimatedPomodoros && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="size-3 mr-1" />
                    {todo.estimatedPomodoros}p
                  </Badge>
                )}
              </div>
              {todo.description && (
                <p
                  className={`
                  text-sm text-muted-foreground break-words
                  ${todo.completed ? "line-through" : ""}
                `}
                >
                  {todo.description}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 flex-shrink-0 mt-1">
          {!isEditing && (
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-9 w-9 p-0"
            >
              <Edit3 className="size-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={onDelete}
            className="text-destructive hover:text-destructive/80 h-9 w-9 p-0"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
