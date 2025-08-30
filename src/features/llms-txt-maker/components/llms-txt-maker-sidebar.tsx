/**
 * llms.txt Maker Sidebar Component
 * Displays generation history and saved configurations
 */

"use client";

import React, { useState } from "react";
import { Trash2, FileText } from "lucide-react";
import { GitHubIcon } from "./github-icon";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/features/shared/ui/action-button";
import { Input } from "@/features/shared/ui/input";
import { Badge } from "@/features/shared/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/features/shared/ui/sidebar";
import { useLlmsTxtMaker } from "../lib/llms-txt-maker-context";
import type { LlmsTxtGenerationModel } from "../types";

export function LlmsTxtMakerSidebar() {
  const t = useTranslations("GitHubToLlmsTxt");
  const { state, clearHistory, regenerateFromHistory } = useLlmsTxtMaker();

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredHistory = state.historyItems.filter((item) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      item.repositoryName.toLowerCase().includes(query) ||
      item.repositoryOwner.toLowerCase().includes(query) ||
      item.repositoryUrl.toLowerCase().includes(query)
    );
  });

  const handleRegenerate = async (item: LlmsTxtGenerationModel) => {
    setIsLoading(true);
    try {
      await regenerateFromHistory(item);
    } catch (error) {
      console.error("Failed to regenerate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      await clearHistory();
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sidebar className="h-full">
      <SidebarHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("history.title")}</h2>
          {state.historyItems.length > 0 && (
            <ActionButton
              icon={<Trash2 />}
              onClick={handleClearHistory}
              variant="destructive"
              size="default"
              tooltip={t("history.clearAll")}
            />
          )}
        </div>

        {/* Search */}
        {state.historyItems.length > 0 && (
          <div className="mb-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        {state.historyItems.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("history.noHistory")}</p>
            <p className="text-xs">Generate llms.txt to see history</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No matches</p>
            <p className="text-xs">Try another search</p>
          </div>
        ) : (
          <SidebarMenu>
            {filteredHistory.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => handleRegenerate(item)}
                  disabled={isLoading}
                  className="flex flex-col items-start h-auto py-2 px-3 transition-all duration-150 cursor-pointer hover:bg-accent/50"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm truncate">
                      {item.repositoryName}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <GitHubIcon className="size-3" />
                    <span className="text-xs text-muted-foreground truncate">
                      {item.repositoryOwner}
                    </span>
                  </div>

                  {/* Statistics */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {item.selectedFiles.length} files
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.output.metadata.filesIncluded} included
                    </Badge>
                    {item.output.metadata.tokenEstimate && (
                      <Badge variant="secondary" className="text-xs">
                        ~
                        {item.output.metadata.tokenEstimate.total.toLocaleString()}{" "}
                        tokens
                      </Badge>
                    )}
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
