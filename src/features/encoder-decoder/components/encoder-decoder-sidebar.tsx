"use client";

import { useState, useEffect, useCallback, memo, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/features/shared/ui/action-button";
import { Plus, History, Trash2 } from "lucide-react";
import { useEncoderDecoder } from "../lib/encoder-decoder-context";
import { encodingConfigs } from "../encoders/encoder-registry";
import { encoderDecoderService } from "../lib/encoder-decoder-db";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  Sidebar,
  SidebarFooter,
} from "@/features/shared/ui/sidebar";
import { Input } from "@/features/shared/ui/input";
import { Button } from "@/features/shared/ui/button";
import type { EncoderDecoderEntry } from "../types";

interface HistoryItemProps {
  entry: EncoderDecoderEntry;
  onSelect: (entry: EncoderDecoderEntry) => void;
  onDelete: (id: string) => void;
  isActive?: boolean;
}

function HistoryItem({ entry, onSelect, isActive }: HistoryItemProps) {
  const config = encodingConfigs[entry.type];
  const [, startTransition] = useTransition();

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        className="flex flex-col items-start h-auto py-2 transition-all duration-150 cursor-pointer hover:bg-accent/50"
        onClick={() => {
          startTransition(() => {
            onSelect(entry);
          });
        }}
      >
        <div className="flex items-center justify-between w-full">
          <span className="font-medium text-sm">
            {config.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {entry.operation === "encode" ? "Encode" : "Decode"}
          </span>
        </div>
        <div className="flex flex-col items-start w-full mt-1">
          <p className="text-xs text-muted-foreground text-left font-mono">
            {truncateText(entry.input)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(entry.timestamp)}
          </p>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function EncoderDecoderSidebarComponent() {
  const t = useTranslations("EncoderDecoder");
  const { state, setType, setOperation, setInput } = useEncoderDecoder();
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<EncoderDecoderEntry[]>([]);
  const [, startTransition] = useTransition();

  const handleNewEncoding = useCallback(() => {
    setType("base64");
    setOperation("encode");
  }, [setType, setOperation]);

  const handleSelectHistoryItem = useCallback(
    (entry: EncoderDecoderEntry) => {
      setType(entry.type);
      setOperation(entry.operation);
      setInput(entry.input);
    },
    [setType, setOperation, setInput]
  );

  const handleDeleteHistoryItem = useCallback(
    async (id: string) => {
      try {
        await encoderDecoderService.deleteEntry(id);
        setEntries(prev => prev.filter(entry => entry.id !== id));
      } catch (error) {
        console.error("Failed to delete entry:", error);
      }
    },
    []
  );

  const handleClearHistory = useCallback(async () => {
    try {
      await encoderDecoderService.clearHistory();
      setEntries([]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }, []);

  // Load history (only when enabled)
  useEffect(() => {
    const loadHistory = async () => {
      if (state.saveHistory) {
        try {
          const history = await encoderDecoderService.getRecentEntries(50);
          setEntries(history);
        } catch (error) {
          console.error("Failed to load history:", error);
        }
      } else {
        setEntries([]); // Clear entries when history is disabled
      }
    };

    loadHistory();
  }, [state.saveHistory]);

  // Refresh history when new operations complete (only if history is enabled)
  useEffect(() => {
    const refreshHistory = async () => {
      if (state.saveHistory && !state.isProcessing && state.output) {
        try {
          const history = await encoderDecoderService.getRecentEntries(50);
          setEntries(history);
        } catch (error) {
          console.error("Failed to refresh history:", error);
        }
      }
    };

    refreshHistory();
  }, [state.isProcessing, state.output, state.saveHistory]);

  // Filter history based on search
  const filteredEntries = entries.filter(entry => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    const config = encodingConfigs[entry.type];
    return (
      entry.input.toLowerCase().includes(searchLower) ||
      entry.output.toLowerCase().includes(searchLower) ||
      config.name.toLowerCase().includes(searchLower) ||
      entry.operation.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Sidebar className="h-full">
      <SidebarHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">History</h2>
          <ActionButton
            icon={<Plus />}
            onClick={handleNewEncoding}
            variant="ghost"
            size="default"
            tooltip="New encoding"
          />
        </div>
        <div className="mb-2">
          <Input
            value={search}
            onChange={(e) => {
              startTransition(() => {
                setSearch(e.target.value);
              });
            }}
            placeholder={state.saveHistory ? t("sidebar.search.placeholder") : t("sidebar.disabled.searchPlaceholder")}
            disabled={!state.saveHistory}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        {!state.saveHistory ? (
          <div className="p-4 text-center text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">{t("sidebar.disabled.title")}</p>
            <p className="text-xs mt-1">{t("sidebar.disabled.message")}</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            {entries.length === 0 ? (
              <>
                <p className="text-sm">No history yet</p>
                <p className="text-xs">Start encoding to build history</p>
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
            {filteredEntries.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                onSelect={handleSelectHistoryItem}
                onDelete={handleDeleteHistoryItem}
                isActive={false}
              />
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>

      {state.saveHistory && entries.length > 0 && (
        <SidebarFooter className="mt-auto">
          <Button
            onClick={handleClearHistory}
            variant="destructive"
            size="sm"
            className="w-full text-xs h-10 relative group overflow-hidden"
            title={`Clear all ${entries.length} entries`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Trash2 className="w-3 h-3 mr-2 z-10" />
            <span className="z-10">Clear History ({entries.length})</span>
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

export const EncoderDecoderSidebar = memo(EncoderDecoderSidebarComponent);