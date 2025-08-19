"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/features/shared/ui/action-button";
import { Trash2, FileText } from "lucide-react";
import { useTextDiff } from "../lib/text-diff-context";
import { textDiffService, type DiffEntry } from "../lib/text-diff-db";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/features/shared/ui/sidebar";

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

  return (
    <Sidebar className="!h-[calc(100vh-2.25rem)] !top-9 flex flex-col">
      <SidebarHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("history.title")}</h2>
          {entries.length > 0 && (
            <ActionButton
              icon={<Trash2 />}
              onClick={handleClearAll}
              variant="destructive"
              size="default"
              tooltip={t("history.clearAll")}
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto min-h-0">
        {entries.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("history.noHistory")}</p>
            <p className="text-xs">Compare text to see history</p>
          </div>
        ) : (
          <SidebarMenu>
            {entries.map((entry) => (
              <SidebarMenuItem key={entry.id}>
                <SidebarMenuButton
                  onClick={() => handleLoad(entry.id)}
                  isActive={selectedEntry === entry.id}
                  className="flex flex-col items-start h-auto py-2 transition-all duration-150 cursor-pointer hover:bg-accent/50"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm truncate">
                      {entry.title || t("history.itemTitle")}
                    </span>
                  </div>
                  <div className="flex flex-col items-start w-full mt-1">
                    <p className="text-xs text-muted-foreground line-clamp-2 text-left">
                      {entry.originalText.split("\n").length} → {entry.modifiedText.split("\n").length} lines
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>
    </Sidebar>
  );
}