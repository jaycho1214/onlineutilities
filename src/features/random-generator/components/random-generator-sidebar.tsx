"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/shared/ui/button";
import { History, Trash2, Copy, X } from "lucide-react";
import { useRandomGenerator } from "../lib/random-generator-context";
import type { GenerationEntry } from "../types";

export function RandomGeneratorSidebar() {
  const t = useTranslations("RandomGenerator");
  const { state, clearHistory, deleteHistoryEntry, copyToClipboard } =
    useRandomGenerator();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

      {/* History Content */}
      <div className="flex-1 overflow-hidden">
        <HistoryTab
          history={state.history}
          isLoading={state.isLoadingHistory}
          onClear={clearHistory}
          onDelete={deleteHistoryEntry}
          onCopy={copyToClipboard}
          formatDate={formatDate}
          t={t}
        />
      </div>
    </div>
  );
}

// History Tab Component
interface HistoryTabProps {
  history: GenerationEntry[];
  isLoading: boolean;
  onClear: () => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  formatDate: (date: string) => string;
  t: ReturnType<typeof useTranslations>;
}

function HistoryTab({
  history,
  isLoading,
  onClear,
  onDelete,
  onCopy,
  formatDate,
  t,
}: HistoryTabProps) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-black/5 dark:bg-white/5 rounded-lg backdrop-blur-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-4 text-center">
        <History className="size-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t("history.noHistory")}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {history.length} {history.length === 1 ? "entry" : "entries"}
          </span>
          <Button
            onClick={onClear}
            variant="ghost"
            size="icon"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="p-3 border border-black/10 dark:border-white/10 rounded-lg bg-white/30 dark:bg-white/5 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {entry.type}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {formatDate(entry.createdAt)}
                </span>
              </div>
              <Button
                onClick={() => onDelete(entry.id)}
                variant="ghost"
                size="icon"
                className="size-6 text-gray-400 hover:text-red-600"
              >
                <X className="size-3" />
              </Button>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {entry.results.length}{" "}
              {entry.results.length === 1 ? "result" : "results"}
            </div>

            <div>
              <Button
                onClick={() => onCopy(entry.results.join("\n"))}
                variant="ghost"
                size="icon"
                className="size-7"
              >
                <Copy className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
