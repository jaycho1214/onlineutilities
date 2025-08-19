"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/features/shared/ui/action-button";
import { History, Trash2, X } from "lucide-react";
import { useRandomGenerator } from "../lib/random-generator-context";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/features/shared/ui/sidebar";

export function RandomGeneratorSidebar() {
  const t = useTranslations("RandomGenerator");
  const { state, clearHistory, deleteHistoryEntry } = useRandomGenerator();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sidebar className="!h-[calc(100vh-2.25rem)] !top-9 flex flex-col">
      <SidebarHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("history.title")}</h2>
          {state.history.length > 0 && (
            <ActionButton
              icon={<Trash2 />}
              onClick={clearHistory}
              variant="destructive"
              size="default"
              tooltip={t("history.clearAll")}
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto min-h-0">
        {state.isLoadingHistory ? (
          <div className="p-4 text-center text-muted-foreground">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-black/5 dark:bg-white/5 rounded-lg backdrop-blur-sm"
                />
              ))}
            </div>
          </div>
        ) : state.history.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("history.noHistory")}</p>
            <p className="text-xs">Generate random data to see history</p>
          </div>
        ) : (
          <SidebarMenu>
            {state.history.map((entry) => (
              <SidebarMenuItem key={entry.id}>
                <SidebarMenuButton asChild>
                  <div className="flex flex-col items-start h-auto py-2 transition-all duration-150 cursor-pointer hover:bg-accent/50">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm truncate capitalize">
                        {entry.type}
                      </span>
                      <ActionButton
                        icon={<X className="w-3 h-3" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryEntry(entry.id);
                        }}
                        variant="ghost"
                        size="sm"
                        tooltip="Delete entry"
                      />
                    </div>
                    <div className="flex flex-col items-start w-full mt-1">
                      <p className="text-xs text-muted-foreground line-clamp-1 text-left">
                        {entry.results.length} {entry.results.length === 1 ? "result" : "results"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
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
