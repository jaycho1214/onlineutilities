"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/features/shared/ui/dialog";
import { Button } from "@/features/shared/ui/button";
import { History, Trash2, Clock, FileText } from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";
import { textDiffService, type DiffEntry } from "../lib/text-diff-db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TextDiffHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TextDiffHistoryDialog({
  open,
  onOpenChange,
}: TextDiffHistoryDialogProps) {
  const t = useTranslations("TextDiff");
  const { loadFromHistory } = useTextDiff();
  const [entries, setEntries] = useState<DiffEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open]);

  const loadEntries = async () => {
    const data = await textDiffService.getRecentEntries(20);
    setEntries(data);
  };

  const handleLoad = async () => {
    if (!selectedEntry) return;

    await loadFromHistory(selectedEntry);
    toast.success(t("notifications.compared"));
    onOpenChange(false);
  };

  const handleDelete = async (id: string) => {
    await textDiffService.deleteEntry(id);
    await loadEntries();
    if (selectedEntry === id) {
      setSelectedEntry(null);
    }
    toast.success("Entry deleted");
  };

  const handleClearAll = async () => {
    await textDiffService.clearHistory();
    setEntries([]);
    setSelectedEntry(null);
    toast.success(t("notifications.historyCleared"));
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" />
            {t("history.title")}
          </DialogTitle>
          <DialogDescription>
            Load a previous diff comparison from history
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[400px] my-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileText className="size-12 mb-2" />
              <p className="text-sm">{t("history.noHistory")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry.id)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    selectedEntry === entry.id
                      ? "bg-primary/10 border-primary"
                      : "bg-background/50 border-border hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground">
                        {entry.title || t("history.itemTitle")}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDate(entry.timestamp)}
                        </span>
                        <span>{entry.viewMode}</span>
                        <span>
                          {entry.originalText.split("\n").length} →{" "}
                          {entry.modifiedText.split("\n").length} lines
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          {entries.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="mr-auto"
              size="sm"
            >
              <Trash2 className="size-4" />
              {t("history.clearAll")}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="sm"
          >
            {t("actions.close")}
          </Button>
          <Button onClick={handleLoad} disabled={!selectedEntry} size="sm">
            {t("history.restore")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
