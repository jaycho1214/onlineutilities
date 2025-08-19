"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/features/shared/ui/action-button";
import { History, Trash2, FileText, X } from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";
import { textDiffService, type DiffEntry } from "../lib/text-diff-db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TextDiffHistorySidebar() {
  const t = useTranslations("TextDiff");
  const { loadFromHistory } = useTextDiff();
  const [entries, setEntries] = useState<DiffEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await textDiffService.getRecentEntries(20);
    setEntries(data);
  };

  const handleLoad = async (entryId: string) => {
    await loadFromHistory(entryId);
    toast.success(t("notifications.compared"));
    setSelectedEntry(entryId);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  if (entries.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <History className="size-5" />
            <h2 className="font-medium text-gray-900 dark:text-white">
              {t("history.title")}
            </h2>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
          <FileText className="size-12 mb-2" />
          <p className="text-sm text-center">{t("history.noHistory")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <History className="size-5" />
          <h2 className="font-medium text-gray-900 dark:text-white">
            {t("history.title")}
          </h2>
        </div>
      </div>

      {/* Sub-header with count and clear action */}
      <div className="p-4 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
          <ActionButton
            icon={<Trash2 className="size-4" />}
            onClick={handleClearAll}
            variant="destructive"
            size="default"
            tooltip={t("history.clearAll")}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            onClick={() => handleLoad(entry.id)}
            className={cn(
              "p-3 border border-black/10 dark:border-white/10 rounded-lg bg-white/30 dark:bg-white/5 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-200 shadow-sm cursor-pointer",
              selectedEntry === entry.id && "bg-primary/10 border-primary"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {entry.title || t("history.itemTitle")}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {formatDate(entry.timestamp)}
                </span>
              </div>
              <ActionButton
                icon={<X className="size-3" />}
                onClick={(e) => handleDelete(entry.id, e)}
                variant="ghost"
                size="sm"
                tooltip="Delete entry"
                className="text-gray-400 hover:text-red-600"
              />
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {entry.originalText.split("\n").length} →{" "}
              {entry.modifiedText.split("\n").length} lines • {entry.viewMode}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}